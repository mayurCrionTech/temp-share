const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");
const config = require("../config");
// const logger = require("../utils/logger");

class SQLiteHandler {
  constructor() {
    this.currentDb = null;
    this.currentDbPath = null;
    this.currentDateKey = null;
    this.baseDir = config.database.dataDir;
  }

  // One file per calendar day, named by date so listing/sorting the
  // data dir is enough to see how many days are on disk. Date is
  // computed in IST regardless of the machine's local timezone, so
  // behavior is consistent whether this runs as a Windows service,
  // a Linux box, or in a container set to UTC.
  getDateKey(date = new Date()) {
    return new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date); // -> "2026-08-17"
  }

  getDbPath(dateKey) {
    return path.join(this.baseDir, `plc_data_${dateKey}.db`);
  }

  // Every .db file this handler has ever created, oldest first.
  // Archived files (moved into archiveDir) are NOT included - that's
  // what keeps the sync scan bounded as time goes on.
  listDbFiles() {
    if (!fs.existsSync(this.baseDir)) return [];
    return fs
      .readdirSync(this.baseDir)
      .filter((f) => /^plc_data_\d{4}-\d{2}-\d{2}\.db$/.test(f))
      .sort()
      .map((f) => path.join(this.baseDir, f));
  }

  get archiveDir() {
    return path.join(this.baseDir, "archive");
  }

  // Moves any fully-synced file (other than today's live one) into
  // archiveDir. No age wait - a file gets archived the first time this
  // runs after it has zero unsynced rows left, whether that's the very
  // next day or, if the server was down for a while, however many days
  // it took to catch up. A file with a backlog is simply skipped and
  // re-checked the next time this runs - it stays in baseDir, so
  // getUnsentRecords keeps finding it, for as long as it takes.
  async archiveSyncedFiles() {
    for (const dbPath of this.listDbFiles()) {
      if (dbPath === this.currentDbPath) continue; // never touch today's live file

      const fileName = path.basename(dbPath);

      const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);
      const unsyncedCount = await new Promise((resolve, reject) => {
        db.get(
          "SELECT COUNT(*) AS c FROM tag_data WHERE synced = 0",
          (err, row) => (err ? reject(err) : resolve(row.c)),
        );
      });
      await new Promise((res) => db.close(res));

      if (unsyncedCount > 0) {
        console.warn(
          `Not archiving ${fileName}: ${unsyncedCount} unsynced row(s) still pending`,
        );
        continue;
      }

      fs.mkdirSync(this.archiveDir, { recursive: true });
      fs.renameSync(dbPath, path.join(this.archiveDir, fileName));
      console.log(`Archived ${fileName} -> archive/ (fully synced)`);
    }
  }

  async getDatabase() {
    const dateKey = this.getDateKey();

    if (this.currentDb && this.currentDateKey === dateKey) {
      return this.currentDb;
    }

    // Either first run, or the day has rolled over - close whatever
    // was open (if anything) and open/create today's file. Nothing
    // is deleted; yesterday's file is left on disk for getUnsentRecords
    // to pick up until it's fully synced.
    if (this.currentDb) {
      await new Promise((res) => this.currentDb.close(res));
      console.log(`Rotated database: closed ${this.currentDbPath}`);
    }

    const dbPath = this.getDbPath(dateKey);

    fs.mkdirSync(path.dirname(dbPath), { recursive: true });

    this.currentDb = new sqlite3.Database(dbPath);
    this.currentDbPath = dbPath;
    this.currentDateKey = dateKey;

    await this.exec(`
      CREATE TABLE IF NOT EXISTS tag_data (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plc_name TEXT,
        tag_name TEXT NOT NULL,
        value TEXT,
        value_type TEXT,
        min_value REAL,
        max_value REAL,
        timestamp TEXT NOT NULL,
        synced INTEGER DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_plc_name ON tag_data(plc_name);
      CREATE INDEX IF NOT EXISTS idx_tag_name ON tag_data(tag_name);
      CREATE INDEX IF NOT EXISTS idx_timestamp ON tag_data(timestamp);
      CREATE INDEX IF NOT EXISTS idx_synced ON tag_data(synced);
    `);

    // Migration safety net: if an older DB file already exists without
    // value_type/min_value/max_value, add them; and drop plc_ip/plc_slot
    // if they're still there from before. Safe to call every startup.
    await this.ensureValueTypeColumn();

    console.log(`Opened database: ${dbPath}`);

    // Piggyback the archive sweep on the once-a-day rotation moment -
    // no separate timer needed. Runs in the background so it never
    // delays a write; a failure here just gets logged, never thrown.
    this.archiveSyncedFiles().catch((err) =>
      console.error("Archive sweep failed:", err.message),
    );

    return this.currentDb;
  }

  // Adds value_type to pre-existing databases created before this
  // column existed. Safe to call every startup (checks first).
  async ensureValueTypeColumn() {
    const columns = await new Promise((resolve, reject) => {
      this.currentDb.all("PRAGMA table_info(tag_data)", (err, rows) =>
        err ? reject(err) : resolve(rows),
      );
    });

    const hasValueType = columns.some((c) => c.name === "value_type");
    if (!hasValueType) {
      await this.exec("ALTER TABLE tag_data ADD COLUMN value_type TEXT;");
      console.log("Migrated tag_data: added value_type column");
    }

    const hasMinValue = columns.some((c) => c.name === "min_value");
    if (!hasMinValue) {
      await this.exec("ALTER TABLE tag_data ADD COLUMN min_value REAL;");
      console.log("Migrated tag_data: added min_value column");
    }

    const hasMaxValue = columns.some((c) => c.name === "max_value");
    if (!hasMaxValue) {
      await this.exec("ALTER TABLE tag_data ADD COLUMN max_value REAL;");
      console.log("Migrated tag_data: added max_value column");
    }

    // Older DB files may still have plc_ip / plc_slot from before we
    // dropped them (plc_name alone is enough to identify the PLC).
    // Requires SQLite 3.35+ (bundled with sqlite3 5.x) for DROP COLUMN;
    // if it fails on an older engine, just leave the columns unused.
    const hasPlcIp = columns.some((c) => c.name === "plc_ip");
    if (hasPlcIp) {
      try {
        await this.exec("ALTER TABLE tag_data DROP COLUMN plc_ip;");
        console.log("Migrated tag_data: dropped plc_ip column");
      } catch (err) {
        console.warn("Could not drop plc_ip column (leaving it unused):", err.message);
      }
    }

    const hasPlcSlot = columns.some((c) => c.name === "plc_slot");
    if (hasPlcSlot) {
      try {
        await this.exec("ALTER TABLE tag_data DROP COLUMN plc_slot;");
        console.log("Migrated tag_data: dropped plc_slot column");
      } catch (err) {
        console.warn("Could not drop plc_slot column (leaving it unused):", err.message);
      }
    }
  }

  exec(sql) {
    return new Promise((resolve, reject) => {
      this.currentDb.exec(sql, (err) => (err ? reject(err) : resolve()));
    });
  }

  async saveTagData(records) {
    if (!records || records.length === 0) return;

    const db = await this.getDatabase();

    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");

        const stmt = db.prepare(`
        INSERT INTO tag_data
        (plc_name, tag_name, value, value_type, min_value, max_value, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

        try {
          for (const r of records) {
            // By the time records get here, dataCollector has already
            // run them through bufferDecoder, so r.value is a plain
            // string/number/boolean/null, or a hex string for opaque
            // structs. Anything still an object (e.g. records saved
            // via a caller that skipped decoding) falls back to JSON.
            const valueStr =
              r.value !== null && typeof r.value === "object"
                ? JSON.stringify(r.value)
                : String(r.value);

            stmt.run(
              r.plcName || null,
              r.name,
              valueStr,
              r.valueType || null,
              r.ranges?.minValue ?? null,
              r.ranges?.maxValue ?? null,
              r.timestamp,
            );
          }

          stmt.finalize((err) => {
            if (err) throw err;

            db.run("COMMIT", (err) => {
              if (err) {
                db.run("ROLLBACK");
                reject(err);
              } else {
                resolve();
              }
            });
          });
        } catch (err) {
          db.run("ROLLBACK");
          reject(err);
        }
      });
    });
  }

  // Scans every plc_data_*.db file (oldest first, so a backlog drains in
  // order), not just today's file. This is what makes daily rotation safe:
  // if the sync interval falls behind and a day boundary passes while
  // records are still unsynced, they don't get stranded in the old file -
  // they're picked up here until markAsSynced clears them, however many
  // days back that takes.
  async getUnsentRecords(limit = 100) {
    // Make sure today's file exists/is open before we list, so a
    // freshly-rotated day is included even if nothing's been written yet.
    await this.getDatabase();

    const results = [];
    const files = this.listDbFiles();

    for (const dbPath of files) {
      if (results.length >= limit) break;

      const isCurrent = dbPath === this.currentDbPath;
      const db = isCurrent
        ? this.currentDb
        : new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

      const rows = await new Promise((resolve, reject) =>
        db.all(
          `SELECT id,
                plc_name,
                tag_name,
                value,
                value_type,
                min_value,
                max_value,
                timestamp
         FROM tag_data
         WHERE synced = 0
         ORDER BY id
         LIMIT ?`,
          [limit - results.length],
          (err, rows) => (err ? reject(err) : resolve(rows)),
        ),
      );

      if (!isCurrent) await new Promise((res) => db.close(res));

      for (const row of rows) {
        results.push({ ...row, dbPath });
      }
    }

    return results;
  }

  // Records passed in may come from several different day-files (see
  // getUnsentRecords), so group by dbPath and update each file separately.
  async markAsSynced(records) {
    if (!records.length) return;

    const grouped = records.reduce((m, r) => {
      (m[r.dbPath] ||= []).push(r.id);
      return m;
    }, {});

    for (const [dbPath, ids] of Object.entries(grouped)) {
      const isCurrent = dbPath === this.currentDbPath;
      const db = isCurrent ? this.currentDb : new sqlite3.Database(dbPath);

      await new Promise((resolve, reject) => {
        db.serialize(() => {
          db.run("BEGIN TRANSACTION");

          const stmt = db.prepare("UPDATE tag_data SET synced = 1 WHERE id = ?");

          for (const id of ids) {
            stmt.run(id);
          }

          stmt.finalize((err) => {
            if (err) {
              db.run("ROLLBACK");
              return reject(err);
            }

            db.run("COMMIT", (err) => {
              if (err) {
                db.run("ROLLBACK");
                reject(err);
              } else {
                resolve();
              }
            });
          });
        });
      });

      if (!isCurrent) await new Promise((res) => db.close(res));
    }
  }

  async close() {
    if (this.currentDb) {
      await new Promise((res) => this.currentDb.close(res));
      this.currentDb = null;
      // this.currentDbPath = null;
      console.log("SQLite closed");
    }
  }
}

module.exports = new SQLiteHandler();
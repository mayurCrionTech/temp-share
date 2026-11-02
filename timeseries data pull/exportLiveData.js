// exportLiveData.js
// npm i mongodb
const fs = require("fs");
const { once } = require("events");
const { MongoClient, BSON } = require("mongodb");
const { EJSON } = BSON;

const SOURCE_URI = "mongodb://localhost:27017";
const SOURCE_DB = "paintddt";
const COLLECTION = "liveData_test";

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

// ---- parse CLI args: --date YYYY-MM-DD --from HH:MM --to HH:MM ----
function getArg(name) {
  const i = process.argv.indexOf(`--${name}`);
  return i !== -1 ? process.argv[i + 1] : undefined;
}

// default date = today in IST
const nowIST = new Date(Date.now() + IST_OFFSET_MS);
const todayIST = nowIST.toISOString().slice(0, 10);

const dateStr = getArg("date") || todayIST;
const fromStr = getArg("from") || "10:00";
const toStr = getArg("to") || "11:00";

// ---- validate ----
if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
  console.error("Invalid --date, use YYYY-MM-DD (e.g. 2026-08-04)");
  process.exit(1);
}
for (const [name, val] of [["from", fromStr], ["to", toStr]]) {
  if (!/^\d{1,2}:\d{2}$/.test(val)) {
    console.error(`Invalid --${name}, use HH:MM in 24h IST (e.g. 10:00)`);
    process.exit(1);
  }
}

// ---- build UTC range from IST input ----
const [y, m, d] = dateStr.split("-").map(Number);
const [fh, fm] = fromStr.split(":").map(Number);
const [th, tm] = toStr.split(":").map(Number);

// Treat the IST wall-clock time as UTC, then subtract the offset to get the real UTC instant
const start = new Date(Date.UTC(y, m - 1, d, fh, fm, 0) - IST_OFFSET_MS);
const end = new Date(Date.UTC(y, m - 1, d, th, tm, 0) - IST_OFFSET_MS);

if (isNaN(start) || isNaN(end) || start >= end) {
  console.error("Invalid range: --from must be earlier than --to");
  process.exit(1);
}

const tag = (s) => s.replace(":", "");
const OUT_FILE = `liveData_${dateStr}_${tag(fromStr)}-${tag(toStr)}IST.ndjson`;

(async () => {
  const client = new MongoClient(SOURCE_URI);
  try {
    await client.connect();
    const col = client.db(SOURCE_DB).collection(COLLECTION);

    const filter = { timestamp: { $gte: start, $lt: end } };
    console.log(`IST range : ${dateStr} ${fromStr} -> ${toStr}`);
    console.log(`UTC range : ${start.toISOString()} -> ${end.toISOString()}`);
    console.log("Docs to export:", await col.countDocuments(filter));

    const out = fs.createWriteStream(OUT_FILE);
    let total = 0;

    for await (const doc of col.find(filter).sort({ timestamp: 1 })) {
      const line = EJSON.stringify(doc, { relaxed: false }) + "\n";
      if (!out.write(line)) await once(out, "drain");
      total++;
    }

    out.end();
    await once(out, "finish");
    console.log(`Done. ${total} docs written to ${OUT_FILE}`);
  } catch (err) {
    console.error("Failed:", err);
  } finally {
    await client.close();
  }
})();


/**
Usage examples: 
# today, 10:00-11:00 IST (default) -> node exportLiveData.js

# older date, same hour -> node exportLiveData.js --date 2026-08-04

# older date, custom time range
node exportLiveData.js --date 2026-08-04 --from 14:30 --to 16:00

# full day
node exportLiveData.js --date 2026-08-04 --from 00:00 --to 24:00

node exportLiveData.js --date 2026-11-02 --from 07:30 --to 16:00

*/
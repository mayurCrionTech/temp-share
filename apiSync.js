const axios = require("axios");
const config = require("../config");
const sqliteHandler = require("../database/sqliteHandler");

/**
 * API Sync Service
 * Syncs collected PLC data to a remote server API
 */
class ApiSync {
  constructor() {
    this.syncInterval = null;
    this.isRunning = false;
    this.httpClient = axios.create({
      baseURL: config.api.baseUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.PLC_API_KEY,
      },
    });
  }

  /**
   * Consistent timestamp prefix for every log line
   */
  _ts() {
    return `[${new Date().toLocaleString()}]`;
  }

  /**
   * Start the API sync service
   */
  start() {
    if (this.isRunning) {
      console.warn(this._ts(), "API sync service is already running");
      return;
    }

    console.log(
      this._ts(),
      `Starting API sync service - syncing every ${config.api.syncIntervalMs}ms to ${config.api.baseUrl}`,
    );

    this.isRunning = true;
    this.sync();
  }

  /**
   * Perform a sync operation
   */
  async sync() {
    if (!this.isRunning) {
      return;
    }

    try {
      // Get unsent records
      const records = await sqliteHandler.getUnsentRecords(
        config.api.batchSize,
      );

      if (records.length > 0) {
        console.log(this._ts(), `Syncing ${records.length} records to server...`);

        // Prepare payload
        const payload = records.map((r) => {
          // SQLite stores `value` as TEXT, so numbers come back out as
          // strings (e.g. "123.45"). Convert back using the recorded
          // value_type so numeric tags reach the server as real numbers.
          let value = r.value;
          if (r.value_type === "number" && value !== null && value !== "") {
            const n = Number(value);
            if (!Number.isNaN(n)) value = n;
          }

          const data = {
            plcName: r.plc_name,
            tagName: r.tag_name,
            value,
            dataType: r.value_type,
            timestamp: r.timestamp,
          };

          // Include ranges only if present
          if (r.min_value != null || r.max_value != null) {
            data.ranges = {};

            if (r.min_value != null) {
              data.ranges.minValue = r.min_value;
            }

            if (r.max_value != null) {
              data.ranges.maxValue = r.max_value;
            }
          }

          return data;
        });

        // Send to Receiver API
        const response = await this.httpClient.post("", payload);

        if (response.status >= 200 && response.status < 300) {
          await sqliteHandler.markAsSynced(records);
          console.log(this._ts(), `Successfully synced ${records.length} records`);
        } else {
          console.warn(this._ts(), `API returned status ${response.status}`);
        }
      } else {
        console.log(this._ts(), "No records to sync");
      }
    } catch (error) {
      if (error.response) {
        console.error(
          this._ts(),
          `API error: ${error.response.status} -`,
          error.response.data,
        );
      } else if (error.request) {
        console.error(this._ts(), "API request failed - no response received");
      } else {
        console.error(this._ts(), "API sync error:", error.message);
      }
    }

    // Schedule next sync
    this.syncInterval = setTimeout(
      () => this.sync(),
      config.api.syncIntervalMs,
    );
  }

  /**
   * Force an immediate sync
   */
  async forceSync() {
    console.log(this._ts(), "Forcing immediate sync...");
    await this.sync();
  }

  /**
   * Stop the API sync service
   */
  stop() {
    console.log(this._ts(), "Stopping API sync service...");

    this.isRunning = false;

    if (this.syncInterval) {
      clearTimeout(this.syncInterval);
      this.syncInterval = null;
    }

    console.log(this._ts(), "API sync service stopped");
  }
}

module.exports = new ApiSync();
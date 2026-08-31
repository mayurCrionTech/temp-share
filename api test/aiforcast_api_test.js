/**
 * Test script for getForeCastValues API
 * Usage: node test-forecast-api.js
 *
 * Requires Node 18+ (built-in fetch). If on older Node, run:
 *   npm install node-fetch
 * and uncomment the require line below.
 */

// const fetch = require('node-fetch'); // uncomment if Node < 18

// ==========================================
// CONFIG — change these as needed
// ==========================================
const API_BASE_URL = "http://localhost:5000"; // <-- change to your server URL
const API_PATH = "/api/tag/forecast";          // <-- change to actual route path
const TAG_ID = "699426acbfb07d6db09a0510";      // <-- change to tagId you want to test
const QUERY_PARAMS = {
  tagId: TAG_ID,
  interval: "PT1M",     // optional
  aggregation: "avg",   // optional
  format: "points"      // "points" or "compact"
};
// ==========================================

function buildUrl() {
  const url = new URL(API_PATH, API_BASE_URL);
  Object.entries(QUERY_PARAMS).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

function fmt(d) {
  return d ? new Date(d).toISOString() : "N/A";
}

async function main() {
  const url = buildUrl();
  const clientNow = new Date();

  console.log("=".repeat(60));
  console.log("REQUEST");
  console.log("=".repeat(60));
  console.log("URL:            ", url);
  console.log("Client time now:", clientNow.toISOString());
  console.log("");

  const startedAt = Date.now();
  let res, body;

  let rawText;
  try {
    res = await fetch(url);
    rawText = await res.text();
    try {
      body = JSON.parse(rawText);
    } catch (parseErr) {
      console.error("Request failed: response was not valid JSON.");
      console.error("HTTP status:", res.status);
      console.error("This usually means you're hitting the wrong URL/port/route");
      console.error("(e.g. a frontend dev server, a 404 page, or an auth redirect).");
      console.error("");
      console.error("Raw response body (first 500 chars):");
      console.error(rawText.slice(0, 500));
      process.exit(1);
    }
  } catch (err) {
    console.error("Request failed:", err.message);
    process.exit(1);
  }

  const latencyMs = Date.now() - startedAt;

  console.log("=".repeat(60));
  console.log("RESPONSE META");
  console.log("=".repeat(60));
  console.log("HTTP status:  ", res.status);
  console.log("Latency (ms): ", latencyMs);
  console.log("");

  const data = body?.data || body; // adjust if your apiResponseHandler wraps differently

  if (!data) {
    console.log("Full raw body:", JSON.stringify(body, null, 2));
    return;
  }

  console.log("=".repeat(60));
  console.log("WINDOW SANITY CHECK");
  console.log("=".repeat(60));

  const hist = data.historical;
  const fcst = data.forecast;

  if (Array.isArray(hist)) {
    // format=points -> historical is an array of {ts, value}
    const timestamps = hist.map(p => new Date(p.ts));
    const oldest = timestamps.length ? new Date(Math.min(...timestamps)) : null;
    const newest = timestamps.length ? new Date(Math.max(...timestamps)) : null;
    console.log("Historical points:", hist.length);
    console.log("Oldest ts:        ", fmt(oldest));
    console.log("Newest ts:        ", fmt(newest));
    if (oldest) {
      const hoursBack = (clientNow - oldest) / (1000 * 60 * 60);
      console.log("Oldest is", hoursBack.toFixed(2), "hours before client now",
        hoursBack > 3.6 ? "  <-- ⚠️  MORE THAN 3.5h, INVESTIGATE" : "  OK");
    }
  } else if (hist) {
    // format=compact -> historical has start/end
    console.log("Historical start:", fmt(hist.start));
    console.log("Historical end:  ", fmt(hist.end));
    console.log("Historical values count:", hist.values?.length ?? 0);
    if (hist.start) {
      const hoursBack = (clientNow - new Date(hist.start)) / (1000 * 60 * 60);
      console.log("Start is", hoursBack.toFixed(2), "hours before client now",
        hoursBack > 3.6 ? "  <-- ⚠️  MORE THAN 3.5h, INVESTIGATE" : "  OK");
    }
  }

  console.log("");

  if (Array.isArray(fcst)) {
    const timestamps = fcst.map(p => new Date(p.ts));
    const oldest = timestamps.length ? new Date(Math.min(...timestamps)) : null;
    const newest = timestamps.length ? new Date(Math.max(...timestamps)) : null;
    console.log("Forecast points:", fcst.length);
    console.log("Earliest ts:    ", fmt(oldest));
    console.log("Latest ts:      ", fmt(newest));
  } else if (fcst) {
    console.log("Forecast start:", fmt(fcst.start));
    console.log("Forecast end:  ", fmt(fcst.end));
    console.log("Forecast values count:", fcst.values?.length ?? 0);
  }

  console.log("");
  console.log("=".repeat(60));
  console.log("FULL RESPONSE (raw JSON)");
  console.log("=".repeat(60));
  console.log(JSON.stringify(body, null, 2));
}

main();
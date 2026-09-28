#!/usr/bin/env node

/**
 * ============================================================================
 * DICV Paint Shop Digital Twin - MongoDB Cabin & Stage Tracking Exporter
 * ============================================================================
 * 
 * Description:
 *   Extracts time-series tracking data from MongoDB for specified Cabin Numbers
 *   (e.g., 296860, 296902, 296854, 296855, 286858, 296861, 296876).
 *   Matches combined VIN_1 + VIN_2 tags (e.g. 2968 + 60 = 296860),
 *   maps each Cabin Number to its Skid Number, Hanger Number, and Cabin Type,
 *   then calculates Stage Entry Time, Exit Time, and Duration across all 23 stages.
 * 
 * Usage:
 *   node export.js
 *   node export.js --cabins 296860,296902 --start 2025-10-01 --end 2026-03-01
 *   node export.js --help
 * ============================================================================
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
let { STAGES, ALL_TAG_IDS, TAG_MAP_BY_ID, SKID_TAG_IDS, VIN1_TAG_IDS, VIN2_TAG_IDS } = require('./stage_config');

// ============================================================================
// 1. CONFIGURATION (all values come from .env — see .env.example)
// ============================================================================

// Fallback cabin list used ONLY if CABINS is not set in .env / CLI
const FALLBACK_CABINS = [
  '296860',
  '296902',
  '296854',
  '296855',
  '286858',
  '296861',
  '296876'
];

if (!process.env.MONGO_URI) {
  console.warn('⚠️  MONGO_URI not set in .env — falling back to mongodb://localhost:27017');
}
if (!process.env.CABINS) {
  console.warn('⚠️  CABINS not set in .env — falling back to built-in default cabin list');
}

const CONFIG = {
  // MongoDB Connection
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
  dbName: process.env.DB_NAME || 'dicv_dt',
  timeSeriesCollection: process.env.TIMESERIES_COLLECTION || 'taghistories',
  tagsCollection: process.env.TAGS_COLLECTION || 'tags',

  // Field names — these vary by deployment (e.g. 'tagId' vs 'tag_id').
  // Set these in .env to match your actual collection schema.
  tagIdField: process.env.TAG_ID_FIELD || 'tag_id',
  tagNameField: process.env.TAG_NAME_FIELD || 'tagname',

  // When true (default), tag ObjectIds are re-resolved at startup by looking
  // up each stage_config.js tagName in TAGS_COLLECTION, instead of trusting
  // the hardcoded ids baked into stage_config.js (which can go stale across
  // environments/databases). Set to 'false' to skip and use the hardcoded
  // ids as-is.
  resolveTagIds: process.env.RESOLVE_TAG_IDS !== 'false',

  // Read preference — this tool never writes, so 'secondaryPreferred' is safe
  // and reduces load on the primary. Override via READ_PREFERENCE if needed.
  readPreference: process.env.READ_PREFERENCE || 'secondaryPreferred',

  // Target Cabin Numbers (comma-separated in .env, e.g. CABINS=296860,296902)
  defaultCabins: process.env.CABINS
    ? process.env.CABINS.split(',').map(s => s.trim()).filter(Boolean)
    : FALLBACK_CABINS,

  // Default Output CSV Path
  outputFile: process.env.OUTPUT_FILE || path.join(__dirname, 'output', 'cabin_stage_tracking.csv'),

  // Optional Date Range Filter (null = all data)
  startTime: process.env.START_TIME || null,
  endTime: process.env.END_TIME || null,

  // Time tolerance window for pairing VIN1 and VIN2 (milliseconds)
  vinPairToleranceMs: Number(process.env.VIN_PAIR_TOLERANCE_MS) || 10000
};

// ============================================================================
// 2. CLI ARGUMENT PARSER
// ============================================================================
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    cabins: [...CONFIG.defaultCabins],
    mongoUri: CONFIG.mongoUri,
    dbName: CONFIG.dbName,
    timeSeriesCollection: CONFIG.timeSeriesCollection,
    tagsCollection: CONFIG.tagsCollection,
    outputFile: CONFIG.outputFile,
    startTime: CONFIG.startTime,
    endTime: CONFIG.endTime,
    readPreference: CONFIG.readPreference
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else if ((arg === '--cabins' || arg === '-c') && args[i + 1]) {
      options.cabins = args[++i].split(',').map(s => s.trim()).filter(Boolean);
    } else if ((arg === '--uri' || arg === '-u') && args[i + 1]) {
      options.mongoUri = args[++i];
    } else if ((arg === '--db' || arg === '-d') && args[i + 1]) {
      options.dbName = args[++i];
    } else if ((arg === '--collection' || arg === '--col') && args[i + 1]) {
      options.timeSeriesCollection = args[++i];
    } else if ((arg === '--output' || arg === '-o') && args[i + 1]) {
      options.outputFile = args[++i];
    } else if ((arg === '--start' || arg === '-s') && args[i + 1]) {
      options.startTime = args[++i];
    } else if ((arg === '--end' || arg === '-e') && args[i + 1]) {
      options.endTime = args[++i];
    }
  }

  return options;
}

function printHelp() {
  console.log(`
DICV Paint Shop - Cabin & Stage Tracking Data Exporter

Usage:
  node export.js [options]

Options:
  -c, --cabins <list>       Comma-separated target cabin numbers (default: ${CONFIG.defaultCabins.join(',')})
  -u, --uri <uri>           MongoDB Connection URI (default: ${maskMongoUri(CONFIG.mongoUri)})
  -d, --db <name>           Database name (default: ${CONFIG.dbName})
      --col, --collection   Time-series collection name (default: ${CONFIG.timeSeriesCollection})
  -o, --output <path>       Output CSV file path (default: ${CONFIG.outputFile})
  -s, --start <iso_date>    Start timestamp filter (e.g. 2025-10-01T00:00:00Z)
  -e, --end <iso_date>      End timestamp filter (e.g. 2026-03-01T23:59:59Z)
  -h, --help                Show this help message
  `);
}

// ============================================================================
// 3. UTILITY HELPERS
// ============================================================================

/**
 * Builds a query criterion matching tagId both as ObjectId and as string
 */
function buildTagIdQuery(tagIdStr) {
  if (!tagIdStr) return null;
  const queries = [tagIdStr];
  if (ObjectId.isValid(tagIdStr)) {
    queries.push(new ObjectId(tagIdStr));
  }
  return { $in: queries };
}

/**
 * Builds a query criterion matching any of multiple tagIds (supporting both string and ObjectId)
 */
function buildMultiTagIdQuery(tagIdList) {
  const ids = [];
  tagIdList.forEach(id => {
    if (!id) return;
    ids.push(id);
    if (ObjectId.isValid(id)) {
      ids.push(new ObjectId(id));
    }
  });
  return { $in: ids };
}

/**
 * Masks the credentials portion of a MongoDB URI for safe logging,
 * e.g. mongodb://user:pass@host:27017 -> mongodb://user:****@host:27017
 */
function maskMongoUri(uri) {
  if (!uri) return uri;
  return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:/]+:)([^@]+)(@)/, '$1****$3');
}

/**
 * Normalizes ObjectId/string into plain 24-char string
 */
function normalizeId(id) {
  if (!id) return null;
  if (typeof id === 'object' && id.$oid) return id.$oid;
  return id.toString();
}

/**
 * Format duration in seconds to human-readable string (e.g. '4m 32s', '1h 12m')
 */
function formatDuration(seconds) {
  if (seconds === null || isNaN(seconds) || seconds < 0) return 'N/A';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hrs > 0) {
    return `${hrs}h ${mins}m ${secs}s`;
  }
  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}

/**
 * Formats a Date object or ISO string to standard UTC display string
 */
function formatDate(date) {
  if (!date) return '';
  const d = date instanceof Date ? date : new Date(date);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

/**
 * Decomposes a cabin number into possible (VIN_1, VIN_2) pairs
 * Example: '296860' -> [{ vin1: '2968', vin2: '60', combined: '296860' }]
 * Example: '296902' -> [{ vin1: '2969', vin2: '02', combined: '296902' }, { vin1: '2969', vin2: '2', combined: '296902' }]
 */
function decomposeCabinNumber(cabin) {
  const cabinStr = cabin.toString().trim();
  const combinations = [];

  // Default: first 4 digits is VIN_1, remaining digits is VIN_2
  if (cabinStr.length >= 5) {
    const vin1 = cabinStr.slice(0, 4);
    const vin2 = cabinStr.slice(4);
    combinations.push({
      vin1,
      vin2,
      vin1Values: [vin1, Number(vin1)],
      vin2Values: [vin2, Number(vin2)],
      display: `${vin1}+${vin2}`
    });

    // If vin2 starts with '0' (e.g. '02'), also check single digit '2'
    if (vin2.startsWith('0') && vin2.length > 1) {
      const stripped = vin2.replace(/^0+/, '');
      combinations.push({
        vin1,
        vin2: stripped,
        vin1Values: [vin1, Number(vin1)],
        vin2Values: [stripped, Number(stripped), vin2],
        display: `${vin1}+${stripped}`
      });
    }
  }

  // Fallback: exact match if single tag
  combinations.push({
    vin1: cabinStr,
    vin2: '',
    vin1Values: [cabinStr, Number(cabinStr)].filter(v => !isNaN(v)),
    vin2Values: [],
    display: `${cabinStr}`
  });

  return combinations;
}

/**
 * Looks up every tagName referenced in stage_config.js against the real
 * tags collection (TAGS_COLLECTION, e.g. 'tag_lives') and returns a Map of
 * tagName -> resolved _id (as a string). The hardcoded ids in stage_config.js
 * can go stale when pointed at a different DB/environment, so this is the
 * source of truth whenever CONFIG.resolveTagIds is enabled.
 */
async function fetchTagNameToIdMap(tagsCollection, tagNameField) {
  const docs = await tagsCollection.find(
    {},
    { projection: { [tagNameField]: 1 } }
  ).toArray();

  const map = new Map();
  for (const doc of docs) {
    const name = doc[tagNameField];
    if (name) map.set(name, doc._id.toString());
  }
  return map;
}

/**
 * Rebuilds STAGES (and its derived lookup tables) with tag ids resolved
 * live from the database by tagName, falling back to the hardcoded id from
 * stage_config.js — with a warning — when a tagName isn't found.
 */
function resolveStagesTagIds(baseStages, nameToId) {
  let resolvedCount = 0;
  let fallbackCount = 0;
  const unresolvedNames = [];

  const stages = baseStages.map(stage => {
    const tags = {};
    for (const role of Object.keys(stage.tags)) {
      const tag = stage.tags[role];
      if (!tag) { tags[role] = tag; continue; }

      const resolvedId = nameToId.get(tag.tagName);
      if (resolvedId) {
        resolvedCount++;
        tags[role] = { ...tag, id: resolvedId };
      } else {
        fallbackCount++;
        unresolvedNames.push(tag.tagName);
        tags[role] = tag; // keep hardcoded id from stage_config.js as fallback
      }
    }
    return { ...stage, tags };
  });

  if (fallbackCount > 0) {
    console.warn(
      `⚠️  ${fallbackCount} tag(s) not found in TAGS_COLLECTION by name — ` +
      `falling back to the hardcoded id from stage_config.js for these ` +
      `(likely stale if this DB/environment differs from where those ids ` +
      `were captured): ${unresolvedNames.slice(0, 10).join(', ')}` +
      (unresolvedNames.length > 10 ? ` (+${unresolvedNames.length - 10} more)` : '')
    );
  }
  console.log(`🔗 Tag ID resolution: ${resolvedCount} resolved from DB, ${fallbackCount} using hardcoded fallback.`);

  // Recompute derived lookup tables exactly as stage_config.js does
  const allTagIds = [];
  const tagMapById = {};
  const skidTagIds = [];
  const vin1TagIds = [];
  const vin2TagIds = [];

  stages.forEach(stage => {
    Object.keys(stage.tags).forEach(role => {
      const tag = stage.tags[role];
      if (tag && tag.id) {
        allTagIds.push(tag.id);
        tagMapById[tag.id] = {
          stageIndex: stage.index,
          stageName: stage.name,
          role,
          tagName: tag.tagName,
          dicvName: tag.dicvName
        };
        if (role === 'skidNumber') skidTagIds.push(tag.id);
        if (role === 'cabinNumber1') vin1TagIds.push(tag.id);
        if (role === 'cabinNumber2') vin2TagIds.push(tag.id);
      }
    });
  });

  return { stages, allTagIds, tagMapById, skidTagIds, vin1TagIds, vin2TagIds };
}

/**
 * Wraps a MongoDB collection so that only read operations are reachable from
 * this codebase. This tool is a reporting/export utility and must never
 * mutate production PLC data — if any future edit accidentally calls a write
 * method (insertOne, updateMany, deleteOne, drop, bulkWrite, etc.) it fails
 * loudly here instead of touching the database.
 *
 * This is a defense-in-depth safeguard, not a substitute for real DB
 * permissions — the MONGO_URI credentials used to run this tool should also
 * belong to a database user granted only the built-in `read` role. See
 * .env.example for details.
 */
const READ_ONLY_ALLOWED_METHODS = new Set([
  'find', 'findOne', 'aggregate', 'countDocuments',
  'estimatedDocumentCount', 'distinct', 'watch'
]);

function makeCollectionReadOnly(collection) {
  return new Proxy(collection, {
    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (typeof value !== 'function') return value;
      if (READ_ONLY_ALLOWED_METHODS.has(prop)) {
        return value.bind(target);
      }
      return function blockedWrite() {
        throw new Error(
          `Blocked call to collection.${String(prop)}() — this exporter is read-only ` +
          `and is not permitted to write to the database.`
        );
      };
    }
  });
}

// ============================================================================
// 4. CORE PROCESSING LOGIC
// ============================================================================

/**
 * Finds cabin identification records (Skid Number, Hanger Number, Cabin Type)
 * by actively querying BOTH VIN_1 and VIN_2 tags and verifying their concatenation.
 */
async function identifyCabinMetadata(collection, cabin, dateFilter) {
  const combinations = decomposeCabinNumber(cabin);
  console.log(`\n🔍 Searching for Cabin [${cabin}] (VIN combinations: ${combinations.map(c => c.display).join(', ')})`);

  // Active VIN 1 and VIN 2 tag ID arrays across all stages
  const allVin1TagIds = STAGES.map(s => s.tags.cabinNumber1?.id).filter(Boolean);
  const allVin2TagIds = STAGES.map(s => s.tags.cabinNumber2?.id).filter(Boolean);

  for (const combo of combinations) {
    // 1. Query VIN_1 matches from the collection
    const vin1Query = {
      [CONFIG.tagIdField]: buildMultiTagIdQuery(allVin1TagIds),
      value: { $in: combo.vin1Values },
      ...dateFilter
    };

    const vin1Entries = await collection.find(vin1Query).sort({ timestamp: 1 }).toArray();
    if (!vin1Entries || vin1Entries.length === 0) continue;

    // 2. Query VIN_2 matches from the collection if VIN_2 is expected
    let vin2Entries = [];
    if (combo.vin2 && combo.vin2Values.length > 0) {
      const vin2Query = {
        [CONFIG.tagIdField]: buildMultiTagIdQuery(allVin2TagIds),
        value: { $in: combo.vin2Values },
        ...dateFilter
      };
      vin2Entries = await collection.find(vin2Query).sort({ timestamp: 1 }).toArray();
    }

    // 3. Correlate VIN_1 and VIN_2 by Stage and Timestamp
    for (const vin1Entry of vin1Entries) {
      const vin1NormalizedTagId = normalizeId(vin1Entry[CONFIG.tagIdField]);
      const tagInfo = TAG_MAP_BY_ID[vin1NormalizedTagId];
      if (!tagInfo) continue;

      const stage = STAGES.find(s => s.name === tagInfo.stageName);
      if (!stage) continue;

      const entryTime = new Date(vin1Entry.timestamp);
      const timeWindowStart = new Date(entryTime.getTime() - CONFIG.vinPairToleranceMs);
      const timeWindowEnd = new Date(entryTime.getTime() + CONFIG.vinPairToleranceMs);

      // Verify VIN_2 match at this stage and time window
      let matchingVin2Value = null;
      if (stage.tags.cabinNumber2?.id && combo.vin2) {
        const stageVin2TagId = stage.tags.cabinNumber2.id;
        
        // Find matching VIN_2 entry from pre-fetched vin2Entries within tolerance window
        const matchedVin2Entry = vin2Entries.find(e => {
          const entryId = normalizeId(e[CONFIG.tagIdField]);
          if (entryId !== stageVin2TagId) return false;
          const t = new Date(e.timestamp);
          return t >= timeWindowStart && t <= timeWindowEnd;
        });

        if (!matchedVin2Entry) {
          // Check directly in database as fallback
          const directVin2 = await collection.findOne({
            [CONFIG.tagIdField]: buildTagIdQuery(stageVin2TagId),
            value: { $in: combo.vin2Values },
            timestamp: { $gte: timeWindowStart, $lte: timeWindowEnd }
          });

          if (!directVin2) {
            continue; // VIN_2 does not match at this timestamp
          }
          matchingVin2Value = directVin2.value;
        } else {
          matchingVin2Value = matchedVin2Entry.value;
        }
      }

      // Reconstruct combined cabin number check
      const combinedFound = matchingVin2Value !== null 
        ? `${vin1Entry.value}${matchingVin2Value}` 
        : `${vin1Entry.value}`;
      
      console.log(`   🔗 Matched VIN Tags at Stage '${stage.name}': VIN1=${vin1Entry.value} + VIN2=${matchingVin2Value || ''} -> Combined=[${combinedFound}]`);

      // 4. Retrieve associated Skid Number, Hanger Number, and Cabin Type for this stage & time window
      const stageMetadataTagIds = [
        stage.tags.skidNumber?.id,
        stage.tags.hangerNumber?.id,
        stage.tags.cabinType?.id
      ].filter(Boolean);

      const metadataEntries = await collection.find({
        [CONFIG.tagIdField]: buildMultiTagIdQuery(stageMetadataTagIds),
        timestamp: { $gte: timeWindowStart, $lte: timeWindowEnd }
      }).sort({ timestamp: 1 }).toArray();

      // Extract Skid Number
      let skidNumber = null;
      if (stage.tags.skidNumber?.id) {
        const skidEntry = metadataEntries.find(e => normalizeId(e[CONFIG.tagIdField]) === stage.tags.skidNumber.id && e.value != null && e.value != 0);
        if (skidEntry) skidNumber = skidEntry.value;
      }

      // Extract Cabin Type
      let cabinType = null;
      if (stage.tags.cabinType?.id) {
        const typeEntry = metadataEntries.find(e => normalizeId(e[CONFIG.tagIdField]) === stage.tags.cabinType.id && e.value != null);
        if (typeEntry) cabinType = typeEntry.value;
      }

      // Extract Hanger Number
      let hangerNumber = null;
      if (stage.tags.hangerNumber?.id) {
        const hangerEntry = metadataEntries.find(e => normalizeId(e[CONFIG.tagIdField]) === stage.tags.hangerNumber.id && e.value != null);
        if (hangerEntry) hangerNumber = hangerEntry.value;
      }

      if (skidNumber !== null) {
        console.log(`   ✅ Resolved Metadata: Skid=${skidNumber}, Hanger=${hangerNumber || 'N/A'}, Type=${cabinType || 'N/A'}, Time=${entryTime.toISOString()}`);
        return {
          cabinNumber: cabin,
          resolvedCombinedCabin: combinedFound,
          skidNumber: skidNumber,
          cabinType: cabinType,
          hangerNumber: hangerNumber,
          initialStage: stage.name,
          initialTime: entryTime
        };
      }
    }
  }

  console.log(`   ⚠️ Could not resolve Skid Number for Cabin [${cabin}]`);
  return {
    cabinNumber: cabin,
    resolvedCombinedCabin: cabin,
    skidNumber: null,
    cabinType: null,
    hangerNumber: null,
    initialStage: null,
    initialTime: null
  };
}

/**
 * Tracks a Skid Number across all 23 stages in chronological order
 */
async function trackSkidAcrossStages(collection, metadata, dateFilter) {
  const { cabinNumber, skidNumber, cabinType, hangerNumber, initialTime } = metadata;
  const stageResults = [];

  if (!skidNumber) {
    // If no skid number found, return empty entries for all stages
    STAGES.forEach(stage => {
      stageResults.push({
        cabinNumber,
        cabinType: cabinType || 'N/A',
        skidNumber: 'NOT_FOUND',
        hangerNumber: hangerNumber || 'N/A',
        stageName: stage.name,
        stageIndex: stage.index,
        entryTime: null,
        exitTime: null,
        durationSeconds: null,
        durationFormatted: 'N/A'
      });
    });
    return stageResults;
  }

  // Accept skid number as number and as string
  const skidValues = [skidNumber, skidNumber.toString(), Number(skidNumber)].filter(v => v !== undefined && !isNaN(v));

  // Time boundary for tracking (from slightly before initial detection)
  const trackStartTime = initialTime ? new Date(initialTime.getTime() - 60000) : null;

  let lastKnownExitTime = trackStartTime;

  for (let i = 0; i < STAGES.length; i++) {
    const stage = STAGES[i];
    const skidTagId = stage.tags.skidNumber?.id;

    if (!skidTagId) {
      stageResults.push({
        cabinNumber,
        cabinType: cabinType || 'N/A',
        skidNumber,
        hangerNumber: hangerNumber || 'N/A',
        stageName: stage.name,
        stageIndex: stage.index,
        entryTime: null,
        exitTime: null,
        durationSeconds: null,
        durationFormatted: 'NO_TAG'
      });
      continue;
    }

    // Query time-series entries for this stage's skid tag
    const query = {
      [CONFIG.tagIdField]: buildTagIdQuery(skidTagId),
      value: { $in: skidValues },
      ...(lastKnownExitTime ? { timestamp: { $gte: lastKnownExitTime } } : {})
    };

    if (dateFilter.timestamp) {
      query.timestamp = { ...(query.timestamp || {}), ...dateFilter.timestamp };
    }

    // Find entries where skid tag matched this skid number
    const skidHistory = await collection.find(query).sort({ timestamp: 1 }).toArray();

    if (skidHistory && skidHistory.length > 0) {
      const entryTimestamp = new Date(skidHistory[0].timestamp);
      let exitTimestamp = new Date(skidHistory[skidHistory.length - 1].timestamp);

      // Look ahead for the next entry where skid changed to something else
      const nextChange = await collection.findOne({
        [CONFIG.tagIdField]: buildTagIdQuery(skidTagId),
        timestamp: { $gt: exitTimestamp }
      }, { sort: { timestamp: 1 } });

      if (nextChange) {
        exitTimestamp = new Date(nextChange.timestamp);
      }

      // Calculate duration
      let durationSeconds = Math.max(0, Math.round((exitTimestamp.getTime() - entryTimestamp.getTime()) / 1000));
      
      // If entry and exit are identical (single reading), mark a minimum duration or note
      if (durationSeconds === 0 && skidHistory.length === 1) {
        durationSeconds = 0;
      }

      lastKnownExitTime = exitTimestamp;

      stageResults.push({
        cabinNumber,
        cabinType: cabinType || 'N/A',
        skidNumber,
        hangerNumber: hangerNumber || 'N/A',
        stageName: stage.name,
        stageIndex: stage.index,
        entryTime: entryTimestamp,
        exitTime: exitTimestamp,
        durationSeconds: durationSeconds,
        durationFormatted: formatDuration(durationSeconds)
      });
    } else {
      // Skid not observed in this stage
      stageResults.push({
        cabinNumber,
        cabinType: cabinType || 'N/A',
        skidNumber,
        hangerNumber: hangerNumber || 'N/A',
        stageName: stage.name,
        stageIndex: stage.index,
        entryTime: null,
        exitTime: null,
        durationSeconds: null,
        durationFormatted: 'N/A'
      });
    }
  }

  return stageResults;
}

/**
 * Formats stage tracking rows into CSV text
 */
function convertToCSV(rows) {
  const headers = [
    'Cabin Number',
    'Cabin Type',
    'Skid Number',
    'Hanger Number',
    'Stage Name',
    'Stage Index',
    'Entry Time (UTC)',
    'Exit Time (UTC)',
    'Duration (Seconds)',
    'Duration (Formatted)'
  ];

  const lines = [headers.join(',')];

  rows.forEach(row => {
    const values = [
      `"${row.cabinNumber}"`,
      `"${row.cabinType || ''}"`,
      `"${row.skidNumber}"`,
      `"${row.hangerNumber || ''}"`,
      `"${row.stageName}"`,
      row.stageIndex,
      `"${formatDate(row.entryTime)}"`,
      `"${formatDate(row.exitTime)}"`,
      row.durationSeconds !== null ? row.durationSeconds : '',
      `"${row.durationFormatted}"`
    ];
    lines.push(values.join(','));
  });

  return lines.join('\n');
}

// ============================================================================
// 5. MAIN EXECUTION ENTRYPOINT
// ============================================================================
async function main() {
  const options = parseCliArgs();

  console.log('===============================================================');
  console.log(' DICV Paint Shop Digital Twin - Cabin & Stage Tracking Exporter');
  console.log('===============================================================');
  console.log(`🔌 Mongo URI:   ${maskMongoUri(options.mongoUri)}`);
  console.log(`🗄️  Database:    ${options.dbName}`);
  console.log(`📊 Collection:  ${options.timeSeriesCollection}`);
  console.log(`🎯 Target Cabins (${options.cabins.length}): ${options.cabins.join(', ')}`);
  console.log(`📁 Output File: ${options.outputFile}`);
  if (options.startTime || options.endTime) {
    console.log(`⏱️ Date Range:  ${options.startTime || 'Start'} -> ${options.endTime || 'Now'}`);
  }
  console.log('---------------------------------------------------------------');

  // Build Date Filter
  const dateFilter = {};
  if (options.startTime || options.endTime) {
    dateFilter.timestamp = {};
    if (options.startTime) dateFilter.timestamp.$gte = new Date(options.startTime);
    if (options.endTime) dateFilter.timestamp.$lte = new Date(options.endTime);
  }

  let client;
  try {
    console.log('\nConnecting to MongoDB (read-only)...');
    client = new MongoClient(options.mongoUri, {
      readPreference: options.readPreference
    });
    await client.connect();
    console.log('✅ Connected to MongoDB successfully.');

    const db = client.db(options.dbName);
    // Wrapped so only find/aggregate/count-style calls are reachable from this tool.
    const collection = makeCollectionReadOnly(db.collection(options.timeSeriesCollection));

    // Verify collection access
    const count = await collection.estimatedDocumentCount().catch(() => 0);
    console.log(`📋 Time-series collection estimated documents: ${count.toLocaleString()}`);

    // Resolve tag ObjectIds live from TAGS_COLLECTION (by tagName), instead of
    // trusting the ids hardcoded in stage_config.js, which go stale whenever
    // this tool is pointed at a different DB/environment.
    if (CONFIG.resolveTagIds) {
      console.log(`\n🔎 Resolving tag ids from '${options.tagsCollection}' (field: ${CONFIG.tagNameField})...`);
      const tagsCollection = makeCollectionReadOnly(db.collection(options.tagsCollection));
      const nameToId = await fetchTagNameToIdMap(tagsCollection, CONFIG.tagNameField);
      console.log(`   Found ${nameToId.size} tag document(s) in '${options.tagsCollection}'.`);

      const resolved = resolveStagesTagIds(STAGES, nameToId);
      STAGES = resolved.stages;
      ALL_TAG_IDS = resolved.allTagIds;
      TAG_MAP_BY_ID = resolved.tagMapById;
      SKID_TAG_IDS = resolved.skidTagIds;
      VIN1_TAG_IDS = resolved.vin1TagIds;
      VIN2_TAG_IDS = resolved.vin2TagIds;
    } else {
      console.log('\n⚠️  RESOLVE_TAG_IDS=false — using hardcoded tag ids from stage_config.js as-is.');
    }

    const allResults = [];

    for (const cabin of options.cabins) {
      // Step 1: Identify cabin metadata (Skid Number, Hanger, Cabin Type)
      const metadata = await identifyCabinMetadata(collection, cabin, dateFilter);

      // Step 2: Track Skid across all 23 stages
      const stagesData = await trackSkidAcrossStages(collection, metadata, dateFilter);
      allResults.push(...stagesData);
    }

    // Step 3: Write Output CSV
    const csvContent = convertToCSV(allResults);
    const outputDir = path.dirname(options.outputFile);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    fs.writeFileSync(options.outputFile, csvContent, 'utf8');

    console.log('\n===============================================================');
    console.log(`✅ CSV exported successfully to: ${options.outputFile}`);
    console.log(`📊 Total rows generated: ${allResults.length}`);
    console.log('===============================================================');

    // Display summary preview in console
    console.log('\nSample Preview (First 10 rows):');
    console.table(allResults.slice(0, 10).map(r => ({
      Cabin: r.cabinNumber,
      Type: r.cabinType,
      Skid: r.skidNumber,
      Hanger: r.hangerNumber,
      Stage: r.stageName,
      Entry: formatDate(r.entryTime),
      Exit: formatDate(r.exitTime),
      Duration: r.durationFormatted
    })));

  } catch (error) {
    console.error('\n❌ Execution Error:', error.message);
    console.error(error.stack);
    process.exitCode = 1;
  } finally {
    if (client) {
      await client.close();
      console.log('🔒 MongoDB connection closed.');
    }
  }
}

// Run main
if (require.main === module) {
  main();
}

module.exports = {
  identifyCabinMetadata,
  trackSkidAcrossStages,
  decomposeCabinNumber,
  convertToCSV,
  fetchTagNameToIdMap,
  resolveStagesTagIds,
  makeCollectionReadOnly,
  maskMongoUri,
  CONFIG
};

# DICV Paint Shop — MongoDB Cabin & Stage Tracking Exporter

Node.js helper utility to extract and track cabin progress through all 23 paint shop stages from MongoDB PLC time-series data.

## Features
- **Automatic VIN Combination Resolution**: Matches combined cabin numbers (e.g. `296860` → `2968` + `60`, `296902` → `2969` + `02` / `2`) across `Serial_No_VIN_1` and `Serial_No_VIN_2`.
- **Skid & Hanger Metadata Resolution**: Extracts the cabin's assigned `Skid Number` (`Dip_Paint_skid`), `Hanger Number` (`Hanger_RFID_Data`), and `Cabin Type` (`Cab_Body_Code`).
- **Full 23-Stage Tracking**: Follows the `Skid Number` across all 23 stages (from `LOADING` to `SEC 22`).
- **Entry & Exit Timestamping via Skid**: Computes exact Stage Entry, Stage Exit, and dwell Duration per stage using Skid Number arrival and departure transitions.
- **CSV Output**: Outputs clean CSV with detailed breakdown.

---

## 23 Stages Tracked

| # | Stage Name | Cabin Type Tag | VIN 1 Tag | VIN 2 Tag | Skid Tag | Hanger Tag |
|---|------------|----------------|-----------|-----------|----------|------------|
| 1 | LOADING | `RB_File[172].Cab_Body_Code` | `RB_File[172].Serial_No_VIN_1` | `RB_File[172].Serial_No_VIN_2` | `RB_File[172].Dip_Paint_skid` | `Hanger_RFID_Data[1]` |
| 2 | PRE DEGREASE | `RB_File[173].Cab_Body_Code` | `RB_File[173].Serial_No_VIN_1` | `RB_File[173].Serial_No_VIN_2` | `RB_File[173].Dip_Paint_skid` | `Hanger_RFID_Data[2]` |
| 3 | SEC 3 (Mist) | `RB_File[174].Cab_Body_Code` | `RB_File[174].Serial_No_VIN_1` | `RB_File[174].Serial_No_VIN_2` | `RB_File[174].Dip_Paint_skid` | `Hanger_RFID_Data[3]` |
| 4 | DEGREASING DIP | `RB_File[175].Cab_Body_Code` | `RB_File[175].Serial_No_VIN_1` | `RB_File[175].Serial_No_VIN_2` | `RB_File[175].Dip_Paint_skid` | `Hanger_RFID_Data[4]` |
| 5 | SEC 5 | `RB_File[176].Cab_Body_Code` | `RB_File[176].Serial_No_VIN_1` | `RB_File[176].Serial_No_VIN_2` | `RB_File[176].Dip_Paint_skid` | `Hanger_RFID_Data[5]` |
| 6 | WATER RINSE 1&2 | `RB_File[177].Cab_Body_Code` | `RB_File[177].Serial_No_VIN_1` | `RB_File[177].Serial_No_VIN_2` | `RB_File[177].Dip_Paint_skid` | `Hanger_RFID_Data[6]` |
| 7 | ACTIVATION | `RB_File[178].Cab_Body_Code` | `RB_File[178].Serial_No_VIN_1` | `RB_File[178].Serial_No_VIN_2` | `RB_File[178].Dip_Paint_skid` | `Hanger_RFID_Data[7]` |
| 8 | PHOSPATING | `RB_File[179].Cab_Body_Code` | `RB_File[179].Serial_No_VIN_1` | `RB_File[179].Serial_No_VIN_2` | `RB_File[179].Dip_Paint_skid` | `Hanger_RFID_Data[8]` |
| 9 | SEC 9 | `RB_File[180].Cab_Body_Code` | `RB_File[180].Serial_No_VIN_1` | `RB_File[180].Serial_No_VIN_2` | `RB_File[180].Dip_Paint_skid` | `Hanger_RFID_Data[9]` |
| 10 | WATER RINSE 3&4 | `RB_File[181].Cab_Body_Code` | `RB_File[181].Serial_No_VIN_1` | `RB_File[181].Serial_No_VIN_2` | `RB_File[181].Dip_Paint_skid` | `Hanger_RFID_Data[10]` |
| 11 | WATER RINSE 5 | `RB_File[182].Cab_Body_Code` | `RB_File[182].Serial_No_VIN_1` | `RB_File[182].Serial_No_VIN_2` | `RB_File[182].Dip_Paint_skid` | `Hanger_RFID_Data[11]` |
| 12 | DA WATER SPRAY | `RB_File[183].Cab_Body_Code` | `RB_File[183].Serial_No_VIN_1` | `RB_File[183].Serial_No_VIN_2` | `RB_File[183].Dip_Paint_skid` | `Hanger_RFID_Data[12]` |
| 13 | SEC 12 A | `RB_File[184].Cab_Body_Code` | `RB_File[184].Serial_No_VIN_1` | `RB_File[184].Serial_No_VIN_2` | `RB_File[184].Dip_Paint_skid` | `Hanger_RFID_Data[13]` |
| 14 | SEC 13 | `RB_File[185].Cab_Body_Code` | `RB_File[185].Serial_No_VIN_1` | `RB_File[185].Serial_No_VIN_2` | `RB_File[185].Dip_Paint_skid` | `Hanger_RFID_Data[14]` |
| 15 | SEC 14 | `RB_File[186].Cab_Body_Code` | `RB_File[186].Serial_No_VIN_1` | `RB_File[186].Serial_No_VIN_2` | `RB_File[186].Dip_Paint_skid` | `Hanger_RFID_Data[15]` |
| 16 | E COAT | `RB_File[187].Cab_Body_Code` | `RB_File[187].Serial_No_VIN_1` | `RB_File[187].Serial_No_VIN_2` | `RB_File[187].Dip_Paint_skid` | `Hanger_RFID_Data[16]` |
| 17 | SEC 16 | `RB_File[188].Cab_Body_Code` | `RB_File[188].Serial_No_VIN_1` | `RB_File[188].Serial_No_VIN_2` | `RB_File[188].Dip_Paint_skid` | `Hanger_RFID_Data[17]` |
| 18 | UF RINSE-1 (SPRAY) | `RB_File[189].Cab_Body_Code` | `RB_File[189].Serial_No_VIN_1` | `RB_File[189].Serial_No_VIN_2` | `RB_File[189].Dip_Paint_skid` | `Hanger_RFID_Data[18]` |
| 19 | UF RINSE-2 (DIP) | `RB_File[190].Cab_Body_Code` | `RB_File[190].Serial_No_VIN_1` | `RB_File[190].Serial_No_VIN_2` | `RB_File[190].Dip_Paint_skid` | `Hanger_RFID_Data[19]` |
| 20 | SEC 19 | `RB_File[191].Cab_Body_Code` | `RB_File[191].Serial_No_VIN_1` | `RB_File[191].Serial_No_VIN_2` | `RB_File[191].Dip_Paint_skid` | `Hanger_RFID_Data[20]` |
| 21 | RCDI WATER SPRAY | `RB_File[192].Cab_Body_Code` | `RB_File[192].Serial_No_VIN_1` | `RB_File[192].Serial_No_VIN_2` | `RB_File[192].Dip_Paint_skid` | `Hanger_RFID_Data[21]` |
| 22 | SEC 21 | `RB_File[193].Cab_Body_Code` | `RB_File[193].Serial_No_VIN_1` | `RB_File[193].Serial_No_VIN_2` | `RB_File[193].Dip_Paint_skid` | `Hanger_RFID_Data[22]` |
| 23 | SEC 22 | `RB_File[194].Cab_Body_Code` | `RB_File[194].Serial_No_VIN_1` | `RB_File[194].Serial_No_VIN_2` | `RB_File[194].Dip_Paint_skid` | `Hanger_RFID_Data[23]` |

---

## Installation & Setup

1. Navigate to the utility directory:
   ```bash
   cd DICV_Paint_Shop_DT/Assets/Tools/DICV_Data_Exporter
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the example and fill in real values (never
   commit `.env` — only `.env.example` should be in version control):
   ```bash
   cp .env.example .env
   ```

4. **Use a read-only database user.** `MONGO_URI` should point to a Mongo
   user granted only the built-in `read` role on `dicv_dt`, never
   `readWrite`. This tool only performs `find`/`aggregate`/count-style
   queries — it never writes — and enforces that in code too (see
   "Read-Only by Design" below), but a read-only DB user is the real
   guarantee.

---

## Running the Exporter

### 1. Default Run (with predefined cabins):
```bash
node export.js
```

### 2. Custom Cabins:
```bash
node export.js --cabins 296860,296902,296854,296855,286858,296861,296876
```

### 3. Custom Database & Collection:
```bash
node export.js --db dicv_dt --col taghistories
```
Prefer setting `MONGO_URI` in `.env` over passing `--uri` with credentials on
the command line — CLI args can be visible in shell history and process
lists (`ps`).

### 4. With Date Range Filtering:
```bash
node export.js --start 2025-10-01T00:00:00Z --end 2026-03-01T23:59:59Z
```

### 5. Custom Output File:
```bash
node export.js --output ./output/dicv_tracking_results.csv
```

---

## Read-Only by Design

This tool only ever reads PLC/cabin tracking data — it must never modify the
`dicv_dt` database. That's enforced two ways:

1. **Database user permissions** (the real guarantee): `MONGO_URI` should
   use a Mongo user with only the `read` role — see `.env.example`.
2. **Code-level safeguard**: the MongoDB `collection` object this script
   uses is wrapped so only `find`, `findOne`, `aggregate`,
   `countDocuments`, `estimatedDocumentCount`, `distinct`, and `watch` are
   callable. Any accidental call to a write method (`insertOne`,
   `updateMany`, `deleteOne`, `drop`, `bulkWrite`, etc.) throws immediately
   instead of touching the database — even if a future code change adds one
   by mistake.

The driver also defaults to `readPreference=secondaryPreferred`
(configurable via `READ_PREFERENCE` in `.env`), since a read-only export
tool has no reason to hit the primary.

## Configuration

All configuration lives in `.env` (copy `.env.example` to `.env`) — nothing
is hardcoded in `export.js`. CLI flags (`--uri`, `--db`, `--cabins`, etc.)
override the corresponding `.env` value for one-off runs. See
`.env.example` for the full list of variables (`MONGO_URI`, `DB_NAME`,
`TIMESERIES_COLLECTION`, `TAGS_COLLECTION`, `TAG_ID_FIELD`,
`TAG_NAME_FIELD`, `RESOLVE_TAG_IDS`, `READ_PREFERENCE`, `CABINS`,
`OUTPUT_FILE`, `START_TIME`, `END_TIME`, `VIN_PAIR_TOLERANCE_MS`).

### Field names differ by deployment

Different environments use different field names for the tag reference in
the time-series collection — e.g. `taghistories` docs use `tagId`, while
`liveData_test` docs use `tag_id`. Set `TAG_ID_FIELD` in `.env` to match
whatever your actual collection uses; the script no longer assumes `tagId`.

### Tag ID resolution (`RESOLVE_TAG_IDS`)

`stage_config.js` ships with ~115 hardcoded MongoDB ObjectIds mapping each
stage/role (e.g. `LOADING` → `skidNumber`) to a tag document. Those ids are
only valid for the specific database they were captured from — pointed at a
different DB (a different `DB_NAME`/environment), the real `_id` values in
your `TAGS_COLLECTION` will very likely differ even for tags with the same
name, and every query would silently return zero rows.

By default (`RESOLVE_TAG_IDS=true`) the exporter now looks up every tag by
its `tagName` (field configurable via `TAG_NAME_FIELD`, e.g. `tagname`) in
`TAGS_COLLECTION` at startup and uses the *live* `_id` it finds there. Any
tag it can't find by name falls back to the hardcoded id from
`stage_config.js`, with a console warning listing which ones — treat that
warning as a signal those stages likely need `stage_config.js` updated or
the tag needs renaming/creating in the DB.

Set `RESOLVE_TAG_IDS=false` to skip this and use the hardcoded ids as-is
(e.g. if you know your `TAGS_COLLECTION` doesn't have matching `tagName`
values and you'd rather rely on the static mapping).

## Output CSV Format

The generated CSV contains the following columns:
```csv
Cabin Number,Cabin Type,Skid Number,Hanger Number,Stage Name,Stage Index,Entry Time (UTC),Exit Time (UTC),Duration (Seconds),Duration (Formatted)
"296860","Body_101","42","H-12","LOADING",1,"2025-10-16T04:56:21.955Z","2025-10-16T05:01:21.955Z",300,"5m 0s"
"296860","Body_101","42","H-12","PRE DEGREASE",2,"2025-10-16T05:02:10.000Z","2025-10-16T05:07:15.000Z",305,"5m 5s"
...
```

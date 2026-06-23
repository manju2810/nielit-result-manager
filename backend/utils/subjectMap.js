/**
 * Maps raw subject codes found in the Result file / YN file
 * to the fixed subject keys defined in the ALevelStudent / OLevelStudent schemas.
 */

// O-Level: result file uses M1, M2, M3, M4 — schema keys add _R4 suffix
const O_LEVEL_RAW_TO_KEY = {
  M1: "M1_R4",
  M2: "M2_R4",
  M3: "M3_R4",
  M4: "M4_R4",
};

// YN file headers for O-Level already match schema-ish names
const O_LEVEL_YN_HEADER_TO_KEY = {
  M1_R4: "M1_R4",
  M2_R4: "M2_R4",
  M3_R4: "M3_R4",
  M4_R4: "M4_R4",
  M4_3_R4: "M4_R4", // legacy header fallback, just in case
  Project: "Project",
};

// A-Level: schema has fixed A1..A10 + PR5. Result file has electives like
// A9.1..A9.5 and A10.1..A10.5 — these all collapse onto A9 / A10.
function aLevelRawToKey(rawCode) {
  // Strip decimal sub-variant: "A9.2" -> "A9", "A10.4" -> "A10"
  const base = rawCode.split(".")[0];
  const validKeys = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "PR5"];
  return validKeys.includes(base) ? base : null;
}

function oLevelRawToKey(rawCode) {
  return O_LEVEL_RAW_TO_KEY[rawCode] || null;
}

const A_LEVEL_YN_HEADERS = ["A1", "A2", "A3", "A4", "A5", "A6", "A7", "A8", "A9", "A10", "PR5"];
const O_LEVEL_YN_HEADERS = ["M1_R4", "M2_R4", "M3_R4", "M4_R4", "Project"];

module.exports = {
  oLevelRawToKey,
  aLevelRawToKey,
  O_LEVEL_YN_HEADER_TO_KEY,
  A_LEVEL_YN_HEADERS,
  O_LEVEL_YN_HEADERS,
};
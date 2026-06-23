const ExcelJS = require("exceljs");
const {
  oLevelRawToKey,
  aLevelRawToKey,
  O_LEVEL_YN_HEADER_TO_KEY,
  A_LEVEL_YN_HEADERS,
} = require("./subjectMap");

// Matches "M1-R5.1 ( B )", "A9.2-R5.1 ( ABS )", and also "PR5 ( B )" (no paper-version segment)
const RESULT_REGEX = /^([A-Za-z0-9.]+)\s*(?:-\s*([^()]+?))?\s*\(\s*([^)]+?)\s*\)\s*$/;

function cleanStr(val) {
  if (val === null || val === undefined) return null;
  const s = String(val).trim();
  return s.length ? s : null;
}

function gradeToStatus(grade) {
  if (!grade) return null;
  const g = grade.trim().toUpperCase();
  if (g === "ABS") return "ABSENT";
  if (g === "F") return "FAIL";
  // A, B, C, D and anything else not ABS/F is treated as a pass grade
  return "PASS";
}

/**
 * Read the first worksheet of a workbook buffer into an array of row-objects
 * keyed by the header row (row 1).
 */
async function readSheetAsObjects(buffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];

  const headerRow = sheet.getRow(1);
  const headers = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber] = cleanStr(cell.value);
  });

  const rows = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header
    const obj = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headers[colNumber];
      if (key) obj[key] = cell.value;
    });
    const hasAnyValue = Object.values(obj).some(
      (v) => v !== null && v !== undefined && String(v).trim() !== ""
    );
    if (hasAnyValue) rows.push(obj);
  });

  return rows;
}

/**
 * Parse a YN (registration) file.
 * Returns: Map<regn_no, { regn_no, roll_no, name, father_name, batch_no,
 *                          exam_app_no, cycle_name, registered: { subjectKey: true } }>
 */
async function parseYNFile(buffer, course) {
  const rows = await readSheetAsObjects(buffer);
  const result = new Map();

  const subjectHeaders = course === "A_LEVEL" ? A_LEVEL_YN_HEADERS : Object.keys(O_LEVEL_YN_HEADER_TO_KEY);

  for (const row of rows) {
    const regn_no = cleanStr(row.Regn_No);
    if (!regn_no) continue;

    const registered = {};
    for (const header of subjectHeaders) {
      if (!(header in row)) continue;
      const key = course === "A_LEVEL" ? header : O_LEVEL_YN_HEADER_TO_KEY[header];
      if (!key) continue;
      const val = cleanStr(row[header]);
      registered[key] = val !== null && val.toLowerCase() === "yes";
    }

    result.set(regn_no, {
      regn_no,
      roll_no: cleanStr(row.Roll_No),
      name: cleanStr(row.Name),
      father_name: cleanStr(row.Father_Name),
      batch_no: cleanStr(row.Batch_No),
      exam_app_no: cleanStr(row.Examination_Application_No),
      cycle_name: cleanStr(row.Month_year_Level),
      registered,
    });
  }

  return result;
}

/**
 * Parse a Result file (one row per subject result).
 */
async function parseResultFile(buffer, course) {
  const rows = await readSheetAsObjects(buffer);
  const result = new Map();
  const skipped = [];

  for (const row of rows) {
    const regn_no = cleanStr(row.Regn_No);
    const resultStr = cleanStr(row.Result);
    if (!regn_no || !resultStr) continue;

    const match = resultStr.match(RESULT_REGEX);
    if (!match) {
      skipped.push({ regn_no, raw: resultStr });
      continue;
    }
    const [, rawCode, , gradeRaw] = match;
    const key = course === "A_LEVEL" ? aLevelRawToKey(rawCode) : oLevelRawToKey(rawCode);
    if (!key) {
      skipped.push({ regn_no, raw: resultStr });
      continue;
    }

    const grade = gradeRaw.trim().toUpperCase();
    const status = gradeToStatus(grade);

    if (!result.has(regn_no)) {
      result.set(regn_no, {
        regn_no,
        roll_no: cleanStr(row.Roll_No),
        name: cleanStr(row.Candidate_Name),
        father_name: cleanStr(row.Fathers_Name),
        subjects: [],
      });
    }
    result.get(regn_no).subjects.push({ key, raw_code: rawCode, grade, status });
  }

  return { data: result, skipped };
}

module.exports = { parseYNFile, parseResultFile, gradeToStatus };
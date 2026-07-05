const ExcelJS = require("exceljs");
const {
  oLevelRawToKey,
  aLevelRawToKey,
  O_LEVEL_YN_HEADER_TO_KEY,
  A_LEVEL_YN_HEADERS,
} = require("./subjectMap");
const { parseHtmlTable, looksLikeHtml } = require("./htmlTableParser");

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

// Strips punctuation/spacing so "Regn_No", "Regn.No.", "Regn No" all match the same key
function normalizeHeader(h) {
  return String(h || "").replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
}

function normalizeRow(row) {
  const norm = {};
  for (const [k, v] of Object.entries(row)) {
    norm[normalizeHeader(k)] = v;
  }
  return norm;
}

/**
 * Read tabular data from a buffer into an array of row-objects keyed by header text.
 * Auto-detects format: real .xlsx spreadsheet, or an HTML table saved with a
 * .xls/.xlsx extension (a format the NIELIT portal sometimes exports).
 */
async function readSheetAsObjects(buffer) {
  if (looksLikeHtml(buffer)) {
    return parseHtmlTable(buffer);
  }

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
    // Skip fully blank rows
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
    if (!regn_no) continue; // students with no Regn_No (e.g. "Not Applied"/"Dropout") can't be tracked per-student

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
 * Returns: Map<regn_no, { regn_no, roll_no, name, father_name, category,
 *                          subjects: [{ key, raw_code, grade, status }] }>
 */
async function parseResultFile(buffer, course) {
  const rows = await readSheetAsObjects(buffer);
  const result = new Map();
  const skipped = [];

  for (const row of rows) {
    const norm = normalizeRow(row);
    const regn_no = cleanStr(norm.regnno);
    const resultStr = cleanStr(norm.result);
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
        roll_no: cleanStr(norm.rollno),
        name: cleanStr(norm.candidatename),
        father_name: cleanStr(norm.fathersname),
        category: cleanStr(norm.category),
        subjects: [],
      });
    }
    result.get(regn_no).subjects.push({ key, raw_code: rawCode, grade, status });
  }

  return { data: result, skipped };
}

/**
 * Parse a Student Registration (enrollment) file — one row per student,
 * one-time demographic/enrollment info (not tied to a specific exam cycle).
 * Returns: Map<regn_no, { regn_no, name, father_name, mother_name, dob,
 *                          enrollment_app_no, batch, expiry_date,
 *                          address, city, state, pincode, level }>
 */
async function parseStudentRegistrationFile(buffer) {
  const rows = await readSheetAsObjects(buffer);
  const result = new Map();

  for (const row of rows) {
    const norm = normalizeRow(row);
    const regn_no = cleanStr(norm.regnno);
    if (!regn_no) continue;

    result.set(regn_no, {
      regn_no,
      name: cleanStr(norm.name),
      father_name: cleanStr(norm.fatherguardianname),
      mother_name: cleanStr(norm.mothername),
      dob: cleanStr(norm.dateofbirth),
      enrollment_app_no: cleanStr(norm.appno),
      batch: cleanStr(norm.commencedfrom),
      expiry_date: cleanStr(norm.expirydate),
      address: cleanStr(norm.address),
      city: cleanStr(norm.city),
      state: cleanStr(norm.state),
      pincode: cleanStr(norm.pincode),
      level: cleanStr(norm.level),
    });
  }

  return result;
}

module.exports = { parseYNFile, parseResultFile, parseStudentRegistrationFile, gradeToStatus };
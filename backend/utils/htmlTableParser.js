const cheerio = require("cheerio");

/**
 * NIELIT portal sometimes exports reports as HTML tables saved with a .xls/.xlsx
 * extension (not real spreadsheet binaries). This parses that HTML into the same
 * shape as a normal spreadsheet: an array of row-objects keyed by header text.
 */
function parseHtmlTable(buffer) {
  const html = buffer.toString("utf8");
  const $ = cheerio.load(html);

  const rows = $("table tr");
  if (rows.length === 0) return [];

  const headerCells = $(rows[0]).children("th, td");
  const headers = [];
  headerCells.each((i, el) => {
    headers.push($(el).text().trim());
  });

  const result = [];
  for (let i = 1; i < rows.length; i++) {
    const cells = $(rows[i]).children("th, td");
    if (cells.length === 0) continue;

    const obj = {};
    cells.each((colIdx, el) => {
      const key = headers[colIdx];
      if (key) obj[key] = $(el).text().trim();
    });

    const hasAnyValue = Object.values(obj).some((v) => v !== null && v !== undefined && v !== "");
    if (hasAnyValue) result.push(obj);
  }

  return result;
}

/**
 * Detects whether a buffer looks like an HTML document (vs a real binary
 * spreadsheet). NIELIT's fake ".xls" exports start with plain HTML tags.
 */
function looksLikeHtml(buffer) {
  const head = buffer.slice(0, 200).toString("utf8").trimStart().toLowerCase();
  return head.startsWith("<div") || head.startsWith("<html") || head.startsWith("<table") || head.startsWith("<!doctype");
}

module.exports = { parseHtmlTable, looksLikeHtml };
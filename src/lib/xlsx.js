/**
 * Minimal & robust OpenXML XLSX generator and parser without external heavy dependencies.
 * Compatible with Microsoft Excel, Google Sheets, LibreOffice, and Univer.
 */

// CRC32 table
const CRC_TABLE = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  CRC_TABLE[i] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function escapeXml(str) {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function colToLetter(colIndex) {
  let temp = null;
  let letter = "";
  let col = colIndex + 1;
  while (col > 0) {
    temp = (col - 1) % 26;
    letter = String.fromCharCode(65 + temp) + letter;
    col = Math.floor((col - temp - 1) / 26);
  }
  return letter;
}

export function letterToCol(colStr) {
  let n = 0;
  const s = String(colStr || "").toUpperCase();
  for (let i = 0; i < s.length; i++) {
    n = n * 26 + (s.charCodeAt(i) - 64);
  }
  return n - 1;
}

/**
 * Creates uncompressed ZIP container (Store method = 0), which is 100% compliant with OpenXML .xlsx
 */
function createStoreZip(files) {
  const enc = new TextEncoder();
  const fileRecords = [];
  let offset = 0;
  const chunks = [];

  for (const file of files) {
    const nameBuf = enc.encode(file.name);
    const dataBuf = typeof file.data === "string" ? enc.encode(file.data) : file.data;
    const size = dataBuf.length;
    const crc = crc32(dataBuf);

    const localHeader = new Uint8Array(30 + nameBuf.length);
    const view = new DataView(localHeader.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true); // Compression: Store (0)
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint32(14, crc, true);
    view.setUint32(18, size, true);
    view.setUint32(22, size, true);
    view.setUint16(26, nameBuf.length, true);
    view.setUint16(28, 0, true);
    localHeader.set(nameBuf, 30);

    chunks.push(localHeader, dataBuf);
    fileRecords.push({ nameBuf, crc, size, offset });
    offset += localHeader.length + dataBuf.length;
  }

  const centralDirStart = offset;
  for (const r of fileRecords) {
    const cdHeader = new Uint8Array(46 + r.nameBuf.length);
    const view = new DataView(cdHeader.buffer);
    view.setUint32(0, 0x02014b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0, true);
    view.setUint32(16, r.crc, true);
    view.setUint32(20, r.size, true);
    view.setUint32(24, r.size, true);
    view.setUint16(28, r.nameBuf.length, true);
    view.setUint16(30, 0, true);
    view.setUint16(32, 0, true);
    view.setUint16(34, 0, true);
    view.setUint16(36, 0, true);
    view.setUint32(38, 0, true);
    view.setUint32(42, r.offset, true);
    cdHeader.set(r.nameBuf, 46);
    chunks.push(cdHeader);
    offset += cdHeader.length;
  }
  const centralDirSize = offset - centralDirStart;

  const eocd = new Uint8Array(22);
  const eocdView = new DataView(eocd.buffer);
  eocdView.setUint32(0, 0x06054b50, true);
  eocdView.setUint16(4, 0, true);
  eocdView.setUint16(6, 0, true);
  eocdView.setUint16(8, fileRecords.length, true);
  eocdView.setUint16(10, fileRecords.length, true);
  eocdView.setUint32(12, centralDirSize, true);
  eocdView.setUint32(16, centralDirStart, true);
  eocdView.setUint16(20, 0, true);
  chunks.push(eocd);

  const totalLength = chunks.reduce((acc, cur) => acc + cur.length, 0);
  const out = new Uint8Array(totalLength);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}

export function buildXlsxBlob(sheets) {
  const contentTypes = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">',
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>',
    '<Default Extension="xml" ContentType="application/xml"/>',
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>',
  ];

  const rels = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
    '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>',
    '</Relationships>',
  ].join("");

  const wbRels = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
  ];

  const wbSheets = [];
  const files = [
    { name: "_rels/.rels", data: rels },
  ];

  sheets.forEach((sheet, idx) => {
    const sheetId = idx + 1;
    const rId = `rId${sheetId}`;
    contentTypes.push(`<Override PartName="/xl/worksheets/sheet${sheetId}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`);
    wbRels.push(`<Relationship Id="${rId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${sheetId}.xml"/>`);
    wbSheets.push(`<sheet name="${escapeXml(sheet.name || `Sheet${sheetId}`)}" sheetId="${sheetId}" r:id="${rId}"/>`);

    const sheetXml = [
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
      '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">',
      '<sheetData>',
    ];

    (sheet.cells || []).forEach((row, r) => {
      let rowHasData = false;
      const rowXml = [];
      row.forEach((cellVal, c) => {
        if (cellVal !== undefined && cellVal !== null && cellVal !== "") {
          rowHasData = true;
          const cellRef = colToLetter(c) + (r + 1);
          const isNum = typeof cellVal === "number" || (!isNaN(cellVal) && !isNaN(parseFloat(cellVal)) && !String(cellVal).startsWith("0"));
          if (isNum && !String(cellVal).includes("/") && !String(cellVal).includes("-")) {
            rowXml.push(`<c r="${cellRef}"><v>${cellVal}</v></c>`);
          } else {
            rowXml.push(`<c r="${cellRef}" t="inlineStr"><is><t>${escapeXml(cellVal)}</t></is></c>`);
          }
        }
      });
      if (rowHasData) {
        sheetXml.push(`<row r="${r + 1}">${rowXml.join("")}</row>`);
      }
    });

    sheetXml.push("</sheetData></worksheet>");
    files.push({ name: `xl/worksheets/sheet${sheetId}.xml`, data: sheetXml.join("") });
  });

  contentTypes.push("</Types>");
  wbRels.push("</Relationships>");

  const workbookXml = [
    '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
    '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">',
    '<sheets>',
    wbSheets.join(""),
    '</sheets>',
    '</workbook>',
  ].join("");

  files.push({ name: "[Content_Types].xml", data: contentTypes.join("") });
  files.push({ name: "xl/workbook.xml", data: workbookXml });
  files.push({ name: "xl/_rels/workbook.xml.rels", data: wbRels.join("") });

  const zipBytes = createStoreZip(files);
  return new Blob([zipBytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadXlsx(filename, sheets) {
  const blob = buildXlsxBlob(sheets);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Evaluates formula string starting with "=" (e.g. =SUM(A1:A5), =AVERAGE(B1:B10))
 */
export function evaluateFormula(val, getCell) {
  if (typeof val !== "string" || !val.startsWith("=")) return val;
  const expr = val.slice(1).trim();
  const upper = expr.toUpperCase();

  const fnMatch = upper.match(/^(SUM|AVERAGE|COUNT|MAX|MIN)\(([A-Z]+[0-9]+):([A-Z]+[0-9]+)\)$/);
  if (fnMatch) {
    const [, fn, start, end] = fnMatch;
    const sCol = start.match(/[A-Z]+/)[0];
    const sRow = parseInt(start.match(/[0-9]+/)[0], 10);
    const eCol = end.match(/[A-Z]+/)[0];
    const eRow = parseInt(end.match(/[0-9]+/)[0], 10);

    const c1 = Math.min(letterToCol(sCol), letterToCol(eCol));
    const c2 = Math.max(letterToCol(sCol), letterToCol(eCol));
    const r1 = Math.min(sRow, eRow);
    const r2 = Math.max(sRow, eRow);

    const nums = [];
    for (let r = r1; r <= r2; r++) {
      for (let c = c1; c <= c2; c++) {
        const raw = getCell(r - 1, c);
        const v = parseFloat(raw);
        if (!isNaN(v)) nums.push(v);
      }
    }

    if (fn === "SUM") return nums.reduce((a, b) => a + b, 0);
    if (fn === "AVERAGE") return nums.length ? (nums.reduce((a, b) => a + b, 0) / nums.length).toFixed(2) : 0;
    if (fn === "COUNT") return nums.length;
    if (fn === "MAX") return nums.length ? Math.max(...nums) : 0;
    if (fn === "MIN") return nums.length ? Math.min(...nums) : 0;
  }

  // Simple cell references like =A1+B1 or =A1
  const simpleMath = upper.match(/^([A-Z]+[0-9]+)\s*([\+\-\*\/])\s*([A-Z]+[0-9]+)$/);
  if (simpleMath) {
    const [, cell1, op, cell2] = simpleMath;
    const c1Col = letterToCol(cell1.match(/[A-Z]+/)[0]);
    const c1Row = parseInt(cell1.match(/[0-9]+/)[0], 10) - 1;
    const c2Col = letterToCol(cell2.match(/[A-Z]+/)[0]);
    const c2Row = parseInt(cell2.match(/[0-9]+/)[0], 10) - 1;

    const v1 = parseFloat(getCell(c1Row, c1Col)) || 0;
    const v2 = parseFloat(getCell(c2Row, c2Col)) || 0;
    if (op === "+") return v1 + v2;
    if (op === "-") return v1 - v2;
    if (op === "*") return v1 * v2;
    if (op === "/") return v2 !== 0 ? v1 / v2 : "#DIV/0!";
  }

  return val;
}


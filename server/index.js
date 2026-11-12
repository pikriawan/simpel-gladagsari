import { createServer } from "node:http";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { deflateRawSync } from "node:zlib";
import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";

const here = dirname(fileURLToPath(import.meta.url));
const databasePath = resolve(process.env.DATABASE_PATH || `${here}/../data/simpel.sqlite`);
mkdirSync(dirname(databasePath), { recursive: true });
const db = new DatabaseSync(databasePath);
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;
  CREATE TABLE IF NOT EXISTS employees (
    id TEXT PRIMARY KEY,
    nip TEXT NOT NULL UNIQUE,
    nama TEXT NOT NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('Pelayanan', 'Administrator')),
    status TEXT NOT NULL DEFAULT 'Aktif',
    password_hash TEXT NOT NULL DEFAULT '',
    password_set INTEGER NOT NULL DEFAULT 0,
    authenticator INTEGER NOT NULL DEFAULT 0
  );
  CREATE TABLE IF NOT EXISTS app_data (
    resource TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS sessions (
    token_hash TEXT PRIMARY KEY,
    employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    scope TEXT NOT NULL CHECK (scope IN ('pending', 'active')),
    expires_at INTEGER NOT NULL
  );
`);

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

function generateXlsxBuffer(sheets) {
  const enc = new TextEncoder();
  const fileRecords = [];
  let offset = 0;
  const chunks = [];

  function escapeXml(str) {
    return String(str ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function colToLetter(colIndex) {
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

  (sheets || []).forEach((sheet, idx) => {
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

  for (const file of files) {
    const nameBuf = Buffer.from(file.name, "utf8");
    const dataBuf = Buffer.isBuffer(file.data) ? file.data : Buffer.from(file.data, "utf8");
    const uncompressedSize = dataBuf.length;
    const deflated = deflateRawSync(dataBuf);
    const compressedSize = deflated.length;
    const crc = crc32(dataBuf);

    const localHeader = Buffer.alloc(30 + nameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(8, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(compressedSize, 18);
    localHeader.writeUInt32LE(uncompressedSize, 22);
    localHeader.writeUInt16LE(nameBuf.length, 26);
    localHeader.writeUInt16LE(0, 28);
    nameBuf.copy(localHeader, 30);

    chunks.push(localHeader, deflated);
    fileRecords.push({ nameBuf, crc, compressedSize, uncompressedSize, offset });
    offset += localHeader.length + deflated.length;
  }

  const centralDirStart = offset;
  for (const r of fileRecords) {
    const cdHeader = Buffer.alloc(46 + r.nameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);
    cdHeader.writeUInt16LE(20, 4);
    cdHeader.writeUInt16LE(20, 6);
    cdHeader.writeUInt16LE(0, 8);
    cdHeader.writeUInt16LE(8, 10);
    cdHeader.writeUInt16LE(0, 12);
    cdHeader.writeUInt16LE(0, 14);
    cdHeader.writeUInt32LE(r.crc, 16);
    cdHeader.writeUInt32LE(r.compressedSize, 20);
    cdHeader.writeUInt32LE(r.uncompressedSize, 24);
    cdHeader.writeUInt16LE(r.nameBuf.length, 28);
    cdHeader.writeUInt16LE(0, 30);
    cdHeader.writeUInt16LE(0, 32);
    cdHeader.writeUInt16LE(0, 34);
    cdHeader.writeUInt16LE(0, 36);
    cdHeader.writeUInt32LE(0, 38);
    cdHeader.writeUInt32LE(r.offset, 42);
    r.nameBuf.copy(cdHeader, 46);
    chunks.push(cdHeader);
    offset += cdHeader.length;
  }
  const centralDirSize = offset - centralDirStart;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(fileRecords.length, 8);
  eocd.writeUInt16LE(fileRecords.length, 10);
  eocd.writeUInt32LE(centralDirSize, 12);
  eocd.writeUInt32LE(centralDirStart, 16);
  eocd.writeUInt16LE(0, 20);
  chunks.push(eocd);

  return Buffer.concat(chunks);
}

const DEFAULT_DESA = [
  "Candisari", "Gladagsari", "Jlarem", "Kaligentong", "Kembang",
  "Ngadirojo", "Ngagrong", "Ngargoloka", "Sampetan", "Seboto",
];

const DEFAULT_DUKUH_BY_DESA = {
  Candisari: [
    "Banjaran", "Candilaras", "Candirejo", "Cuken", "Kembangkuning", "Kumpulrejo",
    "Ledoksari", "Ngelo", "Sokorejo", "Sorengan", "Tugusari", "Wonosari",
  ],
  Gladagsari: [
    "Gentansari", "Kupo", "Mitiran", "Mrawun", "Ngablak", "Pengulon", "Tempel",
  ],
  Jlarem: [
    "Jlarem", "Ngaglik", "Grogolan", "Mongkrong", "Gemawang", "Tegalrejo",
    "Sugihwaras", "Sukodono", "Kumpulrejo", "Semirat", "Dora", "Gondang Kulon",
    "Gondang Sari", "Soka", "Jetis", "Ngablak A", "Ngablak B", "Kebondowo", "Sidorejo",
  ],
  Kaligentong: [
    "Bener", "Bener Wetan", "Prandelan", "Prampelan", "Tegalsari", "Ngaduman",
    "Karangsari", "Kalisari", "Banjarsari", "Prigen", "Kalipuyang", "Bendosari", "Ngelo",
  ],
  Kembang: [
    "Babadan", "Dali", "Gatak", "Karangduwet", "Kepoh", "Klangon", "Klatak",
    "Margosari", "Ngemplak", "Sewengi", "Tegalrejo", "Tegalsari", "Tegalwaton",
    "Tempel", "Wates", "Kembang", "Sidodadi", "Purosari", "Mulyosari", "Kembangsari",
  ],
  Ngadirojo: [
    "Bodrosari", "Dedegan", "Diwak", "Dukuhrejo", "Gondanglegi", "Jati Kulon",
    "Jati Wetan", "Kadang", "Karang", "Kedung", "Kembang", "Magak", "Margodadi",
    "Margokaton", "Margomulyo", "Margorejo", "Margosari", "Margosuci", "Melambong",
    "Ngadirojo", "Pentur", "Rejosari", "Rejoso", "Tegalsari", "Tomo",
  ],
  Ngagrong: [
    "Dukuh", "Gondangsari", "Gunungsari", "Kajongan", "Kalipuyang", "Karangtalun",
    "Lengkong", "Ngaglik", "Ngagrong", "Ngargosari", "Ngegrek", "Pulerejo",
    "Sidomulyo", "Sikepan", "Surodadi", "Tegalrejo", "Tompak", "Tonolayu",
  ],
  Ngargoloka: [
    "Gawok", "Glagah", "Kwaron", "Losari", "Malibari", "Ngargoloka", "Pesan", "Tanen",
  ],
  Sampetan: [
    "Bumirejo", "Cemorosewu", "Ganduman", "Gumuk", "Karangboyo", "Kendal",
    "Kropak Kulon", "Kropak Wetan", "Mungsari", "Pereng Kulon", "Purwogondo",
    "Purwosari", "Ringinsari Kulon", "Salamrejo", "Sampetan", "Selorejo",
    "Sembung Kidul", "Sidorejo", "Sidorejo Wetan", "Sukorame", "Tanjungsari",
    "Tarumulyo", "Tarumulyo Kulon", "Tempelsari",
  ],
  Seboto: [
    "Bendo", "Cengklik", "Drajud", "Dungus", "Rejosari", "Seboto", "Selomiring",
    "Sendang", "Tempel", "Wates",
  ],
};

const SAMPLE_RIWAYAT = [
  { id: "s-156", nomorUrut: "156", nomorSurat: "474.2/156/6.20/2026", namaPemohon: "Muhammad Rifqi", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Kaligentong", nomorSuratPengantar: "474/101/II/2026", tanggalSurat: "2026-10-15", dukuh: "Bener", rt: "001", rw: "001", tanggalNikah: "2026-10-16", namaPasangan: "Nem Painem", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Banjaran, RT001/RW001, Desa Candisari, Kec. Gladagsari", savedAt: "2026-10-16T12:34:00.000Z" },
  { id: "s-157", nomorUrut: "157", nomorSurat: "474.2/157/6.20/2026", namaPemohon: "Arya Suparman", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Gladagsari", nomorSuratPengantar: "474/102/II/2026", tanggalSurat: "2026-10-15", dukuh: "Gentansari", rt: "002", rw: "001", tanggalNikah: "2026-10-17", namaPasangan: "Sumarni Ilham", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Gentansari, RT002/RW001, Desa Gladagsari, Kec. Gladagsari", savedAt: "2026-10-16T12:38:00.000Z" },
  { id: "s-158", nomorUrut: "158", nomorSurat: "474.2/158/6.20/2026", namaPemohon: "Purnama Tirta", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Kaligentong", nomorSuratPengantar: "474/103/II/2026", tanggalSurat: "2026-11-20", dukuh: "Kalisari", rt: "001", rw: "002", tanggalNikah: "2026-11-21", namaPasangan: "Rahman Arya", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Kalisari, RT001/RW002, Desa Kaligentong, Kec. Gladagsari", savedAt: "2026-11-20T09:11:00.000Z" },
  { id: "s-159", nomorUrut: "159", nomorSurat: "474.2/159/6.20/2026", namaPemohon: "Siti Aisyah", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Jlarem", nomorSuratPengantar: "474/104/II/2026", tanggalSurat: "2026-11-23", dukuh: "Mongkrong", rt: "003", rw: "001", tanggalNikah: "2026-11-24", namaPasangan: "Budi Santoso", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Mongkrong, RT003/RW001, Desa Jlarem, Kec. Gladagsari", savedAt: "2026-11-23T10:42:00.000Z" },
  { id: "s-160", nomorUrut: "160", nomorSurat: "474.2/160/6.20/2026", namaPemohon: "Lestari Widyastuti", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Kembang", nomorSuratPengantar: "474/105/II/2026", tanggalSurat: "2026-11-27", dukuh: "Kepoh", rt: "001", rw: "001", tanggalNikah: "2026-11-28", namaPasangan: "Andi Pratama", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Kepoh, RT001/RW001, Desa Kembang, Kec. Gladagsari", savedAt: "2026-11-27T11:15:00.000Z" },
  { id: "s-161", nomorUrut: "161", nomorSurat: "474.2/161/6.20/2026", namaPemohon: "Rina Maharani", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Ngadirojo", nomorSuratPengantar: "474/106/II/2026", tanggalSurat: "2026-11-30", dukuh: "Diwak", rt: "002", rw: "002", tanggalNikah: "2026-12-01", namaPasangan: "Dedi Saputra", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Diwak, RT002/RW002, Desa Ngadirojo, Kec. Gladagsari", savedAt: "2026-11-30T12:00:00.000Z" },
  { id: "s-162", nomorUrut: "162", nomorSurat: "474.2/162/6.20/2026", namaPemohon: "Adi Nugroho", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Gladagsari", nomorSuratPengantar: "474/107/II/2026", tanggalSurat: "2026-12-04", dukuh: "Mitiran", rt: "001", rw: "001", tanggalNikah: "2026-12-05", namaPasangan: "Yuli Astuti", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Mitiran, RT001/RW001, Desa Gladagsari, Kec. Gladagsari", savedAt: "2026-12-04T13:28:00.000Z" },
  { id: "s-163", nomorUrut: "163", nomorSurat: "474.2/163/6.20/2026", namaPemohon: "Dina Putri", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Kaligentong", nomorSuratPengantar: "474/108/II/2026", tanggalSurat: "2026-12-07", dukuh: "Ngaduman", rt: "003", rw: "001", tanggalNikah: "2026-12-08", namaPasangan: "Rudi Hartono", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Ngaduman, RT003/RW001, Desa Kaligentong, Kec. Gladagsari", savedAt: "2026-12-07T14:45:00.000Z" },
  { id: "s-164", nomorUrut: "164", nomorSurat: "474.2/164/6.20/2026", namaPemohon: "Eka Sari", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Ngagrong", nomorSuratPengantar: "474/109/II/2026", tanggalSurat: "2026-12-11", dukuh: "Kajongan", rt: "001", rw: "001", tanggalNikah: "2026-12-12", namaPasangan: "Bagas Pradana", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Kajongan, RT001/RW001, Desa Ngagrong, Kec. Gladagsari", savedAt: "2026-12-11T15:10:00.000Z" },
  { id: "s-165", nomorUrut: "165", nomorSurat: "474.2/165/6.20/2026", namaPemohon: "Fajar Ramadhan", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Seboto", nomorSuratPengantar: "474/110/II/2026", tanggalSurat: "2026-12-14", dukuh: "Bendo", rt: "002", rw: "001", tanggalNikah: "2026-12-15", namaPasangan: "Vina Lestari", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Bendo, RT002/RW001, Desa Seboto, Kec. Gladagsari", savedAt: "2026-12-14T16:33:00.000Z" },
  { id: "s-166", nomorUrut: "166", nomorSurat: "474.2/166/6.20/2026", namaPemohon: "Rina Amelia", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Seboto", nomorSuratPengantar: "474/111/II/2026", tanggalSurat: "2026-12-17", dukuh: "Cengklik", rt: "001", rw: "002", tanggalNikah: "2026-12-18", namaPasangan: "Bambang Sutanto", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Cengklik, RT001/RW002, Desa Seboto, Kec. Gladagsari", savedAt: "2026-12-17T17:56:00.000Z" },
  { id: "s-167", nomorUrut: "167", nomorSurat: "474.2/167/6.20/2026", namaPemohon: "Tono Setiawan", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Sampetan", nomorSuratPengantar: "474/112/II/2026", tanggalSurat: "2026-12-21", dukuh: "Bumirejo", rt: "001", rw: "001", tanggalNikah: "2026-12-22", namaPasangan: "Lili Sari", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Bumirejo, RT001/RW001, Desa Sampetan, Kec. Gladagsari", savedAt: "2026-12-21T18:19:00.000Z" },
  { id: "s-168", nomorUrut: "168", nomorSurat: "474.2/168/6.20/2026", namaPemohon: "Dwi Cahyani", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Candisari", nomorSuratPengantar: "474/113/II/2026", tanggalSurat: "2026-12-24", dukuh: "Wonosari", rt: "004", rw: "002", tanggalNikah: "2026-12-25", namaPasangan: "Rizki Wijaya", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Wonosari, RT004/RW002, Desa Candisari, Kec. Gladagsari", savedAt: "2026-12-24T19:02:00.000Z" },
  { id: "s-169", nomorUrut: "169", nomorSurat: "474.2/169/6.20/2026", namaPemohon: "Rendi Saputra", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Gladagsari", nomorSuratPengantar: "474/114/II/2026", tanggalSurat: "2026-12-25", dukuh: "Ngablak", rt: "001", rw: "001", tanggalNikah: "2026-12-26", namaPasangan: "Ayu Lestari", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Ngablak, RT001/RW001, Desa Gladagsari, Kec. Gladagsari", savedAt: "2026-12-25T19:45:00.000Z" },
  { id: "s-170", nomorUrut: "170", nomorSurat: "474.2/170/6.20/2026", namaPemohon: "Sari Dewi", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Kaligentong", nomorSuratPengantar: "474/115/II/2026", tanggalSurat: "2026-12-26", dukuh: "Bendosari", rt: "002", rw: "001", tanggalNikah: "2026-12-27", namaPasangan: "Imam Sutanto", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Bendosari, RT002/RW001, Desa Kaligentong, Kec. Gladagsari", savedAt: "2026-12-26T20:12:00.000Z" },
  { id: "s-171", nomorUrut: "171", nomorSurat: "474.2/171/6.20/2026", namaPemohon: "Budi Santoso", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Ngargoloka", nomorSuratPengantar: "474/116/II/2026", tanggalSurat: "2026-12-27", dukuh: "Gawok", rt: "001", rw: "001", tanggalNikah: "2026-12-28", namaPasangan: "Rina Amelia", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Gawok, RT001/RW001, Desa Ngargoloka, Kec. Gladagsari", savedAt: "2026-12-27T20:48:00.000Z" },
  { id: "s-172", nomorUrut: "172", nomorSurat: "474.2/172/6.20/2026", namaPemohon: "Wahyu Santoso", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Kaligentong", nomorSuratPengantar: "474/117/II/2026", tanggalSurat: "2027-01-02", dukuh: "Banjarsari", rt: "001", rw: "001", tanggalNikah: "2027-01-03", namaPasangan: "Dewi Rahayu", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Banjarsari, RT001/RW001, Desa Kaligentong, Kec. Gladagsari", savedAt: "2027-01-02T08:15:00.000Z" },
  { id: "s-173", nomorUrut: "173", nomorSurat: "474.2/173/6.20/2026", namaPemohon: "Hendra Kusuma", ttlPemohon: "Boyolali, 1 Januari 2006", desaPengantar: "Gladagsari", nomorSuratPengantar: "474/118/II/2026", tanggalSurat: "2027-01-04", dukuh: "Pengulon", rt: "003", rw: "001", tanggalNikah: "2027-01-05", namaPasangan: "Fitri Handayani", ttlPasangan: "Boyolali, 1 Januari 2000", agama: "Islam", alamatPasangan: "Pengulon, RT003/RW001, Desa Gladagsari, Kec. Gladagsari", savedAt: "2027-01-04T09:30:00.000Z" },
];

const DEFAULT_DATA = {
  riwayat: SAMPLE_RIWAYAT,
  desa: DEFAULT_DESA,
  dukuhByDesa: DEFAULT_DUKUH_BY_DESA,
  template: {
    version: 8,
    baris1: "PEMERINTAH KABUPATEN BOYOLALI",
    baris2: "KECAMATAN GLADAGSARI",
    baris3: "Jl. Boyolali – Semarang KM 10 Gladagsari Boyolali Telp. (0276) 331345",
    baris4: "website: gladagsarikec.boyolali.go.id, email: gladagsari@boyolali.go.id",
    baris5: "",
    logo: "",
    namaPejabat: "Gilang Pamungkas",
    jabatanUtama: "a.n. BUPATI BOYOLALI",
    subJabatan: "Kasi Pelayanan",
    pangkat: "Penata Tingkat I",
    nipPejabat: "19850101 201001 1 001",
    dasarHukum1: "Undang-Undang Nomor 1 Tahun 1974 tentang Perkawinan sebagaimana telah diubah dengan Undang-Undang Nomor 16 Tahun 2019.",
    dasarHukum2: "Peraturan Mahkamah Agung Nomor 5 Tahun 2019 tentang Pedoman Mengadili Permohonan Dispensasi Kawin.",
    alasan: "Dispensasi nikah diberikan untuk memenuhi persyaratan administrasi pencatatan perkawinan.",
  },
  draft: null,
  sheets: [
    {
      name: "KTP 474.4",
      cells: [
        ["No", "Tanggal Masuk", "Nama Pemohon", "NIK", "Desa / Dukuh", "Jenis Layanan", "No. Registrasi / Berkas", "Tanggal Selesai", "Keterangan"],
        ["1", "2026-11-10", "Siti Aisyah", "3309012345670001", "Candisari", "Dispensasi Nikah", "474.2/156/6.20/2026", "2026-11-10", "Selesai"],
        ["2", "2026-11-11", "Budi Santoso", "3309012345670002", "Gladagsari", "Surat Keterangan Usaha", "503/012/6.20/2026", "2026-11-11", "Selesai"],
        ["3", "2026-11-12", "Agus Setiawan", "3309012345670003", "Kaligentong", "Legalisir Dokumen", "470/045/6.20/2026", "2026-11-12", "Selesai"],
        ["4", "", "", "", "", "", "", "", ""],
        ["5", "", "", "", "", "", "", "", ""],
      ],
    },
  ],
  patenTemplate: [
    {
      name: "Template PATEN",
      cells: [
        ["No", "Tanggal Masuk", "Nama Pemohon", "NIK", "Desa / Dukuh", "Jenis Layanan", "No. Registrasi / Berkas", "Tanggal Selesai", "Keterangan"],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
        ["", "", "", "", "", "", "", "", ""],
      ],
    },
  ],
};

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, expectedHex] = stored.split(":");
  if (!salt || !expectedHex) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function tokenHash(token) {
  return createHash("sha256").update(token).digest("hex");
}

const employeeCount = db.prepare("SELECT COUNT(*) AS count FROM employees").get().count;
if (employeeCount === 0) {
  const insert = db.prepare(`
    INSERT INTO employees (id, nip, nama, email, role, status, password_hash, password_set, authenticator)
    VALUES (?, ?, ?, ?, ?, 'Aktif', ?, ?, ?)
  `);
  insert.run("p1", "098765432123456787", "Salung Fadlan Juliansyah", "salung@gmail.com", "Pelayanan", hashPassword("password123"), 1, 1);
  insert.run("p2", "098765432123456788", "Gilang Pamungkas", "gilang@gmail.com", "Administrator", hashPassword("password123"), 1, 1);
  insert.run("p3", "098765432123456789", "Rifqi Khoirurrozaq", "rifqi@gmail.com", "Pelayanan", "", 0, 0);
}

function publicEmployee(row) {
  return {
    id: row.id,
    nip: row.nip,
    nama: row.nama,
    email: row.email,
    role: row.role,
    status: row.status,
    passwordSet: Boolean(row.password_set),
    authenticator: Boolean(row.authenticator),
  };
}

function issueSession(employeeId, scope = "active") {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = Date.now() + (scope === "active" ? 7 : 10) * 24 * 60 * 60 * 1000;
  db.prepare("INSERT INTO sessions (token_hash, employee_id, scope, expires_at) VALUES (?, ?, ?, ?)")
    .run(tokenHash(token), employeeId, scope, expiresAt);
  return token;
}

function getSession(req, requiredScope = "active") {
  const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
  if (!token) return null;
  const row = db.prepare(`
    SELECT s.token_hash, s.scope, s.expires_at, e.*
    FROM sessions s JOIN employees e ON e.id = s.employee_id
    WHERE s.token_hash = ?
  `).get(tokenHash(token));
  if (!row || row.expires_at < Date.now()) {
    if (row) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(row.token_hash);
    return null;
  }
  if (row.scope !== requiredScope) return null;
  return { token, hash: row.token_hash, employee: row };
}

function readJson(req) {
  return new Promise((resolveBody, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 12_000_000) reject(new Error("Ukuran permintaan terlalu besar."));
    });
    req.on("end", () => {
      try {
        resolveBody(raw ? JSON.parse(raw) : {});
      } catch {
        reject(new Error("Format JSON tidak valid."));
      }
    });
    req.on("error", reject);
  });
}

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
  });
  res.end(JSON.stringify(body));
}

function getData() {
  const result = { ...DEFAULT_DATA };
  for (const { resource, value: rawValue } of db.prepare("SELECT resource, value FROM app_data").all()) {
    const value = JSON.parse(rawValue);
    if (resource === "template") {
      const merged = { ...DEFAULT_DATA.template, ...value };
      if (!merged.namaPejabat || merged.namaPejabat.includes("...")) {
        merged.namaPejabat = DEFAULT_DATA.template.namaPejabat;
        merged.subJabatan = DEFAULT_DATA.template.subJabatan;
        merged.pangkat = DEFAULT_DATA.template.pangkat;
        merged.nipPejabat = DEFAULT_DATA.template.nipPejabat;
        merged.jabatanUtama = DEFAULT_DATA.template.jabatanUtama;
      }
      result[resource] = merged;
      saveResource(resource, result[resource]);
    } else if (resource === "dukuhByDesa") {
      const merged = { ...DEFAULT_DATA.dukuhByDesa, ...value };
      result[resource] = merged;
      saveResource(resource, result[resource]);
    } else if (resource === "riwayat") {
      result[resource] = Array.isArray(value) && value.length > 1 ? value : SAMPLE_RIWAYAT;
      if (!Array.isArray(value) || value.length <= 1) {
        saveResource(resource, result[resource]);
      }
    } else {
      result[resource] = value;
    }
  }
  return result;
}

function saveResource(resource, value) {
  if (!Object.hasOwn(DEFAULT_DATA, resource) || resource === "pegawai") {
    throw Object.assign(new Error("Data yang diminta tidak dikenal."), { status: 404 });
  }
  db.prepare("INSERT INTO app_data (resource, value) VALUES (?, ?) ON CONFLICT(resource) DO UPDATE SET value = excluded.value")
    .run(resource, JSON.stringify(value));
}

function saveEmployees(rows, actor) {
  if (actor.role !== "Administrator") {
    throw Object.assign(new Error("Akses administrator diperlukan."), { status: 403 });
  }
  if (!Array.isArray(rows)) throw Object.assign(new Error("Daftar pegawai tidak valid."), { status: 400 });
  const existing = new Map(db.prepare("SELECT * FROM employees").all().map((row) => [row.id, row]));
  const incomingIds = new Set(rows.map((row) => row.id));
  if (!incomingIds.has(actor.id)) {
    throw Object.assign(new Error("Akun administrator yang sedang digunakan tidak dapat dihapus."), { status: 400 });
  }
  const upsert = db.prepare(`
    INSERT INTO employees (id, nip, nama, email, role, status, password_hash, password_set, authenticator)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      nip=excluded.nip, nama=excluded.nama, email=excluded.email, role=excluded.role,
      status=excluded.status, password_hash=excluded.password_hash,
      password_set=excluded.password_set, authenticator=excluded.authenticator
  `);
  db.exec("BEGIN IMMEDIATE");
  try {
    for (const employee of rows) {
      if (!employee.id || !/^\d{18}$/.test(employee.nip || "") || !employee.nama?.trim() ||
          !/^\S+@\S+\.\S+$/.test(employee.email || "") ||
          !["Pelayanan", "Administrator"].includes(employee.role)) {
        throw Object.assign(new Error("Data pegawai tidak valid."), { status: 400 });
      }
      const old = existing.get(employee.id);
      const passwordHash = employee.password
        ? hashPassword(employee.password)
        : old?.password_hash || "";
      upsert.run(
        employee.id, employee.nip, employee.nama.trim(), employee.email, employee.role,
        employee.status || "Aktif", passwordHash,
        employee.password ? 1 : old?.password_set || 0,
        employee.authenticator ? 1 : 0,
      );
    }
    for (const id of existing.keys()) {
      if (!incomingIds.has(id)) db.prepare("DELETE FROM employees WHERE id = ?").run(id);
    }
    db.exec("COMMIT");
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;
  try {
    if (req.method === "GET" && path === "/api/health") return send(res, 200, { ok: true });

    if (req.method === "POST" && ["/api/auth/forgot-password", "/api/auth/reset-password"].includes(path)) {
      return send(res, 503, { error: "Reset password email belum dikonfigurasi pada server." });
    }

    if (req.method === "POST" && path === "/api/auth/login") {
      const { nip, password } = await readJson(req);
      const employee = db.prepare("SELECT * FROM employees WHERE nip = ?").get(String(nip || "").trim());
      if (!employee || employee.status !== "Aktif" || !employee.password_set || !verifyPassword(String(password || ""), employee.password_hash)) {
        return send(res, 401, { error: "NIP atau password salah." });
      }
      if (employee.authenticator) {
        const pendingToken = issueSession(employee.id, "pending");
        return send(res, 200, { needsCode: true, pendingToken, user: publicEmployee(employee) });
      }
      return send(res, 200, { token: issueSession(employee.id), user: publicEmployee(employee) });
    }

    if (req.method === "POST" && path === "/api/auth/verify") {
      const pending = getSession(req, "pending");
      if (!pending) return send(res, 401, { error: "Sesi autentikasi tidak berlaku. Silakan login kembali." });
      const { code } = await readJson(req);
      if (!/^\d{6}$/.test(String(code || ""))) return send(res, 400, { error: "Kode harus 6 digit." });
      db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(pending.hash);
      return send(res, 200, { token: issueSession(pending.employee.id), user: publicEmployee(pending.employee) });
    }

    if (req.method === "GET" && path === "/api/auth/me") {
      const session = getSession(req);
      if (!session) return send(res, 401, { error: "Sesi tidak berlaku." });
      return send(res, 200, { user: publicEmployee(session.employee) });
    }

    if (req.method === "POST" && path === "/api/auth/logout") {
      const session = getSession(req);
      if (session) db.prepare("DELETE FROM sessions WHERE token_hash = ?").run(session.hash);
      return send(res, 200, { ok: true });
    }

    const session = getSession(req);
    if (!session) return send(res, 401, { error: "Silakan login kembali." });
    const actor = session.employee;

    if (req.method === "GET" && path === "/api/data") {
      const data = getData();
      if (actor.role === "Administrator") {
        data.pegawai = db.prepare("SELECT * FROM employees ORDER BY nama").all().map(publicEmployee);
      }
      return send(res, 200, data);
    }

    const dataMatch = path.match(/^\/api\/data\/([A-Za-z]+)$/);
    if (req.method === "PUT" && dataMatch) {
      const resource = dataMatch[1];
      const value = await readJson(req);
      if (resource === "pegawai") {
        saveEmployees(value, actor);
        return send(res, 200, { ok: true });
      }
      if (resource === "template" && actor.role !== "Administrator") {
        return send(res, 403, { error: "Akses administrator diperlukan untuk mengubah Pengaturan Template." });
      }
      saveResource(resource, value);
      return send(res, 200, { ok: true });
    }

    if (req.method === "POST" && path === "/api/xlsx/export") {
      const { filename = "export.xlsx", sheets = [] } = await readJson(req);
      const xlsxBuffer = generateXlsxBuffer(sheets);
      res.writeHead(200, {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(filename)}"`,
        "Content-Length": xlsxBuffer.length,
      });
      return res.end(xlsxBuffer);
    }

    if (req.method === "PUT" && path === "/api/profile") {
      const { nama, email, currentPassword, newPassword } = await readJson(req);
      if (typeof nama !== "string" || !nama.trim() || !/^\S+@\S+\.\S+$/.test(email || "")) {
        return send(res, 400, { error: "Nama dan email yang valid wajib diisi." });
      }
      let passwordHash = actor.password_hash;
      let passwordSet = actor.password_set;
      if (newPassword !== undefined) {
        if (!verifyPassword(String(currentPassword || ""), actor.password_hash)) return send(res, 400, { error: "Password saat ini salah." });
        if (String(newPassword).length < 8) return send(res, 400, { error: "Password baru minimal 8 karakter." });
        passwordHash = hashPassword(newPassword);
        passwordSet = 1;
      }
      db.prepare("UPDATE employees SET nama = ?, email = ?, password_hash = ?, password_set = ? WHERE id = ?")
        .run(nama.trim(), email, passwordHash, passwordSet, actor.id);
      return send(res, 200, { user: publicEmployee(db.prepare("SELECT * FROM employees WHERE id = ?").get(actor.id)) });
    }

    return send(res, 404, { error: "Endpoint tidak ditemukan." });
  } catch (error) {
    if (error.status) return send(res, error.status, { error: error.message });
    console.error("API error:", error);
    return send(res, 500, { error: "Terjadi kesalahan pada server." });
  }
});

const port = Number(process.env.PORT || 3001);
server.listen(port, "0.0.0.0", () => {
  console.log(`Simpel API berjalan di http://localhost:${port}`);
  console.log(`Database SQLite: ${databasePath}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => {
      db.close();
      process.exit(0);
    });
  });
}

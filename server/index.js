import { createServer } from "node:http";
import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
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

const DEFAULT_DATA = {
  riwayat: [],
  desa: ["Candisari", "Gladagsari", "Jlarem", "Kaligentong", "Kembang", "Ngadirojo", "Ngagrong", "Ngargoloka", "Sampetan", "Seboto"],
  dukuhByDesa: {
    Candisari: ["Banjaran", "Candilaras", "Candirejo", "Cuken", "Kembangkuning", "Kumpulrejo", "Ledoksari", "Ngelo", "Sukorejo", "Sorengan", "Tugusari", "Wonosari"],
  },
  template: {
    version: 8,
    baris1: "PEMERINTAH KABUPATEN BOYOLALI",
    baris2: "KECAMATAN GLADAGSARI",
    baris3: "Jl. Boyolali – Semarang KM 10 Gladagsari Boyolali Telp. (0276) 331345",
    baris4: "website: gladagsarikec.boyolali.go.id, email: gladagsari@boyolali.go.id",
    baris5: "",
    logo: "",
    namaPejabat: "........................................",
    jabatanUtama: "a.n. BUPATI BOYOLALI",
    subJabatan: "CAMAT GLADAGSARI",
    pangkat: "",
    nipPejabat: "........................................",
    dasarHukum1: "Undang-Undang Nomor 1 Tahun 1974 tentang Perkawinan sebagaimana telah diubah dengan Undang-Undang Nomor 16 Tahun 2019.",
    dasarHukum2: "Peraturan Mahkamah Agung Nomor 5 Tahun 2019 tentang Pedoman Mengadili Permohonan Dispensasi Kawin.",
    alasan: "Dispensasi nikah diberikan untuk memenuhi persyaratan administrasi pencatatan perkawinan.",
  },
  draft: null,
  sheets: [{ name: "KTP 474.4", cells: Array.from({ length: 5 }, () => Array(5).fill("")) }],
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
    if (resource === "template" && value.version !== DEFAULT_DATA.template.version) {
      const migrated = { ...DEFAULT_DATA.template, ...value };
      const email = [value.baris4, value.baris5]
        .map((line) => (line || "").match(/email:\s*([^\s,]+)/i)?.[1])
        .find(Boolean);
      if (!migrated.baris3 || [
        "Jl. Boyolali - Semarang Km. 10 Gladagsari, Telp. (0276) 331345, Kode Pos 57352",
        "Jl. Boyolali - Semarang Km. 10 Gladagsari, Telp. (0276) 331345",
        "Jl. Boyolali - Semarang Km. 10 Gladagsari Telp. (0276) 331345",
        "Jl. Boyolali - Semarang Km. 10, Gladagsari",
      ].includes(migrated.baris3)) {
        migrated.baris3 = DEFAULT_DATA.template.baris3;
      } else {
        migrated.baris3 = migrated.baris3.replace(/,?\s*Kode\s*Pos\s+[^,]+/i, "").trim();
      }
      if (!/^website\s*:/i.test(migrated.baris4 || "")) {
        migrated.baris4 = DEFAULT_DATA.template.baris4;
      }
      if (email && !/^[.]+$/.test(email)) {
        migrated.baris4 = migrated.baris4.replace(/gladagsari@boyolali\.go\.id/i, email);
      }
      migrated.baris5 = "";
      for (const [key, defaultValue] of Object.entries(DEFAULT_DATA.template)) {
        if (key !== "version" && !migrated[key] && defaultValue) migrated[key] = defaultValue;
      }
      migrated.version = DEFAULT_DATA.template.version;
      result[resource] = migrated;
      saveResource(resource, result[resource]);
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
      saveResource(resource, value);
      return send(res, 200, { ok: true });
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

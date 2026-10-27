export const pad = (n) => String(n).padStart(2, "0");

/** "2026-10-16" -> "16/10/2026" */
export function fmtDate(iso) {
  if (!iso) return "";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
}

const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
const BULAN = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember"
];

/** "2027-01-01" -> "Jumat, 1 Januari 2027" */
export function fmtDateDay(val) {
  if (!val) return "";
  let y, m, d;
  if (typeof val === "string" && val.includes("-")) {
    [y, m, d] = val.slice(0, 10).split("-").map(Number);
  } else if (typeof val === "string" && val.includes("/")) {
    [d, m, y] = val.split("/").map(Number);
  } else {
    const dt = new Date(val);
    if (isNaN(dt.getTime())) return val;
    y = dt.getFullYear();
    m = dt.getMonth() + 1;
    d = dt.getDate();
  }
  const date = new Date(y, m - 1, d);
  if (isNaN(date.getTime())) return val;
  return `${HARI[date.getDay()]}, ${d} ${BULAN[date.getMonth()]} ${y}`;
}

/** ISO datetime -> "16/10/2026, 12:34" */
export function fmtDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}, ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** "16/10/2026" -> "2026-10-16" */
export const isoFromDmy = (s) => s.split("/").reverse().join("-");

export const alamatPemohon = (r) =>
  [r.dukuh, r.rt || r.rw ? `RT${r.rt}/RW${r.rw}` : "", r.desaPengantar ? `Desa ${r.desaPengantar}` : "", "Kec. Gladagsari"]
    .filter(Boolean)
    .join(", ");

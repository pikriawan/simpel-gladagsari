import { useRef, useState } from "react";
import { AlignLeft, Bold, Download, Maximize2, Plus, Redo2, Search, Underline, Undo2, Upload } from "lucide-react";
import { PageHead } from "../../components/ui.jsx";
import { useData } from "../../context/DataContext.jsx";
import { downloadCsv, parseCsv } from "../../lib/csv.js";

const COLS = ["A", "B", "C", "D", "E"];

export default function RegistrasiPaten() {
  const { sheets, setSheets, makeSheet } = useData();
  const [active, setActive] = useState(0);
  const [sel, setSel] = useState({ r: 0, c: 0 });
  const fileRef = useRef(null);
  const sheet = sheets[Math.min(active, sheets.length - 1)];

  const setCell = (r, c, v) =>
    setSheets((all) => all.map((s, i) => (i !== active ? s : { ...s, cells: s.cells.map((row, ri) => (ri !== r ? row : row.map((x, ci) => (ci === c ? v : x)))) })));

  function addSheet() {
    const name = window.prompt("Nama lembar kerja baru")?.trim();
    if (!name) return;
    setSheets((all) => [...all, makeSheet(name)]);
    setActive(sheets.length);
  }
  function onImport(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      const rows = parseCsv(String(reader.result).replace(/^\ufeff/, ""));
      const R = Math.max(5, rows.length);
      const cells = Array.from({ length: R }, (_, r) => Array.from({ length: 5 }, (_, c) => rows[r]?.[c] ?? ""));
      setSheets((all) => all.map((s, i) => (i === active ? { ...s, cells } : s)));
    };
    reader.readAsText(f);
    e.target.value = "";
  }

  return (
    <>
      <PageHead crumbs={["Registrasi PATEN"]} title="Registrasi PATEN">
        <button className="btn" onClick={() => fileRef.current?.click()}><Download size={16} />Impor Excel</button>
        <input ref={fileRef} type="file" accept=".csv,text/csv" hidden onChange={onImport} />
        <button className="btn" onClick={() => downloadCsv(`${sheet.name}.csv`, sheet.cells)}><Upload size={16} />Ekspor Excel</button>
      </PageHead>

      <div className="sheet-tabs">
        {sheets.map((s, i) => (
          <button key={s.name + i} className={i === active ? "is-active" : ""} onClick={() => setActive(i)}>{s.name}</button>
        ))}
        <button aria-label="Tambah lembar kerja" onClick={addSheet}><Plus size={14} /></button>
      </div>

      <div className="sheet">
        <div className="sheet__toolbar" aria-hidden="true">
          <Undo2 size={14} /><Redo2 size={14} /><Bold size={14} /><Underline size={14} /><AlignLeft size={14} /><Search size={14} /><Maximize2 size={14} />
        </div>
        <div className="sheet__formula">
          <input className="name" readOnly value={`${COLS[sel.c]}${sel.r + 1}`} aria-label="Sel terpilih" />
          <span style={{ padding: "0 8px", fontStyle: "italic" }}>fx</span>
          <input className="fx" value={sheet.cells[sel.r]?.[sel.c] ?? ""} onChange={(e) => setCell(sel.r, sel.c, e.target.value)} aria-label="Isi sel" />
        </div>
        <table>
          <thead>
            <tr><th className="row" />{COLS.map((c) => <th key={c}>{c}</th>)}</tr>
          </thead>
          <tbody>
            {sheet.cells.map((row, r) => (
              <tr key={r}>
                <th className="row">{r + 1}</th>
                {row.map((v, c) => (
                  <td key={c} className={sel.r === r && sel.c === c ? "is-selected" : ""}>
                    <input value={v} onFocus={() => setSel({ r, c })} onChange={(e) => setCell(r, c, e.target.value)} aria-label={`${COLS[c]}${r + 1}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

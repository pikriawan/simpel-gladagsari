import { useState } from "react";
import { Plus, RotateCcw, SquarePen, Trash2 } from "lucide-react";
import { Field, PageHead } from "../../components/ui.jsx";
import { useData } from "../../context/DataContext.jsx";

function ListColumn({ label, placeholder, addLabel, items, selected, onSelect, onAdd, onRename, onRemove, disabled, hint }) {
  const [value, setValue] = useState("");
  function submit(e) {
    e.preventDefault();
    const v = value.trim();
    if (!v || disabled) return;
    onAdd(v);
    setValue("");
  }
  return (
    <div className="list-col">
      <Field label={label}>
        <form className="add-row" onSubmit={submit}>
          <input className="input" value={value} onChange={(e) => setValue(e.target.value)} placeholder={placeholder} disabled={disabled} />
          <button className="btn" type="submit" disabled={disabled}><Plus size={16} />{addLabel}</button>
        </form>
      </Field>
      {hint && <p className="t-muted" style={{ fontSize: 14 }}>{hint}</p>}
      <div className="stack-8">
        {items.map((name) => {
          const Tag = onSelect ? "div" : "div";
          return (
            <Tag
              key={name}
              className={`list-item${onSelect ? " list-item--btn" : ""}${selected === name ? " is-selected" : ""}`}
              onClick={() => onSelect?.(name)}
              role={onSelect ? "button" : undefined}
              tabIndex={onSelect ? 0 : undefined}
              onKeyDown={(e) => onSelect && (e.key === "Enter" || e.key === " ") && onSelect(name)}
            >
              <span>{name}</span>
              <span className="list-item__actions" onClick={(e) => e.stopPropagation()}>
                <button className="icon-btn" aria-label={`Ubah ${name}`} onClick={() => {
                  const n = window.prompt("Ubah nama", name)?.trim();
                  if (n && n !== name) onRename(name, n);
                }}><SquarePen size={16} /></button>
                <button className="icon-btn icon-btn--danger" aria-label={`Hapus ${name}`} onClick={() => window.confirm(`Hapus "${name}"?`) && onRemove(name)}><Trash2 size={16} /></button>
              </span>
            </Tag>
          );
        })}
      </div>
    </div>
  );
}

export default function DataDesaDukuh() {
  const { desa, setDesa, dukuhByDesa, setDukuhByDesa, resetDesaDukuh } = useData();
  const [selected, setSelected] = useState(desa[0] || "");
  const dukuh = dukuhByDesa[selected] || [];

  const renameDesa = (a, b) => {
    setDesa((l) => l.map((x) => (x === a ? b : x)));
    setDukuhByDesa((m) => { const { [a]: v = [], ...rest } = m; return { ...rest, [b]: v }; });
    if (selected === a) setSelected(b);
  };
  const removeDesa = (a) => {
    setDesa((l) => l.filter((x) => x !== a));
    setDukuhByDesa((m) => { const { [a]: _, ...rest } = m; return rest; });
    if (selected === a) setSelected(desa.find((x) => x !== a) || "");
  };
  const setDukuh = (fn) => setDukuhByDesa((m) => ({ ...m, [selected]: fn(m[selected] || []) }));

  return (
    <>
      <PageHead crumbs={["Surat Dispensasi Nikah", "Data Desa dan Dukuh"]} title="Data Desa dan Dukuh">
        <button className="btn btn--grey" onClick={() => window.confirm("Kembalikan data desa dan dukuh ke bawaan?") && resetDesaDukuh()}>
          <RotateCcw size={16} />Reset default
        </button>
      </PageHead>

      <div className="split" style={{ gap: 16 }}>
        <ListColumn
          label="Desa" placeholder="Masukkan nama desa" addLabel="Tambah desa"
          items={desa} selected={selected} onSelect={setSelected}
          onAdd={(v) => !desa.includes(v) && (setDesa((l) => [...l, v].sort()), setSelected(v))}
          onRename={renameDesa} onRemove={removeDesa}
        />
        <ListColumn
          label="Dukuh" placeholder="Masukkan nama dukuh" addLabel="Tambah dukuh"
          items={dukuh} disabled={!selected}
          hint={selected ? undefined : "Pilih desa terlebih dahulu."}
          onAdd={(v) => !dukuh.includes(v) && setDukuh((l) => [...l, v].sort())}
          onRename={(a, b) => setDukuh((l) => l.map((x) => (x === a ? b : x)))}
          onRemove={(a) => setDukuh((l) => l.filter((x) => x !== a))}
        />
      </div>
    </>
  );
}

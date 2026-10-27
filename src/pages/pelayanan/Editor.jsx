import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Printer } from "lucide-react";
import { DateField, PageHead, SelectField, TextField, Field } from "../../components/ui.jsx";
import LetterPreview from "../../components/LetterPreview.jsx";
import PanelSwitch from "../../components/PanelSwitch.jsx";
import { useData } from "../../context/DataContext.jsx";
import { saveData } from "../../lib/api.js";
import { usePanelSwitch } from "../../lib/usePanelSwitch.js";

const AGAMA = ["Islam", "Kristen", "Katolik", "Hindu", "Buddha", "Konghucu"];

export const EMPTY_FORM = {
  nomorUrut: "", desaPengantar: "", nomorSuratPengantar: "", tanggalSurat: "",
  namaPemohon: "", ttlPemohon: "", dukuh: "", rt: "", rw: "",
  tanggalNikah: "",
  namaPasangan: "", ttlPasangan: "", agama: "", alamatPasangan: "",
};

export default function Editor() {
  const { draft, setDraft, template, dukuhByDesa, addRiwayat } = useData();
  const navigate = useNavigate();
  const [form, setForm] = useState(() => ({ ...EMPTY_FORM, ...(draft || {}) }));
  const [error, setError] = useState("");
  const panelSwitch = usePanelSwitch();
  const allDukuh = useMemo(() => [...new Set(Object.values(dukuhByDesa).flat())].sort(), [dukuhByDesa]);

  const bind = (k) => ({ value: form[k], onChange: (e) => setForm((f) => ({ ...f, [k]: e.target.value })) });

  async function saveAndPrint() {
    const required = ["nomorUrut", "namaPemohon", "namaPasangan", "tanggalNikah"];
    if (required.some((k) => !String(form[k]).trim())) {
      return setError("Nomor urut, nama pemohon, nama pasangan, dan tanggal pernikahan wajib diisi.");
    }
    setError("");
    try {
      await addRiwayat({
        ...form,
        id: crypto.randomUUID(),
        nomorSurat: `474.2/${form.nomorUrut}/6.20/${new Date().getFullYear()}`,
        savedAt: new Date().toISOString(),
      });
      await saveData("draft", null);
      setDraft(null);
    } catch (saveError) {
      setError(`Data belum tersimpan. ${saveError.message}`);
      return;
    }
    window.print();
    navigate("/surat-dispensasi-nikah/riwayat");
  }

  return (
    <>
      <PageHead crumbs={["Surat Dispensasi Nikah", "Editor"]} title="Editor">
        <button className="btn" onClick={saveAndPrint}><Printer size={16} />Simpan dan cetak</button>
      </PageHead>
      {error && <p className="error-text" role="alert">{error}</p>}

      <PanelSwitch {...panelSwitch} />

      <div className={`split editor-panels editor-panels--${panelSwitch.activePanel}`}>
        <form className="split__form sections editor-panel editor-panel--form" onSubmit={(e) => e.preventDefault()}>
          <section className="section">
            <h2 className="t-section">Nomor Surat dan Tanggal</h2>
            <TextField label="Nomor urut" placeholder="Contoh: 1" inputMode="numeric" {...bind("nomorUrut")} />
            <TextField label="Nama desa pengantar" placeholder="Contoh: Kaligentong" {...bind("desaPengantar")} />
            <TextField label="Nomor surat pengantar" placeholder="Contoh: 474/222/02/2026" {...bind("nomorSuratPengantar")} />
            <DateField label="Tanggal surat dikeluarkan" {...bind("tanggalSurat")} />
          </section>

          <section className="section">
            <h2 className="t-section">Data Pemohon</h2>
            <TextField label="Nama pemohon" placeholder="Contoh: Muhammad Rifqi Khoirurrozaq" {...bind("namaPemohon")} />
            <TextField label="Tempat/tanggal lahir" placeholder="Contoh: Boyolali, 1 Januari 2006" {...bind("ttlPemohon")} />
            <TextField label="Dukuh" placeholder="Cari dukuh..." list="dukuh-list" {...bind("dukuh")} />
            <datalist id="dukuh-list">{allDukuh.map((d) => <option key={d} value={d} />)}</datalist>
            <div className="form-grid">
              <TextField label="RT" placeholder="Contoh: 001" {...bind("rt")} />
              <TextField label="RW" placeholder="Contoh: 001" {...bind("rw")} />
            </div>
          </section>

          <section className="section">
            <h2 className="t-section">Tanggal Pernikahan</h2>
            <DateField label="Tanggal pernikahan di KUA" {...bind("tanggalNikah")} />
          </section>

          <section className="section">
            <h2 className="t-section">Data Pasangan</h2>
            <TextField label="Nama pasangan" placeholder="Contoh: Nem Painem" {...bind("namaPasangan")} />
            <TextField label="Tempat/tanggal lahir" placeholder="Contoh: Boyolali, 1 Januari 2000" {...bind("ttlPasangan")} />
            <SelectField label="Agama" placeholder="Pilih agama" options={AGAMA} {...bind("agama")} />
            <TextField label="Alamat" placeholder="Contoh: Banjaran, RT001/RW001, Desa Candisari, Kec. Gladagsari" {...bind("alamatPasangan")} />
          </section>
        </form>

        <div className="split__preview editor-panel editor-panel--preview">
          <LetterPreview form={form} template={template} />
        </div>
      </div>
    </>
  );
}

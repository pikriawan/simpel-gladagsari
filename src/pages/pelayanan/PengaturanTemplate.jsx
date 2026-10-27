import { useRef } from "react";
import { RotateCcw } from "lucide-react";
import { Field, PageHead, TextField } from "../../components/ui.jsx";
import LetterPreview from "../../components/LetterPreview.jsx";
import PanelSwitch from "../../components/PanelSwitch.jsx";
import { EMPTY_FORM } from "./Editor.jsx";
import { useData } from "../../context/DataContext.jsx";
import { usePanelSwitch } from "../../lib/usePanelSwitch.js";

export default function PengaturanTemplate() {
  const { template, setTemplate, resetTemplate } = useData();
  const panelSwitch = usePanelSwitch();
  const fileRef = useRef(null);
  const bind = (k) => ({ value: template[k], onChange: (e) => setTemplate((t) => ({ ...t, [k]: e.target.value })) });

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setTemplate((t) => ({ ...t, logo: String(reader.result), logoName: f.name }));
    reader.readAsDataURL(f);
  }
  function resetLogo() {
    setTemplate((t) => ({ ...t, logo: "", logoName: "" }));
    if (fileRef.current) fileRef.current.value = "";
  }

  return (
    <>
      <PageHead crumbs={["Surat Dispensasi Nikah", "Pengaturan Template"]} title="Pengaturan Template">
        <button className="btn btn--grey" onClick={() => window.confirm("Kembalikan template ke bawaan?") && resetTemplate()}>
          <RotateCcw size={16} />Reset default
        </button>
      </PageHead>

      <PanelSwitch {...panelSwitch} editorLabel="Pengaturan" />

      <div className={`split editor-panels editor-panels--${panelSwitch.activePanel}`}>
        <form className="split__form sections editor-panel editor-panel--form" onSubmit={(e) => e.preventDefault()}>
          <section className="section">
            <h2 className="t-section">Kop Surat</h2>
            <TextField label="Baris 1 (pemerintah kabupaten)" placeholder="Contoh: Pemerintah Kabupaten Boyolali" {...bind("baris1")} />
            <TextField label="Baris 2 (nama kecamatan)" placeholder="Contoh: Kecamatan Gladagsari" {...bind("baris2")} />
            <TextField label="Baris 3 (alamat dan telepon)" placeholder="Jl. Boyolali – Semarang KM 10 Gladagsari Boyolali Telp. (0276) 331345" {...bind("baris3")} />
            <TextField label="Baris 4 (website dan email)" placeholder="website: gladagsarikec.boyolali.go.id, email: gladagsari@boyolali.go.id" {...bind("baris4")} />
            <Field label="Logo lambang daerah">
              <div className="file-input">
                <label className="file-input__box">
                  <span style={{ fontWeight: 500 }}>Pilih File</span>
                  <span className="file-input__name">{template.logoName || "Logo bawaan Kabupaten Boyolali"}</span>
                  <input ref={fileRef} type="file" accept="image/*" onChange={onFile} />
                </label>
                <button type="button" className="btn btn--grey" onClick={resetLogo}><RotateCcw size={16} />Reset</button>
              </div>
            </Field>
          </section>

          <section className="section">
            <h2 className="t-section">Pejabat Penandatangan Surat</h2>
            <div className="form-grid">
              <TextField label="Nama lengkap pejabat" placeholder="Contoh: Gilang Pamungkas" {...bind("namaPejabat")} />
              <TextField label="Jabatan utama" placeholder="Contoh: a.n. Camat Gladagsari" {...bind("jabatanUtama")} />
            </div>
            <div className="form-grid">
              <TextField label="Sub-jabatan/mengetahui (opsional)" placeholder="Contoh: Kasi Pelayanan" {...bind("subJabatan")} />
              <TextField label="Pangkat" placeholder="Contoh: Penata Tingkat I" {...bind("pangkat")} />
            </div>
            <TextField label="NIP" placeholder="Masukkan NIP" {...bind("nipPejabat")} />
          </section>

          <section className="section">
            <h2 className="t-section">Dasar Hukum dan Alasan</h2>
            <TextField label="Dasar hukum poin 1" placeholder="Masukkan dasar hukum poin 1" {...bind("dasarHukum1")} />
            <TextField label="Dasar hukum poin 2" placeholder="Masukkan dasar hukum poin 2" {...bind("dasarHukum2")} />
            <TextField label="Teks alasan dispensasi nikah" placeholder="Contoh: Dispensasi nikah untuk kelengkapan pemberkasan nikah" {...bind("alasan")} />
          </section>
        </form>

        <div className="split__preview editor-panel editor-panel--preview">
          <LetterPreview form={EMPTY_FORM} template={template} />
        </div>
      </div>
    </>
  );
}

import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { request, saveData } from "../lib/api.js";

const DataContext = createContext(null);
export const useData = () => useContext(DataContext);

const DEFAULT_DESA = [
  "Candisari", "Gladagsari", "Jlarem", "Kaligentong", "Kembang",
  "Ngadirojo", "Ngagrong", "Ngargoloka", "Sampetan", "Seboto",
];

const DEFAULT_DUKUH = {
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

export const DEFAULT_TEMPLATE = {
  version: 8,
  baris1: "PEMERINTAH KABUPATEN BOYOLALI",
  baris2: "KECAMATAN GLADAGSARI",
  baris3: "Jl. Boyolali – Semarang KM 10 Gladagsari Boyolali Telp. (0276) 331345",
  baris4: "website: gladagsarikec.boyolali.go.id, email: gladagsari@boyolali.go.id",
  baris5: "",
  logo: "/assets/Logo%20KOP.png",
  namaPejabat: "Gilang Pamungkas",
  jabatanUtama: "a.n. BUPATI BOYOLALI",
  subJabatan: "Kasi Pelayanan",
  pangkat: "Penata Tingkat I",
  nipPejabat: "19850101 201001 1 001",
  dasarHukum1: "Undang-Undang Nomor 1 Tahun 1974 tentang Perkawinan sebagaimana telah diubah dengan Undang-Undang Nomor 16 Tahun 2019.",
  dasarHukum2: "Peraturan Mahkamah Agung Nomor 5 Tahun 2019 tentang Pedoman Mengadili Permohonan Dispensasi Kawin.",
  alasan: "Dispensasi nikah diberikan untuk memenuhi persyaratan administrasi pencatatan perkawinan.",
};

export const DEFAULT_PATEN_COLUMNS = [
  "No", "Tanggal Masuk", "Nama Pemohon", "NIK", "Desa / Dukuh",
  "Jenis Layanan", "No. Registrasi / Berkas", "Tanggal Selesai", "Keterangan",
];

export const makeSheet = (name, rows = 100, cols = 20) => {
  const cells = Array.from({ length: Math.max(5, rows) }, () => Array(Math.max(10, cols)).fill(""));
  return { name, cells };
};

export const DEFAULT_SHEETS = [
  {
    name: "KTP 474.4",
    cells: [
      [...DEFAULT_PATEN_COLUMNS, "", ""],
      ["1", "2026-11-10", "Siti Aisyah", "3309012345670001", "Candisari", "Dispensasi Nikah", "474.2/156/6.20/2026", "2026-11-10", "Selesai", "", ""],
      ["2", "2026-11-11", "Budi Santoso", "3309012345670002", "Gladagsari", "Surat Keterangan Usaha", "503/012/6.20/2026", "2026-11-11", "Selesai", "", ""],
      ["3", "2026-11-12", "Agus Setiawan", "3309012345670003", "Kaligentong", "Legalisir Dokumen", "470/045/6.20/2026", "2026-11-12", "Selesai", "", ""],
      ...Array.from({ length: 96 }, () => Array(11).fill("")),
    ],
  },
];

export const DEFAULT_PATEN_TEMPLATE = [
  {
    name: "Template PATEN",
    cells: [
      [...DEFAULT_PATEN_COLUMNS, "", ""],
      ...Array.from({ length: 99 }, () => Array(11).fill("")),
    ],
  },
];

/* --------------------------------- Provider --------------------------------- */

export function DataProvider({ children }) {
  const [riwayat, setRiwayatState] = useState([]);
  const [desa, setDesaState] = useState(DEFAULT_DESA);
  const [dukuhByDesa, setDukuhByDesaState] = useState(DEFAULT_DUKUH);
  const [template, setTemplateState] = useState(DEFAULT_TEMPLATE);
  const [pegawai, setPegawaiState] = useState([]);
  const [draft, setDraftState] = useState(null);
  const [sheets, setSheetsState] = useState(() => DEFAULT_SHEETS);
  const [patenTemplate, setPatenTemplateState] = useState(() => DEFAULT_PATEN_TEMPLATE);
  const [dataError, setDataError] = useState("");
  const riwayatRef = useRef(riwayat);
  const desaRef = useRef(desa);
  const dukuhRef = useRef(dukuhByDesa);
  const templateRef = useRef(template);
  const pegawaiRef = useRef(pegawai);
  const draftRef = useRef(draft);
  const sheetsRef = useRef(sheets);
  const patenTemplateRef = useRef(patenTemplate);

  riwayatRef.current = riwayat;
  desaRef.current = desa;
  dukuhRef.current = dukuhByDesa;
  templateRef.current = template;
  pegawaiRef.current = pegawai;
  draftRef.current = draft;
  sheetsRef.current = sheets;
  patenTemplateRef.current = patenTemplate;

  const persist = useCallback((resource, ref, setState) => (next) => {
    const value = typeof next === "function" ? next(ref.current) : next;
    ref.current = value;
    setState(value);
    saveData(resource, value).then(() => setDataError("")).catch((error) => {
      console.error(`Gagal menyimpan ${resource}:`, error);
      setDataError(`Gagal menyimpan data (${resource}): ${error.message}`);
    });
  }, []);

  const setDesa = useMemo(() => persist("desa", desaRef, setDesaState), [persist]);
  const setDukuhByDesa = useMemo(() => persist("dukuhByDesa", dukuhRef, setDukuhByDesaState), [persist]);
  const setTemplate = useMemo(() => persist("template", templateRef, setTemplateState), [persist]);
  const setPegawai = useCallback((next) => {
    const value = typeof next === "function" ? next(pegawaiRef.current) : next;
    pegawaiRef.current = value;
    setPegawaiState(value);
    saveData("pegawai", value).then(({ pegawai: saved }) => {
      if (saved) {
        pegawaiRef.current = saved;
        setPegawaiState(saved);
      }
      setDataError("");
    }).catch((error) => {
      console.error("Gagal menyimpan pegawai:", error);
      setDataError(`Gagal menyimpan data (pegawai): ${error.message}`);
    });
  }, []);
  const setDraft = useMemo(() => persist("draft", draftRef, setDraftState), [persist]);
  const setSheets = useMemo(() => persist("sheets", sheetsRef, setSheetsState), [persist]);
  const setPatenTemplate = useMemo(() => persist("patenTemplate", patenTemplateRef, setPatenTemplateState), [persist]);

  const refreshData = useCallback(async () => {
    const data = await request("/data");
    const apply = (key, ref, setter, fallback) => {
      const value = data[key] === undefined ? fallback : data[key];
      ref.current = value;
      setter(value);
    };
    apply("riwayat", riwayatRef, setRiwayatState, []);
    apply("desa", desaRef, setDesaState, DEFAULT_DESA);
    apply("dukuhByDesa", dukuhRef, setDukuhByDesaState, DEFAULT_DUKUH);
    apply("template", templateRef, setTemplateState, DEFAULT_TEMPLATE);
    apply("pegawai", pegawaiRef, setPegawaiState, []);
    apply("draft", draftRef, setDraftState, null);
    apply("sheets", sheetsRef, setSheetsState, DEFAULT_SHEETS);
    apply("patenTemplate", patenTemplateRef, setPatenTemplateState, DEFAULT_PATEN_TEMPLATE);
  }, []);

  const addRiwayat = useCallback((rec) => {
    return request("/data/riwayat", { method: "POST", body: rec }).then(({ record }) => {
      const next = [record, ...riwayatRef.current];
      riwayatRef.current = next;
      setRiwayatState(next);
      return record;
    }).catch((error) => {
      console.error("Gagal menyimpan riwayat:", error);
      setDataError(`Gagal menyimpan riwayat: ${error.message}`);
      throw error;
    });
  }, []);
  const removeRiwayat = useCallback(async (id) => {
    await request(`/data/riwayat/${encodeURIComponent(id)}`, { method: "DELETE" });
    const next = riwayatRef.current.filter((record) => record.id !== id);
    riwayatRef.current = next;
    setRiwayatState(next);
  }, []);

  const value = useMemo(
    () => ({
      riwayat, addRiwayat, removeRiwayat,
      desa, setDesa, dukuhByDesa, setDukuhByDesa,
      template, setTemplate,
      pegawai, setPegawai,
      draft, setDraft,
      sheets, setSheets, makeSheet,
      patenTemplate, setPatenTemplate,
      resetToPatenTemplate: () => {
        setSheets(DEFAULT_SHEETS);
      },
      refreshData, dataError, clearDataError: () => setDataError(""),
      resetDesaDukuh: () => { setDesa(DEFAULT_DESA); setDukuhByDesa(DEFAULT_DUKUH); },
      resetTemplate: () => setTemplate(DEFAULT_TEMPLATE),
    }),
    [riwayat, desa, dukuhByDesa, template, pegawai, draft, sheets, patenTemplate, addRiwayat, removeRiwayat,
      setDesa, setDukuhByDesa, setTemplate, setPegawai, setDraft, setSheets, setPatenTemplate, refreshData, dataError]
  );

  return (
    <DataContext.Provider value={value}>
      {dataError && (
        <div role="alert" style={{ position: "fixed", zIndex: 10000, top: 12, left: 12, right: 12, padding: 12, background: "#fee2e2", color: "#991b1b", borderRadius: 8 }}>
          {dataError}
          <button type="button" onClick={() => setDataError("")} style={{ float: "right" }}>Tutup</button>
        </div>
      )}
      {children}
    </DataContext.Provider>
  );
}

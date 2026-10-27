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
    "Ledoksari", "Ngelo", "Sukorejo", "Sorengan", "Tugusari", "Wonosari",
  ],
};

export const DEFAULT_TEMPLATE = {
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
};

const makeSheet = (name) => ({
  name,
  cells: Array.from({ length: 5 }, () => Array(5).fill("")),
});

/* --------------------------------- Provider --------------------------------- */

export function DataProvider({ children }) {
  const [riwayat, setRiwayatState] = useState([]);
  const [desa, setDesaState] = useState(DEFAULT_DESA);
  const [dukuhByDesa, setDukuhByDesaState] = useState(DEFAULT_DUKUH);
  const [template, setTemplateState] = useState(DEFAULT_TEMPLATE);
  const [pegawai, setPegawaiState] = useState([]);
  const [draft, setDraftState] = useState(null);
  const [sheets, setSheetsState] = useState(() => [makeSheet("KTP 474.4")]);
  const [dataError, setDataError] = useState("");
  const riwayatRef = useRef(riwayat);
  const desaRef = useRef(desa);
  const dukuhRef = useRef(dukuhByDesa);
  const templateRef = useRef(template);
  const pegawaiRef = useRef(pegawai);
  const draftRef = useRef(draft);
  const sheetsRef = useRef(sheets);

  riwayatRef.current = riwayat;
  desaRef.current = desa;
  dukuhRef.current = dukuhByDesa;
  templateRef.current = template;
  pegawaiRef.current = pegawai;
  draftRef.current = draft;
  sheetsRef.current = sheets;

  const persist = useCallback((resource, ref, setState) => (next) => {
    const value = typeof next === "function" ? next(ref.current) : next;
    ref.current = value;
    setState(value);
    saveData(resource, value).then(() => setDataError("")).catch((error) => {
      console.error(`Gagal menyimpan ${resource}:`, error);
      setDataError(`Gagal menyimpan data (${resource}): ${error.message}`);
    });
  }, []);

  const setRiwayat = useMemo(() => persist("riwayat", riwayatRef, setRiwayatState), [persist]);
  const setDesa = useMemo(() => persist("desa", desaRef, setDesaState), [persist]);
  const setDukuhByDesa = useMemo(() => persist("dukuhByDesa", dukuhRef, setDukuhByDesaState), [persist]);
  const setTemplate = useMemo(() => persist("template", templateRef, setTemplateState), [persist]);
  const setPegawai = useMemo(() => persist("pegawai", pegawaiRef, setPegawaiState), [persist]);
  const setDraft = useMemo(() => persist("draft", draftRef, setDraftState), [persist]);
  const setSheets = useMemo(() => persist("sheets", sheetsRef, setSheetsState), [persist]);

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
    apply("sheets", sheetsRef, setSheetsState, [makeSheet("KTP 474.4")]);
  }, []);

  const addRiwayat = useCallback((rec) => {
    const next = [rec, ...riwayatRef.current];
    riwayatRef.current = next;
    setRiwayatState(next);
    return saveData("riwayat", next).catch((error) => {
      console.error("Gagal menyimpan riwayat:", error);
      setDataError(`Gagal menyimpan riwayat: ${error.message}`);
      throw error;
    });
  }, []);
  const removeRiwayat = useCallback((id) => setRiwayat((l) => l.filter((r) => r.id !== id)), [setRiwayat]);

  const value = useMemo(
    () => ({
      riwayat, setRiwayat, addRiwayat, removeRiwayat,
      desa, setDesa, dukuhByDesa, setDukuhByDesa,
      template, setTemplate,
      pegawai, setPegawai,
      draft, setDraft,
      sheets, setSheets, makeSheet,
      refreshData, dataError, clearDataError: () => setDataError(""),
      resetDesaDukuh: () => { setDesa(DEFAULT_DESA); setDukuhByDesa(DEFAULT_DUKUH); },
      resetTemplate: () => setTemplate(DEFAULT_TEMPLATE),
    }),
    [riwayat, desa, dukuhByDesa, template, pegawai, draft, sheets, addRiwayat, removeRiwayat,
      setRiwayat, setDesa, setDukuhByDesa, setTemplate, setPegawai, setDraft, setSheets, refreshData, dataError]
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

import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Download, Eye, FileSpreadsheet, Trash2, Upload } from "lucide-react";
import { DateField, Modal, PageHead, Pager, TextField } from "../../components/ui.jsx";
import { useData } from "../../context/DataContext.jsx";
import { alamatPemohon, fmtDate, fmtDateTime } from "../../lib/format.js";
import { downloadCsv } from "../../lib/csv.js";

const PER_PAGE = 20;

function Detail({ r, onClose, onDelete, onLoad }) {
  const Row = ({ k, v }) => (<><dt>{k}</dt><dd>{v || "-"}</dd></>);
  return (
    <Modal
      title="Detail Data" onClose={onClose}
      actions={
        <>
          <button className="btn btn--grey" onClick={onClose}>Tutup</button>
          <button className="btn btn--danger" onClick={onDelete}><Trash2 size={16} />Hapus</button>
          <button className="btn" onClick={onLoad}><Upload size={16} />Muat ke Editor</button>
        </>
      }
    >
      <h3 className="t-section">Nomor Surat dan Tanggal</h3>
      <dl className="kv">
        <Row k="Nomor urut" v={r.nomorUrut} />
        <Row k="Nama desa pengantar" v={r.desaPengantar} />
        <Row k="Nomor surat pengantar" v={r.nomorSuratPengantar} />
        <Row k="Tanggal surat dikeluarkan" v={fmtDate(r.tanggalSurat)} />
      </dl>
      <hr />
      <h3 className="t-section">Data Pemohon</h3>
      <dl className="kv">
        <Row k="Nama pemohon" v={r.namaPemohon} />
        <Row k="Tempat/tanggal lahir" v={r.ttlPemohon} />
        <Row k="Alamat" v={alamatPemohon(r)} />
      </dl>
      <hr />
      <h3 className="t-section">Tanggal Pernikahan</h3>
      <dl className="kv"><Row k="Tanggal pernikahan di KUA" v={fmtDate(r.tanggalNikah)} /></dl>
      <hr />
      <h3 className="t-section">Data Pasangan</h3>
      <dl className="kv">
        <Row k="Nama pasangan" v={r.namaPasangan} />
        <Row k="Tempat/tanggal lahir" v={r.ttlPasangan} />
        <Row k="Agama" v={r.agama} />
        <Row k="Alamat" v={r.alamatPasangan} />
      </dl>
    </Modal>
  );
}

export default function Riwayat() {
  const { riwayat, removeRiwayat, setDraft } = useData();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);

  const rows = useMemo(() => {
    const k = q.trim().toLowerCase();
    return riwayat
      .filter((r) => {
        if (k && ![r.nomorSurat, r.namaPemohon, r.namaPasangan, r.desaPengantar].some((v) => v?.toLowerCase().includes(k))) return false;
        const d = r.tanggalNikah;
        if (from && d < from) return false;
        if (to && d > to) return false;
        return true;
      })
      .sort((a, b) => a.savedAt.localeCompare(b.savedAt));
  }, [riwayat, q, from, to]);

  const pages = Math.max(1, Math.ceil(rows.length / PER_PAGE));
  const current = Math.min(page, pages);
  const slice = rows.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const filter = (setter) => (e) => { setter(e.target.value); setPage(1); };

  function exportExcel() {
    downloadCsv("riwayat-surat-dispensasi-nikah.csv", [
      ["Nomor surat", "Pemohon", "Pasangan", "Tanggal pernikahan", "Desa asal", "Waktu disimpan"],
      ...rows.map((r) => [r.nomorSurat, r.namaPemohon, r.namaPasangan, fmtDate(r.tanggalNikah), r.desaPengantar, fmtDateTime(r.savedAt)]),
    ]);
  }

  return (
    <>
      <PageHead crumbs={["Surat Dispensasi Nikah", "Riwayat"]} title="Riwayat">
        <button className="btn" onClick={exportExcel}><FileSpreadsheet size={16} />Ekspor Excel</button>
      </PageHead>

      <div className="form-grid">
        <TextField label="Cari" placeholder="Kata kunci" value={q} onChange={filter(setQ)} />
        <DateField label="Dari" value={from} onChange={filter(setFrom)} />
        <DateField label="Hingga" value={to} onChange={filter(setTo)} />
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nomor surat</th><th>Pemohon</th><th>Pasangan</th><th>Tanggal pernikahan</th>
              <th>Desa asal</th><th>Waktu disimpan</th><th className="actions" />
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && <tr><td className="empty" colSpan={7}>Belum ada data.</td></tr>}
            {slice.map((r) => (
              <tr key={r.id}>
                <td>{r.nomorSurat}</td>
                <td title={r.namaPemohon}>{r.namaPemohon}</td>
                <td title={r.namaPasangan}>{r.namaPasangan}</td>
                <td>{fmtDate(r.tanggalNikah)}</td>
                <td>{r.desaPengantar}</td>
                <td>{fmtDateTime(r.savedAt)}</td>
                <td className="actions">
                  <button className="icon-btn" aria-label="Lihat detail" onClick={() => setDetail(r)}><Eye size={16} /></button>
                  <button className="icon-btn icon-btn--danger" aria-label="Hapus" onClick={() => window.confirm("Hapus data ini?") && removeRiwayat(r.id)}><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pager page={current} pages={pages} onChange={setPage} />

      {detail && (
        <Detail
          r={detail}
          onClose={() => setDetail(null)}
          onDelete={() => { removeRiwayat(detail.id); setDetail(null); }}
          onLoad={() => {
            const { id, nomorSurat, savedAt, ...form } = detail;
            setDraft(form);
            navigate("/surat-dispensasi-nikah/editor");
          }}
        />
      )}
    </>
  );
}

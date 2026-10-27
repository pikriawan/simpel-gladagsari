import { useLayoutEffect, useRef, useState } from "react";
import { fmtDate, fmtDateDay } from "../lib/format.js";
import { DEFAULT_TEMPLATE } from "../context/DataContext.jsx";

const display = (value) => (value?.trim() ? value : "..........");

export default function LetterPreview({ form, template }) {
  const containerRef = useRef(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateScale = () => {
      const w = el.clientWidth;
      if (w > 0) {
        // 210mm in standard CSS pixels is 793.7008px (210 * 96 / 25.4)
        setScale(w / 793.7008);
      }
    };
    updateScale();
    const ro = new ResizeObserver(updateScale);
    ro.observe(el);
    window.addEventListener("resize", updateScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  const config = Object.fromEntries(
    Object.entries(DEFAULT_TEMPLATE).map(([key, value]) => [
      key,
      typeof value === "string" && !template[key]?.trim() ? value : template[key] ?? value,
    ])
  );

  const headerLines = [config.baris1, config.baris2, config.baris3, config.baris4];
  const logo = config.logo || "/assets/Logo%20KOP.png";
  const emailMatch = headerLines[3].match(/^(.*?\bemail:\s*)([^\s,]+)(.*)$/i);
  const applicantAddress = [
    form.dukuh || "..........",
    `RT ${form.rt || "000"}/RW ${form.rw || "000"}`,
    `DESA ${(form.desaPengantar || "..........").toUpperCase()}`,
    "KEC. GLADAGSARI",
  ].join(", ");
  const partnerAddress = form.alamatPasangan || "..........";

  return (
    <div ref={containerRef} className="preview-viewport">
      <article
        id="printable-letter"
        className="preview preview--document"
        aria-label="Pratinjau surat dispensasi nikah"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <header className="preview__letterhead preview__letterhead--logo">
          <img className="preview__logo" src={logo} alt="Lambang Kabupaten Boyolali" />
          <div className="preview__letterhead-text">
            <div className="preview__institution">{display(headerLines[0])}</div>
            <div className="preview__district">{display(headerLines[1])}</div>
            <div className="preview__address">{display(headerLines[2])}</div>
            <div className="preview__address">
              {emailMatch ? (
                <>
                  {emailMatch[1]}
                  <a href={`mailto:${emailMatch[2]}`}>{emailMatch[2]}</a>
                  {emailMatch[3]}
                </>
              ) : display(headerLines[3])}
            </div>
          </div>
        </header>

        <div className="preview__rule" aria-hidden="true"><span /></div>

        <section className="preview__title">
          <h2>DISPENSASI NIKAH</h2>
          <div>Nomor : {form.nomorUrut ? `474.2/${form.nomorUrut}/6.20/${new Date().getFullYear()}` : ".........."}</div>
        </section>

        <section className="preview__body">
          <div className="preview__legal">
            <div>Dasar Hukum</div>
            <ol>
              <li>{display(config.dasarHukum1)}</li>
              <li>{display(config.dasarHukum2)}</li>
            </ol>
          </div>

          <div className="preview__consideration">
            <div>Memperhatikan:</div>
            <ol>
              <li>
                Surat Pengantar dari Kepala {form.desaPengantar ? `Desa ${form.desaPengantar}` : "Desa .........."} Nomor:{" "}
                {display(form.nomorSuratPengantar)} bahwa berdasarkan permohonan dari seorang *) :
              </li>
            </ol>
            <dl className="preview__details">
              <dt>Nama</dt><dd><span className="preview__colon">:</span><span>{display(form.namaPemohon).toUpperCase()}</span></dd>
              <dt>Tempat/Tgl Lahir</dt><dd><span className="preview__colon">:</span><span>{display(form.ttlPemohon).toUpperCase()}</span></dd>
              <dt>Alamat</dt><dd><span className="preview__colon">:</span><span>{applicantAddress}</span></dd>
            </dl>
          </div>

          <p className="preview__decision">
            Dengan ini kami Camat Gladagsari atas nama Bupati Boyolali, memberikan izin / dispensasi kepada pemohon,
            untuk melangsungkan pernikahan di Kantor Urusan Agama Kecamatan Gladagsari pada hari :{" "}
            <strong>{display(fmtDateDay(form.tanggalNikah)).toUpperCase()}</strong> dengan seorang **) :
          </p>

          <dl className="preview__details preview__partner">
            <dt>Nama</dt><dd><span className="preview__colon">:</span><span>{display(form.namaPasangan).toUpperCase()}</span></dd>
            <dt>Tempat/Tgl Lahir</dt><dd><span className="preview__colon">:</span><span>{display(form.ttlPasangan).toUpperCase()}</span></dd>
            <dt>Agama</dt><dd><span className="preview__colon">:</span><span>{display(form.agama || "Islam").toUpperCase()}</span></dd>
            <dt>Alamat</dt><dd><span className="preview__colon">:</span><span>{display(partnerAddress).toUpperCase()}</span></dd>
          </dl>

          <dl className="preview__details preview__reason">
            <dt>Karena</dt><dd><span className="preview__colon">:</span><span>{display(config.alasan)}</span></dd>
          </dl>
          <p className="preview__closing">
            Demikian dispensasi ini kami buat untuk dapat dipergunakan sebagaimana mestinya.
          </p>
        </section>

        <footer className="preview__signature">
          <div className="preview__signature-date">Gladagsari, {display(fmtDate(form.tanggalSurat))}</div>
          <div>Mengetahui</div>
          <div>{display(config.jabatanUtama)}</div>
          {config.subJabatan && <div className="preview__sub-role">{config.subJabatan}</div>}
          <div className="preview__signature-space" />
          <div className="preview__signer">{display(config.namaPejabat)}</div>
          {config.pangkat && <div>{config.pangkat}</div>}
          <div>NIP. {display(config.nipPejabat)}</div>
        </footer>
      </article>
    </div>
  );
}

import { toJpeg } from 'html-to-image';
import { jsPDF } from 'jspdf';

/**
 * Mengambil elemen surat (#printable-letter), mengonversinya menjadi dokumen PDF ukuran A4,
 * dan memicu download otomatis di browser tanpa error stylesheet / CORS di mode dev.
 *
 * @param {HTMLElement|null} element Elemen yang akan dicetak ke PDF (default: #printable-letter)
 * @param {string} filename Nama file PDF yang diunduh
 * @returns {Promise<boolean>}
 */
export async function downloadLetterPdf(
    element = null,
    filename = 'Surat_Dispensasi_Nikah.pdf'
) {
    const targetElement = element || document.getElementById('printable-letter');
    if (!targetElement) {
        console.warn('Elemen surat tidak ditemukan untuk ekspor PDF.');
        return false;
    }

    try {
        const A4_WIDTH_PX = 794;
        const A4_HEIGHT_PX = 1123;

        const dataUrl = await toJpeg(targetElement, {
            quality: 0.98,
            pixelRatio: 2,
            backgroundColor: '#ffffff',
            skipFonts: true, // Mencegah crawling stylesheet Vite dev server yang menyebabkan SecurityError di konsol
            width: A4_WIDTH_PX,
            height: A4_HEIGHT_PX,
            style: {
                transform: 'none',
                transformOrigin: 'top left',
                position: 'static',
                margin: '0',
                width: `${A4_WIDTH_PX}px`,
                minWidth: `${A4_WIDTH_PX}px`,
                maxWidth: `${A4_WIDTH_PX}px`,
                height: `${A4_HEIGHT_PX}px`,
                minHeight: `${A4_HEIGHT_PX}px`,
                maxHeight: `${A4_HEIGHT_PX}px`,
            },
        });

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        });

        pdf.addImage(dataUrl, 'JPEG', 0, 0, 210, 297);
        pdf.save(filename);
        return true;
    } catch (error) {
        console.error('Gagal membuat dan mengunduh file PDF:', error);
        return false;
    }
}

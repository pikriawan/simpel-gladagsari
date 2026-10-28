export const DEFAULT_TEMPLATE_SETTINGS = {
    baris1: 'PEMERINTAH KABUPATEN BOYOLALI',
    baris2: 'KECAMATAN GLADAGSARI',
    baris3: 'Jl. Boyolali – Semarang KM 10 Gladagsari Boyolali Telp. (0276) 331345',
    baris4: 'website: gladagsarikec.boyolali.go.id, email: gladagsari@boyolali.go.id',
    baris5: '',
    logo: '',
    namaPejabat: 'Gilang Pamungkas',
    jabatanUtama: 'a.n. Camat Gladagsari',
    subJabatan: 'Kasi Pelayanan',
    pangkat: 'Penata Tingkat I',
    nipPejabat: '19850101 201001 1 001',
    dasarHukum1:
        'Undang-Undang Nomor 1 Tahun 1974 tentang Perkawinan sebagaimana telah diubah dengan Undang-Undang Nomor 16 Tahun 2019.',
    dasarHukum2:
        'Peraturan Mahkamah Agung Nomor 5 Tahun 2019 tentang Pedoman Mengadili Permohonan Dispensasi Kawin.',
    alasan: 'Dispensasi nikah diberikan untuk memenuhi persyaratan administrasi pencatatan perkawinan.',
};

const STORAGE_KEY = 'simpel_template_settings';

export function getStoredTemplateSettings() {
    if (typeof window === 'undefined') return DEFAULT_TEMPLATE_SETTINGS;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return DEFAULT_TEMPLATE_SETTINGS;
        const parsed = JSON.parse(raw);
        return { ...DEFAULT_TEMPLATE_SETTINGS, ...parsed };
    } catch {
        return DEFAULT_TEMPLATE_SETTINGS;
    }
}

export function saveStoredTemplateSettings(settings) {
    if (typeof window === 'undefined') return;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
        window.dispatchEvent(new Event('template_settings_updated'));
    } catch (e) {
        console.error('Failed to save template settings to localStorage', e);
    }
}

export function resetStoredTemplateSettings() {
    if (typeof window === 'undefined') return DEFAULT_TEMPLATE_SETTINGS;
    try {
        localStorage.removeItem(STORAGE_KEY);
        window.dispatchEvent(new Event('template_settings_updated'));
    } catch (e) {
        console.error('Failed to reset template settings in localStorage', e);
    }
    return DEFAULT_TEMPLATE_SETTINGS;
}

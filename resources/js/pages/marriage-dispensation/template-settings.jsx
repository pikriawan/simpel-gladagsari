import {
    Head,
    router,
    resetLayoutProps,
    setLayoutProps,
} from '@inertiajs/react';
import { editor, templateSettings } from '@/routes/marriage-dispensation';
import { useEffect, useRef, useState } from 'react';
import { RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import LetterPreview from '@/components/letter-preview';
import { DEFAULT_TEMPLATE_SETTINGS } from '@/lib/template-settings';

const SAMPLE_PREVIEW_FORM = {
    letterNumber: '001',
    village: 'Candisari',
    villageName: 'Candisari',
    referenceLetterNumber: '474/123/2026',
    letterDate: new Date().toISOString().slice(0, 10),
    applicantName: 'Muhammad Rifqi Khoirurrozaq',
    applicantBirthPlaceDate: 'Boyolali, 1 Januari 2006',
    subvillage: 'Candirejo',
    rt: '001',
    rw: '001',
    marriageDate: new Date(Date.now() + 86400000 * 7)
        .toISOString()
        .slice(0, 10),
    partnerName: 'Annisa Putri',
    partnerBirthPlaceDate: 'Boyolali, 1 Januari 2006',
    religion: 'Islam',
    partnerAddress:
        'Dukuh Banjaran, RT 001/RW 001, Desa Candisari, Kec. Gladagsari',
};

export default function PengaturanTemplate({ settings = {} }) {
    const [template, setTemplate] = useState(() => ({
        ...DEFAULT_TEMPLATE_SETTINGS,
        ...settings,
    }));
    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
    const templateRef = useRef(template);

    useEffect(() => {
        templateRef.current = template;
    }, [template]);

    // Header action: Reset default button
    useEffect(() => {
        setLayoutProps({
            actions: (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setIsResetDialogOpen(true)}
                        className="h-8 gap-1.5 px-3 text-xs"
                    >
                        <RotateCcw className="size-3.5" />
                        Reset default
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        onClick={handleSave}
                        className="h-8 gap-1.5 px-3 text-xs"
                    >
                        <Save className="size-3.5" />
                        Simpan
                    </Button>
                </>
            ),
        });

        return () => resetLayoutProps();
    }, []);

    const handleChange = (key, value) => {
        setTemplate((prev) => ({ ...prev, [key]: value }));
    };

    const handleSave = () => {
        router.post(
            '/marriage-dispensation/template-settings',
            { settings: templateRef.current },
            {
                preserveScroll: true,
                onSuccess: () => {
                    window.dispatchEvent(
                        new CustomEvent('template_settings_updated', {
                            detail: templateRef.current,
                        }),
                    );
                },
            },
        );
    };

    const handleConfirmReset = () => {
        router.delete('/marriage-dispensation/template-settings', {
            preserveScroll: true,
            onSuccess: () => {
                setTemplate({ ...DEFAULT_TEMPLATE_SETTINGS });
                window.dispatchEvent(
                    new CustomEvent('template_settings_updated', {
                        detail: { ...DEFAULT_TEMPLATE_SETTINGS },
                    }),
                );
            },
        });
        setIsResetDialogOpen(false);
    };

    return (
        <>
            <Head title="Pengaturan Template" />

            <div className="flex-1 overflow-auto p-6">
                <h1 className="mb-6 text-xl font-bold tracking-tight text-foreground">
                    Pengaturan Template
                </h1>

                <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2">
                    {/* ── Form Pengaturan ──────────────────────────────────── */}
                    <div className="flex flex-col gap-6">
                        {/* 1. KOP SURAT */}
                        <section className="flex flex-col gap-3">
                            <h2 className="text-sm font-semibold text-foreground">
                                Kop Surat
                            </h2>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">
                                    Baris 1 (pemerintah kabupaten)
                                </label>
                                <Input
                                    placeholder="Contoh: Pemerintah Kabupaten Boyolali"
                                    value={template.baris1}
                                    onChange={(e) =>
                                        handleChange('baris1', e.target.value)
                                    }
                                    className="h-9 bg-background text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">
                                    Baris 2 (nama kecamatan)
                                </label>
                                <Input
                                    placeholder="Contoh: Kecamatan Gladagsari"
                                    value={template.baris2}
                                    onChange={(e) =>
                                        handleChange('baris2', e.target.value)
                                    }
                                    className="h-9 bg-background text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">
                                    Baris 3 (alamat dan telepon)
                                </label>
                                <Input
                                    placeholder="Contoh: Jl. Boyolali - Semarang Km. 10, Gladagsari, Telp. (0276) 331345"
                                    value={template.baris3}
                                    onChange={(e) =>
                                        handleChange('baris3', e.target.value)
                                    }
                                    className="h-9 bg-background text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">
                                    Baris 4 (kode pos)
                                </label>
                                <Input
                                    placeholder="Contoh: Kode Pos 55555"
                                    value={template.baris4}
                                    onChange={(e) =>
                                        handleChange('baris4', e.target.value)
                                    }
                                    className="h-9 bg-background text-sm"
                                />
                            </div>
                        </section>

                        {/* 2. PEJABAT PENANDATANGAN SURAT */}
                        <section className="flex flex-col gap-3">
                            <h2 className="text-sm font-semibold text-foreground">
                                Pejabat Penandatangan Surat
                            </h2>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-muted-foreground">
                                        Nama lengkap pejabat
                                    </label>
                                    <Input
                                        placeholder="Contoh: Gilang Pamungkas"
                                        value={template.namaPejabat}
                                        onChange={(e) =>
                                            handleChange(
                                                'namaPejabat',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 bg-background text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-muted-foreground">
                                        Jabatan utama
                                    </label>
                                    <Input
                                        placeholder="Contoh: a.n. Camat Gladagsari"
                                        value={template.jabatanUtama}
                                        onChange={(e) =>
                                            handleChange(
                                                'jabatanUtama',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 bg-background text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-muted-foreground">
                                        Sub-jabatan/mengetahui (opsional)
                                    </label>
                                    <Input
                                        placeholder="Contoh: Kasi Pelayanan"
                                        value={template.subJabatan}
                                        onChange={(e) =>
                                            handleChange(
                                                'subJabatan',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 bg-background text-sm"
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-xs text-muted-foreground">
                                        Pangkat
                                    </label>
                                    <Input
                                        placeholder="Contoh: Penata Tingkat I"
                                        value={template.pangkat}
                                        onChange={(e) =>
                                            handleChange(
                                                'pangkat',
                                                e.target.value,
                                            )
                                        }
                                        className="h-9 bg-background text-sm"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">
                                    NIP
                                </label>
                                <Input
                                    placeholder="Masukkan NIP"
                                    value={template.nipPejabat}
                                    onChange={(e) =>
                                        handleChange(
                                            'nipPejabat',
                                            e.target.value,
                                        )
                                    }
                                    className="h-9 bg-background text-sm"
                                />
                            </div>
                        </section>

                        {/* 3. DASAR HUKUM DAN ALASAN */}
                        <section className="flex flex-col gap-3">
                            <h2 className="text-sm font-semibold text-foreground">
                                Dasar Hukum dan Alasan
                            </h2>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">
                                    Dasar hukum poin 1
                                </label>
                                <Input
                                    placeholder="Masukkan dasar hukum poin 1"
                                    value={template.dasarHukum1}
                                    onChange={(e) =>
                                        handleChange(
                                            'dasarHukum1',
                                            e.target.value,
                                        )
                                    }
                                    className="h-9 bg-background text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">
                                    Dasar hukum poin 2
                                </label>
                                <Input
                                    placeholder="Masukkan dasar hukum poin 2"
                                    value={template.dasarHukum2}
                                    onChange={(e) =>
                                        handleChange(
                                            'dasarHukum2',
                                            e.target.value,
                                        )
                                    }
                                    className="h-9 bg-background text-sm"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-xs text-muted-foreground">
                                    Teks alasan dispensasi nikah
                                </label>
                                <Input
                                    placeholder="Contoh: Dispensasi nikah untuk kelengkapan pemberkasan nikah"
                                    value={template.alasan}
                                    onChange={(e) =>
                                        handleChange('alasan', e.target.value)
                                    }
                                    className="h-9 bg-background text-sm"
                                />
                            </div>
                        </section>
                    </div>

                    {/* ── Preview Surat dengan Pita Pratinjau ────────────────── */}
                    <div className="sticky top-6">
                        <div className="relative min-h-0 overflow-hidden rounded-md border border-border shadow-xs">
                            {/* Pita diagonal Pratinjau di sudut kanan atas */}
                            <div className="pointer-events-none absolute top-6 -right-12 z-20 w-44 rotate-45 bg-zinc-400/90 py-1 text-center text-xs font-semibold tracking-wider text-white shadow-xs backdrop-blur-xs select-none">
                                Pratinjau
                            </div>

                            <LetterPreview
                                form={SAMPLE_PREVIEW_FORM}
                                template={template}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Dialog Konfirmasi Reset Default ──────────────────────────── */}
            <Dialog
                open={isResetDialogOpen}
                onOpenChange={setIsResetDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kembalikan ke Default</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin mengembalikan seluruh
                            pengaturan template (kop surat, pejabat, dasar
                            hukum) ke pengaturan awal?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsResetDialogOpen(false)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleConfirmReset}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Reset ke Default
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

PengaturanTemplate.layout = {
    breadcrumbs: [
        {
            title: 'Surat Dispensasi Nikah',
            href: editor(),
        },
        {
            title: 'Pengaturan Template',
            href: templateSettings(),
        },
    ],
};

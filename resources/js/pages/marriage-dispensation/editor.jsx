import {
    Head,
    router,
    setLayoutProps,
    resetLayoutProps,
} from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import {
    editor,
    store as storeMarriageDispensation,
} from '@/routes/marriage-dispensation';
import { Button } from '@/components/ui/button';
import LetterPreview from '@/components/letter-preview';
import { downloadLetterPdf } from '@/lib/download-letter-pdf';
import { extractLetterSequence, formatLetterNumber } from '@/lib/format';
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from '@/components/ui/combobox';
import { cn } from '@/lib/utils';

const RELIGIONS = [
    'Islam',
    'Kristen',
    'Katolik',
    'Hindu',
    'Buddha',
    'Konghucu',
];

const getTodayString = () => {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const d = String(today.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const EMPTY_FORM = {
    id: null,
    letterNumber: '',
    village: '',
    referenceLetterNumber: '',
    letterDate: getTodayString(),
    applicantName: '',
    applicantBirthPlaceDate: '',
    subvillage: '',
    rt: '',
    rw: '',
    marriageDate: '',
    partnerName: '',
    partnerBirthPlaceDate: '',
    religion: '',
    partnerAddress: '',
};

import { getAllSubvillagesList, getAllVillagesList } from '@/lib/village-data';
import { DEFAULT_TEMPLATE_SETTINGS } from '@/lib/template-settings';

function recordToForm(record) {
    if (!record) return { ...EMPTY_FORM, letterDate: getTodayString() };
    let sub = record.subvillage ?? '';
    let vil = record.village ?? record.village_name ?? '';
    if (sub.includes(',') && !vil) {
        const parts = sub.split(',').map((p) => p.trim());
        sub = parts[0] || '';
        vil = parts[1] || '';
    } else if (sub.includes(',')) {
        sub = sub.split(',')[0].trim();
    }
    return {
        id: record.id ?? null,
        letterNumber: extractLetterSequence(record.letter_number),
        village: vil,
        referenceLetterNumber: record.reference_letter_number ?? '',
        letterDate: (record.letter_date ?? '').slice(0, 10) || getTodayString(),
        applicantName: record.applicant_name ?? '',
        applicantBirthPlaceDate: record.applicant_birth_place_date ?? '',
        subvillage: sub,
        rt: record.rt ?? '',
        rw: record.rw ?? '',
        marriageDate: (record.marriage_date ?? '').slice(0, 10),
        partnerName: record.partner_name ?? '',
        partnerBirthPlaceDate: record.partner_birth_place_date ?? '',
        religion: record.religion ?? '',
        partnerAddress: record.partner_address ?? '',
    };
}

const REQUIRED_FIELDS = [
    'letterNumber',
    'village',
    'referenceLetterNumber',
    'letterDate',
    'applicantName',
    'applicantBirthPlaceDate',
    'subvillage',
    'rt',
    'rw',
    'marriageDate',
    'partnerName',
    'partnerBirthPlaceDate',
    'religion',
    'partnerAddress',
];

export default function Editor({ record, templateSettings = {} }) {
    const [form, setForm] = useState(() => recordToForm(record));
    const [villages, setVillages] = useState(() => getAllVillagesList());
    const [subVillages] = useState(() => getAllSubvillagesList());
    const [template, setTemplate] = useState(() => ({
        ...DEFAULT_TEMPLATE_SETTINGS,
        ...templateSettings,
    }));
    const [showErrors, setShowErrors] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [mobileTab, setMobileTab] = useState('form');

    const isFieldEmpty = useCallback(
        (key) => !form[key] || !String(form[key]).trim(),
        [form],
    );

    useEffect(() => {
        const updateList = () => {
            setVillages(getAllVillagesList());
        };
        const updateTemplate = (event) => {
            const next = event?.detail;
            if (next) {
                setTemplate((prev) => ({
                    ...DEFAULT_TEMPLATE_SETTINGS,
                    ...prev,
                    ...next,
                }));
            }
        };
        window.addEventListener('village_data_updated', updateList);
        window.addEventListener('template_settings_updated', updateTemplate);
        return () => {
            window.removeEventListener('village_data_updated', updateList);
            window.removeEventListener(
                'template_settings_updated',
                updateTemplate,
            );
        };
    }, []);

    // Reset form setiap kali record berubah (navigasi dari riwayat)
    useEffect(() => {
        setForm(recordToForm(record));
        setShowErrors(false);
    }, [record]);

    // saveAndPrint selalu membaca nilai form terbaru
    const saveAndPrint = useCallback(() => {
        const emptyFields = REQUIRED_FIELDS.filter((key) => isFieldEmpty(key));
        if (emptyFields.length > 0) {
            setShowErrors(true);
            const firstEl = document.querySelector(
                `[name="${emptyFields[0]}"]`,
            );
            firstEl?.focus();
            return;
        }

        setIsSubmitting(true);
        const rawNumber = (form.letterNumber || '').trim();
        const fullLetterNumber = rawNumber
            ? formatLetterNumber(rawNumber, form.letterDate)
            : '';

        const submitPayload = {
            ...form,
            letterNumber: fullLetterNumber || form.letterNumber,
        };

        router.post(storeMarriageDispensation().url, submitPayload, {
            preserveScroll: true,
            onSuccess: async () => {
                // Karakter seperti '/' diganti '-' agar valid sebagai nama file di semua OS
                const cleanNumber = fullLetterNumber
                    .replace(/[\\/:*?"<>|]/g, '-')
                    .replace(/-+/g, '-');
                const cleanApplicant = (form.applicantName || '')
                    .trim()
                    .replace(/[\\/:*?"<>|]/g, '')
                    .replace(/\s+/g, '_');

                let filename = 'Surat_Dispensasi_Nikah.pdf';
                if (cleanNumber && cleanApplicant) {
                    filename = `${cleanNumber}_${cleanApplicant}.pdf`;
                } else if (cleanNumber) {
                    filename = `${cleanNumber}.pdf`;
                } else if (cleanApplicant) {
                    filename = `${cleanApplicant}.pdf`;
                }

                try {
                    await downloadLetterPdf(
                        document.getElementById('printable-letter'),
                        filename,
                    );
                } catch (error) {
                    console.error('Gagal mengunduh PDF:', error);
                } finally {
                    setIsSubmitting(false);
                }

                // Otomatis langsung mengarah ke print dialog
                setTimeout(() => {
                    window.print();
                }, 300);
            },
            onError: () => {
                setIsSubmitting(false);
            },
        });
    }, [form, isFieldEmpty]);

    // Perbarui tombol di header setiap kali saveAndPrint berubah
    useEffect(() => {
        setLayoutProps({
            actions: (
                <Button
                    type="button"
                    onClick={saveAndPrint}
                    disabled={isSubmitting}
                >
                    <Printer />
                    Simpan dan cetak
                </Button>
            ),
        });

        return () => resetLayoutProps();
    }, [saveAndPrint, isSubmitting]);

    const bind = (key) => {
        const hasError = showErrors && isFieldEmpty(key);
        return {
            value: form[key],
            'aria-invalid': hasError,
            className: hasError
                ? 'border-destructive focus-visible:ring-destructive/20'
                : '',
            onChange: (event) =>
                setForm((current) => ({
                    ...current,
                    [key]: event.target.value,
                })),
        };
    };

    return (
        <>
            <Head title="Editor Surat Dispensasi Nikah" />
            <div className="w-full flex-1">
                {/* Mobile View Toggle */}
                <div className="p-3 pb-0 lg:hidden">
                    <div className="flex rounded-lg border bg-muted p-1 text-muted-foreground">
                        <button
                            type="button"
                            onClick={() => setMobileTab('form')}
                            className={cn(
                                'flex-1 rounded-md py-1.5 text-xs font-semibold transition-all',
                                mobileTab === 'form'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'hover:text-foreground',
                            )}
                        >
                            Formulir Data
                        </button>
                        <button
                            type="button"
                            onClick={() => setMobileTab('preview')}
                            className={cn(
                                'flex-1 rounded-md py-1.5 text-xs font-semibold transition-all',
                                mobileTab === 'preview'
                                    ? 'bg-background text-foreground shadow-xs'
                                    : 'hover:text-foreground',
                            )}
                        >
                            Pratinjau Surat
                        </button>
                    </div>
                </div>

                <div className="pb-safe grid grid-cols-1 gap-4 p-3 sm:p-4 lg:grid-cols-2 print:block print:p-0 print:m-0">
                    <form
                        className={cn(
                            'flex flex-col gap-4 pb-4',
                            mobileTab === 'preview' && 'hidden lg:flex',
                        )}
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend>
                                    Nomor Surat dan Tanggal
                                </FieldLegend>
                                <FieldGroup>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('letterNumber')
                                        }
                                    >
                                        <FieldLabel>Nomor urut</FieldLabel>
                                        <Input
                                            placeholder="Contoh: 1"
                                            inputMode="numeric"
                                            name="letterNumber"
                                            {...bind('letterNumber')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty('letterNumber') && (
                                                <FieldError>
                                                    Nomor urut wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('village')
                                        }
                                    >
                                        <FieldLabel>
                                            Nama desa pengantar
                                        </FieldLabel>
                                        <Combobox
                                            items={villages}
                                            value={form.village}
                                            onValueChange={(value) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    village: value ?? '',
                                                }))
                                            }
                                        >
                                            <ComboboxInput
                                                name="village"
                                                placeholder="Pilih atau cari desa..."
                                                aria-invalid={
                                                    showErrors &&
                                                    isFieldEmpty('village')
                                                }
                                                className={
                                                    showErrors &&
                                                    isFieldEmpty('village')
                                                        ? 'border-destructive ring-destructive/20'
                                                        : ''
                                                }
                                                onChange={(e) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        village: e.target.value,
                                                    }))
                                                }
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>
                                                    Desa tidak ditemukan.
                                                </ComboboxEmpty>
                                                <ComboboxList>
                                                    {(item) => (
                                                        <ComboboxItem
                                                            key={item}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                        {showErrors &&
                                            isFieldEmpty('village') && (
                                                <FieldError>
                                                    Nama desa pengantar wajib
                                                    diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty(
                                                'referenceLetterNumber',
                                            )
                                        }
                                    >
                                        <FieldLabel>
                                            Nomor surat pengantar
                                        </FieldLabel>
                                        <Input
                                            placeholder="Contoh: 474/222/02/2026"
                                            name="referenceLetterNumber"
                                            {...bind('referenceLetterNumber')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty(
                                                'referenceLetterNumber',
                                            ) && (
                                                <FieldError>
                                                    Nomor surat pengantar wajib
                                                    diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('letterDate')
                                        }
                                    >
                                        <FieldLabel>
                                            Tanggal surat dikeluarkan
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            name="letterDate"
                                            {...bind('letterDate')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty('letterDate') && (
                                                <FieldError>
                                                    Tanggal surat dikeluarkan
                                                    wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                </FieldGroup>
                            </FieldSet>

                            <FieldSet>
                                <FieldLegend>Data Pemohon</FieldLegend>
                                <FieldGroup>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('applicantName')
                                        }
                                    >
                                        <FieldLabel>Nama pemohon</FieldLabel>
                                        <Input
                                            placeholder="Contoh: Muhammad Rifqi Khoirurrozaq"
                                            name="applicantName"
                                            {...bind('applicantName')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty('applicantName') && (
                                                <FieldError>
                                                    Nama pemohon wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty(
                                                'applicantBirthPlaceDate',
                                            )
                                        }
                                    >
                                        <FieldLabel>
                                            Tempat/tanggal lahir
                                        </FieldLabel>
                                        <Input
                                            placeholder="Contoh: Boyolali, 1 Januari 2006"
                                            name="applicantBirthPlaceDate"
                                            {...bind('applicantBirthPlaceDate')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty(
                                                'applicantBirthPlaceDate',
                                            ) && (
                                                <FieldError>
                                                    Tempat/tanggal lahir pemohon
                                                    wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('subvillage')
                                        }
                                    >
                                        <FieldLabel>Dukuh</FieldLabel>
                                        <Combobox
                                            items={subVillages}
                                            value={form.subvillage}
                                            onValueChange={(value) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    subvillage: value ?? '',
                                                }))
                                            }
                                        >
                                            <ComboboxInput
                                                name="subvillage"
                                                placeholder="Pilih atau cari dukuh..."
                                                aria-invalid={
                                                    showErrors &&
                                                    isFieldEmpty('subvillage')
                                                }
                                                className={
                                                    showErrors &&
                                                    isFieldEmpty('subvillage')
                                                        ? 'border-destructive ring-destructive/20'
                                                        : ''
                                                }
                                                onChange={(e) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        subvillage:
                                                            e.target.value,
                                                    }))
                                                }
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>
                                                    Dukuh tidak ditemukan.
                                                </ComboboxEmpty>
                                                <ComboboxList>
                                                    {(item) => (
                                                        <ComboboxItem
                                                            key={item}
                                                            value={item}
                                                        >
                                                            {item}
                                                        </ComboboxItem>
                                                    )}
                                                </ComboboxList>
                                            </ComboboxContent>
                                        </Combobox>
                                        {showErrors &&
                                            isFieldEmpty('subvillage') && (
                                                <FieldError>
                                                    Dukuh pemohon wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field
                                            data-invalid={
                                                showErrors && isFieldEmpty('rt')
                                            }
                                        >
                                            <FieldLabel>RT</FieldLabel>
                                            <Input
                                                placeholder="Contoh: 001"
                                                name="rt"
                                                {...bind('rt')}
                                            />
                                            {showErrors &&
                                                isFieldEmpty('rt') && (
                                                    <FieldError>
                                                        RT wajib diisi
                                                    </FieldError>
                                                )}
                                        </Field>
                                        <Field
                                            data-invalid={
                                                showErrors && isFieldEmpty('rw')
                                            }
                                        >
                                            <FieldLabel>RW</FieldLabel>
                                            <Input
                                                placeholder="Contoh: 001"
                                                name="rw"
                                                {...bind('rw')}
                                            />
                                            {showErrors &&
                                                isFieldEmpty('rw') && (
                                                    <FieldError>
                                                        RW wajib diisi
                                                    </FieldError>
                                                )}
                                        </Field>
                                    </div>
                                </FieldGroup>
                            </FieldSet>

                            <FieldSet>
                                <FieldLegend>Tanggal Pernikahan</FieldLegend>
                                <FieldGroup>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('marriageDate')
                                        }
                                    >
                                        <FieldLabel>
                                            Tanggal pernikahan
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            name="marriageDate"
                                            {...bind('marriageDate')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty('marriageDate') && (
                                                <FieldError>
                                                    Tanggal pernikahan wajib
                                                    diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                </FieldGroup>
                            </FieldSet>

                            <FieldSet>
                                <FieldLegend>Data Pasangan</FieldLegend>
                                <FieldGroup>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('partnerName')
                                        }
                                    >
                                        <FieldLabel>Nama pasangan</FieldLabel>
                                        <Input
                                            placeholder="Contoh: Nem Painem"
                                            name="partnerName"
                                            {...bind('partnerName')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty('partnerName') && (
                                                <FieldError>
                                                    Nama pasangan wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty(
                                                'partnerBirthPlaceDate',
                                            )
                                        }
                                    >
                                        <FieldLabel>
                                            Tempat/tanggal lahir
                                        </FieldLabel>
                                        <Input
                                            placeholder="Contoh: Boyolali, 1 Januari 2000"
                                            name="partnerBirthPlaceDate"
                                            {...bind('partnerBirthPlaceDate')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty(
                                                'partnerBirthPlaceDate',
                                            ) && (
                                                <FieldError>
                                                    Tempat/tanggal lahir
                                                    pasangan wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('religion')
                                        }
                                    >
                                        <FieldLabel>Agama</FieldLabel>
                                        <Select
                                            name="religion"
                                            value={form.religion}
                                            onValueChange={(value) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    religion: value ?? '',
                                                }))
                                            }
                                        >
                                            <SelectTrigger
                                                className={cn(
                                                    'w-full',
                                                    showErrors &&
                                                        isFieldEmpty(
                                                            'religion',
                                                        ) &&
                                                        'border-destructive ring-destructive/20',
                                                )}
                                                aria-invalid={
                                                    showErrors &&
                                                    isFieldEmpty('religion')
                                                }
                                            >
                                                <SelectValue placeholder="Pilih agama" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {RELIGIONS.map((religion) => (
                                                    <SelectItem
                                                        key={religion}
                                                        value={religion}
                                                    >
                                                        {religion}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {showErrors &&
                                            isFieldEmpty('religion') && (
                                                <FieldError>
                                                    Agama pasangan wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                    <Field
                                        data-invalid={
                                            showErrors &&
                                            isFieldEmpty('partnerAddress')
                                        }
                                    >
                                        <FieldLabel>Alamat</FieldLabel>
                                        <Input
                                            placeholder="Contoh: Banjaran, RT001/RW001, Desa Candisari, Kec. Gladagsari"
                                            name="partnerAddress"
                                            {...bind('partnerAddress')}
                                        />
                                        {showErrors &&
                                            isFieldEmpty('partnerAddress') && (
                                                <FieldError>
                                                    Alamat pasangan wajib diisi
                                                </FieldError>
                                            )}
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </FieldGroup>
                    </form>

                    <div
                        className={cn(
                            'min-h-0 self-start lg:sticky lg:top-4 print:!block print:!static print:!w-full print:!m-0 print:!p-0',
                            mobileTab === 'form' && 'hidden lg:block',
                        )}
                    >
                        <LetterPreview form={form} template={template} />
                    </div>
                </div>
            </div>
        </>
    );
}

Editor.layout = {
    breadcrumbs: [
        {
            title: 'Surat Dispensasi Nikah',
            href: editor(),
        },
        {
            title: 'Editor',
            href: editor(),
        },
    ],
};

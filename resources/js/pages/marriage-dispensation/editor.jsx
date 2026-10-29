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
    loadToEditor,
    store as storeMarriageDispensation,
} from '@/routes/marriage-dispensation';
import { Button } from '@/components/ui/button';
import LetterPreview from '@/components/letter-preview';
import {
    Field,
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

const RELIGIONS = [
    'Islam',
    'Kristen',
    'Katolik',
    'Hindu',
    'Buddha',
    'Konghucu',
];

const EMPTY_FORM = {
    letterNumber: '',
    village: '',
    referenceLetterNumber: '',
    letterDate: '',
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

import {
    getAllSubvillagesList,
    getAllVillagesList,
    getVillageBySubvillage,
} from '@/lib/village-data';
import { getStoredTemplateSettings } from '@/lib/template-settings';

function recordToForm(record) {
    if (!record) return { ...EMPTY_FORM };
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
        letterNumber:           record.letter_number           ?? '',
        village:                vil,
        referenceLetterNumber:  record.reference_letter_number ?? '',
        letterDate:             record.letter_date             ?? '',
        applicantName:          record.applicant_name          ?? '',
        applicantBirthPlaceDate:record.applicant_birth_place_date ?? '',
        subvillage:             sub,
        rt:                     record.rt                      ?? '',
        rw:                     record.rw                      ?? '',
        marriageDate:           record.marriage_date           ?? '',
        partnerName:            record.partner_name            ?? '',
        partnerBirthPlaceDate:  record.partner_birth_place_date ?? '',
        religion:               record.religion                ?? '',
        partnerAddress:         record.partner_address         ?? '',
    };
}

export default function Editor({ record }) {
    const [form, setForm] = useState(() => recordToForm(record));
    const [villages, setVillages] = useState(() => getAllVillagesList());
    const [subVillages, setSubVillages] = useState(() =>
        getAllSubvillagesList(form.village),
    );
    const [template, setTemplate] = useState(() => getStoredTemplateSettings());

    useEffect(() => {
        setSubVillages(getAllSubvillagesList(form.village));
    }, [form.village]);

    useEffect(() => {
        const updateList = () => {
            setVillages(getAllVillagesList());
            setSubVillages(getAllSubvillagesList(form.village));
        };
        const updateTemplate = () => setTemplate(getStoredTemplateSettings());
        window.addEventListener('village_data_updated', updateList);
        window.addEventListener('template_settings_updated', updateTemplate);
        return () => {
            window.removeEventListener('village_data_updated', updateList);
            window.removeEventListener('template_settings_updated', updateTemplate);
        };
    }, [form.village]);

    // Reset form setiap kali record berubah (navigasi dari riwayat)
    useEffect(() => {
        setForm(recordToForm(record));
    }, [record]);

    // saveAndPrint selalu membaca nilai form terbaru
    const saveAndPrint = useCallback(() => {
        router.post(storeMarriageDispensation().url, form, {
            preserveScroll: true,
            onSuccess: () => window.print(),
        });
    }, [form]);

    // Perbarui tombol di header setiap kali saveAndPrint berubah
    useEffect(() => {
        setLayoutProps({
            actions: (
                <Button type="button" onClick={saveAndPrint}>
                    <Printer />
                    Simpan dan cetak
                </Button>
            ),
        });

        return () => resetLayoutProps();
    }, [saveAndPrint]);

    const bind = (key) => ({
        value: form[key],
        onChange: (event) =>
            setForm((current) => ({ ...current, [key]: event.target.value })),
    });

    return (
        <>
            <Head title="Editor Surat Dispensasi Nikah" />
            <div className="max-h-[calc(100svh-5rem)] min-h-0 w-full flex-1 overflow-auto">
                <div className="grid grid-cols-2 gap-4 p-4">
                    <form
                        className="flex flex-col gap-4"
                        onSubmit={(event) => event.preventDefault()}
                    >
                        <FieldGroup>
                            <FieldSet>
                                <FieldLegend>
                                    Nomor Surat dan Tanggal
                                </FieldLegend>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>Nomor urut</FieldLabel>
                                        <Input
                                            placeholder="Contoh: 1"
                                            inputMode="numeric"
                                            name="letterNumber"
                                            {...bind('letterNumber')}
                                        />
                                    </Field>
                                    <Field>
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
                                    </Field>
                                    <Field>
                                        <FieldLabel>
                                            Nomor surat pengantar
                                        </FieldLabel>
                                        <Input
                                            placeholder="Contoh: 474/222/02/2026"
                                            name="referenceLetterNumber"
                                            {...bind('referenceLetterNumber')}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>
                                            Tanggal surat dikeluarkan
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            name="letterDate"
                                            {...bind('letterDate')}
                                        />
                                    </Field>
                                </FieldGroup>
                            </FieldSet>

                            <FieldSet>
                                <FieldLegend>Data Pemohon</FieldLegend>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>Nama pemohon</FieldLabel>
                                        <Input
                                            placeholder="Contoh: Muhammad Rifqi Khoirurrozaq"
                                            name="applicantName"
                                            {...bind('applicantName')}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>
                                            Tempat/tanggal lahir
                                        </FieldLabel>
                                        <Input
                                            placeholder="Contoh: Boyolali, 1 Januari 2006"
                                            name="applicantBirthPlaceDate"
                                            {...bind('applicantBirthPlaceDate')}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>Dukuh</FieldLabel>
                                        <Combobox
                                            items={subVillages}
                                            value={form.subvillage}
                                            onValueChange={(value) => {
                                                setForm((current) => {
                                                    const next = {
                                                        ...current,
                                                        subvillage: value ?? '',
                                                    };
                                                    if (!current.village && value) {
                                                        const detected = getVillageBySubvillage(value);
                                                        if (detected) {
                                                            next.village = detected;
                                                        }
                                                    }
                                                    return next;
                                                });
                                            }}
                                        >
                                            <ComboboxInput
                                                name="subvillage"
                                                placeholder="Pilih atau cari dukuh..."
                                                onChange={(e) =>
                                                    setForm((current) => ({
                                                        ...current,
                                                        subvillage: e.target.value,
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
                                    </Field>
                                    <div className="grid grid-cols-2 gap-4">
                                        <Field>
                                            <FieldLabel>RT</FieldLabel>
                                            <Input
                                                placeholder="Contoh: 001"
                                                name="rt"
                                                {...bind('rt')}
                                            />
                                        </Field>
                                        <Field>
                                            <FieldLabel>RW</FieldLabel>
                                            <Input
                                                placeholder="Contoh: 001"
                                                name="rw"
                                                {...bind('rw')}
                                            />
                                        </Field>
                                    </div>
                                </FieldGroup>
                            </FieldSet>

                            <FieldSet>
                                <FieldLegend>Tanggal Pernikahan</FieldLegend>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>
                                            Tanggal pernikahan
                                        </FieldLabel>
                                        <Input
                                            type="date"
                                            name="marriageDate"
                                            {...bind('marriageDate')}
                                        />
                                    </Field>
                                </FieldGroup>
                            </FieldSet>

                            <FieldSet>
                                <FieldLegend>Data Pasangan</FieldLegend>
                                <FieldGroup>
                                    <Field>
                                        <FieldLabel>Nama pasangan</FieldLabel>
                                        <Input
                                            placeholder="Contoh: Nem Painem"
                                            name="partnerName"
                                            {...bind('partnerName')}
                                        />
                                    </Field>
                                    <Field>
                                        <FieldLabel>
                                            Tempat/tanggal lahir
                                        </FieldLabel>
                                        <Input
                                            placeholder="Contoh: Boyolali, 1 Januari 2000"
                                            name="partnerBirthPlaceDate"
                                            {...bind('partnerBirthPlaceDate')}
                                        />
                                    </Field>
                                    <Field>
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
                                            <SelectTrigger className="w-full">
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
                                    </Field>
                                    <Field>
                                        <FieldLabel>Alamat</FieldLabel>
                                        <Input
                                            placeholder="Contoh: Banjaran, RT001/RW001, Desa Candisari, Kec. Gladagsari"
                                            name="partnerAddress"
                                            {...bind('partnerAddress')}
                                        />
                                    </Field>
                                </FieldGroup>
                            </FieldSet>
                        </FieldGroup>
                    </form>

                    <div className="min-h-0 overflow-hidden">
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

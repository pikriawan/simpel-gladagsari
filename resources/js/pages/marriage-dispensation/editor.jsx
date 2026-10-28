import {
    Head,
    router,
    setLayoutProps,
    resetLayoutProps,
} from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Printer } from 'lucide-react';
import {
    editor,
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
    villageName: '',
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

const subVillages = ['Belang Kidul, Kaligentong', 'Tempel, Gladagsari'];

export default function Editor() {
    const [form, setForm] = useState(() => ({ ...EMPTY_FORM }));
    const formRef = useRef(form);

    useEffect(() => {
        formRef.current = form;
    }, [form]);

    const saveAndPrint = () => {
        router.post(storeMarriageDispensation().url, formRef.current, {
            preserveScroll: true,
            onSuccess: () => window.print(),
        });
    };

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
    }, []);

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
                                        <Input
                                            placeholder="Contoh: Kaligentong"
                                            name="villageName"
                                            {...bind('villageName')}
                                        />
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
                                            onValueChange={(value) =>
                                                setForm((current) => ({
                                                    ...current,
                                                    subvillage: value ?? '',
                                                }))
                                            }
                                        >
                                            <ComboboxInput
                                                name="subvillage"
                                                placeholder="Cari dukuh..."
                                            />
                                            <ComboboxContent>
                                                <ComboboxEmpty>
                                                    No items found.
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
                        <LetterPreview form={form} />
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

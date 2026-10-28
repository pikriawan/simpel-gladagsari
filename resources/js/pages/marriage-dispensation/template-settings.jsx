import { Head } from '@inertiajs/react';
import { editor, templateSettings } from '@/routes/marriage-dispensation';

export default function PengaturanTemplate() {
    return (
        <>
            <Head title="Pengaturan Template" />
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

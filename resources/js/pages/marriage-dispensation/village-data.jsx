import { Head } from '@inertiajs/react';
import { editor, villageData } from '@/routes/marriage-dispensation';

export default function DataDesaDukuh() {
    return (
        <>
            <Head title="Data Desa dan Dukuh" />
        </>
    );
}

DataDesaDukuh.layout = {
    breadcrumbs: [
        {
            title: 'Surat Dispensasi Nikah',
            href: editor(),
        },
        {
            title: 'Data Desa dan Dukuh',
            href: villageData(),
        },
    ],
};

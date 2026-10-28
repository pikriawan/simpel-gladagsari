import { Head } from '@inertiajs/react';
import { editor, history } from '@/routes/marriage-dispensation';

export default function Riwayat() {
    return (
        <>
            <Head title="Riwayat Surat Dispensasi Nikah" />
        </>
    );
}

Riwayat.layout = {
    breadcrumbs: [
        {
            title: 'Surat Dispensasi Nikah',
            href: editor(),
        },
        {
            title: 'Riwayat',
            href: history(),
        },
    ],
};

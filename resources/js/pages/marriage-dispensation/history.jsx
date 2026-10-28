import { Head, router, setLayoutProps, resetLayoutProps } from '@inertiajs/react';
import { useEffect, useState, useCallback } from 'react';
import { Eye, Trash2, FileSpreadsheet, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Upload } from 'lucide-react';
import { editor, history, loadToEditor, destroy as destroyRoute } from '@/routes/marriage-dispensation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ─── Pagination Button ───────────────────────────────────────────────────────

function PaginationButton({ onClick, disabled, children, active }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={[
                'flex h-8 min-w-8 items-center justify-center rounded-md px-2 text-sm transition-colors',
                active
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50',
            ].join(' ')}
        >
            {children}
        </button>
    );
}

// ─── Detail Row ──────────────────────────────────────────────────────────────

function DetailRow({ label, value }) {
    return (
        <div className="grid grid-cols-[1fr_1.4fr] gap-2 py-1.5">
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm">{value ?? '-'}</span>
        </div>
    );
}

// ─── Detail Modal ────────────────────────────────────────────────────────────

function DetailModal({ record, open, onClose, onDelete, onLoadToEditor }) {
    if (!record) return null;

    const applicantAddress = [
        record.subvillage,
        record.rt && record.rw ? `RT${record.rt}/RW${record.rw}` : null,
        record.village_name ? `Desa ${record.village_name}` : null,
        'Kec. Gladagsari',
    ]
        .filter(Boolean)
        .join(', ');

    return (
        <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
            <DialogContent className="max-h-[90vh] max-w-md overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Detail Data</DialogTitle>
                </DialogHeader>

                {/* Nomor Surat dan Tanggal */}
                <section>
                    <h3 className="mb-1 text-sm font-semibold">Nomor Surat dan Tanggal</h3>
                    <div className="divide-y">
                        <DetailRow label="Nomor urut" value={record.letter_number} />
                        <DetailRow label="Nama desa pengantar" value={record.village_name} />
                        <DetailRow label="Nomor surat pengantar" value={record.reference_letter_number} />
                        <DetailRow label="Tanggal surat dikeluarkan" value={formatDate(record.letter_date)} />
                    </div>
                </section>

                {/* Data Pemohon */}
                <section>
                    <h3 className="mb-1 text-sm font-semibold">Data Pemohon</h3>
                    <div className="divide-y">
                        <DetailRow label="Nama pemohon" value={record.applicant_name} />
                        <DetailRow label="Tempat/tanggal lahir" value={record.applicant_birth_place_date} />
                        <DetailRow label="Alamat" value={applicantAddress} />
                    </div>
                </section>

                {/* Tanggal Pernikahan */}
                <section>
                    <h3 className="mb-1 text-sm font-semibold">Tanggal Pernikahan</h3>
                    <div className="divide-y">
                        <DetailRow label="Tanggal pernikahan di KUA" value={formatDate(record.marriage_date)} />
                    </div>
                </section>

                {/* Data Pasangan */}
                <section>
                    <h3 className="mb-1 text-sm font-semibold">Data Pasangan</h3>
                    <div className="divide-y">
                        <DetailRow label="Nama pasangan" value={record.partner_name} />
                        <DetailRow label="Tempat/tanggal lahir" value={record.partner_birth_place_date} />
                        <DetailRow label="Agama" value={record.religion} />
                        <DetailRow label="Alamat" value={record.partner_address} />
                    </div>
                </section>

                <DialogFooter className="flex-row items-center gap-2 sm:justify-between">
                    <Button variant="outline" onClick={onClose}>
                        Tutup
                    </Button>
                    <div className="flex gap-2">
                        <Button variant="destructive" onClick={onDelete}>
                            <Trash2 />
                            Hapus
                        </Button>
                        <Button onClick={onLoadToEditor}>
                            <Upload />
                            Muat ke Editor
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function Riwayat({ records, filters }) {
    const [search, setSearch] = useState(filters?.search ?? '');
    const [from, setFrom] = useState(filters?.from ?? '');
    const [to, setTo] = useState(filters?.to ?? '');

    // Detail modal state
    const [selectedRecord, setSelectedRecord] = useState(null);

    // Debounced filter apply
    useEffect(() => {
        const timer = setTimeout(() => {
            applyFilters({ search, from, to });
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, from, to]);

    const applyFilters = useCallback((params) => {
        const query = {};
        if (params.search) query.search = params.search;
        if (params.from) query.from = params.from;
        if (params.to) query.to = params.to;

        router.get(history().url, query, {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    }, []);

    const handleDelete = (record) => {
        const target = record ?? selectedRecord;
        if (!target) return;
        if (!window.confirm(`Hapus riwayat surat "${target.letter_number}"?`)) return;
        setSelectedRecord(null);
        router.delete(destroyRoute(target.id).url, { preserveScroll: true });
    };

    const handleLoadToEditor = (record) => {
        const target = record ?? selectedRecord;
        if (!target) return;
        setSelectedRecord(null);
        router.visit(loadToEditor(target.id).url);
    };

    const handleExport = () => {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (from) params.set('from', from);
        if (to) params.set('to', to);
        const qs = params.toString();
        window.location.href = '/marriage-dispensation/export' + (qs ? '?' + qs : '');
    };

    const goToPage = (url) => {
        if (!url) return;
        router.visit(url, { preserveScroll: true, preserveState: true });
    };

    useEffect(() => {
        setLayoutProps({
            actions: (
                <Button type="button" variant="outline" onClick={handleExport}>
                    <FileSpreadsheet />
                    Ekspor Excel
                </Button>
            ),
        });
        return () => resetLayoutProps();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search, from, to]);

    const {
        data,
        links,
        current_page,
        last_page,
        prev_page_url,
        next_page_url,
        first_page_url,
        last_page_url,
    } = records ?? {};

    // Remove Prev / Next wrapper links from pagination
    const pageLinks = (links ?? []).filter((link) => {
        const label = link.label ?? '';
        return (
            !label.includes('Previous') &&
            !label.includes('Next') &&
            !label.includes('laquo') &&
            !label.includes('raquo')
        );
    });

    return (
        <>
            <Head title="Riwayat Surat Dispensasi Nikah" />

            <div className="flex flex-col gap-4 p-4">
                {/* Filters */}
                <div className="flex flex-wrap items-end gap-3">
                    <div className="flex min-w-48 flex-1 flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Cari</label>
                        <Input
                            placeholder="Kata kunci..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Dari</label>
                        <Input
                            type="date"
                            className="w-44"
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-sm font-medium text-foreground">Hingga</label>
                        <Input
                            type="date"
                            className="w-44"
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nomor surat</TableHead>
                                <TableHead>Pemohon</TableHead>
                                <TableHead>Pasangan</TableHead>
                                <TableHead>Tanggal pernikahan</TableHead>
                                <TableHead>Desa asal</TableHead>
                                <TableHead>Waktu disimpan</TableHead>
                                <TableHead className="w-16" />
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data && data.length > 0 ? (
                                data.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-mono text-xs">
                                            {record.letter_number ?? '-'}
                                        </TableCell>
                                        <TableCell>{record.applicant_name ?? '-'}</TableCell>
                                        <TableCell>{record.partner_name ?? '-'}</TableCell>
                                        <TableCell>{formatDate(record.marriage_date)}</TableCell>
                                        <TableCell>{record.village_name ?? '-'}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">
                                            {formatDateTime(record.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                    onClick={() => setSelectedRecord(record)}
                                                    title="Lihat detail"
                                                >
                                                    <Eye className="size-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                    onClick={() => handleDelete(record)}
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="size-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={7}
                                        className="h-32 text-center text-muted-foreground"
                                    >
                                        Tidak ada data.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {records && last_page > 1 && (
                    <div className="flex items-center justify-center gap-1">
                        <PaginationButton
                            onClick={() => goToPage(first_page_url)}
                            disabled={current_page === 1}
                        >
                            <ChevronsLeft className="size-4" />
                        </PaginationButton>
                        <PaginationButton
                            onClick={() => goToPage(prev_page_url)}
                            disabled={!prev_page_url}
                        >
                            <ChevronLeft className="size-4" />
                        </PaginationButton>

                        {pageLinks.map((link, i) => {
                            if (link.label === '...') {
                                return (
                                    <span
                                        key={i}
                                        className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground"
                                    >
                                        …
                                    </span>
                                );
                            }
                            return (
                                <PaginationButton
                                    key={i}
                                    onClick={() => goToPage(link.url)}
                                    disabled={!link.url}
                                    active={link.active}
                                >
                                    {link.label}
                                </PaginationButton>
                            );
                        })}

                        <PaginationButton
                            onClick={() => goToPage(next_page_url)}
                            disabled={!next_page_url}
                        >
                            <ChevronRight className="size-4" />
                        </PaginationButton>
                        <PaginationButton
                            onClick={() => goToPage(last_page_url)}
                            disabled={current_page === last_page}
                        >
                            <ChevronsRight className="size-4" />
                        </PaginationButton>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <DetailModal
                record={selectedRecord}
                open={!!selectedRecord}
                onClose={() => setSelectedRecord(null)}
                onDelete={() => handleDelete(selectedRecord)}
                onLoadToEditor={() => handleLoadToEditor(selectedRecord)}
            />
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

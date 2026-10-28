import { Head, resetLayoutProps, setLayoutProps } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Plus, RotateCcw, SquarePen, Trash2 } from 'lucide-react';
import { editor, villageData } from '@/routes/marriage-dispensation';
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
import {
    getStoredVillageData,
    saveStoredVillageData,
    resetStoredVillageData,
} from '@/lib/village-data';
import { cn } from '@/lib/utils';

export default function DataDesaDukuh() {
    const [villages, setVillages] = useState(() => getStoredVillageData());
    const [selectedDesaId, setSelectedDesaId] = useState(() => {
        const initial = getStoredVillageData();
        return initial[0]?.id ?? null;
    });

    const [newDesaName, setNewDesaName] = useState('');
    const [newDukuhName, setNewDukuhName] = useState('');

    // Dialog states
    const [editingDesa, setEditingDesa] = useState(null);
    const [editDesaName, setEditDesaName] = useState('');

    const [deletingDesa, setDeletingDesa] = useState(null);

    const [editingDukuh, setEditingDukuh] = useState(null);
    const [editDukuhName, setEditDukuhName] = useState('');

    const [deletingDukuh, setDeletingDukuh] = useState(null);

    const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

    // Selected village reference
    const selectedDesa =
        villages.find((v) => v.id === selectedDesaId) || villages[0] || null;

    // Header action: Reset default button
    useEffect(() => {
        setLayoutProps({
            actions: (
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
            ),
        });

        return () => resetLayoutProps();
    }, []);

    // ── Desa Actions ────────────────────────────────────────────────────────
    const handleAddDesa = () => {
        const name = newDesaName.trim();
        if (!name) return;

        const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
        const updated = [
            ...villages,
            {
                id: newId,
                name,
                subvillages: [],
            },
        ];

        setVillages(updated);
        saveStoredVillageData(updated);
        setSelectedDesaId(newId);
        setNewDesaName('');
    };

    const handleOpenEditDesa = (desa) => {
        setEditingDesa(desa);
        setEditDesaName(desa.name);
    };

    const handleSaveEditDesa = () => {
        const name = editDesaName.trim();
        if (!name || !editingDesa) return;

        const updated = villages.map((v) =>
            v.id === editingDesa.id ? { ...v, name } : v,
        );

        setVillages(updated);
        saveStoredVillageData(updated);
        setEditingDesa(null);
    };

    const handleConfirmDeleteDesa = () => {
        if (!deletingDesa) return;

        const updated = villages.filter((v) => v.id !== deletingDesa.id);
        setVillages(updated);
        saveStoredVillageData(updated);

        if (selectedDesaId === deletingDesa.id) {
            setSelectedDesaId(updated[0]?.id ?? null);
        }

        setDeletingDesa(null);
    };

    // ── Dukuh Actions ───────────────────────────────────────────────────────
    const handleAddDukuh = () => {
        const name = newDukuhName.trim();
        if (!name || !selectedDesa) return;

        const newId = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now();
        const updatedSubvillages = [
            ...(selectedDesa.subvillages || []),
            {
                id: newId,
                name,
            },
        ];

        const updated = villages.map((v) =>
            v.id === selectedDesa.id
                ? { ...v, subvillages: updatedSubvillages }
                : v,
        );

        setVillages(updated);
        saveStoredVillageData(updated);
        setNewDukuhName('');
    };

    const handleOpenEditDukuh = (dukuh) => {
        setEditingDukuh(dukuh);
        setEditDukuhName(dukuh.name);
    };

    const handleSaveEditDukuh = () => {
        const name = editDukuhName.trim();
        if (!name || !editingDukuh || !selectedDesa) return;

        const updatedSubvillages = (selectedDesa.subvillages || []).map((s) =>
            s.id === editingDukuh.id ? { ...s, name } : s,
        );

        const updated = villages.map((v) =>
            v.id === selectedDesa.id
                ? { ...v, subvillages: updatedSubvillages }
                : v,
        );

        setVillages(updated);
        saveStoredVillageData(updated);
        setEditingDukuh(null);
    };

    const handleConfirmDeleteDukuh = () => {
        if (!deletingDukuh || !selectedDesa) return;

        const updatedSubvillages = (selectedDesa.subvillages || []).filter(
            (s) => s.id !== deletingDukuh.id,
        );

        const updated = villages.map((v) =>
            v.id === selectedDesa.id
                ? { ...v, subvillages: updatedSubvillages }
                : v,
        );

        setVillages(updated);
        saveStoredVillageData(updated);
        setDeletingDukuh(null);
    };

    // ── Reset to Default ────────────────────────────────────────────────────
    const handleConfirmReset = () => {
        const defaults = resetStoredVillageData();
        setVillages(defaults);
        setSelectedDesaId(defaults[0]?.id ?? null);
        setIsResetDialogOpen(false);
    };

    return (
        <>
            <Head title="Data Desa dan Dukuh" />

            <div className="flex-1 overflow-auto p-6">
                <h1 className="mb-6 text-xl font-bold tracking-tight text-foreground">
                    Data Desa dan Dukuh
                </h1>

                <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
                    {/* ── KOLOM DESA ───────────────────────────────────────── */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-semibold text-foreground">
                            Desa
                        </label>
                        <div className="mb-4 flex gap-2">
                            <Input
                                placeholder="Masukkan nama desa"
                                value={newDesaName}
                                onChange={(e) => setNewDesaName(e.target.value)}
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleAddDesa()
                                }
                                className="h-9 bg-background text-sm"
                            />
                            <Button
                                type="button"
                                onClick={handleAddDesa}
                                className="h-9 shrink-0 bg-blue-600 px-3.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                                <Plus className="mr-1 size-3.5" />
                                Tambah desa
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {villages.map((desa) => {
                                const isSelected = selectedDesa?.id === desa.id;
                                return (
                                    <div
                                        key={desa.id}
                                        onClick={() =>
                                            setSelectedDesaId(desa.id)
                                        }
                                        className={cn(
                                            'flex cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-all select-none',
                                            isSelected
                                                ? 'border-blue-400 bg-blue-50/50 text-blue-600 font-medium shadow-xs dark:border-blue-500 dark:bg-blue-950/30 dark:text-blue-400'
                                                : 'border-border bg-background text-foreground hover:bg-muted/50',
                                        )}
                                    >
                                        <span className="truncate">
                                            {desa.name}
                                        </span>
                                        <div
                                            className="flex shrink-0 items-center gap-1"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() =>
                                                    handleOpenEditDesa(desa)
                                                }
                                                title="Edit desa"
                                            >
                                                <SquarePen className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                                onClick={() =>
                                                    setDeletingDesa(desa)
                                                }
                                                title="Hapus desa"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* ── KOLOM DUKUH ──────────────────────────────────────── */}
                    <div className="flex flex-col">
                        <label className="mb-2 text-sm font-semibold text-foreground">
                            Dukuh
                        </label>
                        <div className="mb-4 flex gap-2">
                            <Input
                                placeholder="Masukkan nama dukuh"
                                value={newDukuhName}
                                onChange={(e) =>
                                    setNewDukuhName(e.target.value)
                                }
                                onKeyDown={(e) =>
                                    e.key === 'Enter' && handleAddDukuh()
                                }
                                disabled={!selectedDesa}
                                className="h-9 bg-background text-sm"
                            />
                            <Button
                                type="button"
                                onClick={handleAddDukuh}
                                disabled={!selectedDesa}
                                className="h-9 shrink-0 bg-blue-600 px-3.5 text-xs font-medium text-white hover:bg-blue-700"
                            >
                                <Plus className="mr-1 size-3.5" />
                                Tambah dukuh
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {selectedDesa &&
                            (selectedDesa.subvillages || []).length > 0 ? (
                                selectedDesa.subvillages.map((dukuh) => (
                                    <div
                                        key={dukuh.id}
                                        className="flex items-center justify-between rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-muted/20"
                                    >
                                        <span className="truncate">
                                            {dukuh.name}
                                        </span>
                                        <div className="flex shrink-0 items-center gap-1">
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                                onClick={() =>
                                                    handleOpenEditDukuh(dukuh)
                                                }
                                                title="Edit dukuh"
                                            >
                                                <SquarePen className="size-4" />
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
                                                onClick={() =>
                                                    setDeletingDukuh(dukuh)
                                                }
                                                title="Hapus dukuh"
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="rounded-lg border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                                    {selectedDesa
                                        ? `Belum ada data dukuh untuk Desa ${selectedDesa.name}.`
                                        : 'Pilih desa terlebih dahulu.'}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Dialog Edit Desa ─────────────────────────────────────────── */}
            <Dialog
                open={Boolean(editingDesa)}
                onOpenChange={(open) => !open && setEditingDesa(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Nama Desa</DialogTitle>
                    </DialogHeader>
                    <div className="py-3">
                        <label className="mb-1 block text-sm font-medium">
                            Nama Desa
                        </label>
                        <Input
                            value={editDesaName}
                            onChange={(e) => setEditDesaName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSaveEditDesa()
                            }
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingDesa(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSaveEditDesa}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog Hapus Desa ────────────────────────────────────────── */}
            <Dialog
                open={Boolean(deletingDesa)}
                onOpenChange={(open) => !open && setDeletingDesa(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Desa</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus Desa{' '}
                            <strong>{deletingDesa?.name}</strong>? Semua data
                            dukuh di dalamnya juga akan terhapus.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletingDesa(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDeleteDesa}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog Edit Dukuh ────────────────────────────────────────── */}
            <Dialog
                open={Boolean(editingDukuh)}
                onOpenChange={(open) => !open && setEditingDukuh(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Nama Dukuh</DialogTitle>
                    </DialogHeader>
                    <div className="py-3">
                        <label className="mb-1 block text-sm font-medium">
                            Nama Dukuh
                        </label>
                        <Input
                            value={editDukuhName}
                            onChange={(e) => setEditDukuhName(e.target.value)}
                            onKeyDown={(e) =>
                                e.key === 'Enter' && handleSaveEditDukuh()
                            }
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setEditingDukuh(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            onClick={handleSaveEditDukuh}
                            className="bg-blue-600 text-white hover:bg-blue-700"
                        >
                            Simpan Perubahan
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog Hapus Dukuh ───────────────────────────────────────── */}
            <Dialog
                open={Boolean(deletingDukuh)}
                onOpenChange={(open) => !open && setDeletingDukuh(null)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hapus Dukuh</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin menghapus dukuh{' '}
                            <strong>{deletingDukuh?.name}</strong> dari Desa{' '}
                            {selectedDesa?.name}?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setDeletingDukuh(null)}
                        >
                            Batal
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDeleteDukuh}
                        >
                            Hapus
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Dialog Reset Default ─────────────────────────────────────── */}
            <Dialog
                open={isResetDialogOpen}
                onOpenChange={setIsResetDialogOpen}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Kembalikan ke Default</DialogTitle>
                        <DialogDescription>
                            Apakah Anda yakin ingin mengembalikan seluruh daftar
                            desa dan dukuh ke pengaturan default? Data yang
                            telah Anda tambahkan atau ubah akan direset.
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

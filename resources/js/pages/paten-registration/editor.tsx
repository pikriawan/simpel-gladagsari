import { Head, setLayoutProps, resetLayoutProps } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { univerSnapshotToExcelJS } from '@/utils/univer-to-xlsx';
import { xlsxToUniverSnapshot } from '@/utils/xlsx-to-univer';
import { editor, store as storePatenRegistration, templateSnapshot as templateSnapshotRoute } from '@/routes/paten-registration';
import { Button } from '@/components/ui/button';

import { Univer, LocaleType, CommandType, ICommandService } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';

import { defaultTheme } from '@univerjs/themes';

import { UniverDocsPlugin } from '@univerjs/docs';
import { UniverDocsUIPlugin } from '@univerjs/docs-ui';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { UniverFormulaEnginePlugin } from '@univerjs/engine-formula';
import { UniverUIPlugin } from '@univerjs/ui';
import { UniverSheetsPlugin } from '@univerjs/sheets';
import { UniverSheetsUIPlugin } from '@univerjs/sheets-ui';
import { UniverSheetsNumfmtPlugin } from '@univerjs/sheets-numfmt';
import { UniverSheetsNumfmtUIPlugin } from '@univerjs/sheets-numfmt-ui';
import { UniverSheetsFormulaPlugin } from '@univerjs/sheets-formula';
import { UniverSheetsFormulaUIPlugin } from '@univerjs/sheets-formula-ui';

// Facade side-effect imports
import '@univerjs/core/facade';
import '@univerjs/docs/facade';
import '@univerjs/docs-ui/facade';
import '@univerjs/engine-formula/facade';
import '@univerjs/sheets/facade';
import '@univerjs/sheets-ui/facade';
import '@univerjs/sheets-formula/facade';
import '@univerjs/sheets-formula-ui/facade';
import '@univerjs/sheets-numfmt/facade';
import '@univerjs/ui/facade';

// Locales
import DesignEnUS from '@univerjs/design/locale/en-US';
import DocsUIEnUS from '@univerjs/docs-ui/locale/en-US';
import EngineFormulaEnUS from '@univerjs/engine-formula/locale/en-US';
import SheetsEnUS from '@univerjs/sheets/locale/en-US';
import SheetsUIEnUS from '@univerjs/sheets-ui/locale/en-US';
import SheetsFormulaEnUS from '@univerjs/sheets-formula/locale/en-US';
import SheetsFormulaUIEnUS from '@univerjs/sheets-formula-ui/locale/en-US';
import SheetsNumfmtUIEnUS from '@univerjs/sheets-numfmt-ui/locale/en-US';
import UIEnUS from '@univerjs/ui/locale/en-US';

// Styles
import '@univerjs/design/lib/index.css';
import '@univerjs/ui/lib/index.css';
import '@univerjs/docs-ui/lib/index.css';
import '@univerjs/sheets-ui/lib/index.css';
import '@univerjs/sheets-formula-ui/lib/index.css';
import '@univerjs/sheets-numfmt-ui/lib/index.css';

export default function Editor({ snapshot }: { snapshot?: any }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const univerAPIRef = useRef<any>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const xlsxFileInputRef = useRef<HTMLInputElement>(null);
    const [isImportingXlsx, setIsImportingXlsx] = useState(false);
    const [isResettingTemplate, setIsResettingTemplate] = useState(false);

    const autoSave = useCallback(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        saveTimeoutRef.current = setTimeout(() => {
            const univerAPI = univerAPIRef.current;
            if (!univerAPI) return;
            try {
                const fWorkbook = univerAPI.getActiveWorkbook();
                if (!fWorkbook) return;
                const snapshot = fWorkbook.save();
                if (snapshot.styles && Array.isArray(snapshot.styles)) {
                    snapshot.styles = {};
                }
                const token = document
                    .querySelector('meta[name="csrf-token"]')
                    ?.getAttribute('content');
                fetch(storePatenRegistration().url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': token ?? '',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({ snapshot }),
                }).catch((error) => {
                    console.error('Gagal menyimpan snapshot ke disk', error);
                });
            } catch (error) {
                console.error('Gagal menyimpan snapshot otomatis', error);
            }
        }, 1000);
    }, []);

    const handleExportXlsx = useCallback(async () => {
        const univerAPI = univerAPIRef.current;
        if (!univerAPI) return;
        try {
            const snapshot = univerAPI.getActiveWorkbook()?.save();
            if (!snapshot) return;

            const wb = await univerSnapshotToExcelJS(snapshot);
            const buffer = await wb.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'registrasi-paten.xlsx';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Gagal mengekspor ke XLSX', error);
        }
    }, []);

    const handleImportXlsxClick = useCallback(() => {
        xlsxFileInputRef.current?.click();
    }, []);

    const handleClearDocument = useCallback(() => {
        if (
            !window.confirm(
                'Kosongkan dokumen saat ini? Data yang belum tersimpan akan hilang.',
            )
        ) {
            return;
        }

        const clear = () => {
            const univerAPI = univerAPIRef.current;
            if (!univerAPI) return;
            const current = univerAPI.getActiveWorkbook();
            const currentId = current?.getId?.();
            if (currentId) univerAPI.disposeUnit(currentId);
            univerAPI.createWorkbook({
                id: 'paten-registration-workbook',
                name: 'Registrasi PATEN',
                sheetOrder: ['sheet-1'],
                sheets: {
                    'sheet-1': {
                        id: 'sheet-1',
                        name: 'Sheet1',
                        rowCount: 100,
                        columnCount: 20,
                    },
                },
            });
            autoSave();
        };

        // Defer agar React selesai memproses state update
        setTimeout(clear, 0);
    }, [autoSave]);

    const handleResetToTemplate = useCallback(async () => {
        if (
            !window.confirm(
                'Reset akan menimpa dokumen saat ini dengan template. Lanjutkan?',
            )
        ) {
            return;
        }

        setIsResettingTemplate(true);
        try {
            const response = await fetch(templateSnapshotRoute().url, {
                headers: { Accept: 'application/json' },
            });
            const data = await response.json();
            const templateSnapshot = data?.snapshot;
            if (!templateSnapshot) {
                window.alert('Template belum tersedia.');
                return;
            }

            // Defer agar React selesai memproses state update
            await new Promise<void>(resolve => setTimeout(resolve, 0));

            const univerAPI = univerAPIRef.current;
            if (!univerAPI) return;
            const current = univerAPI.getActiveWorkbook();
            const currentId = current?.getId?.();
            if (currentId) univerAPI.disposeUnit(currentId);
            univerAPI.createWorkbook(templateSnapshot);
            autoSave();
        } catch (error) {
            console.error('Gagal memuat template', error);
            window.alert('Gagal memuat template.');
        } finally {
            setIsResettingTemplate(false);
        }
    }, [autoSave]);

    const handleImportXlsxFile = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;

            // Peringatan ukuran file besar — lebih dari 15 MB berpotensi berat
            if (file.size > 15 * 1024 * 1024) {
                if (
                    !window.confirm(
                        `File berukuran ${(file.size / 1024 / 1024).toFixed(1)} MB.\n` +
                        'File besar dapat membutuhkan waktu dan memori yang banyak. Lanjutkan?',
                    )
                ) {
                    event.target.value = '';
                    return;
                }
            }

            if (
                !window.confirm(
                    'Import akan menimpa data workbook saat ini. Lanjutkan?',
                )
            ) {
                event.target.value = '';
                return;
            }

            setIsImportingXlsx(true);
            try {
                // Baca file sebagai ArrayBuffer — tidak perlu konversi ke base64
                const buffer = await file.arrayBuffer();

                // Konversi XLSX → snapshot Univer (heavy lifting di sini)
                const univerSnapshot = await xlsxToUniverSnapshot(buffer);

                // Defer ke macrotask berikutnya — pastikan React sudah selesai
                // memproses state update setIsImportingXlsx(true) sebelum kita
                // dispose + recreate workbook (mencegah "synchronously unmount" error)
                await new Promise<void>(resolve => setTimeout(resolve, 0));

                const univerAPI = univerAPIRef.current;
                if (!univerAPI) return;
                const current = univerAPI.getActiveWorkbook();
                const currentId = current?.getId?.();
                if (currentId) univerAPI.disposeUnit(currentId);
                univerAPI.createWorkbook(univerSnapshot);
                autoSave();
            } catch (error) {
                console.error('Gagal mengimpor file XLSX', error);
                window.alert('Gagal mengimpor file. Pastikan file adalah format XLSX yang valid.');
            } finally {
                setIsImportingXlsx(false);
                event.target.value = '';
            }
        },
        [autoSave],
    );

    useEffect(() => {
        setLayoutProps({
            actions: (
                <>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleClearDocument}
                    >
                        Kosongkan dokumen
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleResetToTemplate}
                        disabled={isResettingTemplate}
                    >
                        {isResettingTemplate ? 'Memuat...' : 'Reset ke template'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleImportXlsxClick}
                        disabled={isImportingXlsx}
                    >
                        {isImportingXlsx ? 'Mengimpor...' : 'Impor (.xlsx)'}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleExportXlsx}
                    >
                        Ekspor (.xlsx)
                    </Button>
                </>
            ),
        });

        return () => resetLayoutProps();
    }, [isImportingXlsx, isResettingTemplate, handleResetToTemplate, handleClearDocument]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Set untuk melacak portal containers yang dibuat oleh Univer
        const univerPortals = new Set<HTMLElement>();

        // Intercept appendChild agar portal Univer yang dibuat saat fullscreen langsung diarahkan ke container
        const originalAppendChild = document.body.appendChild.bind(document.body);
        document.body.appendChild = <T extends Node>(child: T): T => {
            if (child instanceof HTMLElement && child.id !== 'app' && child.tagName !== 'SCRIPT') {
                univerPortals.add(child);
                if (
                    document.fullscreenElement &&
                    containerRef.current &&
                    (document.fullscreenElement === containerRef.current || containerRef.current.contains(document.fullscreenElement))
                ) {
                    return containerRef.current.appendChild(child);
                }
            }
            return originalAppendChild(child);
        };

        // Perlindungan agar unmount third-party (seperti Univer portal) tidak melempar NotFoundError pada removeChild
        const originalRemoveChild = document.body.removeChild.bind(document.body);
        document.body.removeChild = <T extends Node>(child: T): T => {
            if (child instanceof HTMLElement) {
                univerPortals.delete(child);
            }
            if (child.parentNode === document.body) {
                return originalRemoveChild(child);
            }
            if (child.parentNode) {
                return child.parentNode.removeChild(child) as T;
            }
            return child;
        };

        // Ketika tabel fullscreen (via native Univer fullscreen), pindahkan portal popup Univer ke dalam container fullscreen
        // agar browser merender popup di layer fullscreen (bukan tersembunyi di luar elemen fullscreen).
        const onFullscreenChange = () => {
            const fsEl = document.fullscreenElement;
            const container = containerRef.current;
            if (fsEl && container && (fsEl === container || container.contains(fsEl))) {
                // Masuk fullscreen: pindahkan portal Univer dari body ke container
                univerPortals.forEach((portal) => {
                    if (portal.parentNode === document.body) {
                        container.appendChild(portal);
                    }
                });
                // Tangkap juga jika ada elemen portal lain yang sudah terlanjur di-append ke body
                Array.from(document.body.children).forEach((child) => {
                    if (child instanceof HTMLElement && child.id !== 'app' && child.tagName !== 'SCRIPT' && child !== container) {
                        univerPortals.add(child);
                        container.appendChild(child);
                    }
                });
            } else if (container) {
                // Keluar fullscreen: kembalikan portal ke document.body
                univerPortals.forEach((portal) => {
                    if (portal.parentNode === container) {
                        document.body.appendChild(portal);
                    }
                });
            }
        };
        document.addEventListener('fullscreenchange', onFullscreenChange);

        const univer = new Univer({
            locale: LocaleType.EN_US,
            locales: {
                [LocaleType.EN_US]: {
                    ...DesignEnUS,
                    ...DocsUIEnUS,
                    ...EngineFormulaEnUS,
                    ...SheetsEnUS,
                    ...SheetsUIEnUS,
                    ...SheetsFormulaEnUS,
                    ...SheetsFormulaUIEnUS,
                    ...SheetsNumfmtUIEnUS,
                    ...UIEnUS,
                },
            },
            theme: defaultTheme,
        });

        univer.registerPlugins([
            [UniverDocsPlugin],
            [UniverRenderEnginePlugin],
            [UniverUIPlugin, { container: containerRef.current }],
            [UniverDocsUIPlugin],
            [UniverFormulaEnginePlugin],
            [UniverSheetsPlugin],
            [UniverSheetsUIPlugin],
            [UniverSheetsNumfmtPlugin],
            [UniverSheetsNumfmtUIPlugin],
            [UniverSheetsFormulaPlugin],
            [UniverSheetsFormulaUIPlugin],
        ]);

        const univerAPI = FUniver.newAPI(univer);
        univerAPIRef.current = univerAPI;

        let loadedFromSnapshot = false;
        try {
            if (snapshot) {
                // Pastikan `styles` selalu objek, bukan array kosong `[]`
                // (round-trip JSON PHP bisa mengubah `{}` menjadi `[]`).
                if (snapshot.styles && Array.isArray(snapshot.styles)) {
                    snapshot.styles = {};
                }
                univerAPI.createWorkbook(snapshot);
                loadedFromSnapshot = true;
            }
        } catch (error) {
            console.error('Gagal memuat snapshot dari server', error);
        }

        if (!loadedFromSnapshot) {
            univerAPI.createWorkbook({
                id: 'paten-registration-workbook',
                name: 'Registrasi PATEN',
                sheetOrder: ['sheet-1'],
                sheets: {
                    'sheet-1': {
                        id: 'sheet-1',
                        name: 'Sheet1',
                        rowCount: 100,
                        columnCount: 20,
                    },
                },
            });
        }

        const disposable = univerAPI.addEvent(
            univerAPI.Event.CommandExecuted,
            () => {
                autoSave();
            },
        );

        return () => {
            document.removeEventListener('fullscreenchange', onFullscreenChange);
            const container = containerRef.current;
            if (container) {
                univerPortals.forEach((portal) => {
                    if (portal.parentNode === container) {
                        document.body.appendChild(portal);
                    }
                });
            }
            document.body.appendChild = originalAppendChild;
            document.body.removeChild = originalRemoveChild;
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            disposable?.dispose();
            univerAPIRef.current = null;
            try {
                univer.dispose();
            } catch (error) {
                console.error('Gagal dispose Univer', error);
            }
        };
    }, []);

    return (
        <>
            <Head title="Editor" />

            <input
                ref={xlsxFileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleImportXlsxFile}
            />

            {/* Univer mengelola fullscreen-nya sendiri via CSS internal,
                container cukup diberi tinggi penuh viewport agar tidak ada ruang kosong. */}
            <div
                ref={containerRef}
                style={{ height: 'calc(100vh - 5rem)', width: '100%' }}
            />
        </>
    );
}

Editor.layout = {
    breadcrumbs: [
        {
            title: 'Registrasi PATEN',
            href: editor(),
        },
        {
            title: 'Editor',
            href: editor(),
        },
    ],
};

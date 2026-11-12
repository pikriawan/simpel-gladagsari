import { Head, setLayoutProps, resetLayoutProps } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState, type ChangeEvent } from 'react';
import { univerSnapshotToExcelJS } from '@/utils/univer-to-xlsx';
import { xlsxToUniverSnapshot } from '@/utils/xlsx-to-univer';
import { editor, store as storePatenRegistration, template } from '@/routes/paten-registration';
import { Button } from '@/components/ui/button';

import { Univer } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { LocaleType } from '@univerjs/core';

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

export default function Template({ snapshot }: { snapshot?: any }) {
    const containerRef        = useRef<HTMLDivElement>(null);
    const univerAPIRef        = useRef<any>(null);
    const saveTimeoutRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
    const xlsxFileInputRef    = useRef<HTMLInputElement>(null);
    const [isImportingXlsx, setIsImportingXlsx] = useState(false);

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
                    body: JSON.stringify({ snapshot, target: 'template' }),
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
            link.download = 'template-paten.xlsx';
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
                id: 'paten-registration-template-workbook',
                name: 'Template PATEN',
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

        setTimeout(clear, 0);
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
                const current   = univerAPI.getActiveWorkbook();
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
    }, [isImportingXlsx, handleClearDocument]);

    useEffect(() => {
        if (!containerRef.current) return;

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
                univerAPI.createWorkbook(snapshot);
                loadedFromSnapshot = true;
            }
        } catch (error) {
            console.error('Gagal memuat snapshot dari server', error);
        }

        if (!loadedFromSnapshot) {
            univerAPI.createWorkbook({
                id: 'paten-registration-template-workbook',
                name: 'Template PATEN',
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
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            disposable?.dispose();
            univerAPIRef.current = null;
            window.setTimeout(() => univer.dispose(), 0);
        };
    }, []);

    return (
        <>
            <Head title="Template" />

            <input
                ref={xlsxFileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleImportXlsxFile}
            />

            <div
                ref={containerRef}
                style={{ height: 'calc(100vh - 5rem)', width: '100%' }}
            />
        </>
    );
}

Template.layout = {
    breadcrumbs: [
        {
            title: 'Registrasi PATEN',
            href: editor(),
        },
        {
            title: 'Template',
            href: template(),
        },
    ],
};

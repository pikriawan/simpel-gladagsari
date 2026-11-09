import { Head, router, setLayoutProps, resetLayoutProps } from '@inertiajs/react';
import { useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { patenRegistration } from '@/routes';
import { store as storePatenRegistration } from '@/routes/paten-registration';
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

export default function PatenRegistration({ snapshot }: { snapshot?: any }) {
    const containerRef = useRef<HTMLDivElement>(null);
    const univerAPIRef = useRef<any>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

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
                    body: JSON.stringify({ snapshot }),
                }).catch((error) => {
                    console.error('Gagal menyimpan snapshot ke disk', error);
                });
            } catch (error) {
                console.error('Gagal menyimpan snapshot otomatis', error);
            }
        }, 1000);
    }, []);

    const handleExportJson = useCallback(() => {
        const univerAPI = univerAPIRef.current;
        if (!univerAPI) return;
        try {
            const snapshot = univerAPI.getActiveWorkbook()?.save();
            if (!snapshot) return;
            const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'registrasi-paten.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Gagal mengekspor snapshot JSON', error);
        }
    }, []);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleImportFile = useCallback(
        (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const parsed = JSON.parse(String(reader.result));
                    if (!parsed || typeof parsed !== 'object' || !parsed.sheets) {
                        throw new Error('Format snapshot tidak valid');
                    }
                    const univerAPI = univerAPIRef.current;
                    if (!univerAPI) return;
                    const current = univerAPI.getActiveWorkbook();
                    const currentId = current?.getId?.();
                    if (currentId) {
                        univerAPI.disposeUnit(currentId);
                    }
                    univerAPI.createWorkbook(parsed);
                    autoSave();
                } catch (error) {
                    console.error('Gagal mengimpor snapshot JSON', error);
                } finally {
                    if (event.target) {
                        event.target.value = '';
                    }
                }
            };
            reader.readAsText(file);
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
                        onClick={handleImportClick}
                    >
                        Impor (.json)
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleExportJson}
                    >
                        Ekspor (.json)
                    </Button>
                </>
            ),
        });

        return () => resetLayoutProps();
    }, []);

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
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
            disposable?.dispose();
            univerAPIRef.current = null;
            univer.dispose();
        };
    }, []);

    return (
        <>
            <Head title="Registrasi PATEN" />

            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleImportFile}
            />

            <div
                ref={containerRef}
                style={{ height: 'calc(100vh - 5rem)', width: '100%' }}
            />
        </>
    );
}

PatenRegistration.layout = {
    breadcrumbs: [
        {
            title: 'Registrasi PATEN',
            href: patenRegistration(),
        },
    ],
};

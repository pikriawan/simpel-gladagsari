import { Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import { patenRegistration } from '@/routes';

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

export default function PatenRegistration() {
    const containerRef = useRef<HTMLDivElement>(null);

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

        return () => {
            univer.dispose();
        };
    }, []);

    return (
        <>
            <Head title="Registrasi PATEN" />

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

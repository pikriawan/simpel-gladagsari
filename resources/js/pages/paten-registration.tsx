import { Head, setLayoutProps, resetLayoutProps } from '@inertiajs/react';
import { useCallback, useEffect, useRef, type ChangeEvent } from 'react';
import { patenRegistration } from '@/routes';
import { store as storePatenRegistration } from '@/routes/paten-registration';
import { Button } from '@/components/ui/button';
import * as ExcelJS from 'exceljs';

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

    const borderStyleToExcel = (style: number) => {
        const map: Record<number, string> = {
            1: 'thin',
            2: 'hair',
            3: 'dotted',
            4: 'dashed',
            5: 'dashDot',
            6: 'dashDotDot',
            7: 'double',
            8: 'medium',
            9: 'mediumDashed',
            10: 'mediumDashDot',
            11: 'mediumDashDotDot',
            12: 'slantDashDot',
            13: 'thick',
        };
        return map[style] || 'thin';
    };

    const excelBorderToUniver = (style: string) => {
        const map: Record<string, number> = {
            thin: 1,
            hair: 2,
            dotted: 3,
            dashed: 4,
            dashDot: 5,
            dashDotDot: 6,
            double: 7,
            medium: 8,
            mediumDashed: 9,
            mediumDashDot: 10,
            mediumDashDotDot: 11,
            slantDashDot: 12,
            thick: 13,
        };
        return map[style] || 1;
    };

    const univerColorToArgb = (color: any) => {
        if (!color?.rgb) return undefined;
        const rgb = String(color.rgb).replace('#', '');
        return rgb.length === 6 ? `FF${rgb}` : rgb;
    };

    const univerStyleToExcel = (style: any) => {
        if (!style) return {};
        const result: any = {};
        if (style.ff || style.fs || style.bl || style.it || style.cl) {
            result.font = {
                name: style.ff || undefined,
                size: style.fs || undefined,
                bold: Boolean(style.bl),
                italic: Boolean(style.it),
                color: style.cl ? { argb: univerColorToArgb(style.cl) } : undefined,
            };
        }
        if (style.bg?.rgb) {
            result.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: univerColorToArgb(style.bg) },
            };
        }
        if (style.ht || style.vt || style.tb) {
            result.alignment = {
                horizontal:
                    style.ht === 1
                        ? 'left'
                        : style.ht === 2
                          ? 'center'
                          : style.ht === 3
                            ? 'right'
                            : undefined,
                vertical:
                    style.vt === 1
                        ? 'top'
                        : style.vt === 2
                          ? 'middle'
                          : style.vt === 3
                            ? 'bottom'
                            : undefined,
                wrapText: Boolean(style.tb),
            };
        }
        if (style.n?.pattern) {
            result.numFmt = style.n.pattern;
        }
        if (style.bd) {
            const bd = style.bd;
            const borders: any = {};
            const mapSide = (side: any) => {
                if (!side) return undefined;
                return {
                    style: borderStyleToExcel(side.s),
                    color: side.cl ? { argb: univerColorToArgb(side.cl) } : undefined,
                };
            };
            if (bd.t) borders.top = mapSide(bd.t);
            if (bd.r) borders.right = mapSide(bd.r);
            if (bd.b) borders.bottom = mapSide(bd.b);
            if (bd.l) borders.left = mapSide(bd.l);
            if (Object.keys(borders).length) {
                result.border = borders;
            }
        }
        return result;
    };

    const resolveUniverStyle = (styleRef: any, styles: any) => {
        if (!styleRef) return null;
        if (typeof styleRef === 'string') {
            return styles?.[styleRef] || null;
        }
        return styleRef;
    };

    const handleExportXlsx = useCallback(async () => {
        const univerAPI = univerAPIRef.current;
        if (!univerAPI) return;
        try {
            const snapshot = univerAPI.getActiveWorkbook()?.save();
            if (!snapshot?.sheets) return;

            const workbook = new ExcelJS.Workbook();
            const styles = snapshot.styles || {};

            Object.values(snapshot.sheets).forEach((sheet: any) => {
                const ws = workbook.addWorksheet(sheet.name || 'Sheet');

                const rowCount = sheet.rowCount || 100;
                const columnCount = sheet.columnCount || 20;

                const cellData = sheet.cellData || {};
                Object.keys(cellData).forEach((rowKey) => {
                    const rowIndex = Number(rowKey);
                    const rowData = cellData[rowKey];
                    Object.keys(rowData || {}).forEach((colKey) => {
                        const colIndex = Number(colKey);
                        const cell = rowData[colKey];
                        if (!cell) return;
                        const excelCell = ws.getCell(rowIndex + 1, colIndex + 1);
                        if (cell.f) {
                            excelCell.value = {
                                formula: String(cell.f).replace(/^=/, ''),
                            };
                        } else {
                            excelCell.value = cell.v ?? null;
                        }
                        const style = resolveUniverStyle(cell.s, styles);
                        const excelStyle = univerStyleToExcel(style);
                        Object.assign(excelCell, excelStyle);
                    });
                });

                if (sheet.columnData) {
                    Object.keys(sheet.columnData).forEach((colKey) => {
                        const colIndex = Number(colKey);
                        const col = sheet.columnData[colKey];
                        if (col?.w) {
                            ws.getColumn(colIndex + 1).width = col.w / 8;
                        }
                    });
                }

                if (sheet.rowData) {
                    Object.keys(sheet.rowData).forEach((rowKey) => {
                        const rowIndex = Number(rowKey);
                        const row = sheet.rowData[rowKey];
                        if (row?.h) {
                            ws.getRow(rowIndex + 1).height = row.h;
                        }
                    });
                }

                if (Array.isArray(sheet.mergeData)) {
                    sheet.mergeData.forEach((merge: any) => {
                        try {
                            ws.mergeCells(
                                merge.startRow + 1,
                                merge.startColumn + 1,
                                merge.endRow,
                                merge.endColumn,
                            );
                            const master = ws.getCell(
                                merge.startRow + 1,
                                merge.startColumn + 1,
                            );
                            master.alignment = {
                                ...master.alignment,
                                horizontal: 'center',
                                vertical: 'middle',
                            };
                        } catch {
                            // ignore invalid merge
                        }
                    });
                }
            });

            const buffer = await workbook.xlsx.writeBuffer();
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
            console.error('Gagal mengekspor snapshot XLSX', error);
        }
    }, []);

    const handleImportClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const excelColorToUniver = (color: any) => {
        if (!color) return null;
        if (color.argb) {
            return { rgb: `#${color.argb.slice(2)}` };
        }
        if (color.rgb) {
            return { rgb: `#${color.rgb}` };
        }
        return null;
    };

    const excelStyleToUniver = (style: any) => {
        if (!style) return null;
        const result: any = {};
        if (style.font) {
            if (style.font.name) result.ff = style.font.name;
            if (style.font.size) result.fs = style.font.size;
            if (style.font.bold) result.bl = 1;
            if (style.font.italic) result.it = 1;
            const color = excelColorToUniver(style.font.color);
            if (color) result.cl = color;
        }
        if (style.fill?.fgColor) {
            const color = excelColorToUniver(style.fill.fgColor);
            if (color) result.bg = color;
        }
        if (style.alignment) {
            if (style.alignment.horizontal === 'left') result.ht = 1;
            if (style.alignment.horizontal === 'center') result.ht = 2;
            if (style.alignment.horizontal === 'right') result.ht = 3;
            if (style.alignment.vertical === 'top') result.vt = 1;
            if (style.alignment.vertical === 'middle') result.vt = 2;
            if (style.alignment.vertical === 'bottom') result.vt = 3;
            if (style.alignment.wrapText) result.tb = 1;
        }
        if (style.numFmt) {
            result.n = { pattern: style.numFmt };
        }
        if (style.border) {
            const bd: any = {};
            const mapSide = (side: any) => {
                if (!side) return undefined;
                const color = excelColorToUniver(side.color);
                return {
                    s: excelBorderToUniver(side.style),
                    cl: color || { rgb: '#000000' },
                };
            };
            if (style.border.top) bd.t = mapSide(style.border.top);
            if (style.border.right) bd.r = mapSide(style.border.right);
            if (style.border.bottom) bd.b = mapSide(style.border.bottom);
            if (style.border.left) bd.l = mapSide(style.border.left);
            if (Object.keys(bd).length) {
                result.bd = bd;
            }
        }
        return Object.keys(result).length ? result : null;
    };

    const handleImportXlsx = useCallback(
        async (event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (!file) return;
            try {
                const buffer = await file.arrayBuffer();
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(buffer);

                const snapshot: any = {
                    id: 'paten-registration-workbook',
                    name: 'Registrasi PATEN',
                    sheetOrder: [],
                    sheets: {},
                    styles: {},
                };

                let styleCounter = 0;
                const styleCache = new Map();

                workbook.eachSheet((ws, index) => {
                    const sheetId = `sheet-${index + 1}`;
                    const rowCount = ws.rowCount || 1;
                    const columnCount = ws.columnCount || 1;
                    const cellData: Record<string, Record<string, any>> = {};

                    ws.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                        row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                            const r = rowNumber - 1;
                            const c = colNumber - 1;
                            if (!cellData[r]) cellData[r] = {};
                            const univerCell: any = {};

                            if (cell.value && typeof cell.value === 'object' && 'formula' in cell.value) {
                                univerCell.f = `=${(cell.value as any).formula}`;
                                if ((cell.value as any).result !== undefined) {
                                    univerCell.v = (cell.value as any).result;
                                }
                            } else {
                                univerCell.v = cell.value ?? null;
                            }

                            if (typeof cell.value === 'number') {
                                univerCell.t = 2;
                            } else if (typeof cell.value === 'boolean') {
                                univerCell.t = 3;
                            } else {
                                univerCell.t = 1;
                            }

                            const style = excelStyleToUniver(cell.style);
                            if (style) {
                                const key = JSON.stringify(style);
                                if (!styleCache.has(key)) {
                                    const styleId = `style-${styleCounter++}`;
                                    styleCache.set(key, styleId);
                                    snapshot.styles[styleId] = style;
                                }
                                univerCell.s = styleCache.get(key);
                            }

                            cellData[r][c] = univerCell;
                        });
                    });

                    const columnData: Record<string, { w: number }> = {};
                    for (let c = 1; c <= columnCount; c++) {
                        const col = ws.getColumn(c);
                        if (col.width) {
                            columnData[c - 1] = { w: Math.round(col.width * 8) };
                        }
                    }

                    const rowData: Record<string, { h: number }> = {};
                    for (let r = 1; r <= rowCount; r++) {
                        const row = ws.getRow(r);
                        if (row.height) {
                            rowData[r - 1] = { h: row.height };
                        }
                    }

                    const mergeData = Object.values((ws as any)._merges || {}).map(
                        (merge: any) => ({
                            startRow: merge.top - 1,
                            startColumn: merge.left - 1,
                            endRow: merge.bottom, // exclusive
                            endColumn: merge.right, // exclusive
                        }),
                    );

                    snapshot.sheetOrder.push(sheetId);
                    snapshot.sheets[sheetId] = {
                        id: sheetId,
                        name: ws.name,
                        rowCount,
                        columnCount,
                        cellData,
                        columnData,
                        rowData,
                        mergeData,
                    };
                });

                const univerAPI = univerAPIRef.current;
                if (!univerAPI) return;
                const current = univerAPI.getActiveWorkbook();
                const currentId = current?.getId?.();
                if (currentId) {
                    univerAPI.disposeUnit(currentId);
                }
                univerAPI.createWorkbook(snapshot);
                autoSave();
            } catch (error) {
                console.error('Gagal mengimpor file XLSX', error);
            } finally {
                if (event.target) {
                    event.target.value = '';
                }
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
                        onClick={handleImportClick}
                    >
                        Impor (.xlsx)
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
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleImportXlsx}
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

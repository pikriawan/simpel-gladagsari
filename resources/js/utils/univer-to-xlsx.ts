/**
 * Konverter snapshot Univer → ExcelJS workbook
 *
 * Mendukung:
 * - Nilai sel (string, number, boolean, formula)
 * - Merge cells
 * - Lebar kolom & tinggi baris
 * - Fill / background color
 * - Font (family, size, bold, italic, underline, strikethrough, color)
 * - Alignment (horizontal, vertical, wrap text, text rotation)
 * - Border (top, right, bottom, left)
 * - Number format
 */

import ExcelJS from 'exceljs';

// ─── Enum values dari Univer (dari @univerjs/core) ───────────────────────────

const HorizontalAlign = { UNSPECIFIED: 0, LEFT: 1, CENTER: 2, RIGHT: 3, JUSTIFIED: 4, DISTRIBUTED: 6 } as const;
const VerticalAlign   = { UNSPECIFIED: 0, TOP: 1, MIDDLE: 2, BOTTOM: 3 } as const;
const WrapStrategy    = { UNSPECIFIED: 0, OVERFLOW: 1, CLIP: 2, WRAP: 3 } as const;
const BooleanNumber   = { FALSE: 0, TRUE: 1 } as const;

// BorderStyleTypes → ExcelJS border style string
const BORDER_STYLE_MAP: Record<number, ExcelJS.BorderStyle> = {
    0:  'none',
    1:  'thin',
    2:  'hair',
    3:  'dotted',
    4:  'dashed',
    5:  'dashDot',
    6:  'dashDotDot',
    7:  'double',
    8:  'medium',
    9:  'mediumDashed',
    10: 'mediumDashDot',
    11: 'mediumDashDotDot',
    12: 'slantDashDot',
    13: 'thick',
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Univer simpan warna sebagai "#RRGGBB" atau "rgb(r,g,b)". ExcelJS pakai "AARRGGBB". */
function toArgb(rgb: string | undefined | null): string | undefined {
    if (!rgb) return undefined;
    // "#RRGGBB"
    const hex = rgb.match(/^#?([0-9A-Fa-f]{6})$/);
    if (hex) return `FF${hex[1].toUpperCase()}`;
    // "rgb(r, g, b)"
    const match = rgb.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `FF${r}${g}${b}`.toUpperCase();
    }
    return undefined;
}

/** Konversi pixel (Univer) ke karakter lebar Excel (~7px per karakter default). */
function pxToCharWidth(px: number | undefined, defaultWidth = 100): number {
    return Math.round(((px ?? defaultWidth) / 7) * 10) / 10;
}

/** Konversi pixel (Univer) ke point tinggi Excel (1pt ≈ 1.333px). */
function pxToPt(px: number | undefined, defaultHeight = 19): number {
    return Math.round(((px ?? defaultHeight) / 1.333) * 10) / 10;
}

/** Resolve style: bisa berupa string (style id) atau objek langsung. */
function resolveStyle(
    rawStyle: any,
    stylesMap: Record<string, any>,
): Record<string, any> | null {
    if (!rawStyle) return null;
    if (typeof rawStyle === 'string') return stylesMap[rawStyle] ?? null;
    return rawStyle;
}

/** Bangun objek ExcelJS.Border dari IBorderStyleData Univer. */
function buildBorderSide(side: any): Partial<ExcelJS.Border> | undefined {
    if (!side || side.s == null) return undefined;
    const style = BORDER_STYLE_MAP[side.s as number];
    if (!style || style === 'none') return undefined;
    const argb = toArgb(side.cl?.rgb);
    return {
        style,
        color: argb ? { argb } : { argb: 'FF000000' },
    };
}

/** Mapping HorizontalAlign Univer → ExcelJS alignment string. */
function mapHAlign(ht: number | undefined): ExcelJS.Alignment['horizontal'] | undefined {
    switch (ht) {
        case HorizontalAlign.LEFT:        return 'left';
        case HorizontalAlign.CENTER:      return 'center';
        case HorizontalAlign.RIGHT:       return 'right';
        case HorizontalAlign.JUSTIFIED:   return 'justify';
        case HorizontalAlign.DISTRIBUTED: return 'distributed';
        default:                          return undefined;
    }
}

/** Mapping VerticalAlign Univer → ExcelJS alignment string. */
function mapVAlign(vt: number | undefined): ExcelJS.Alignment['vertical'] | undefined {
    switch (vt) {
        case VerticalAlign.TOP:    return 'top';
        case VerticalAlign.MIDDLE: return 'middle';
        case VerticalAlign.BOTTOM: return 'bottom';
        default:                   return undefined;
    }
}

// ─── Main converter ───────────────────────────────────────────────────────────

export async function univerSnapshotToExcelJS(snapshot: any): Promise<ExcelJS.Workbook> {
    const wb = new ExcelJS.Workbook();
    wb.creator  = 'Simpel Gladagsari';
    wb.lastModifiedBy = 'Simpel Gladagsari';
    wb.created  = new Date();
    wb.modified = new Date();

    const stylesMap: Record<string, any> = snapshot.styles ?? {};
    const sheetOrder: string[] = snapshot.sheetOrder ?? Object.keys(snapshot.sheets ?? {});

    for (const sheetId of sheetOrder) {
        const sheetData = snapshot.sheets?.[sheetId];
        if (!sheetData) continue;

        const ws = wb.addWorksheet(sheetData.name ?? sheetId);

        // ── 0. Freeze panes ───────────────────────────────────────────────────
        if (sheetData.freeze && (sheetData.freeze.ySplit > 0 || sheetData.freeze.xSplit > 0)) {
            ws.views = [
                {
                    state: 'frozen',
                    xSplit: sheetData.freeze.xSplit > 0 ? sheetData.freeze.xSplit : 0,
                    ySplit: sheetData.freeze.ySplit > 0 ? sheetData.freeze.ySplit : 0,
                },
            ];
        }

        const cellData: Record<number, Record<number, any>> = sheetData.cellData ?? {};
        const columnData: Record<number, any> = sheetData.columnData ?? {};
        const rowData: Record<number, any>    = sheetData.rowData ?? {};
        const mergeData: any[]                = sheetData.mergeData ?? [];
        const defaultColWidth: number         = sheetData.defaultColumnWidth ?? 88;
        const defaultRowHeight: number        = sheetData.defaultRowHeight ?? 19;

        const rowCount: number    = sheetData.rowCount ?? 100;
        const columnCount: number = sheetData.columnCount ?? 20;

        // ── 1. Lebar kolom ───────────────────────────────────────────────────
        for (let c = 0; c < columnCount; c++) {
            const col = ws.getColumn(c + 1);
            const colInfo = columnData[c];
            col.width = pxToCharWidth(colInfo?.w, defaultColWidth);
            if (colInfo?.hd === BooleanNumber.TRUE) col.hidden = true;
        }

        // ── 2. Tinggi baris & data sel ───────────────────────────────────────
        for (let r = 0; r < rowCount; r++) {
            const excelRow = ws.getRow(r + 1);
            const rInfo = rowData[r];

            if (rInfo) {
                const heightPx = rInfo.ia === BooleanNumber.TRUE ? (rInfo.ah ?? rInfo.h) : rInfo.h;
                if (heightPx != null) excelRow.height = pxToPt(heightPx, defaultRowHeight);
                if (rInfo.hd === BooleanNumber.TRUE) excelRow.hidden = true;
            }

            const rowCells = cellData[r];
            if (!rowCells) continue;

            for (let c = 0; c < columnCount; c++) {
                const cellInfo = rowCells[c];
                if (!cellInfo) continue;

                const excelCell = excelRow.getCell(c + 1);

                // ── Nilai sel ────────────────────────────────────────────────
                if (cellInfo.f) {
                    // Formula
                    excelCell.value = { formula: cellInfo.f };
                } else if (cellInfo.p) {
                    // Rich text / document — ekstrak teks biasa
                    const plainText = extractPlainText(cellInfo.p);
                    excelCell.value = plainText;
                } else if (cellInfo.v !== undefined && cellInfo.v !== null) {
                    excelCell.value = cellInfo.v;
                }

                // ── Style ─────────────────────────────────────────────────
                const style = resolveStyle(cellInfo.s, stylesMap);
                if (!style) continue;

                // Fill / background
                const bgArgb = toArgb(style.bg?.rgb);
                if (bgArgb) {
                    excelCell.fill = {
                        type:    'pattern',
                        pattern: 'solid',
                        fgColor: { argb: bgArgb },
                    };
                }

                // Font
                const fontColor = toArgb(style.cl?.rgb);
                const font: Partial<ExcelJS.Font> = {};
                if (style.ff)                           font.name      = style.ff;
                if (style.fs != null)                   font.size      = style.fs;
                if (style.bl === BooleanNumber.TRUE)     font.bold      = true;
                if (style.it === BooleanNumber.TRUE)     font.italic    = true;
                if (style.ul?.s === BooleanNumber.TRUE)  font.underline = true;
                if (style.st?.s === BooleanNumber.TRUE)  font.strike    = true;
                if (fontColor)                           font.color     = { argb: fontColor };
                if (Object.keys(font).length > 0) excelCell.font = font as ExcelJS.Font;

                // Alignment
                const alignment: Partial<ExcelJS.Alignment> = {};
                const hAlign = mapHAlign(style.ht);
                const vAlign = mapVAlign(style.vt);
                if (hAlign) alignment.horizontal = hAlign;
                if (vAlign) alignment.vertical   = vAlign;
                if (style.tb === WrapStrategy.WRAP) alignment.wrapText = true;
                if (style.tr?.a != null && style.tr.a !== 0) {
                    alignment.textRotation = style.tr.a;
                }
                if (Object.keys(alignment).length > 0) excelCell.alignment = alignment as ExcelJS.Alignment;

                // Border
                const bd = style.bd;
                if (bd) {
                    const border: Partial<ExcelJS.Borders> = {};
                    const t = buildBorderSide(bd.t);
                    const r = buildBorderSide(bd.r);
                    const b = buildBorderSide(bd.b);
                    const l = buildBorderSide(bd.l);
                    if (t) border.top    = t;
                    if (r) border.right  = r;
                    if (b) border.bottom = b;
                    if (l) border.left   = l;
                    if (Object.keys(border).length > 0) excelCell.border = border as ExcelJS.Borders;
                }

                // Number format
                if (style.n?.pattern) {
                    excelCell.numFmt = style.n.pattern;
                }
            }
        }

        // ── 3. Merge cells ───────────────────────────────────────────────────
        // mergeData: IRange[] → { startRow, startColumn, endRow, endColumn }
        for (const merge of mergeData) {
            try {
                ws.mergeCells(
                    merge.startRow + 1,
                    merge.startColumn + 1,
                    merge.endRow + 1,
                    merge.endColumn + 1,
                );
            } catch {
                // abaikan merge yang tumpang tindih
            }
        }
    }

    return wb;
}

/** Ekstrak teks biasa dari IDocumentData Univer (rich text / p field). */
function extractPlainText(doc: any): string {
    try {
        const body = doc?.body;
        if (!body) return '';
        // dataStream berisi teks dengan karakter kontrol di akhir (\r\n)
        const stream: string = body.dataStream ?? '';
        // Hapus karakter kontrol Univer (\r, \n, \x1A, dll.)
        return stream.replace(/[\r\n\x1A]/g, '').trim();
    } catch {
        return '';
    }
}


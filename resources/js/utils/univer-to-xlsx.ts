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
const BORDER_STYLE_MAP: Partial<Record<number, ExcelJS.BorderStyle>> = {
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

/** Univer simpan warna sebagai "#RRGGBB", "rgb(r,g,b)", objek { rgb: ... }, dll. ExcelJS pakai "AARRGGBB". */
function toArgb(raw: any): string | undefined {
    if (!raw) return undefined;
    let val = raw;
    while (val && typeof val === 'object') {
        val = val.rgb ?? val.argb ?? val.color;
    }
    if (!val || typeof val !== 'string') return undefined;

    // "#RRGGBB" atau "RRGGBB"
    const hex = val.match(/^#?([0-9A-Fa-f]{6})$/);
    if (hex) return `FF${hex[1].toUpperCase()}`;

    // "#AARRGGBB" atau "AARRGGBB"
    const hexAlpha = val.match(/^#?([0-9A-Fa-f]{8})$/);
    if (hexAlpha) return hexAlpha[1].toUpperCase();

    // "rgb(r, g, b)"
    const match = val.match(/rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (match) {
        const r = parseInt(match[1]).toString(16).padStart(2, '0');
        const g = parseInt(match[2]).toString(16).padStart(2, '0');
        const b = parseInt(match[3]).toString(16).padStart(2, '0');
        return `FF${r}${g}${b}`.toUpperCase();
    }

    // "rgba(r, g, b, a)"
    const matchA = val.match(/rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*([\d.]+)\s*\)/i);
    if (matchA) {
        const a = Math.round(parseFloat(matchA[4]) * 255).toString(16).padStart(2, '0');
        const r = parseInt(matchA[1]).toString(16).padStart(2, '0');
        const g = parseInt(matchA[2]).toString(16).padStart(2, '0');
        const b = parseInt(matchA[3]).toString(16).padStart(2, '0');
        return `${a}${r}${g}${b}`.toUpperCase();
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
    if (!style) return undefined;
    const argb = toArgb(side.cl);
    return {
        style,
        color: argb ? { argb } : { argb: 'FF000000' },
    };
}

/** Mengambil IBorderStyleData dari sel Univer pada koordinat (r, c). */
function getCellBorderStyle(
    cellData: Record<number, any>,
    stylesMap: Record<string, any>,
    r: number,
    c: number,
): any {
    const row = cellData[r];
    if (!row) return null;
    const cell = row[c];
    if (!cell) return null;
    const style = resolveStyle(cell.s, stylesMap);
    return style?.bd ?? null;
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

        // ── 3. Merge cells & border keliling ────────────────────────────────
        // mergeData: IRange[] → { startRow, startColumn, endRow, endColumn }
        for (const merge of mergeData) {
            const startRow = Math.min(merge.startRow, merge.endRow);
            const endRow   = Math.max(merge.startRow, merge.endRow);
            const startCol = Math.min(merge.startColumn, merge.endColumn);
            const endCol   = Math.max(merge.startColumn, merge.endColumn);

            // 1. Top border:
            // a. Cek sepanjang baris teratas merge range (startRow, startCol..endCol)
            let topBorder: Partial<ExcelJS.Border> | undefined;
            for (let c = startCol; c <= endCol; c++) {
                const bd = getCellBorderStyle(cellData, stylesMap, startRow, c);
                topBorder = buildBorderSide(bd?.t);
                if (topBorder) break;
            }
            // b. Fallback: cek sel tepat di atas merge range (startRow - 1, startCol..endCol) yang punya border bottom
            if (!topBorder && startRow > 0) {
                for (let c = startCol; c <= endCol; c++) {
                    const bd = getCellBorderStyle(cellData, stylesMap, startRow - 1, c);
                    topBorder = buildBorderSide(bd?.b);
                    if (topBorder) break;
                }
            }
            // c. Fallback: cek border yang sudah terpasang di excelCell
            if (!topBorder) {
                for (let c = startCol; c <= endCol; c++) {
                    topBorder = ws.getCell(startRow + 1, c + 1).border?.top;
                    if (topBorder) break;
                }
            }
            if (!topBorder && startRow > 0) {
                for (let c = startCol; c <= endCol; c++) {
                    topBorder = ws.getCell(startRow, c + 1).border?.bottom;
                    if (topBorder) break;
                }
            }
            // d. Fallback: scan seluruh sel di merge range
            if (!topBorder) {
                for (let r = startRow; r <= endRow && !topBorder; r++) {
                    for (let c = startCol; c <= endCol; c++) {
                        const bd = getCellBorderStyle(cellData, stylesMap, r, c);
                        topBorder = buildBorderSide(bd?.t);
                        if (topBorder) break;
                    }
                }
            }

            // 2. Bottom border:
            // a. Cek sepanjang baris terbawah merge range (endRow, startCol..endCol)
            let bottomBorder: Partial<ExcelJS.Border> | undefined;
            for (let c = startCol; c <= endCol; c++) {
                const bd = getCellBorderStyle(cellData, stylesMap, endRow, c);
                bottomBorder = buildBorderSide(bd?.b);
                if (bottomBorder) break;
            }
            // b. Fallback: cek sel tepat di bawah merge range (endRow + 1, startCol..endCol) yang punya border top
            if (!bottomBorder) {
                for (let c = startCol; c <= endCol; c++) {
                    const bd = getCellBorderStyle(cellData, stylesMap, endRow + 1, c);
                    bottomBorder = buildBorderSide(bd?.t);
                    if (bottomBorder) break;
                }
            }
            // c. Fallback: cek border yang sudah terpasang di excelCell
            if (!bottomBorder) {
                for (let c = startCol; c <= endCol; c++) {
                    bottomBorder = ws.getCell(endRow + 1, c + 1).border?.bottom;
                    if (bottomBorder) break;
                }
            }
            if (!bottomBorder) {
                for (let c = startCol; c <= endCol; c++) {
                    bottomBorder = ws.getCell(endRow + 2, c + 1).border?.top;
                    if (bottomBorder) break;
                }
            }
            // d. Fallback: cek master cell jika ada border bottom
            if (!bottomBorder) {
                const bd = getCellBorderStyle(cellData, stylesMap, startRow, startCol);
                bottomBorder = buildBorderSide(bd?.b);
            }
            // e. Fallback: scan seluruh sel di merge range
            if (!bottomBorder) {
                for (let r = endRow; r >= startRow && !bottomBorder; r--) {
                    for (let c = startCol; c <= endCol; c++) {
                        const bd = getCellBorderStyle(cellData, stylesMap, r, c);
                        bottomBorder = buildBorderSide(bd?.b);
                        if (bottomBorder) break;
                    }
                }
            }

            // 3. Left border:
            // a. Cek sepanjang kolom terkiri merge range (startCol, startRow..endRow)
            let leftBorder: Partial<ExcelJS.Border> | undefined;
            for (let r = startRow; r <= endRow; r++) {
                const bd = getCellBorderStyle(cellData, stylesMap, r, startCol);
                leftBorder = buildBorderSide(bd?.l);
                if (leftBorder) break;
            }
            // b. Fallback: cek sel tepat di sebelah kiri merge range (r, startCol - 1) yang punya border right
            if (!leftBorder && startCol > 0) {
                for (let r = startRow; r <= endRow; r++) {
                    const bd = getCellBorderStyle(cellData, stylesMap, r, startCol - 1);
                    leftBorder = buildBorderSide(bd?.r);
                    if (leftBorder) break;
                }
            }
            // c. Fallback: cek excelCell
            if (!leftBorder) {
                for (let r = startRow; r <= endRow; r++) {
                    leftBorder = ws.getCell(r + 1, startCol + 1).border?.left;
                    if (leftBorder) break;
                }
            }
            if (!leftBorder && startCol > 0) {
                for (let r = startRow; r <= endRow; r++) {
                    leftBorder = ws.getCell(r + 1, startCol).border?.right;
                    if (leftBorder) break;
                }
            }
            // d. Fallback: scan seluruh sel di merge range
            if (!leftBorder) {
                for (let c = startCol; c <= endCol && !leftBorder; c++) {
                    for (let r = startRow; r <= endRow; r++) {
                        const bd = getCellBorderStyle(cellData, stylesMap, r, c);
                        leftBorder = buildBorderSide(bd?.l);
                        if (leftBorder) break;
                    }
                }
            }

            // 4. Right border:
            // a. Cek sepanjang kolom terkanan merge range (endCol, startRow..endRow)
            let rightBorder: Partial<ExcelJS.Border> | undefined;
            for (let r = startRow; r <= endRow; r++) {
                const bd = getCellBorderStyle(cellData, stylesMap, r, endCol);
                rightBorder = buildBorderSide(bd?.r);
                if (rightBorder) break;
            }
            // b. Fallback: cek sel tepat di sebelah kanan merge range (r, endCol + 1) yang punya border left
            if (!rightBorder) {
                for (let r = startRow; r <= endRow; r++) {
                    const bd = getCellBorderStyle(cellData, stylesMap, r, endCol + 1);
                    rightBorder = buildBorderSide(bd?.l);
                    if (rightBorder) break;
                }
            }
            // c. Fallback: cek excelCell
            if (!rightBorder) {
                for (let r = startRow; r <= endRow; r++) {
                    rightBorder = ws.getCell(r + 1, endCol + 1).border?.right;
                    if (rightBorder) break;
                }
            }
            if (!rightBorder) {
                for (let r = startRow; r <= endRow; r++) {
                    rightBorder = ws.getCell(r + 1, endCol + 2).border?.left;
                    if (rightBorder) break;
                }
            }
            // d. Fallback: scan seluruh sel di merge range
            if (!rightBorder) {
                for (let c = endCol; c >= startCol && !rightBorder; c--) {
                    for (let r = startRow; r <= endRow; r++) {
                        const bd = getCellBorderStyle(cellData, stylesMap, r, c);
                        rightBorder = buildBorderSide(bd?.r);
                        if (rightBorder) break;
                    }
                }
            }

            const masterCell = ws.getCell(startRow + 1, startCol + 1);

            // Mewarisi nilai jika master cell kosong tetapi salah satu slave cell punya nilai
            if (masterCell.value == null || masterCell.value === '') {
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startCol; c <= endCol; c++) {
                        const slaveInfo = cellData[r]?.[c];
                        if (!slaveInfo) continue;
                        if (slaveInfo.f) {
                            masterCell.value = { formula: slaveInfo.f };
                            break;
                        } else if (slaveInfo.p) {
                            const plainText = extractPlainText(slaveInfo.p);
                            if (plainText) {
                                masterCell.value = plainText;
                                break;
                            }
                        } else if (slaveInfo.v !== undefined && slaveInfo.v !== null && slaveInfo.v !== '') {
                            masterCell.value = slaveInfo.v;
                            break;
                        }
                    }
                    if (masterCell.value != null && masterCell.value !== '') break;
                }
            }

            // Mewarisi fill/background jika master cell belum punya fill
            if (!masterCell.fill) {
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startCol; c <= endCol; c++) {
                        const s = resolveStyle(cellData[r]?.[c]?.s, stylesMap);
                        const bgArgb = toArgb(s?.bg?.rgb ?? s?.bg);
                        if (bgArgb) {
                            masterCell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: bgArgb },
                            };
                            break;
                        }
                    }
                    if (masterCell.fill) break;
                }
            }

            // Mewarisi alignment jika belum lengkap (misal merge-and-center)
            const curAlign = (masterCell.alignment || {}) as Partial<ExcelJS.Alignment>;
            let alignChanged = false;
            if (!curAlign.horizontal || !curAlign.vertical) {
                for (let r = startRow; r <= endRow; r++) {
                    for (let c = startCol; c <= endCol; c++) {
                        const s = resolveStyle(cellData[r]?.[c]?.s, stylesMap);
                        if (!s) continue;
                        const h = mapHAlign(s.ht);
                        const v = mapVAlign(s.vt);
                        if (!curAlign.horizontal && h) {
                            curAlign.horizontal = h;
                            alignChanged = true;
                        }
                        if (!curAlign.vertical && v) {
                            curAlign.vertical = v;
                            alignChanged = true;
                        }
                        if (s.tb === WrapStrategy.WRAP && !curAlign.wrapText) {
                            curAlign.wrapText = true;
                            alignChanged = true;
                        }
                    }
                }
            }
            if (alignChanged) {
                masterCell.alignment = curAlign as ExcelJS.Alignment;
            }

            const existingBorder = masterCell.border || {};
            const newBorder: Partial<ExcelJS.Borders> = { ...existingBorder };
            if (topBorder)    newBorder.top    = topBorder;
            if (bottomBorder) newBorder.bottom = bottomBorder;
            if (leftBorder)   newBorder.left   = leftBorder;
            if (rightBorder)  newBorder.right  = rightBorder;

            if (Object.keys(newBorder).length > 0) {
                masterCell.border = newBorder as ExcelJS.Borders;
            }

            try {
                ws.mergeCells(startRow + 1, startCol + 1, endRow + 1, endCol + 1);
            } catch {
                // abaikan merge yang tumpang tindih
            }

            // Pastikan seluruh sel di dalam merged range memiliki border keliling yang seragam
            if (Object.keys(newBorder).length > 0) {
                for (let r = startRow + 1; r <= endRow + 1; r++) {
                    for (let c = startCol + 1; c <= endCol + 1; c++) {
                        ws.getCell(r, c).border = newBorder as ExcelJS.Borders;
                    }
                }
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


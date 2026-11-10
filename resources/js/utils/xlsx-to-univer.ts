/**
 * Konverter file XLSX → snapshot Univer
 *
 * Mendukung:
 * - Nilai sel (string, number, boolean, formula, date, rich text)
 * - Anti-corruption NIK/string: String angka tidak akan dipaksa diformat tanggal
 * - Format tanggal konsisten: Date ditampilkan sebagai M/D/YYYY persis seperti Excel
 * - Freeze panes (pembekuan baris/kolom) dari ws.views
 * - Merge cells lengkap dengan penggabungan border luar (top, bottom, left, right)
 * - Lebar kolom (columnData) & tinggi baris (rowData)
 * - Background fill (pattern solid, theme colors Office standar, argb hex)
 * - Font (family, size, bold, italic, underline, strikethrough, color)
 * - Alignment (horizontal: left/center/right/justify, vertical: top/middle/bottom, wrapText, textRotation)
 * - Border (top, right, bottom, left)
 * - Number format (pattern)
 *
 * Strategi efisiensi RAM:
 * - eachRow() streaming tanpa buffer berlebih
 * - ValueType.Merge slave cell skip (O(1))
 * - Style dedup via Map<JSON, id> — style identik di-cache satu kali
 * - Pembersihan memori & cache setelah konversi
 */

import ExcelJS from 'exceljs';

// ─── Theme Colors Standard Excel 2013+ ───────────────────────────────────────
const STANDARD_THEME_COLORS: Record<number, string> = {
    0: '#FFFFFF', // Light 1
    1: '#000000', // Dark 1
    2: '#E7E6E6', // Light 2
    3: '#44546A', // Dark 2
    4: '#4472C4', // Accent 1 (Blue)
    5: '#ED7D31', // Accent 2 (Orange)
    6: '#A5A5A5', // Accent 3 (Gray)
    7: '#FFC000', // Accent 4 (Gold/Yellow)
    8: '#5B9BD5', // Accent 5 (Light Blue)
    9: '#70AD47', // Accent 6 (Green)
};

function uid(): string {
    return Math.random().toString(36).slice(2, 10);
}

/** Terapkan tint (-1 s.d. 1) ke komponen RGB */
function applyTint(channel: number, tint: number): number {
    if (tint > 0) {
        return Math.round(channel + (255 - channel) * tint);
    }
    if (tint < 0) {
        return Math.round(channel * (1 + tint));
    }
    return channel;
}

/** Konversi objek warna ExcelJS (argb, theme, tint) ke hex "#RRGGBB" */
function excelColorToRgb(color: any): string | undefined {
    if (!color) return undefined;

    // 1. Jika ada ARGB eksplisit
    if (typeof color.argb === 'string') {
        const hex = color.argb.length >= 8 ? color.argb.slice(-6) : color.argb;
        if (hex.length === 6 && /^[0-9A-Fa-f]{6}$/.test(hex)) {
            return `#${hex.toUpperCase()}`;
        }
    }

    // 2. Jika merupakan theme color
    if (color.theme !== undefined && STANDARD_THEME_COLORS[color.theme]) {
        const baseHex = STANDARD_THEME_COLORS[color.theme];
        if (color.tint !== undefined && color.tint !== 0) {
            const r = parseInt(baseHex.slice(1, 3), 16);
            const g = parseInt(baseHex.slice(3, 5), 16);
            const b = parseInt(baseHex.slice(5, 7), 16);
            const tintedR = applyTint(r, color.tint).toString(16).padStart(2, '0');
            const tintedG = applyTint(g, color.tint).toString(16).padStart(2, '0');
            const tintedB = applyTint(b, color.tint).toString(16).padStart(2, '0');
            return `#${tintedR}${tintedG}${tintedB}`.toUpperCase();
        }
        return baseHex;
    }

    return undefined;
}

/** ExcelJS border style string → Univer BorderStyleTypes */
const BORDER_TO_UNIVER: Record<string, number> = {
    thin:             1,
    hair:             2,
    dotted:           3,
    dashed:           4,
    dashDot:          5,
    dashDotDot:       6,
    double:           7,
    medium:           8,
    mediumDashed:     9,
    mediumDashDot:    10,
    mediumDashDotDot: 11,
    slantDashDot:     12,
    thick:            13,
};

/** ExcelJS horizontal alignment → Univer HorizontalAlign */
const HALIGN_TO_UNIVER: Record<string, number> = {
    left:        1,
    center:      2,
    right:       3,
    justify:     4,
    fill:        5,
    distributed: 6,
};

/** ExcelJS vertical alignment → Univer VerticalAlign */
const VALIGN_TO_UNIVER: Record<string, number> = {
    top:         1,
    middle:      2,
    bottom:      3,
    distributed: 2,
};

// ─── Merge cell parser ───────────────────────────────────────────────────────

/** Parse "A1:C3" → Univer IRange (0-indexed) */
function parseRangeStr(s: string): any | null {
    if (!s || typeof s !== 'string') return null;
    const parts = s.split(':');
    if (parts.length !== 2) return null;

    function addrToRC(addr: string): { r: number; c: number } | null {
        const m = addr.trim().match(/^([A-Z]+)(\d+)$/i);
        if (!m) return null;
        const c = m[1].toUpperCase().split('').reduce((a, ch) => a * 26 + ch.charCodeAt(0) - 64, 0) - 1;
        return { r: parseInt(m[2]) - 1, c };
    }

    const start = addrToRC(parts[0]);
    const end   = addrToRC(parts[1]);
    if (!start || !end) return null;
    return { startRow: start.r, startColumn: start.c, endRow: end.r, endColumn: end.c };
}

interface MergeRange {
    startRow: number;
    startColumn: number;
    endRow: number;
    endColumn: number;
}

/**
 * Ekstrak merge cells dari worksheet ExcelJS.
 */
function extractMerges(ws: ExcelJS.Worksheet): MergeRange[] {
    const mergeData: MergeRange[] = [];
    const seen = new Set<string>();

    // 1. ws.model.merges (string[])
    const modelMerges: string[] = (ws as any).model?.merges ?? [];
    for (const m of modelMerges) {
        const range = parseRangeStr(m);
        if (range) {
            const key = `${range.startRow}:${range.startColumn}:${range.endRow}:${range.endColumn}`;
            if (!seen.has(key)) {
                seen.add(key);
                mergeData.push(range);
            }
        }
    }

    // 2. ws._merges map (fallback)
    const internalMerges = (ws as any)._merges as Record<string, any> | undefined;
    if (internalMerges) {
        for (const val of Object.values(internalMerges)) {
            if (!val) continue;
            const top = val.top ?? val.model?.top;
            const left = val.left ?? val.model?.left;
            const bottom = val.bottom ?? val.model?.bottom;
            const right = val.right ?? val.model?.right;
            if (top != null && left != null && bottom != null && right != null) {
                const startRow = top - 1;
                const startColumn = left - 1;
                const endRow = bottom - 1;
                const endColumn = right - 1;
                const key = `${startRow}:${startColumn}:${endRow}:${endColumn}`;
                if (!seen.has(key)) {
                    seen.add(key);
                    mergeData.push({ startRow, startColumn, endRow, endColumn });
                }
            }
        }
    }

    return mergeData;
}

// ─── Style converter helpers ──────────────────────────────────────────────────

function convertFont(font: Partial<ExcelJS.Font> | undefined): Record<string, any> {
    if (!font) return {};
    const out: Record<string, any> = {};

    if (font.name) out.ff = font.name;
    if (font.size != null) out.fs = font.size;
    if (font.bold) out.bl = 1;
    if (font.italic) out.it = 1;
    if (font.underline) out.ul = { s: 1 };
    if (font.strike) out.st = { s: 1 };

    const rgb = excelColorToRgb(font.color);
    if (rgb && rgb !== '#000000') {
        out.cl = { rgb };
    }

    return out;
}

function convertFill(fill: ExcelJS.Fill | undefined): Record<string, any> {
    if (!fill) return {};
    if (fill.type === 'pattern') {
        const pf = fill as ExcelJS.FillPattern;
        if (pf.pattern === 'none') return {};
        const colorSource = pf.fgColor || pf.bgColor;
        const rgb = excelColorToRgb(colorSource);
        if (rgb && rgb !== '#FFFFFF' && rgb !== '#00000000') {
            return { bg: { rgb } };
        }
    }
    return {};
}

function convertAlignment(al: Partial<ExcelJS.Alignment> | undefined): Record<string, any> {
    if (!al) return {};
    const out: Record<string, any> = {};
    if (al.horizontal && HALIGN_TO_UNIVER[al.horizontal]) out.ht = HALIGN_TO_UNIVER[al.horizontal];
    if (al.vertical && VALIGN_TO_UNIVER[al.vertical]) out.vt = VALIGN_TO_UNIVER[al.vertical];
    if (al.wrapText) out.tb = 3; // WrapStrategy.WRAP
    if (al.textRotation && al.textRotation !== 0) out.tr = { a: al.textRotation };
    return out;
}

function convertOneBorder(side: Partial<ExcelJS.Border> | undefined): any {
    if (!side?.style || side.style === 'none') return undefined;
    const s = BORDER_TO_UNIVER[side.style] ?? 1;
    const rgb = excelColorToRgb(side.color) ?? '#000000';
    return { s, cl: { rgb } };
}

function convertBorder(border: Partial<ExcelJS.Borders> | undefined): Record<string, any> {
    if (!border) return {};
    const bd: Record<string, any> = {};
    const t = convertOneBorder(border.top);
    const r = convertOneBorder(border.right);
    const b = convertOneBorder(border.bottom);
    const l = convertOneBorder(border.left);
    if (t) bd.t = t;
    if (r) bd.r = r;
    if (b) bd.b = b;
    if (l) bd.l = l;
    return Object.keys(bd).length > 0 ? { bd } : {};
}

/**
 * Menggabungkan border luar untuk master cell dari merged range.
 * Di Excel, border merged cell sering kali dipecah (top dari sel atas, bottom dari sel bawah).
 * Univer membutuhkan border lengkap di master cell agar garis luar kotak merged utuh.
 */
function getCombinedBorderForMerge(ws: ExcelJS.Worksheet, merge: MergeRange): Record<string, any> {
    const topCell = ws.getCell(merge.startRow + 1, merge.startColumn + 1);
    const bottomCell = ws.getCell(merge.endRow + 1, merge.startColumn + 1);
    const leftCell = ws.getCell(merge.startRow + 1, merge.startColumn + 1);
    const rightCell = ws.getCell(merge.startRow + 1, merge.endColumn + 1);

    const bd: Record<string, any> = {};
    const t = convertOneBorder(topCell.border?.top);
    const b = convertOneBorder(bottomCell.border?.bottom || topCell.border?.bottom);
    const l = convertOneBorder(leftCell.border?.left);
    const r = convertOneBorder(rightCell.border?.right || topCell.border?.right);

    if (t) bd.t = t;
    if (b) bd.b = b;
    if (l) bd.l = l;
    if (r) bd.r = r;

    return Object.keys(bd).length > 0 ? { bd } : {};
}

function buildUniverStyle(
    cell: ExcelJS.Cell,
    isStringCell: boolean,
    combinedBorder?: Record<string, any> | null,
): Record<string, any> {
    const borderObj = combinedBorder || convertBorder(cell.border);

    const style: Record<string, any> = {
        ...convertFont(cell.font),
        ...convertFill(cell.fill),
        ...convertAlignment(cell.alignment),
        ...borderObj,
    };

    // PENTING: Jangan tempelkan format tanggal/angka jika sel adalah STRING atau teks!
    // Di Excel, teks angka (seperti NIK 330902...) tidak pernah diformat tanggal.
    // Jika format tanggal seperti 'mm-dd-yy' dipasang, Univer akan memparsing
    // string angka tersebut dan mengubahnya menjadi tanggal (12-22-05) atau '######'!
    if (cell.numFmt && cell.numFmt !== 'General' && !isStringCell) {
        style.n = { pattern: cell.numFmt };
    }

    return style;
}

// ─── Main converter ───────────────────────────────────────────────────────────

export async function xlsxToUniverSnapshot(buffer: ArrayBuffer): Promise<any> {
    const wb = new ExcelJS.Workbook();
    await wb.xlsx.load(buffer);

    const styles: Record<string, any> = {};
    const styleCache = new Map<string, string>();
    let styleIdx = 0;

    function getStyleId(style: Record<string, any>): string | undefined {
        if (Object.keys(style).length === 0) return undefined;
        const key = JSON.stringify(style, Object.keys(style).sort());
        const cached = styleCache.get(key);
        if (cached) return cached;
        const id = `s${++styleIdx}`;
        styles[id] = style;
        styleCache.set(key, id);
        return id;
    }

    const sheets: Record<string, any> = {};
    const sheetOrder: string[] = [];

    for (const ws of wb.worksheets) {
        const sheetId = `sheet-${uid()}`;
        sheetOrder.push(sheetId);

        const columnData: Record<number, any> = {};
        const rowData: Record<number, any> = {};
        const cellData: Record<number, Record<number, any>> = {};

        // 1. Merge cells & master lookup
        const mergeData = extractMerges(ws);
        const mergeMasterMap = new Map<string, MergeRange>();
        for (const m of mergeData) {
            mergeMasterMap.set(`${m.startRow}:${m.startColumn}`, m);
        }

        // 2. Freeze panes (baca dari ws.views atau model.views)
        const views = ws.views || (ws as any).model?.views || [];
        const freezeView = views.find(
            (v: any) =>
                v.state === 'frozen' ||
                (v.ySplit != null && v.ySplit > 0) ||
                (v.xSplit != null && v.xSplit > 0),
        );
        const xSplit = freezeView?.xSplit ?? 0;
        const ySplit = freezeView?.ySplit ?? 0;
        const freeze = {
            xSplit,
            ySplit,
            startRow: ySplit > 0 ? ySplit : -1,
            startColumn: xSplit > 0 ? xSplit : -1,
        };

        // 3. Lebar kolom
        if (ws.columns) {
            ws.columns.forEach((col, idx) => {
                if (!col) return;
                const entry: any = {};
                if (col.width != null && col.width > 0) {
                    entry.w = Math.round(col.width * 7);
                }
                if ((col as any).hidden) entry.hd = 1;
                if (Object.keys(entry).length > 0) columnData[idx] = entry;
            });
        }

        // 4. Baris & sel
        ws.eachRow({ includeEmpty: false }, (row, rowNum) => {
            const r = rowNum - 1; // 0-indexed

            const rEntry: any = {};
            if (row.height != null) rEntry.h = Math.round(row.height * 1.333);
            if ((row as any).hidden) rEntry.hd = 1;
            if (Object.keys(rEntry).length > 0) rowData[r] = rEntry;

            row.eachCell({ includeEmpty: false }, (cell, colNum) => {
                // Abaikan slave cells pada merge (hanya master cell yang menyimpan nilai)
                if (cell.type === ExcelJS.ValueType.Merge) return;

                const c = colNum - 1; // 0-indexed
                const cd: any = {};

                const isStringCell = cell.type === ExcelJS.ValueType.String;

                // ── Nilai sel ────────────────────────────────────────────────
                if (cell.type === ExcelJS.ValueType.Formula) {
                    const fv = cell.value as ExcelJS.CellFormulaValue;
                    if (fv.formula) cd.f = fv.formula;
                    if (fv.result != null) {
                        if (fv.result instanceof Date) {
                            const d = fv.result;
                            cd.v = `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`;
                            cd.t = 1;
                        } else {
                            cd.v = fv.result;
                            if (typeof cd.v === 'number') cd.t = 2;
                            else if (typeof cd.v === 'string') cd.t = 1;
                            else if (typeof cd.v === 'boolean') cd.t = 3;
                        }
                    }
                } else if (cell.type === ExcelJS.ValueType.Date) {
                    // Gunakan UTC date parts agar bebas timezone offset (sesuai serial Excel)
                    const d = cell.value as Date;
                    const m = d.getUTCMonth() + 1;
                    const day = d.getUTCDate();
                    const y = d.getUTCFullYear();
                    cd.v = `${m}/${day}/${y}`;
                    cd.t = 1;
                } else if (cell.type === ExcelJS.ValueType.RichText) {
                    const rt = cell.value as { richText: Array<{ text: string }> };
                    cd.v = (rt.richText || []).map((part) => part.text).join('');
                    cd.t = 1;
                } else if (cell.type !== ExcelJS.ValueType.Null && cell.value != null) {
                    cd.v = cell.value;
                    if (typeof cell.value === 'number') cd.t = 2;
                    else if (typeof cell.value === 'string') cd.t = 1;
                    else if (typeof cell.value === 'boolean') cd.t = 3;
                }

                // ── Style ─────────────────────────────────────────────────
                // Cek apakah sel ini merupakan master dari merge range
                const mergeObj = mergeMasterMap.get(`${r}:${c}`);
                const combinedBorder = mergeObj ? getCombinedBorderForMerge(ws, mergeObj) : null;

                const style = buildUniverStyle(cell, isStringCell, combinedBorder);
                const sid = getStyleId(style);
                if (sid) cd.s = sid;

                if (Object.keys(cd).length > 0) {
                    if (!cellData[r]) cellData[r] = {};
                    cellData[r][c] = cd;
                }
            });
        });

        const rowCount = Math.max(ws.rowCount + 10, 100);
        const columnCount = Math.max(ws.columnCount + 5, 20);

        sheets[sheetId] = {
            id: sheetId,
            name: ws.name,
            rowCount,
            columnCount,
            defaultColumnWidth: 88,
            defaultRowHeight: 19,
            cellData,
            columnData,
            rowData,
            mergeData,
            freeze,
            showGridlines: 1,
        };
    }

    styleCache.clear();

    return {
        id: `wb-${uid()}`,
        name: wb.title || 'Imported Workbook',
        appVersion: '0.2.0',
        locale: 'enUS',
        sheetOrder,
        sheets,
        styles,
    };
}

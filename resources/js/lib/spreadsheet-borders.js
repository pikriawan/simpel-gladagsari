import jspreadsheet from "jspreadsheet-ce";

/**
 * Menerapkan aturan border spreadsheet sesuai spesifikasi Excel:
 * - Additive: Top, Bottom, Left, Right, Inside Horizontal, Inside Vertical (mempertahankan border yang tidak disentuh)
 * - Replacement: All Borders, Outside Borders, Inside Borders, No Border (menggantikan konfigurasi sesuai cakupan)
 * - Non-toggle: Tidak menghapus border saat opsi ditekan kembali
 * - Mendukung Undo/Redo bawaan jspreadsheet
 */
export function applyBorder(worksheet, item, borderType) {
    if (!worksheet || !worksheet.selectedCell) return;

    const minCol = Math.min(worksheet.selectedCell[0], worksheet.selectedCell[2]);
    const minRow = Math.min(worksheet.selectedCell[1], worksheet.selectedCell[3]);
    const maxCol = Math.max(worksheet.selectedCell[0], worksheet.selectedCell[2]);
    const maxRow = Math.max(worksheet.selectedCell[1], worksheet.selectedCell[3]);

    let thickness = (item && item.thickness) || 1;
    const color = (item && item.color) || "black";
    const lineStyle = (item && item.style) || "solid";
    if (lineStyle === "double") {
        thickness = Math.max(thickness, 3);
    }
    const borderStr = `${thickness}px ${lineStyle} ${color}`;

    const cellStyles = {};
    const addStyle = (cellName, prop, val) => {
        if (!cellStyles[cellName]) {
            cellStyles[cellName] = [];
        }
        cellStyles[cellName].push(`${prop}:${val}`);
    };

    for (let y = minRow; y <= maxRow; y++) {
        for (let x = minCol; x <= maxCol; x++) {
            const cellName = jspreadsheet.helpers.getCellNameFromCoords(x, y);

            switch (borderType) {
                case "border_clear": // No Border
                    addStyle(cellName, "border-top", "");
                    addStyle(cellName, "border-right", "");
                    addStyle(cellName, "border-bottom", "");
                    addStyle(cellName, "border-left", "");
                    break;

                case "border_all": // All Borders
                    addStyle(cellName, "border-top", borderStr);
                    addStyle(cellName, "border-right", borderStr);
                    addStyle(cellName, "border-bottom", borderStr);
                    addStyle(cellName, "border-left", borderStr);
                    break;

                case "border_outer": // Outside Borders
                    if (y === minRow) {
                        addStyle(cellName, "border-top", borderStr);
                    } else {
                        addStyle(cellName, "border-top", "");
                    }

                    if (y === maxRow) {
                        addStyle(cellName, "border-bottom", borderStr);
                    } else {
                        addStyle(cellName, "border-bottom", "");
                    }

                    if (x === minCol) {
                        addStyle(cellName, "border-left", borderStr);
                    } else {
                        addStyle(cellName, "border-left", "");
                    }

                    if (x === maxCol) {
                        addStyle(cellName, "border-right", borderStr);
                    } else {
                        addStyle(cellName, "border-right", "");
                    }
                    break;

                case "border_inner": // Inside Borders
                    if (y === minRow) {
                        addStyle(cellName, "border-top", "");
                    } else {
                        addStyle(cellName, "border-top", borderStr);
                    }

                    if (y === maxRow) {
                        addStyle(cellName, "border-bottom", "");
                    } else {
                        addStyle(cellName, "border-bottom", borderStr);
                    }

                    if (x === minCol) {
                        addStyle(cellName, "border-left", "");
                    } else {
                        addStyle(cellName, "border-left", borderStr);
                    }

                    if (x === maxCol) {
                        addStyle(cellName, "border-right", "");
                    } else {
                        addStyle(cellName, "border-right", borderStr);
                    }
                    break;

                case "border_top": // Top Border
                    if (y === minRow) {
                        addStyle(cellName, "border-top", borderStr);
                    }
                    break;

                case "border_bottom": // Bottom Border
                    if (y === maxRow) {
                        addStyle(cellName, "border-bottom", borderStr);
                    }
                    break;

                case "border_left": // Left Border
                    if (x === minCol) {
                        addStyle(cellName, "border-left", borderStr);
                    }
                    break;

                case "border_right": // Right Border
                    if (x === maxCol) {
                        addStyle(cellName, "border-right", borderStr);
                    }
                    break;

                case "border_horizontal": // Inside Horizontal Border
                    if (minRow < maxRow) {
                        if (y > minRow) {
                            addStyle(cellName, "border-top", borderStr);
                        }
                        if (y < maxRow) {
                            addStyle(cellName, "border-bottom", borderStr);
                        }
                    }
                    break;

                case "border_vertical": // Inside Vertical Border
                    if (minCol < maxCol) {
                        if (x > minCol) {
                            addStyle(cellName, "border-left", borderStr);
                        }
                        if (x < maxCol) {
                            addStyle(cellName, "border-right", borderStr);
                        }
                    }
                    break;
            }
        }
    }

    const finalStyles = {};
    for (const [cell, declarations] of Object.entries(cellStyles)) {
        if (declarations.length > 0) {
            finalStyles[cell] = declarations.join(";");
        }
    }

    if (Object.keys(finalStyles).length > 0) {
        worksheet.setStyle(finalStyles, null, null, true);
    }
}

/**
 * Handler toolbar kustom untuk meng-override fungsi border default jspreadsheet
 * dan meng-override tombol save di samping undo redo agar menyimpan ke database (bukan export browser)
 */
export function createCustomToolbar(getWorksheet, onSave) {
    return function (toolbar) {
        if (toolbar && Array.isArray(toolbar.items)) {
            // Override border dropdown
            const borderItem = toolbar.items.find(
                (item) => item.options && item.options.includes("border_all")
            );
            if (borderItem) {
                borderItem.onchange = function (el, item, opt1, opt2) {
                    const borderType = opt2 || opt1;
                    const ws = getWorksheet();
                    applyBorder(ws, item, borderType);
                };
            }

            // Override tombol save di samping undo/redo
            const saveItem = toolbar.items.find(
                (item) => item.content === "save"
            );
            if (saveItem) {
                saveItem.onclick = function () {
                    if (typeof onSave === "function") {
                        onSave();
                    }
                };
                saveItem.tooltip = "Simpan ke Database";
            }
        }
        return toolbar;
    };
}


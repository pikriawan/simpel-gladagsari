import "jsuites/dist/jsuites.css";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import { patenRegistration } from "@/routes";
import { Head, router } from "@inertiajs/react";
import { useRef, useMemo, useCallback, useEffect, useState } from "react";
import { Spreadsheet, Worksheet, jspreadsheet } from "@jspreadsheet-ce/react";
import { createCustomToolbar } from "@/lib/spreadsheet-borders";
import { HeaderActions } from "@/components/header-actions";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import tabularjs from "tabularjs";

type SheetItem = {
    name: string;
    data: unknown[][] | null;
    style: Record<string, string> | null;
    merge: Record<string, [number, number]> | null;
    columns: { width: number; [key: string]: unknown }[] | null;
    rows: Record<number, { height: number }> | unknown[] | null;
};

type Registration = {
    sheet_data?: {
        sheets?: SheetItem[];
        data?: unknown[][];
        style?: Record<string, string>;
        merge?: Record<string, [number, number]>;
        columns?: { width: number }[];
        rows?: Record<number, { height: number }>;
    };
} | null;

export default function PatenRegistration({ registration }: { registration: Registration }) {
    const spreadsheet = useRef();
    const isSavingRef = useRef(false);
    const fileInputRef = useRef(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [spreadsheetKey, setSpreadsheetKey] = useState(0);

    // Siapkan daftar sheet tersimpan atau default Sheet1
    const initialSheets = useMemo(() => {
        if (
            registration?.sheet_data?.sheets &&
            Array.isArray(registration.sheet_data.sheets) &&
            registration.sheet_data.sheets.length > 0
        ) {
            return registration.sheet_data.sheets;
        }

        return [
            {
                name: "Sheet1",
                data: registration?.sheet_data?.data || null,
                style: registration?.sheet_data?.style || null,
                merge: registration?.sheet_data?.merge || null,
                columns: registration?.sheet_data?.columns || null,
                rows: registration?.sheet_data?.rows || null,
            },
        ];
    }, [registration]);

    const [currentSheets, setCurrentSheets] = useState(initialSheets);

    useEffect(() => {
        setCurrentSheets(initialSheets);
    }, [initialSheets]);

    // Ambil worksheet yang sedang aktif
    const getActiveWorksheet = useCallback(() => {
        if (jspreadsheet.current) {
            return jspreadsheet.current;
        }

        const parent =
            spreadsheet.current && !Array.isArray(spreadsheet.current)
                ? spreadsheet.current
                : spreadsheet.current?.[0]?.parent || null;

        if (parent && typeof parent.getWorksheetActive === "function") {
            const activeIndex = parent.getWorksheetActive();
            if (parent.worksheets && parent.worksheets[activeIndex]) {
                return parent.worksheets[activeIndex];
            }
        }

        return (
            (spreadsheet.current && Array.isArray(spreadsheet.current)
                ? spreadsheet.current[0]
                : spreadsheet.current?.worksheets?.[0]) ||
            jspreadsheet.current
        );
    }, []);

    // Konteks menu klik kanan pada tab sheet mirip Excel
    const customContextMenu = useCallback((instance, col, row, e, items, section) => {
        const isTab =
            section === "tabs" ||
            (e && e.target && Boolean(e.target.closest(".jtabs-headers")));

        if (isTab) {
            const parent = instance?.parent;
            const worksheets =
                parent?.worksheets ||
                (Array.isArray(spreadsheet.current) ? spreadsheet.current : [instance]);

            let tabIndex = typeof col === "number" ? col : 0;
            if (e && e.target) {
                const tabHeader = e.target.closest(
                    ".jtabs-headers > div:not(.jtabs-border)"
                );
                if (tabHeader && tabHeader.parentElement) {
                    const idx = Array.from(tabHeader.parentElement.children).indexOf(
                        tabHeader
                    );
                    if (idx !== -1) {
                        tabIndex = idx;
                    }
                }
            }

            const targetWs = worksheets[tabIndex] || instance;
            const currentName =
                targetWs?.options?.worksheetName || `Sheet${tabIndex + 1}`;

            return [
                {
                    title: "Tambah Sheet Baru",
                    icon: "add",
                    onclick: function () {
                        const nextNum = worksheets.length + 1;
                        const newName = `Sheet${nextNum}`;
                        if (typeof instance.createWorksheet === "function") {
                            instance.createWorksheet({
                                minDimensions: [50, 50],
                                worksheetName: newName,
                            });
                        } else if (parent?.element?.tabs) {
                            parent.element.tabs.create(newName);
                        }
                    },
                },
                {
                    title: "Hapus Sheet",
                    icon: "delete",
                    disabled: worksheets.length <= 1,
                    onclick: function () {
                        if (worksheets.length <= 1) {
                            alert("Workbook minimal harus memiliki 1 sheet.");
                            return;
                        }
                        if (
                            confirm(
                                `Apakah Anda yakin ingin menghapus "${currentName}"?`
                            )
                        ) {
                            if (typeof instance.deleteWorksheet === "function") {
                                instance.deleteWorksheet(tabIndex);
                            } else if (parent?.element?.tabs) {
                                parent.element.tabs.remove(tabIndex);
                            }
                        }
                    },
                },
                {
                    type: "line",
                },
                {
                    title: "Ubah Nama Sheet",
                    icon: "edit",
                    onclick: function () {
                        const newName = prompt(
                            "Masukkan nama sheet baru:",
                            currentName
                        );
                        if (
                            newName &&
                            newName.trim() &&
                            newName.trim() !== currentName
                        ) {
                            const cleanName = newName.trim();
                            if (targetWs?.options) {
                                targetWs.options.worksheetName = cleanName;
                            }
                            if (parent?.element?.tabs?.headers) {
                                const tabEl =
                                    parent.element.tabs.headers.children[tabIndex];
                                if (tabEl) {
                                    tabEl.innerText = cleanName;
                                }
                            }
                        }
                    },
                },
                {
                    title: "Duplikasi Sheet",
                    icon: "content_copy",
                    onclick: function () {
                        const newName = `${currentName} (2)`;
                        const data = targetWs?.getData ? targetWs.getData() : [];
                        const style =
                            typeof targetWs?.getStyle === "function"
                                ? targetWs.getStyle()
                                : {};
                        const merge =
                            typeof targetWs?.getMerge === "function"
                                ? targetWs.getMerge()
                                : {};

                        if (typeof instance.createWorksheet === "function") {
                            instance.createWorksheet({
                                worksheetName: newName,
                                minDimensions: [50, 50],
                                data: data,
                                style: style,
                                mergeCells: merge,
                            });
                        }
                    },
                },
            ];
        }

        return items;
    }, []);

    // Fungsi untuk memastikan tab aktif terlihat di viewport scroll
    const scrollActiveTabIntoView = useCallback(() => {
        setTimeout(() => {
            const activeTab = document.querySelector(
                ".paten-registration-spreadsheet .jtabs-headers > div.jtabs-selected"
            );
            if (activeTab && typeof activeTab.scrollIntoView === "function") {
                activeTab.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "nearest",
                });
            }
        }, 50);
    }, []);

    // Handler saat sheet baru dibuat lewat tombol (+)
    const handleCreateWorksheet = useCallback((worksheet) => {
        if (!worksheet) return;
        const colCount = worksheet.headers
            ? worksheet.headers.length
            : worksheet.options?.data?.[0]?.length || 0;
        const rowCount = worksheet.rows
            ? worksheet.rows.length
            : worksheet.options?.data?.length || 0;

        if (colCount < 50 && typeof worksheet.insertColumn === "function") {
            worksheet.insertColumn(50 - colCount);
        }
        if (rowCount < 50 && typeof worksheet.insertRow === "function") {
            worksheet.insertRow(50 - rowCount);
        }

        scrollActiveTabIntoView();
    }, [scrollActiveTabIntoView]);

    // Dukungan scroll mouse/mousepad dan drag tab sheet (animasi keangkat & pergeseran tab di bawahnya secara otomatis)
    useEffect(() => {
        const container = document.querySelector(".paten-registration-spreadsheet");
        if (!container) return;

        let isDraggingTab = false;
        let isPanning = false;
        let dragTabEl = null;
        let dragStartIndex = -1;
        let currentTargetIndex = -1;
        let startPageX = 0;
        let startClientX = 0;
        let initialScrollLeft = 0;
        let hasMoved = false;
        let shiftWidth = 0;
        let initialTabRects = [];

        const getTabItems = (headersEl) => {
            return Array.from(headersEl.children).filter(
                (el) =>
                    !el.classList.contains("jtabs-border") &&
                    !el.classList.contains("jtabs-controls") &&
                    !el.classList.contains("jtabs-add") &&
                    !el.classList.contains("jtabs-prev") &&
                    !el.classList.contains("jtabs-next")
            );
        };

        const handleMouseDown = (e) => {
            if (e.button !== 0) return; // Hanya klik kiri
            const headersEl = e.target.closest(".jtabs-headers");
            if (!headersEl) return;

            const tabItem = e.target.closest(
                ".jtabs-headers > div:not(.jtabs-border):not(.jtabs-controls):not(.jtabs-add):not(.jtabs-prev):not(.jtabs-next)"
            );

            startPageX = e.pageX;
            startClientX = e.clientX;
            initialScrollLeft = headersEl.scrollLeft;
            hasMoved = false;

            if (tabItem) {
                const tabs = getTabItems(headersEl);
                const idx = tabs.indexOf(tabItem);
                if (idx !== -1) {
                    dragTabEl = tabItem;
                    dragStartIndex = idx;
                    currentTargetIndex = idx;
                    isDraggingTab = false;
                }
            } else {
                isPanning = true;
            }
        };

        const handleMouseMove = (e) => {
            const headersEl = container.querySelector(".jtabs-headers");
            if (!headersEl) return;

            const deltaX = e.pageX - startPageX;

            // 1. Drag tab sheet (animasi keangkat dan geser otomatis sheet di bawahnya)
            if (dragTabEl) {
                if (!isDraggingTab && Math.abs(deltaX) > 4) {
                    isDraggingTab = true;
                    hasMoved = true;
                    dragTabEl.classList.add("tab-is-dragging");

                    const tabs = getTabItems(headersEl);
                    const rectS = dragTabEl.getBoundingClientRect();
                    shiftWidth = rectS.width + 8; // lebar tab + margin antar tab (4px + 4px)

                    // Catat posisi awal semua tab (termasuk scroll offset) sebelum bergeser
                    const scrollStart = headersEl.scrollLeft;
                    initialTabRects = tabs.map((t) => {
                        const r = t.getBoundingClientRect();
                        const contentCenter = r.left + scrollStart + r.width / 2;
                        return {
                            width: r.width,
                            center: contentCenter,
                        };
                    });
                }

                if (isDraggingTab) {
                    hasMoved = true;
                    const tabs = getTabItems(headersEl);
                    const currentScroll = headersEl.scrollLeft;
                    const scrollDiff = currentScroll - initialScrollLeft;
                    const visualOffset = (e.clientX - startClientX) + scrollDiff;

                    // Animasi keangkat dan mengikuti posisi kursor secara presisi
                    dragTabEl.style.transform = `translate3d(${visualOffset}px, -7px, 0) scale(1.06)`;

                    // Hitung pusat virtual tab yang sedang di-drag
                    const startCenter = initialTabRects[dragStartIndex]?.center || 0;
                    const draggedCenter = startCenter + (e.clientX - startClientX) + scrollDiff;

                    // Tentukan targetIndex dengan midpoint threshold sehingga tab di bawahnya langsung bergeser
                    let newTarget = dragStartIndex;
                    const n = initialTabRects.length;

                    if (draggedCenter > startCenter && dragStartIndex < n - 1) {
                        // Geser ke kanan: periksa batas tengah (midpoint) dengan setiap tab di kanannya
                        for (let i = dragStartIndex + 1; i < n; i++) {
                            const midPoint =
                                (initialTabRects[i - 1].center + initialTabRects[i].center) / 2;
                            if (draggedCenter > midPoint) {
                                newTarget = i;
                            } else {
                                break;
                            }
                        }
                    } else if (draggedCenter < startCenter && dragStartIndex > 0) {
                        // Geser ke kiri: periksa batas tengah (midpoint) dengan setiap tab di kirinya
                        for (let i = dragStartIndex - 1; i >= 0; i--) {
                            const midPoint =
                                (initialTabRects[i + 1].center + initialTabRects[i].center) / 2;
                            if (draggedCenter < midPoint) {
                                newTarget = i;
                            } else {
                                break;
                            }
                        }
                    }

                    currentTargetIndex = newTarget;

                    // Geser tab-tab di bawahnya secara otomatis (fluid dynamic shift animation)
                    for (let i = 0; i < tabs.length; i++) {
                        if (i === dragStartIndex) continue;
                        const tab = tabs[i];

                        if (
                            dragStartIndex < currentTargetIndex &&
                            i > dragStartIndex &&
                            i <= currentTargetIndex
                        ) {
                            // Sheet digeser ke kanan: sheet-sheet di antaranya bergeser ke kiri untuk memberi ruang
                            tab.style.transform = `translateX(-${shiftWidth}px)`;
                        } else if (
                            dragStartIndex > currentTargetIndex &&
                            i < dragStartIndex &&
                            i >= currentTargetIndex
                        ) {
                            // Sheet digeser ke kiri: sheet-sheet di antaranya bergeser ke kanan untuk memberi ruang
                            tab.style.transform = `translateX(${shiftWidth}px)`;
                        } else {
                            tab.style.transform = "";
                        }
                    }

                    // Auto-scroll tepi saat drag mendekati tepi kiri/kanan bilah tab
                    const containerRect = headersEl.getBoundingClientRect();
                    if (e.clientX < containerRect.left + 50) {
                        headersEl.scrollLeft -= 6;
                    } else if (e.clientX > containerRect.right - 50) {
                        headersEl.scrollLeft += 6;
                    }
                }
                return;
            }

            // 2. Drag kosong untuk pan/geser scrollbar tab
            if (isPanning) {
                if (Math.abs(deltaX) > 4) {
                    hasMoved = true;
                    headersEl.scrollLeft = initialScrollLeft - deltaX;
                }
            }
        };

        const handleMouseUp = () => {
            const headersEl = container.querySelector(".jtabs-headers");

            if (isDraggingTab && dragTabEl) {
                const tabs = headersEl ? getTabItems(headersEl) : [];

                // Reset transform pada semua tab
                for (let i = 0; i < tabs.length; i++) {
                    tabs[i].style.transform = "";
                }

                dragTabEl.classList.remove("tab-is-dragging");
                dragTabEl.style.transform = "";

                // Eksekusi pemindahan urutan sheet jika target berbeda
                if (
                    dragStartIndex !== -1 &&
                    currentTargetIndex !== -1 &&
                    dragStartIndex !== currentTargetIndex
                ) {
                    const ws = getActiveWorksheet();
                    const parent = ws?.parent;
                    const tabsObj = parent?.element?.tabs;

                    if (tabsObj && typeof tabsObj.move === "function") {
                        tabsObj.move(dragStartIndex, currentTargetIndex);

                        if (parent && Array.isArray(parent.worksheets)) {
                            const [moved] = parent.worksheets.splice(
                                dragStartIndex,
                                1
                            );
                            parent.worksheets.splice(currentTargetIndex, 0, moved);
                        }
                    }
                }
            }

            // Reset state
            isDraggingTab = false;
            isPanning = false;
            dragTabEl = null;
            dragStartIndex = -1;
            currentTargetIndex = -1;
            initialTabRects = [];

            if (hasMoved) {
                setTimeout(() => {
                    hasMoved = false;
                }, 50);
            }
        };

        const handleClickCapture = (e) => {
            if (hasMoved) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const handleWheel = (e) => {
            const headersEl = e.target.closest(".jtabs-headers");
            if (headersEl) {
                if (Math.abs(e.deltaX) > 0) {
                    return; // Biarkan swipe horizontal trackpad alami
                }
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    headersEl.scrollLeft += e.deltaY;
                }
            }
        };

        const handleClick = (e) => {
            const tabHeader = e.target.closest(
                ".jtabs-headers > div:not(.jtabs-border)"
            );
            if (tabHeader && !hasMoved) {
                setTimeout(() => {
                    tabHeader.scrollIntoView({
                        behavior: "smooth",
                        block: "nearest",
                        inline: "nearest",
                    });
                }, 50);
            }
        };

        container.addEventListener("mousedown", handleMouseDown);
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        container.addEventListener("click", handleClickCapture, true);
        container.addEventListener("click", handleClick);
        container.addEventListener("wheel", handleWheel, { passive: false });

        return () => {
            container.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
            container.removeEventListener("click", handleClickCapture, true);
            container.removeEventListener("click", handleClick);
            container.removeEventListener("wheel", handleWheel);
        };
    }, [getActiveWorksheet]);

    // Double-click tab header untuk rename langsung ala Excel
    useEffect(() => {
        const container = document.querySelector(".paten-registration-spreadsheet");
        if (!container) return;

        const handleDblClick = (e) => {
            const tabHeader = e.target.closest(
                ".jtabs-headers > div:not(.jtabs-border):not(.jtabs-add)"
            );
            if (!tabHeader) return;

            const tabsContainer = tabHeader.parentElement;
            const index = Array.from(tabsContainer.children).indexOf(tabHeader);
            if (index === -1) return;

            const ws = getActiveWorksheet();
            const parent = ws?.parent;
            const targetWs = parent?.worksheets?.[index] || ws;
            const currentName =
                targetWs?.options?.worksheetName || tabHeader.innerText;

            const newName = prompt("Masukkan nama sheet baru:", currentName);
            if (newName && newName.trim() && newName.trim() !== currentName) {
                const cleanName = newName.trim();
                if (targetWs?.options) {
                    targetWs.options.worksheetName = cleanName;
                }
                tabHeader.innerText = cleanName;
            }
        };

        // Auto-fit kolom saat double-click pada batas header kolom ala Excel
        const handleHeaderDblClick = (e) => {
            const headerTd = e.target.closest(
                ".jss_worksheet > thead > tr > td[data-x]"
            );
            if (!headerTd) return;

            const rect = headerTd.getBoundingClientRect();
            // Cek apakah double click terjadi di area resize (~8px dari tepi kanan header)
            if (e.clientX < rect.right - 8) return;

            const colIndex = parseInt(headerTd.getAttribute("data-x"));
            if (isNaN(colIndex)) return;

            const ws = getActiveWorksheet();
            if (
                !ws ||
                typeof ws.getData !== "function" ||
                typeof ws.setWidth !== "function"
            ) {
                return;
            }

            const data = ws.getData();
            let maxCharLen = headerTd.innerText?.trim()?.length || 1;

            data.forEach((row) => {
                const val = row[colIndex];
                if (val !== null && val !== undefined) {
                    const len = String(val).length;
                    if (len > maxCharLen) {
                        maxCharLen = len;
                    }
                }
            });

            // Hitung lebar pixel proporsional: ~8.5px per karakter + padding 24px (min 60px, max 500px)
            const calculatedWidth = Math.min(
                500,
                Math.max(60, Math.round(maxCharLen * 8.5 + 24))
            );
            ws.setWidth(colIndex, calculatedWidth);
        };

        container.addEventListener("dblclick", handleDblClick);
        container.addEventListener("dblclick", handleHeaderDblClick);
        return () => {
            container.removeEventListener("dblclick", handleDblClick);
            container.removeEventListener("dblclick", handleHeaderDblClick);
        };
    }, [getActiveWorksheet]);

    // Simpan semua sheet beserta lebar kolom & tinggi baris ke database
    const handleSave = useCallback(() => {
        if (isSavingRef.current) return;

        const ws = getActiveWorksheet();
        if (!ws) return;

        const parent =
            ws.parent ||
            (spreadsheet.current && !Array.isArray(spreadsheet.current)
                ? spreadsheet.current
                : null);

        const worksheets =
            parent?.worksheets ||
            (Array.isArray(spreadsheet.current) ? spreadsheet.current : [ws]);

        const sheets = worksheets.map((w, idx) => {
            // Ambil lebar setiap kolom
            let colWidths = [];
            if (typeof w.getWidth === "function") {
                colWidths = w.getWidth();
            } else if (w.cols && Array.isArray(w.cols)) {
                colWidths = w.cols.map((c) => {
                    const attr = c?.colElement?.getAttribute("width");
                    return attr ? parseInt(attr) : 100;
                });
            }

            const columns = colWidths.map((width) => ({
                width: typeof width === "number" ? width : parseInt(width) || 100,
            }));

            // Ambil tinggi baris khusus jika ada yang diatur
            let rows = {};
            if (typeof w.getHeight === "function") {
                const h = w.getHeight();
                if (Array.isArray(h)) {
                    h.forEach((val, rIdx) => {
                        if (val) {
                            const hVal =
                                typeof val === "number" ? val : parseInt(val);
                            if (hVal) rows[rIdx] = { height: hVal };
                        }
                    });
                } else if (h && typeof h === "object") {
                    Object.entries(h).forEach(([rIdx, val]) => {
                        if (val) {
                            const hVal =
                                typeof val === "number" ? val : parseInt(val);
                            if (hVal) rows[rIdx] = { height: hVal };
                        }
                    });
                }
            }

            return {
                name: w.options?.worksheetName || `Sheet${idx + 1}`,
                data: typeof w.getData === "function" ? w.getData() : [],
                style: typeof w.getStyle === "function" ? w.getStyle() : {},
                merge: typeof w.getMerge === "function" ? w.getMerge() : {},
                columns: columns.length > 0 ? columns : undefined,
                rows: Object.keys(rows).length > 0 ? rows : undefined,
            };
        });

        isSavingRef.current = true;
        const toastId = toast.loading("Menyimpan ke database...");

        router.post(
            patenRegistration.url(),
            {
                sheets: sheets,
                data: sheets[0]?.data || [],
                style: sheets[0]?.style || {},
                merge: sheets[0]?.merge || {},
                columns: sheets[0]?.columns || [],
                rows: sheets[0]?.rows || {},
            },
            {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => {
                    isSavingRef.current = false;
                    toast.success("File XLSX berhasil disimpan ke database", {
                        id: toastId,
                    });
                },
                onError: () => {
                    isSavingRef.current = false;
                    toast.error("Gagal menyimpan file ke database", { id: toastId });
                },
                onFinish: () => {
                    isSavingRef.current = false;
                },
            }
        );
    }, [getActiveWorksheet]);

    // Export file Excel (.xlsx) secara client-side menggunakan SheetJS
    const handleExport = useCallback(() => {
        if (isExporting) return;
        setIsExporting(true);
        const toastId = toast.loading("Mengekspor file Excel...");

        try {
            const ws = getActiveWorksheet();
            const parent =
                ws?.parent ||
                (spreadsheet.current && !Array.isArray(spreadsheet.current)
                    ? spreadsheet.current
                    : null);

            const worksheets =
                parent?.worksheets ||
                (Array.isArray(spreadsheet.current) ? spreadsheet.current : [ws]);

            const wb = XLSX.utils.book_new();

            worksheets.forEach((w, idx) => {
                const sheetName = w.options?.worksheetName || `Sheet${idx + 1}`;
                const data = typeof w.getData === "function" ? w.getData() : [];

                // Buat worksheet SheetJS dari data 2D array
                const xlsxWs = XLSX.utils.aoa_to_sheet(data);

                // Terapkan lebar kolom
                let colWidths = [];
                if (typeof w.getWidth === "function") {
                    colWidths = w.getWidth();
                } else if (w.cols && Array.isArray(w.cols)) {
                    colWidths = w.cols.map((c) => {
                        const attr = c?.colElement?.getAttribute("width");
                        return attr ? parseInt(attr) : 100;
                    });
                }
                if (colWidths.length > 0) {
                    xlsxWs["!cols"] = colWidths.map((w) => ({
                        wpx: typeof w === "number" ? w : parseInt(w) || 100,
                    }));
                }

                // Terapkan tinggi baris
                if (typeof w.getHeight === "function") {
                    const h = w.getHeight();
                    const rowArr = [];
                    const pushHeight = (rIdx, val) => {
                        const hVal = typeof val === "number" ? val : parseInt(val);
                        if (hVal) rowArr[rIdx] = { hpx: hVal };
                    };
                    if (Array.isArray(h)) {
                        h.forEach((val, rIdx) => val && pushHeight(rIdx, val));
                    } else if (h && typeof h === "object") {
                        Object.entries(h).forEach(([rIdx, val]) =>
                            val && pushHeight(Number(rIdx), val)
                        );
                    }
                    if (rowArr.length > 0) xlsxWs["!rows"] = rowArr;
                }

                // Terapkan merge cells
                if (typeof w.getMerge === "function") {
                    const mergeObj = w.getMerge();
                    if (mergeObj && typeof mergeObj === "object") {
                        const merges = [];
                        Object.entries(mergeObj).forEach(([cellRef, [colspan, rowspan]]) => {
                            const decoded = XLSX.utils.decode_cell(cellRef);
                            if (decoded && (colspan > 1 || rowspan > 1)) {
                                merges.push({
                                    s: { c: decoded.c, r: decoded.r },
                                    e: {
                                        c: decoded.c + (colspan || 1) - 1,
                                        r: decoded.r + (rowspan || 1) - 1,
                                    },
                                });
                            }
                        });
                        if (merges.length > 0) xlsxWs["!merges"] = merges;
                    }
                }

                XLSX.utils.book_append_sheet(wb, xlsxWs, sheetName);
            });

            XLSX.writeFile(wb, "registrasi-paten.xlsx");
            toast.success("File Excel berhasil diekspor", { id: toastId });
        } catch (err) {
            toast.error(err.message || "Gagal mengekspor file Excel", {
                id: toastId,
            });
        } finally {
            setIsExporting(false);
        }
    }, [getActiveWorksheet, isExporting]);

    // Trigger input file saat tombol Import ditekan
    const handleImportClick = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
            fileInputRef.current.click();
        }
    }, []);

    // Proses import file Excel menggunakan TabularJS → JSON native Jspreadsheet
    const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.name.match(/\.(xlsx|xls|ods|csv)$/i)) {
            toast.error("Hanya file Excel (.xlsx, .xls), ODS, atau CSV yang diperbolehkan.");
            return;
        }

        setIsImporting(true);
        const toastId = toast.loading(`Mengimpor "${file.name}"...`);

        try {
            // TabularJS mengonversi file → JSON format native Jspreadsheet
            const result = await tabularjs(file);

            console.log("[TabularJS] result:", result);

            if (!result || !result.worksheets || result.worksheets.length === 0) {
                throw new Error("File tidak memiliki data yang valid.");
            }

            // Mapping output TabularJS ke format currentSheets yang dipakai komponen
            const sheets = result.worksheets.map((ws, idx) => {
                // columns: TabularJS menghasilkan [{title, name, width, type}]
                // Jspreadsheet CE menerima format yang sama, cukup teruskan langsung
                const columns = ws.columns && ws.columns.length > 0 ? ws.columns : null;

                // rows: TabularJS menghasilkan plain object {0:{height}, 1:{height},...}
                // Jspreadsheet CE menerima array [{height}, {height},...] dengan index sesuai posisi
                let rows: unknown[] | null = null;
                if (ws.rows && typeof ws.rows === "object" && !Array.isArray(ws.rows)) {
                    const rowObj = ws.rows as Record<string, { height?: number }>;
                    const keys = Object.keys(rowObj);
                    if (keys.length > 0) {
                        const maxIdx = Math.max(...keys.map(Number));
                        const rowArr: { height: number }[] = [];
                        for (let i = 0; i <= maxIdx; i++) {
                            rowArr.push(rowObj[i] && rowObj[i].height
                                ? { height: rowObj[i].height as number }
                                : { height: 23 });
                        }
                        rows = rowArr;
                    }
                } else if (Array.isArray(ws.rows)) {
                    rows = ws.rows;
                }

                // mergeCells: TabularJS menghasilkan {"A1":[colspan,rowspan]}
                // Jspreadsheet CE menerima format yang sama
                const merge = ws.mergeCells && Object.keys(ws.mergeCells).length > 0
                    ? ws.mergeCells
                    : null;

                // style: TabularJS menghasilkan {"A1":"css-string"}
                const style = ws.style && Object.keys(ws.style).length > 0
                    ? ws.style
                    : null;

                console.log(`[TabularJS] Sheet ${idx} "${ws.worksheetName}":`, {
                    rows: ws.data?.length,
                    cols: ws.data?.[0]?.length,
                    columns: columns?.length,
                    hasRows: !!rows,
                    hasMerge: !!merge,
                    hasStyle: !!style,
                });

                return {
                    name: ws.worksheetName || `Sheet${idx + 1}`,
                    data: ws.data && ws.data.length > 0 ? ws.data : null,
                    columns,
                    rows,
                    merge,
                    style,
                };
            });

            setCurrentSheets(sheets);
            setSpreadsheetKey((prev) => prev + 1);
            toast.success(
                `Berhasil mengimpor ${sheets.length} sheet. Klik Simpan untuk menyimpan ke database.`,
                { id: toastId, duration: 5000 }
            );
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Gagal mengimpor file";
            toast.error(msg, { id: toastId });
        } finally {
            setIsImporting(false);
        }
    }, []);

    const toolbar = useMemo(() => {
        return createCustomToolbar(getActiveWorksheet, handleSave);
    }, [getActiveWorksheet, handleSave]);

    return (
        <>
            <link
                rel="stylesheet"
                href="https://fonts.googleapis.com/icon?family=Material+Icons"
            />
            <Head title="Registrasi PATEN" />

            {/* Tombol Export & Import di seberang tulisan Registrasi PATEN pada header */}
            <HeaderActions>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".xlsx,.xls,.ods,.csv"
                        className="hidden"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleImportClick}
                        disabled={isImporting}
                        className="cursor-pointer gap-1.5 font-medium border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                    >
                        <Upload className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Import Excel</span>
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={isExporting}
                        className="cursor-pointer gap-1.5 font-medium border-emerald-600/30 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/30"
                    >
                        <Download className="size-4 text-emerald-600 dark:text-emerald-400" />
                        <span>Export Excel</span>
                    </Button>
                </div>
            </HeaderActions>

            <div className="p-4">
                <div className="paten-registration-spreadsheet h-[calc(100svh-7rem)] w-full overflow-hidden">
                    <Spreadsheet
                        key={spreadsheetKey}
                        ref={spreadsheet}
                        toolbar={toolbar}
                        tabs={true}
                        allowComments={true}
                        contextMenu={customContextMenu}
                        oncreateworksheet={handleCreateWorksheet}
                    >
                        {currentSheets.map((sheet, index) => (
                            <Worksheet
                                key={index}
                                worksheetName={sheet.name || `Sheet${index + 1}`}
                                data={sheet.data}
                                style={sheet.style}
                                mergeCells={sheet.merge}
                                columns={sheet.columns}
                                rows={sheet.rows}
                                minDimensions={[50, 50]}
                            />
                        ))}
                    </Spreadsheet>
                </div>
            </div>
        </>
    );
}

PatenRegistration.layout = {
    breadcrumbs: [
        {
            title: "Registrasi PATEN",
            href: patenRegistration(),
        },
    ],
};

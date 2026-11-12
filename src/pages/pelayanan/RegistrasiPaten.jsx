import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, Bold, Check, ChevronDown,
  Download, FileSpreadsheet, Grid, Italic, PaintBucket, Plus,
  Redo2, RotateCcw, Strikethrough, Trash2, Type, Underline, Undo2, Upload,
} from "lucide-react";
import { PageHead } from "../../components/ui.jsx";
import { useData } from "../../context/DataContext.jsx";
import { downloadXlsx, colToLetter, evaluateFormula } from "../../lib/xlsx.js";
import { parseCsv } from "../../lib/csv.js";

const TOTAL_ROWS = 100;
const TOTAL_COLS = 20;

export default function RegistrasiPaten({ mode = "editor" }) {
  const isTemplate = mode === "template";
  const {
    sheets: editorSheets,
    setSheets: setEditorSheets,
    patenTemplate,
    setPatenTemplate,
    makeSheet,
  } = useData();

  const currentSheets = isTemplate ? patenTemplate : editorSheets;
  const setWorkbook = isTemplate ? setPatenTemplate : setEditorSheets;

  const [activeTab, setActiveTab] = useState(0);
  const [sel, setSel] = useState({ r: 0, c: 0 });
  const [range, setRange] = useState({ r1: 0, c1: 0, r2: 0, c2: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editInput, setEditInput] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // 'idle' | 'saving' | 'saved'
  const [cellStyles, setCellStyles] = useState({}); // key "sheetIdx:r:c" -> style obj

  // History for undo/redo
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  const fileInputRef = useRef(null);
  const autoSaveTimerRef = useRef(null);
  const gridContainerRef = useRef(null);
  const inlineInputRef = useRef(null);

  const safeSheets = useMemo(() => {
    if (!Array.isArray(currentSheets) || currentSheets.length === 0) {
      return [makeSheet(isTemplate ? "Template PATEN" : "KTP 474.4", TOTAL_ROWS, TOTAL_COLS)];
    }
    return currentSheets.map((s, idx) => {
      const existing = s.cells || [];
      const cells = Array.from({ length: Math.max(TOTAL_ROWS, existing.length) }, (_, r) =>
        Array.from({ length: Math.max(TOTAL_COLS, (existing[r] || []).length) }, (_, c) =>
          existing[r]?.[c] ?? ""
        )
      );
      return { name: s.name || `Sheet${idx + 1}`, cells };
    });
  }, [currentSheets, isTemplate, makeSheet]);

  const activeSheetIndex = Math.min(activeTab, safeSheets.length - 1);
  const activeSheet = safeSheets[activeSheetIndex];

  // Helper to read evaluated cell content
  const getCellValue = useCallback((r, c) => {
    return activeSheet.cells[r]?.[c] ?? "";
  }, [activeSheet]);

  const getDisplayValue = useCallback((r, c) => {
    const raw = getCellValue(r, c);
    return evaluateFormula(raw, getCellValue);
  }, [getCellValue]);

  const activeRawValue = activeSheet.cells[sel.r]?.[sel.c] ?? "";

  // Auto-sync editInput when selection changes and not inline editing
  useEffect(() => {
    if (!isEditing) {
      setEditInput(activeRawValue);
    }
  }, [sel.r, sel.c, activeRawValue, isEditing]);

  // Trigger auto-save to server with debounce
  const triggerAutoSave = useCallback((newSheets) => {
    setSaveStatus("saving");
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    autoSaveTimerRef.current = setTimeout(() => {
      setWorkbook(newSheets);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2500);
    }, 800);
  }, [setWorkbook]);

  const updateCells = useCallback((updater) => {
    // Save to history for undo
    setHistory((prev) => [...prev.slice(-30), safeSheets]);
    setFuture([]);

    const updated = safeSheets.map((s, idx) => {
      if (idx !== activeSheetIndex) return s;
      const nextCells = s.cells.map((row) => [...row]);
      updater(nextCells);
      return { ...s, cells: nextCells };
    });
    triggerAutoSave(updated);
  }, [safeSheets, activeSheetIndex, triggerAutoSave]);

  const setCellVal = (r, c, val) => {
    updateCells((cells) => {
      if (!cells[r]) cells[r] = [];
      cells[r][c] = val;
    });
  };

  // Cell style helpers
  const getStyleKey = (r, c) => `${activeSheetIndex}:${r}:${c}`;
  const getSelectedStyle = () => cellStyles[getStyleKey(sel.r, sel.c)] || {};

  const toggleStyle = (prop, value) => {
    setCellStyles((prev) => {
      const next = { ...prev };
      const minR = Math.min(range.r1, range.r2);
      const maxR = Math.max(range.r1, range.r2);
      const minC = Math.min(range.c1, range.c2);
      const maxC = Math.max(range.c1, range.c2);

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const k = `${activeSheetIndex}:${r}:${c}`;
          const cur = next[k] || {};
          const isToggled = cur[prop] === value;
          next[k] = { ...cur, [prop]: isToggled ? undefined : value };
        }
      }
      return next;
    });
  };

  const setFormatStyle = (prop, value) => {
    setCellStyles((prev) => {
      const next = { ...prev };
      const minR = Math.min(range.r1, range.r2);
      const maxR = Math.max(range.r1, range.r2);
      const minC = Math.min(range.c1, range.c2);
      const maxC = Math.max(range.c1, range.c2);

      for (let r = minR; r <= maxR; r++) {
        for (let c = minC; c <= maxC; c++) {
          const k = `${activeSheetIndex}:${r}:${c}`;
          next[k] = { ...(next[k] || {}), [prop]: value };
        }
      }
      return next;
    });
  };

  // Undo / Redo
  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setFuture((f) => [safeSheets, ...f]);
    triggerAutoSave(prev);
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((f) => f.slice(1));
    setHistory((h) => [...h, safeSheets]);
    triggerAutoSave(next);
  };

  // Header Actions matching friend's project
  const handleClearDocument = useCallback(() => {
    if (!window.confirm("Kosongkan dokumen saat ini? Data yang belum tersimpan akan hilang.")) {
      return;
    }
    const blank = [makeSheet(isTemplate ? "Template PATEN" : "Sheet1", TOTAL_ROWS, TOTAL_COLS)];
    setWorkbook(blank);
    setActiveTab(0);
    setSel({ r: 0, c: 0 });
    setRange({ r1: 0, c1: 0, r2: 0, c2: 0 });
    setCellStyles({});
    setHistory([]);
    setFuture([]);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [isTemplate, makeSheet, setWorkbook]);

  const handleResetToTemplate = useCallback(() => {
    if (!window.confirm("Reset akan menimpa dokumen saat ini dengan template. Lanjutkan?")) {
      return;
    }
    const templateSource = Array.isArray(patenTemplate) && patenTemplate.length > 0
      ? patenTemplate
      : [makeSheet("Registrasi PATEN", TOTAL_ROWS, TOTAL_COLS)];

    setWorkbook(templateSource);
    setActiveTab(0);
    setSel({ r: 0, c: 0 });
    setRange({ r1: 0, c1: 0, r2: 0, c2: 0 });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  }, [patenTemplate, makeSheet, setWorkbook]);

  const handleExportXlsx = useCallback(() => {
    const filename = isTemplate ? "template-paten" : "registrasi-paten";
    downloadXlsx(filename, safeSheets);
  }, [isTemplate, safeSheets]);

  const handleImportFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!window.confirm("Import akan menimpa data workbook saat ini. Lanjutkan?")) {
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        const rows = parseCsv(text.replace(/^\ufeff/, ""));
        if (!rows || rows.length === 0) {
          alert("File tidak memiliki data yang valid.");
          return;
        }
        const maxCols = Math.max(TOTAL_COLS, ...rows.map((r) => r.length));
        const maxRows = Math.max(TOTAL_ROWS, rows.length);
        const cells = Array.from({ length: maxRows }, (_, r) =>
          Array.from({ length: maxCols }, (_, c) => rows[r]?.[c] ?? "")
        );
        const importedSheet = { name: file.name.replace(/\.[^/.]+$/, ""), cells };
        const newSheets = [importedSheet];
        setWorkbook(newSheets);
        setActiveTab(0);
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2500);
      } catch (err) {
        console.error("Gagal mengimpor file:", err);
        alert("Gagal membaca file: " + err.message);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }, [setWorkbook]);

  // Keyboard navigation & Shortcuts
  const handleKeyDown = (e) => {
    if (isEditing) {
      if (e.key === "Enter") {
        e.preventDefault();
        setCellVal(sel.r, sel.c, editInput);
        setIsEditing(false);
        setSel((s) => ({ ...s, r: Math.min(TOTAL_ROWS - 1, s.r + 1) }));
      } else if (e.key === "Escape") {
        setEditInput(activeRawValue);
        setIsEditing(false);
      } else if (e.key === "Tab") {
        e.preventDefault();
        setCellVal(sel.r, sel.c, editInput);
        setIsEditing(false);
        setSel((s) => ({ ...s, c: Math.min(TOTAL_COLS - 1, s.c + 1) }));
      }
      return;
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setSel((s) => {
        const r = Math.max(0, s.r - 1);
        setRange({ r1: r, c1: s.c, r2: r, c2: s.c });
        return { ...s, r };
      });
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSel((s) => {
        const r = Math.min(TOTAL_ROWS - 1, s.r + 1);
        setRange({ r1: r, c1: s.c, r2: r, c2: s.c });
        return { ...s, r };
      });
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setSel((s) => {
        const c = Math.max(0, s.c - 1);
        setRange({ r1: s.r, c1: c, r2: s.r, c2: c });
        return { ...s, c };
      });
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setSel((s) => {
        const c = Math.min(TOTAL_COLS - 1, s.c + 1);
        setRange({ r1: s.r, c1: c, r2: s.r, c2: c });
        return { ...s, c };
      });
    } else if (e.key === "Tab") {
      e.preventDefault();
      setSel((s) => {
        const c = Math.min(TOTAL_COLS - 1, s.c + 1);
        setRange({ r1: s.r, c1: c, r2: s.r, c2: c });
        return { ...s, c };
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      setIsEditing(true);
      setTimeout(() => inlineInputRef.current?.focus(), 10);
    } else if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      setCellVal(sel.r, sel.c, "");
      setEditInput("");
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      setIsEditing(true);
      setEditInput(e.key);
      setCellVal(sel.r, sel.c, e.key);
      setTimeout(() => inlineInputRef.current?.focus(), 10);
    }
  };

  // Sheet tab manipulation
  const addSheetTab = () => {
    const name = window.prompt("Nama lembar kerja baru:")?.trim();
    if (!name) return;
    const newSheet = makeSheet(name, TOTAL_ROWS, TOTAL_COLS);
    const updated = [...safeSheets, newSheet];
    triggerAutoSave(updated);
    setActiveTab(updated.length - 1);
  };

  const removeSheetTab = (idx, e) => {
    e.stopPropagation();
    if (safeSheets.length <= 1) {
      alert("Tidak dapat menghapus lembar kerja terakhir.");
      return;
    }
    if (!window.confirm(`Hapus lembar kerja "${safeSheets[idx].name}"?`)) return;
    const updated = safeSheets.filter((_, i) => i !== idx);
    triggerAutoSave(updated);
    setActiveTab(Math.max(0, idx - 1));
  };

  const renameSheetTab = (idx) => {
    const currentName = safeSheets[idx].name;
    const newName = window.prompt("Ganti nama lembar kerja:", currentName)?.trim();
    if (!newName || newName === currentName) return;
    const updated = safeSheets.map((s, i) => (i === idx ? { ...s, name: newName } : s));
    triggerAutoSave(updated);
  };

  // Selection statistics
  const selectionStats = useMemo(() => {
    const minR = Math.min(range.r1, range.r2);
    const maxR = Math.max(range.r1, range.r2);
    const minC = Math.min(range.c1, range.c2);
    const maxC = Math.max(range.c1, range.c2);
    let count = 0;
    let sum = 0;
    let numCount = 0;

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const val = getCellValue(r, c);
        if (val !== undefined && val !== null && String(val).trim() !== "") {
          count++;
          const num = parseFloat(val);
          if (!isNaN(num)) {
            sum += num;
            numCount++;
          }
        }
      }
    }
    return {
      count,
      sum: numCount > 0 ? sum : null,
      avg: numCount > 0 ? (sum / numCount).toFixed(2) : null,
    };
  }, [range, getCellValue]);

  const activeStyle = getSelectedStyle();

  return (
    <div className="paten-workspace" onKeyDown={handleKeyDown} tabIndex={0}>
      {/* Top Page Header & Actions */}
      <PageHead
        crumbs={["Registrasi PATEN", isTemplate ? "Template" : "Editor"]}
        title={isTemplate ? "Template PATEN" : "Editor Registrasi PATEN"}
      >
        <button
          type="button"
          className="btn btn--outline"
          onClick={handleClearDocument}
          title="Kosongkan dokumen saat ini"
        >
          Kosongkan dokumen
        </button>

        {!isTemplate && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleResetToTemplate}
            title="Reset lembar kerja ke template standar"
          >
            <RotateCcw size={15} />
            Reset ke template
          </button>
        )}

        <button
          type="button"
          className="btn btn--outline"
          onClick={() => fileInputRef.current?.click()}
          title="Impor spreadsheet (.xlsx atau .csv)"
        >
          <Upload size={15} />
          Impor (.xlsx)
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,.csv,text/csv"
          hidden
          onChange={handleImportFile}
        />

        <button
          type="button"
          className="btn btn--outline"
          onClick={handleExportXlsx}
          title="Unduh sebagai file Excel (.xlsx)"
        >
          <Download size={15} />
          Ekspor (.xlsx)
        </button>
      </PageHead>

      {/* Spreadsheet Main Container */}
      <div className="sheet-container">
        {/* Ribbon Toolbar */}
        <div className="sheet-ribbon" role="toolbar" aria-label="Alat Spreadsheet">
          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-btn"
              onClick={handleUndo}
              disabled={history.length === 0}
              title="Urungkan (Undo)"
            >
              <Undo2 size={15} />
            </button>
            <button
              type="button"
              className="ribbon-btn"
              onClick={handleRedo}
              disabled={future.length === 0}
              title="Ulangi (Redo)"
            >
              <Redo2 size={15} />
            </button>
          </div>

          <div className="ribbon-divider" />

          {/* Font & Size */}
          <div className="ribbon-group">
            <select
              className="ribbon-select font-family-select"
              value={activeStyle.fontFamily || "Inter"}
              onChange={(e) => setFormatStyle("fontFamily", e.target.value)}
              title="Pilih Huruf"
            >
              <option value="Inter">Inter</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>

            <select
              className="ribbon-select font-size-select"
              value={activeStyle.fontSize || "12"}
              onChange={(e) => setFormatStyle("fontSize", e.target.value)}
              title="Ukuran Huruf"
            >
              <option value="10">10</option>
              <option value="11">11</option>
              <option value="12">12</option>
              <option value="14">14</option>
              <option value="16">16</option>
              <option value="18">18</option>
            </select>
          </div>

          <div className="ribbon-divider" />

          {/* Text Styling */}
          <div className="ribbon-group">
            <button
              type="button"
              className={`ribbon-btn ${activeStyle.bold ? "is-active" : ""}`}
              onClick={() => toggleStyle("bold", true)}
              title="Tebal (Bold)"
            >
              <Bold size={15} />
            </button>
            <button
              type="button"
              className={`ribbon-btn ${activeStyle.italic ? "is-active" : ""}`}
              onClick={() => toggleStyle("italic", true)}
              title="Miring (Italic)"
            >
              <Italic size={15} />
            </button>
            <button
              type="button"
              className={`ribbon-btn ${activeStyle.underline ? "is-active" : ""}`}
              onClick={() => toggleStyle("underline", true)}
              title="Garis Bawah (Underline)"
            >
              <Underline size={15} />
            </button>
            <button
              type="button"
              className={`ribbon-btn ${activeStyle.strike ? "is-active" : ""}`}
              onClick={() => toggleStyle("strike", true)}
              title="Coret (Strikethrough)"
            >
              <Strikethrough size={15} />
            </button>
          </div>

          <div className="ribbon-divider" />

          {/* Colors */}
          <div className="ribbon-group">
            <label className="ribbon-color-wrap" title="Warna Teks">
              <Type size={15} />
              <input
                type="color"
                className="ribbon-color-picker"
                value={activeStyle.color || "#000000"}
                onChange={(e) => setFormatStyle("color", e.target.value)}
              />
            </label>
            <label className="ribbon-color-wrap" title="Warna Latar Sel">
              <PaintBucket size={15} />
              <input
                type="color"
                className="ribbon-color-picker"
                value={activeStyle.bgColor || "#ffffff"}
                onChange={(e) => setFormatStyle("bgColor", e.target.value)}
              />
            </label>
          </div>

          <div className="ribbon-divider" />

          {/* Alignment */}
          <div className="ribbon-group">
            <button
              type="button"
              className={`ribbon-btn ${activeStyle.align === "left" ? "is-active" : ""}`}
              onClick={() => setFormatStyle("align", "left")}
              title="Rata Kiri"
            >
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              className={`ribbon-btn ${activeStyle.align === "center" ? "is-active" : ""}`}
              onClick={() => setFormatStyle("align", "center")}
              title="Rata Tengah"
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              className={`ribbon-btn ${activeStyle.align === "right" ? "is-active" : ""}`}
              onClick={() => setFormatStyle("align", "right")}
              title="Rata Kanan"
            >
              <AlignRight size={15} />
            </button>
          </div>

          <div className="ribbon-divider" />

          {/* Borders & Grid */}
          <div className="ribbon-group">
            <button
              type="button"
              className={`ribbon-btn ${activeStyle.border === "all" ? "is-active" : ""}`}
              onClick={() => toggleStyle("border", "all")}
              title="Beri Batas Sel (All Borders)"
            >
              <Grid size={15} />
            </button>
          </div>

          {/* Formula shortcut helpers */}
          <div className="ribbon-group">
            <button
              type="button"
              className="ribbon-btn ribbon-formula-btn"
              onClick={() => {
                const s = `${colToLetter(sel.c)}1:${colToLetter(sel.c)}${Math.max(1, sel.r)}`;
                const formula = `=SUM(${s})`;
                setEditInput(formula);
                setCellVal(sel.r, sel.c, formula);
              }}
              title="Sisipkan Rumus =SUM()"
            >
              <span className="fx-symbol">∑</span> SUM
            </button>
          </div>

          {/* Auto-save Status Indicator */}
          <div className="ribbon-status-indicator">
            {saveStatus === "saving" && (
              <span className="save-badge saving">Menyimpan...</span>
            )}
            {saveStatus === "saved" && (
              <span className="save-badge saved">
                <Check size={12} /> Tersimpan
              </span>
            )}
            {saveStatus === "idle" && (
              <span className="save-badge idle">Tersimpan otomatis</span>
            )}
          </div>
        </div>

        {/* Formula Bar */}
        <div className="sheet-formula-bar">
          <div className="formula-cell-name">
            {colToLetter(sel.c)}{sel.r + 1}
          </div>
          <div className="formula-fx-label">fx</div>
          <input
            type="text"
            className="formula-input"
            value={editInput}
            placeholder="Ketik nilai atau rumus (contoh: =SUM(A1:A5))"
            onChange={(e) => {
              setEditInput(e.target.value);
              setCellVal(sel.r, sel.c, e.target.value);
            }}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                gridContainerRef.current?.focus();
              }
            }}
          />
        </div>

        {/* Spreadsheet Grid Table */}
        <div className="sheet-grid-wrapper" ref={gridContainerRef}>
          <table className="sheet-grid-table">
            <thead>
              <tr>
                <th className="corner-header"></th>
                {Array.from({ length: TOTAL_COLS }).map((_, c) => (
                  <th
                    key={c}
                    className={`col-header ${sel.c === c ? "is-active-col" : ""}`}
                    onClick={() => {
                      setSel({ r: 0, c });
                      setRange({ r1: 0, c1: c, r2: TOTAL_ROWS - 1, c2: c });
                    }}
                  >
                    {colToLetter(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: TOTAL_ROWS }).map((_, r) => (
                <tr key={r}>
                  <th
                    className={`row-header ${sel.r === r ? "is-active-row" : ""}`}
                    onClick={() => {
                      setSel({ r, c: 0 });
                      setRange({ r1: r, c1: 0, r2: r, c2: TOTAL_COLS - 1 });
                    }}
                  >
                    {r + 1}
                  </th>
                  {Array.from({ length: TOTAL_COLS }).map((_, c) => {
                    const isSelected = sel.r === r && sel.c === c;
                    const inRange =
                      r >= Math.min(range.r1, range.r2) &&
                      r <= Math.max(range.r1, range.r2) &&
                      c >= Math.min(range.c1, range.c2) &&
                      c <= Math.max(range.c1, range.c2);

                    const style = cellStyles[getStyleKey(r, c)] || {};
                    const displayVal = getDisplayValue(r, c);

                    return (
                      <td
                        key={c}
                        className={[
                          "grid-cell",
                          isSelected ? "is-selected-cell" : "",
                          inRange && !isSelected ? "is-in-range" : "",
                          style.border === "all" ? "has-border" : "",
                        ].filter(Boolean).join(" ")}
                        style={{
                          fontWeight: style.bold ? "bold" : "normal",
                          fontStyle: style.italic ? "italic" : "normal",
                          textDecoration: [
                            style.underline ? "underline" : "",
                            style.strike ? "line-through" : "",
                          ].filter(Boolean).join(" ") || undefined,
                          color: style.color || undefined,
                          backgroundColor: style.bgColor || undefined,
                          textAlign: style.align || (c === 0 ? "center" : "left"),
                          fontFamily: style.fontFamily || undefined,
                          fontSize: style.fontSize ? `${style.fontSize}px` : undefined,
                        }}
                        onClick={() => {
                          setSel({ r, c });
                          setRange({ r1: r, c1: c, r2: r, c2: c });
                          setIsEditing(false);
                        }}
                        onDoubleClick={() => {
                          setSel({ r, c });
                          setRange({ r1: r, c1: c, r2: r, c2: c });
                          setIsEditing(true);
                          setTimeout(() => inlineInputRef.current?.focus(), 10);
                        }}
                      >
                        {isSelected && isEditing ? (
                          <input
                            ref={inlineInputRef}
                            className="inline-cell-input"
                            value={editInput}
                            onChange={(e) => {
                              setEditInput(e.target.value);
                              setCellVal(r, c, e.target.value);
                            }}
                            onBlur={() => setIsEditing(false)}
                          />
                        ) : (
                          <span className="cell-content">{displayVal}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Bottom Sheet Tabs Bar & Selection Summary */}
        <div className="sheet-bottom-bar">
          <div className="sheet-tabs-list">
            {safeSheets.map((s, idx) => (
              <div
                key={idx}
                className={`sheet-tab-item ${idx === activeSheetIndex ? "is-active" : ""}`}
                onClick={() => {
                  setActiveTab(idx);
                  setSel({ r: 0, c: 0 });
                  setRange({ r1: 0, c1: 0, r2: 0, c2: 0 });
                }}
                onDoubleClick={() => renameSheetTab(idx)}
                title="Klik untuk memilih, klik ganda untuk mengubah nama"
              >
                <FileSpreadsheet size={13} />
                <span>{s.name}</span>
                {safeSheets.length > 1 && (
                  <button
                    type="button"
                    className="sheet-tab-close"
                    onClick={(e) => removeSheetTab(idx, e)}
                    title="Hapus lembar kerja"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="sheet-tab-add-btn"
              onClick={addSheetTab}
              title="Tambah Lembar Kerja Baru"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="sheet-selection-stats">
            <span className="stat-item">Sel: {colToLetter(sel.c)}{sel.r + 1}</span>
            {selectionStats.count > 0 && (
              <span className="stat-item">Jumlah: {selectionStats.count}</span>
            )}
            {selectionStats.sum !== null && (
              <span className="stat-item">Total: {selectionStats.sum}</span>
            )}
            {selectionStats.avg !== null && (
              <span className="stat-item">Rata-rata: {selectionStats.avg}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

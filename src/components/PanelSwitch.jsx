import { Eye } from "lucide-react";

export default function PanelSwitch({
  activePanel,
  setActivePanel,
  shortcut,
  isRecordingShortcut,
  setIsRecordingShortcut,
  editorLabel = "Editor",
}) {
  return (
    <div className="editor-switch-row">
      <div className="editor-switch" role="tablist" aria-label="Pilih tampilan">
        <button
          type="button"
          role="tab"
          aria-selected={activePanel === "editor"}
          className={activePanel === "editor" ? "is-active" : ""}
          onClick={() => setActivePanel("editor")}
        >
          {editorLabel}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activePanel === "preview"}
          className={activePanel === "preview" ? "is-active" : ""}
          onClick={() => setActivePanel("preview")}
        >
          <Eye size={16} />Preview
        </button>
      </div>
      <button
        type="button"
        className="editor-shortcut"
        onClick={() => setIsRecordingShortcut(true)}
        title="Pilih kombinasi tombol shortcut"
      >
        {isRecordingShortcut ? "Tekan shortcut…" : `Shortcut: ${shortcut}`}
      </button>
      {isRecordingShortcut && (
        <span className="editor-shortcut-hint">Gunakan kombinasi dengan Ctrl, Alt, Shift, atau Meta. Esc untuk batal.</span>
      )}
    </div>
  );
}

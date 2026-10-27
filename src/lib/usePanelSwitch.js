import { useEffect, useState } from "react";

const STORAGE_KEY = "simpel.editor-preview-shortcut";
const DEFAULT_SHORTCUT = "Alt+Shift+P";

function shortcutFromEvent(event) {
  const modifiers = [
    event.ctrlKey && "Ctrl",
    event.altKey && "Alt",
    event.shiftKey && "Shift",
    event.metaKey && "Meta",
  ].filter(Boolean);
  if (!modifiers.length || ["CONTROL", "ALT", "SHIFT", "META"].includes(event.key.toUpperCase())) return "";
  return [...modifiers, event.key.toUpperCase()].join("+");
}

export function usePanelSwitch() {
  const [activePanel, setActivePanel] = useState("editor");
  const [shortcut, setShortcut] = useState(() => localStorage.getItem(STORAGE_KEY) || DEFAULT_SHORTCUT);
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false);

  useEffect(() => {
    function onKeyDown(event) {
      if (isRecordingShortcut) {
        event.preventDefault();
        event.stopPropagation();
        if (event.key === "Escape") {
          setIsRecordingShortcut(false);
          return;
        }
        const nextShortcut = shortcutFromEvent(event);
        if (nextShortcut) {
          localStorage.setItem(STORAGE_KEY, nextShortcut);
          setShortcut(nextShortcut);
          setIsRecordingShortcut(false);
        }
        return;
      }

      if (shortcutFromEvent(event) === shortcut) {
        event.preventDefault();
        setActivePanel((current) => current === "editor" ? "preview" : "editor");
      }
    }

    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [isRecordingShortcut, shortcut]);

  return { activePanel, setActivePanel, shortcut, isRecordingShortcut, setIsRecordingShortcut };
}

import { useEffect, useState } from "react";

export function usePersistedState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) return JSON.parse(raw);
    } catch {
      /* abaikan */
    }
    return typeof initial === "function" ? initial() : initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* abaikan */
    }
  }, [key, value]);
  return [value, setValue];
}

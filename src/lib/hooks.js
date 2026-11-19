import { useEffect, useState } from "react";

export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(key));
      return saved && typeof saved === "object" && !Array.isArray(saved)
        ? { ...initial, ...saved }
        : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Calculators still work without storage. */
    }
  }, [key, value]);
  return [value, setValue];
}

export function downloadText(
  filename,
  content,
  type = "text/plain;charset=utf-8",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

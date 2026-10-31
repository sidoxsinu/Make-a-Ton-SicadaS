"use client";

import React, { createContext, useContext, useState, useCallback } from "react";

export interface ToastMessage {
  id: string;
  type: "success" | "error";
  text: string;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
  remove: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const remove = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const success = useCallback(
    (text: string) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { id, type: "success", text }]);
      setTimeout(() => {
        remove(id);
      }, 6000);
    },
    [remove]
  );

  const error = useCallback((text: string) => {
    const id = Math.random().toString(36).slice(2);
    // Errors stay until closed
    setToasts((prev) => [...prev, { id, type: "error", text }]);
  }, []);

  return (
    <ToastContext.Provider value={{ success, error, remove }}>
      {children}
      {/* Toast viewport: bottom left */}
      <div
        className="fixed bottom-4 left-4 z-50 flex flex-col gap-2 max-w-[420px] pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto p-3.5 bg-sheet rounded-sm border flex items-start justify-between gap-4 text-[13px] font-sans ${
              t.type === "error"
                ? "border-bad text-bad"
                : "border-ink text-ink"
            }`}
          >
            <div className="flex-1 leading-normal break-words">{t.text}</div>
            <button
              type="button"
              onClick={() => remove(t.id)}
              className="text-[12px] font-sans underline decoration-1 opacity-70 hover:opacity-100 select-none shrink-0"
            >
              Close
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

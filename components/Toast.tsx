"use client";

import React, { useEffect, useState } from "react";

interface ToastMessage {
  id: string;
  message: string;
  type: "success" | "error" | "info";
}

let toastCounter = 0;
let addToastExternal: ((message: string, type: "success" | "error" | "info") => void) | null = null;

export const toast = {
  success: (message: string) => {
    if (addToastExternal) {
      addToastExternal(message, "success");
    }
  },
  error: (message: string) => {
    if (addToastExternal) {
      addToastExternal(message, "error");
    }
  },
  info: (message: string) => {
    if (addToastExternal) {
      addToastExternal(message, "info");
    }
  },
};

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    addToastExternal = (message: string, type: "success" | "error" | "info") => {
      const id = `toast-${toastCounter++}`;
      setToasts((prev) => [...prev, { id, message, type }]);

      // Auto remove after 3 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, 3000);
    };

    return () => {
      addToastExternal = null;
    };
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 ${
            toast.type === "success"
              ? "bg-green-500 text-white"
              : toast.type === "error"
              ? "bg-red-500 text-white"
              : "bg-blue-500 text-white"
          }`}
        >
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
              className="ml-auto text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
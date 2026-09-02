import React from "react";
import { AlertCircle } from "lucide-react";

export default function ConfirmDelete({ label, busy, onCancel, onConfirm }) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm backdrop-blur-xl bg-red-500/10 dark:bg-red-500/20 border border-red-500/30 shadow-lg"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <AlertCircle size={16} className="text-red-500 shrink-0" />
      <span className="text-slate-900 dark:text-slate-100 font-medium truncate">Delete "{label}"?</span>
      <button
        onClick={onConfirm}
        disabled={busy}
        className="ml-auto px-3 py-1 rounded-xl text-xs font-semibold bg-red-600 text-white hover:bg-red-500 disabled:opacity-50 transition shadow-md shadow-red-500/20 cursor-pointer"
      >
        {busy ? "Deleting…" : "Delete"}
      </button>
      <button
        onClick={onCancel}
        disabled={busy}
        className="px-3 py-1 rounded-xl text-xs text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );
}
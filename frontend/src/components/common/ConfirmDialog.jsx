import React from "react";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45 p-4 animate-[overlayIn_0.15s_ease-out]">
      <div className="w-full max-w-sm rounded-xl bg-[#1A1F2B] border border-gray-800 p-6 shadow-2xl animate-[modalIn_0.2s_ease-out]">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        {message && <p className="mt-2 text-sm text-gray-400">{message}</p>}

        <div className="mt-5 flex items-center justify-end gap-2.5">
          <button
            onClick={onCancel}
            className="rounded-lg border border-gray-700 bg-transparent px-3.5 py-2 text-sm font-medium text-gray-300 transition-all duration-150 hover:bg-white/5 hover:border-gray-600 active:scale-[0.97]"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-lg px-3.5 py-2 text-sm font-medium text-white transition-all duration-150 active:scale-[0.97] ${
              danger
                ? 'bg-rose-600 hover:bg-rose-500'
                : 'bg-indigo-600 hover:bg-indigo-500'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
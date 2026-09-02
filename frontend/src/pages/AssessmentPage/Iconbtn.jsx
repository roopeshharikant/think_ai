import React from "react";

export default function IconBtn({ onClick, title, tone = "default", disabled, children }) {
  const toneClasses =
    tone === "danger"
      ? "text-red-500 hover:bg-red-500/10"
      : tone === "accent"
        ? "text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
        : "text-slate-500 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5";
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-1.5 rounded-lg transition-colors disabled:opacity-40 cursor-pointer ${toneClasses}`}
    >
      {children}
    </button>
  );
}
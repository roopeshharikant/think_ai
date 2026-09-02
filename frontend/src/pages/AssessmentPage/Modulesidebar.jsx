import React from "react";

export default function ModuleSidebar({ modules, selectedModuleId, onSelectModule }) {
  return (
    <div className="lg:col-span-4 space-y-4">
      <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800/80 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-slate-700 dark:text-slate-300 mb-4">
          Modules (Select to view Assessments)
        </h2>

        <div className="space-y-2.5">
          {Array.isArray(modules) && modules.map((m, i) => (
            <button
              key={m.id}
              onClick={() => onSelectModule(m.id)}
              className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all duration-300 backdrop-blur-md cursor-pointer ${selectedModuleId === m.id
                ? "bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/25 border border-white/20 font-medium"
                : "bg-white/40 dark:bg-slate-800/40 hover:bg-white/70 dark:hover:bg-slate-800/70 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 shadow-sm"
                }`}
            >
              <span
                className={`text-xs font-semibold rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-mono ${selectedModuleId === m.id
                  ? "bg-white/20 text-white"
                  : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                  }`}
              >
                {i + 1}
              </span>
              <span className="flex-1 min-w-0 text-xs font-semibold truncate">{m.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
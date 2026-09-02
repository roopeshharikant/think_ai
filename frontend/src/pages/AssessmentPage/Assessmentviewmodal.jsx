import React from "react";
import { X, CheckCircle } from "lucide-react";

export default function AssessmentViewModal({ assessment, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div
        className="w-full max-w-3xl p-6 rounded-3xl bg-white dark:bg-[#1a1e2b] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 relative text-slate-900 dark:text-slate-100 max-h-[85vh] overflow-y-auto"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">
              {assessment.type || "MCQ"} Assessment Details
            </span>
            <h3 className="text-xl font-bold font-fraunces mt-1">{assessment.title}</h3>
            {assessment.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{assessment.description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Marks</span>
            <p className="text-sm font-bold font-mono">{assessment.totalMarks}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Duration</span>
            <p className="text-sm font-bold font-mono">{assessment.duration ? `${assessment.duration} mins` : 'N/A'}</p>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Questions</span>
            <p className="text-sm font-bold font-mono">{assessment.questions?.length || 0}</p>
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-500">Question Bank</h4>

          {assessment.questions?.length > 0 ? (
            assessment.questions.map((q, qIdx) => (
              <div key={qIdx} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      Q{qIdx + 1} ({q.questionType || 'MCQ'})
                    </span>
                    <h5 className="text-sm font-semibold text-slate-900 dark:text-white">{q.questionText}</h5>
                  </div>
                  <span className="text-xs font-mono font-semibold text-slate-400 shrink-0">
                    {q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}
                  </span>
                </div>

                {/* Dynamically render Coding problem info or MCQ options based on questionType */}
                {q.questionType === "CODING" ? (
                  <div className="space-y-3 pl-2 text-xs">
                    {q.problemStatement && (
                      <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <strong className="block text-[11px] font-mono text-emerald-600 dark:text-emerald-400 mb-1">Problem Statement:</strong>
                        <p className="whitespace-pre-line">{q.problemStatement}</p>
                      </div>
                    )}

                    <div className="p-3 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] space-y-1">
                      <p className="text-emerald-400 font-bold">Configured Test Cases ({q.codingTestCases?.length || 0}):</p>
                      {q.codingTestCases?.map((tc, tcIdx) => (
                        <div key={tcIdx} className="border-t border-slate-800 pt-1.5 flex flex-col gap-0.5">
                          <span className="text-slate-400">#Test Case {tcIdx + 1} {tc.isHidden && '(Hidden)'}</span>
                          <span>Input: <code className="text-amber-300">{tc.input || 'None'}</code></span>
                          <span>Expected: <code className="text-emerald-300">{tc.expectedOutput}</code></span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-7">
                    {q.options?.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs border ${opt.isCorrect
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium'
                          : 'bg-white/50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          }`}
                      >
                        {opt.isCorrect && <CheckCircle size={14} className="text-emerald-500 shrink-0" />}
                        <span className="truncate">{opt.optionText || `Option ${oIdx + 1}`}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-400 text-center py-6">No questions added to this assessment yet.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-emerald-600 to-green-600 shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-green-500 transition cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
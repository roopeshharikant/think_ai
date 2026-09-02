import React, { useState } from "react";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { toast } from "react-toastify";

export default function AssessmentForm({ initial, saving, onCancel, onSave }) {
  const [title, setTitle] = useState(initial?.title || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [assessmentType, setAssessmentType] = useState(initial?.type || "MCQ");
  const [duration, setDuration] = useState(initial?.duration || 30);
  const [totalMarks, setTotalMarks] = useState(initial?.totalMarks || 10);

  const [questions, setQuestions] = useState(
    initial?.questions && initial.questions.length > 0
      ? initial.questions.map(q => ({
        questionText: q.questionText || "",
        marks: q.marks || 1,
        questionType: q.questionType || initial?.type || "MCQ",
        // Map coding specific fields
        problemStatement: q.problemStatement || "",
        inputFormat: q.inputFormat || "",
        outputFormat: q.outputFormat || "",
        constraints: q.constraints || "",
        explanation: q.explanation || "",
        supportedLanguages: q.supportedLanguages || ["python", "javascript", "java", "cpp"],
        starterCode: q.starterCode || { java: "public class Main {}" },
        // Map options if MCQ
        options: q.options || [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
        // Map test cases if coding (checks both testCases and codingTestCases from backend)
        testCases: (q.testCases || q.codingTestCases || []).length > 0
          ? (q.testCases || q.codingTestCases).map(tc => ({
            input: tc.input || "",
            expectedOutput: tc.expectedOutput || "",
            marks: tc.marks || 1,
            isHidden: !!tc.isHidden
          }))
          : [{ input: "", expectedOutput: "", marks: 1, isHidden: false }]
      }))
      : [
        {
          questionText: "",
          marks: 1,
          questionType: initial?.type || "MCQ",
          problemStatement: "",
          inputFormat: "",
          outputFormat: "",
          constraints: "",
          explanation: "",
          options: [
            { optionText: "", isCorrect: true },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
            { optionText: "", isCorrect: false },
          ],
          testCases: [{ input: "", expectedOutput: "", marks: 1, isHidden: false }]
        },
      ]
  );

  const handleAssessmentTypeChange = (newType) => {
    setAssessmentType(newType);
    setQuestions(prev => prev.map(q => ({
      ...q,
      questionType: newType
    })));
  };

  const handleQuestionChange = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const handleOptionChange = (qIndex, oIndex, field, value) => {
    const updated = [...questions];
    if (field === "isCorrect") {
      updated[qIndex].options = updated[qIndex].options.map((opt, i) => ({
        ...opt,
        isCorrect: i === oIndex,
      }));
    } else {
      updated[qIndex].options[oIndex][field] = value;
    }
    setQuestions(updated);
  };

  const handleTestCaseChange = (qIndex, tcIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex].testCases[tcIndex][field] = value;
    setQuestions(updated);
  };

  const addTestCase = (qIndex) => {
    const updated = [...questions];
    if (!updated[qIndex].testCases) updated[qIndex].testCases = [];
    updated[qIndex].testCases.push({ input: "", expectedOutput: "", marks: 1, isHidden: false });
    setQuestions(updated);
  };

  const removeTestCase = (qIndex, tcIndex) => {
    const updated = [...questions];
    if (updated[qIndex].testCases.length === 1) return;
    updated[qIndex].testCases = updated[qIndex].testCases.filter((_, i) => i !== tcIndex);
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: "",
        marks: 1,
        questionType: assessmentType,
        options: [
          { optionText: "", isCorrect: true },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
          { optionText: "", isCorrect: false },
        ],
        testCases: [{ input: "", expectedOutput: "", marks: 1, isHidden: false }]
      },
    ]);
  };

  const removeQuestion = (qIndex) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== qIndex));
  };

  const handleSubmit = () => {
    const validQuestions = questions
      .filter(q => q.questionText && q.questionText.trim() !== "")
      .map(q => ({
        title: q.title || title.trim(),
        questionText: q.questionText.trim(),
        questionType: assessmentType,
        difficulty: q.difficulty || "EASY",
        marks: Number(q.marks) || 1,
        order: Number(q.order) || 1,
        // Include coding specific fields if it's a CODING assessment
        ...(assessmentType === "CODING" ? {
          problemStatement: q.problemStatement || "",
          inputFormat: q.inputFormat || "",
          outputFormat: q.outputFormat || "",
          constraints: q.constraints || "",
          explanation: q.explanation || "",
          examples: q.examples || [],
          supportedLanguages: q.supportedLanguages || ["python", "javascript", "java", "cpp"],
          starterCode: q.starterCode || { java: "public class Main {}" },
          testCases: (q.testCases || []).map(tc => ({
            input: tc.input || "",
            expectedOutput: tc.expectedOutput || "",
            marks: Number(tc.marks) || 1,
            isHidden: !!tc.isHidden
          }))
        } : {
          options: (q.options || []).filter(opt => opt.optionText && opt.optionText.trim() !== "")
        })
      }));

    if (validQuestions.length === 0) {
      toast.error("Please add at least one complete question.", { theme: "dark" });
      return;
    }

    const durationValue = Math.trunc(Number(duration));
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      toast.error("Duration must be a positive number of minutes.", { theme: "dark" });
      return;
    }

    const totalMarksValue = Math.trunc(Number(totalMarks));
    if (!Number.isFinite(totalMarksValue) || totalMarksValue <= 0) {
      toast.error("Total marks must be a positive number.", { theme: "dark" });
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      type: assessmentType,
      totalMarks: totalMarksValue,
      duration: durationValue,
      questions: validQuestions,
    });
  };

  return (
    <div
      className="p-6 rounded-3xl space-y-6 backdrop-blur-2xl bg-white/80 dark:bg-[#1a1e2b]/90 border border-white/40 dark:border-slate-700/60 shadow-2xl transition-all max-h-[80vh] overflow-y-auto"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <h3 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
        {initial ? "Edit Assessment" : "Create New Assessment"}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Assessment Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Java Fundamentals Quiz"
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Assessment Type
          </label>
          <select
            value={assessmentType}
            onChange={(e) => handleAssessmentTypeChange(e.target.value)}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
          >
            <option value="MCQ">MCQ Assessment</option>
            <option value="CODING">Coding Assessment</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Total Marks
          </label>
          <input
            type="number"
            value={totalMarks}
            onChange={(e) => setTotalMarks(Number(e.target.value))}
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
        <div>
          <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
            Duration (Minutes)
          </label>
          <input
            type="number"
            min={1}
            step={1}
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="e.g. 30"
            className="mt-1.5 w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500 bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500 dark:text-slate-400 font-mono">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief details regarding this assessment..."
          rows={2}
          className="mt-1.5 w-full px-4 py-2.5 rounded-xl border text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
        />
      </div>

      <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300">
            Questions ({assessmentType === "MCQ" ? "Multiple Choice Options" : "Coding Problem & Test Cases"})
          </h4>
          <button
            type="button"
            onClick={addQuestion}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Question
          </button>
        </div>

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">Q{qIndex + 1}</span>
              <select
                value={q.questionType || assessmentType}
                onChange={(e) => handleQuestionChange(qIndex, "questionType", e.target.value)}
                className="px-3 py-2 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white cursor-pointer"
              >
                <option value="MCQ">MCQ</option>
                <option value="CODING">CODING</option>
              </select>
              <input
                value={q.questionText}
                onChange={(e) => handleQuestionChange(qIndex, "questionText", e.target.value)}
                placeholder="Enter question statement..."
                className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="number"
                value={q.marks}
                onChange={(e) => handleQuestionChange(qIndex, "marks", Number(e.target.value))}
                placeholder="Marks"
                className="w-20 px-3 py-2 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(qIndex)}
                  className="p-2 text-red-500 hover:bg-red-500/10 rounded-xl transition cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {(q.questionType || assessmentType) === "CODING" ? (
              <div className="space-y-3 pt-2 pl-4">
                <textarea
                  value={q.problemStatement || ""}
                  onChange={(e) => handleQuestionChange(qIndex, "problemStatement", e.target.value)}
                  placeholder="Problem description / input-output specifications..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white resize-none"
                />

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">Test Cases</span>
                    <button
                      type="button"
                      onClick={() => addTestCase(qIndex)}
                      className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/20 transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Test Case
                    </button>
                  </div>

                  {q.testCases?.map((tc, tcIndex) => (
                    <div key={tcIndex} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-slate-100 dark:bg-slate-900/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                      <input
                        value={tc.input || ""}
                        onChange={(e) => handleTestCaseChange(qIndex, tcIndex, "input", e.target.value)}
                        placeholder="Input (stdin)"
                        className="sm:col-span-4 px-3 py-1.5 rounded-lg border text-xs outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      />
                      <input
                        value={tc.expectedOutput || ""}
                        onChange={(e) => handleTestCaseChange(qIndex, tcIndex, "expectedOutput", e.target.value)}
                        placeholder="Expected Output"
                        className="sm:col-span-4 px-3 py-1.5 rounded-lg border text-xs outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                      />
                      <input
                        type="number"
                        value={tc.marks || 1}
                        onChange={(e) => handleTestCaseChange(qIndex, tcIndex, "marks", Number(e.target.value))}
                        placeholder="Marks"
                        className="sm:col-span-2 px-3 py-1.5 rounded-lg border text-xs outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                      />
                      <div className="sm:col-span-2 flex items-center justify-between gap-1">
                        <label className="text-[10px] font-mono flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={tc.isHidden || false}
                            onChange={(e) => handleTestCaseChange(qIndex, tcIndex, "isHidden", e.target.checked)}
                            className="accent-indigo-600"
                          />
                          Hidden
                        </label>
                        {q.testCases.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTestCase(qIndex, tcIndex)}
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-4">
                {q.options?.map((opt, oIndex) => (
                  <div key={oIndex} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`correct-option-${qIndex}`}
                      checked={opt.isCorrect}
                      onChange={() => handleOptionChange(qIndex, oIndex, "isCorrect", true)}
                      title="Mark as correct answer"
                      className="cursor-pointer accent-emerald-600"
                    />
                    <input
                      value={opt.optionText}
                      onChange={(e) => handleOptionChange(qIndex, oIndex, "optionText", e.target.value)}
                      placeholder={`Option ${oIndex + 1}`}
                      className="flex-1 px-3 py-1.5 rounded-xl border text-xs outline-none bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          disabled={!title.trim() || saving}
          onClick={handleSubmit}
          className="px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider disabled:opacity-40 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-500 hover:to-green-500 transition cursor-pointer"
        >
          {saving && <Loader2 size={13} className="animate-spin" />}
          Save Assessment
        </button>
        <button
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-black/5 dark:hover:bg-white/5 transition cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
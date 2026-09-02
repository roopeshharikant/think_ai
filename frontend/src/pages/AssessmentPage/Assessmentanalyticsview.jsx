import React, { useEffect, useState, useMemo } from "react";
import { Search, Loader2, CheckCircle, X } from "lucide-react";

// NOTE: this file lives one folder deeper than the original AssessmentManager.jsx
// (src/.../AssessmentManager/assessment-manager/AssessmentAnalyticsView.jsx), so the
// relative import paths below have one extra "../" compared to the original file.
// Adjust to match your actual project structure if it differs.
import api from "../../api/axios";
import { getEnrollments } from "../../api/enrollmentApi";

export default function AssessmentAnalyticsView({ assessmentId, courseId, onBack }) {
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [assessmentDetails, setAssessmentDetails] = useState(null);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [analyticsSearchQuery, setAnalyticsSearchQuery] = useState("");

  // Fetch assessment details to know total questions count
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const asmRes = await api.get(`/assessments/${assessmentId}`).catch(() => null);
        const asmData = asmRes?.data?.data || asmRes?.data;
        if (isMounted && asmData) setAssessmentDetails(asmData);
      } catch (err) {
        console.error("Failed to load assessment details", err);
      }
    })();
    return () => { isMounted = false; };
  }, [assessmentId]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingSubmissions(true);
        const subRes = await api.get(`/assessments/${assessmentId}/submissions`).catch(() => ({ data: { data: [] } }));
        const subs = subRes?.data?.data || subRes?.data || [];
        if (isMounted) setSubmissions(Array.isArray(subs) ? subs : []);
      } catch (err) {
        console.error("Failed to load submissions for assessment", err);
      } finally {
        if (isMounted) setLoadingSubmissions(false);
      }
    })();
    return () => { isMounted = false; };
  }, [assessmentId]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingEnrollments(true);
        const response = await getEnrollments();
        const d = response?.data;
        const allEnrollments = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];

        const courseEnrollments = allEnrollments.filter((e) => {
          const c = e.batch?.course || e.course;
          const cId = c?.id || c?._id || e.courseId;
          return String(cId) === String(courseId);
        });

        if (isMounted) setEnrolledStudents(courseEnrollments);
      } catch (err) {
        console.error("Failed to load course enrollments for analytics", err);
      } finally {
        if (isMounted) setLoadingEnrollments(false);
      }
    })();
    return () => { isMounted = false; };
  }, [courseId]);

  const submissionsByEnrollmentId = useMemo(() => {
    const map = new Map();
    submissions.forEach((sub) => {
      const key = String(sub.enrollmentId ?? "");
      if (key) map.set(key, sub);
    });
    return map;
  }, [submissions]);

  const filteredStudents = useMemo(() => {
    if (!Array.isArray(enrolledStudents)) return [];
    const q = analyticsSearchQuery.toLowerCase().trim();
    if (!q) return enrolledStudents;

    return enrolledStudents.filter((enrollment) => {
      const studentName = (enrollment.studentName || enrollment.user?.name || "").toLowerCase();
      const studentEmail = (enrollment.studentEmail || enrollment.user?.email || "").toLowerCase();
      return studentName.includes(q) || studentEmail.includes(q);
    });
  }, [enrolledStudents, analyticsSearchQuery]);

  const loading = loadingEnrollments || loadingSubmissions;

  // Determine total available questions for this assessment
  const totalQuestionsCount = assessmentDetails?.questions?.length || assessmentDetails?.totalQuestions || 0;

  return (
    <div className="space-y-6 animate-fade-in" style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Top Header: Title, Search Input & Close Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-lg font-bold font-fraunces text-slate-900 dark:text-white">
            Student Submission Analytics
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track individual scores, completion status, and answers breakdown.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={analyticsSearchQuery}
              onChange={(e) => setAnalyticsSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs border bg-white/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Close Icon in Top-Right Corner */}
          <button
            onClick={onBack}
            title="Close analytics"
            className="p-2 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-800 transition text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer shrink-0"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
              <th className="py-3 px-3 w-12">#</th>
              <th className="py-3 px-4">Student Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Marks Obtained</th>
              <th className="py-3 px-4">Percentage</th>
              <th className="py-3 px-4">Submission Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  <Loader2 size={18} className="animate-spin mx-auto mb-2 text-emerald-500" /> Loading analytics data…
                </td>
              </tr>
            ) : filteredStudents.length > 0 ? (
              filteredStudents.map((enrollment, index) => {
                const studentName = enrollment.studentName || enrollment.user?.name || "Enrolled Student";
                const studentEmail = (enrollment.studentEmail || enrollment.user?.email || "").toLowerCase().trim();
                const enrollmentId = String(enrollment.id || enrollment._id || "");

                const sub = submissionsByEnrollmentId.get(enrollmentId);
                const hasSubmitted = !!sub;
                const pct = hasSubmitted && sub.percentage != null ? Number(sub.percentage) : null;

                // Count how many answers the student submitted
                const answersArray = sub?.answers || sub?.responses || sub?.submittedAnswers || [];
                const answeredCount = hasSubmitted
                  ? (Array.isArray(answersArray) ? answersArray.length : (sub.answeredCount ?? sub.answersCount ?? 0))
                  : 0;

                return (
                  <tr key={enrollmentId || index} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <td className="py-3.5 px-3 font-mono font-bold text-slate-400">{index + 1}</td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">{studentName}</td>
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{studentEmail || "N/A"}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {hasSubmitted ? `${sub.score ?? 0} / ${sub.totalMarks ?? '—'}` : "—"}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {pct != null ? `${pct.toFixed(1)}%` : "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      {hasSubmitted ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle size={10} className="text-emerald-500" /> {sub.status || "SUBMITTED"} &nbsp;
                             {pct >= 40 ? " Passed" : " Needs Improvement"}
                          </span>
                        </div>
                      ) : (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-400">
                  No matching student records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Award, 
  Loader2, 
  BookOpen,
  Video
} from "lucide-react";

import { getEnrollments } from "../../api/enrollmentApi";
import { getCourseById } from "../../api/courseApi";
import api from "../../api/axios";

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');`;

export default function StudentSubmissions() {
  const { enrollmentId, courseId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);
  const [courseData, setCourseData] = useState(null);
  const [realSubmissions, setRealSubmissions] = useState([]);
  const [lessonsList, setLessonsList] = useState([]);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        
        // 1. Fetch all enrollments to find the specific student details
        const enrollmentsRes = await getEnrollments();
        const allEnrollments = enrollmentsRes?.data?.data || enrollmentsRes?.data || [];
        const currentEnrollment = allEnrollments.find(
          (e) => String(e.id || e._id) === String(enrollmentId)
        );
        if (isMounted) setStudentData(currentEnrollment || null);

        // 2. Fetch course details
        if (courseId) {
          const courseRes = await getCourseById(courseId);
          const courseObj = courseRes?.data?.data || courseRes?.data || null;
          if (isMounted) setCourseData(courseObj);

          // 3. Fetch modules for this course using the real backend endpoint
          const modRes = await api.get(`/modules/course/${courseId}`).catch(() => ({ data: { data: [] } }));
          const modulesList = modRes?.data?.data || modRes?.data || [];

          let collectedSubmissions = [];
          let allLessons = [];

          for (const mod of modulesList) {
            // Collect lessons for video telemetry view
            if (mod.lessons) {
              allLessons = [...allLessons, ...mod.lessons];
            }

            // Fetch assessments for this module
            const asmRes = await api.get(`/assessments`, { params: { moduleId: mod.id } }).catch(() => ({ data: { data: [] } }));
            const assessments = asmRes?.data?.data || asmRes?.data || [];

            for (const asm of assessments) {
              // Fetch real database submissions for each assessment
              const subRes = await api.get(`/assessments/${asm.id}/submissions`).catch(() => ({ data: { data: [] } }));
              const subs = subRes?.data?.data || subRes?.data || [];
              
              // Filter submissions belonging strictly to this student's enrollmentId
              const studentSubs = subs.filter(s => String(s.enrollmentId) === String(enrollmentId));
              
              const enrichedSubs = studentSubs.map(s => ({
                ...s,
                assessmentTitle: asm.title || "Assessment Quiz"
              }));

              collectedSubmissions = [...collectedSubmissions, ...enrichedSubs];
            }
          }

          if (isMounted) {
            // Sort submissions by submittedAt newest first
            collectedSubmissions.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
            setRealSubmissions(collectedSubmissions);
            setLessonsList(allLessons);
          }
        }
      } catch (err) {
        console.error("Failed to load real student submissions telemetry", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [enrollmentId, courseId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-mono text-xs bg-slate-950">
        <Loader2 className="animate-spin mr-2 text-emerald-500" size={16} /> Loading student assessment records from database...
      </div>
    );
  }

  const latestScore = realSubmissions.length > 0 ? `${realSubmissions[0].score} / ${realSubmissions[0].totalMarks}` : "—";

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-[#F6F5F1] via-[#EFECE6] to-[#E5E2D9] dark:from-[#0b0f17] dark:via-[#111827] dark:to-[#0f172a] text-slate-900 dark:text-[#f1f3f9] p-6 sm:p-8 font-sans transition-colors duration-500"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <style>{FONT_IMPORT}</style>

      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Student Profile Card Header */}
        <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-emerald-500/20 font-mono">
              {(studentData?.studentName || studentData?.user?.name || "S").charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-fraunces text-slate-900 dark:text-white">
                {studentData?.studentName || studentData?.user?.name || "Enrolled Student"}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                {studentData?.studentEmail || studentData?.user?.email || "student@test.com"}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                  Course: {courseData?.title || "Enrolled Course"}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
            <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Attempts</span>
              <p className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">
                {realSubmissions.length}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Latest Score</span>
              <p className="text-lg font-black font-mono text-indigo-600 dark:text-indigo-400 mt-0.5">
                {latestScore}
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-center col-span-2 sm:col-span-1">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Status</span>
              <p className="text-xs font-bold font-mono text-emerald-500 mt-1 uppercase">
                {studentData?.enrollmentStatus || studentData?.status || "Active"}
              </p>
            </div>
          </div>
        </div>

        {/* Section: Real Database Assessment Submissions */}
        <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <Award size={16} className="text-emerald-500" /> Database Assessment Submissions &amp; Attempt Telemetry
            </h3>
            <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Live DB Sync
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono">
                  <th className="py-3 px-3 w-10">#</th>
                  <th className="py-3 px-4">Assessment Title</th>
                  <th className="py-3 px-4">Marks Obtained</th>
                  <th className="py-3 px-4">Percentage</th>
                  <th className="py-3 px-4">Submitted At</th>
                  <th className="py-3 px-4">Result Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/50 dark:divide-slate-800/50">
                {realSubmissions.length > 0 ? (
                  realSubmissions.map((sub, idx) => (
                    <tr key={sub.id || idx} className="hover:bg-black/5 dark:hover:bg-white/5 transition">
                      <td className="py-3.5 px-3 font-mono font-bold text-slate-400">{idx + 1}</td>
                      <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                        <Award size={14} className="text-purple-500 shrink-0" /> {sub.assessmentTitle}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {sub.score} / {sub.totalMarks}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {sub.percentage != null ? `${Number(sub.percentage).toFixed(1)}%` : "0%"}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold border ${
                          Number(sub.percentage) >= 40 
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
                            : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                        }`}>
                          {sub.status || "SUBMITTED"} ({Number(sub.percentage) >= 40 ? "Passed" : "Needs Improvement"})
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400 font-mono">
                      No assessment submissions recorded for this student in the database yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
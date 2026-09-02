import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Award, 
  BookOpen, 
  Clock, 
  Loader2, 
  CheckCircle,
  Code,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react";

import { getEnrollments } from "../../../api/enrollmentApi";
import api from "../../../api/axios";

export default function AssignmentsPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [assessmentsByModule, setAssessmentsByModule] = useState({});
  
  // State to track which modules are expanded/open
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getEnrollments();
        const d = res?.data;
        const list = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];

        // Extract unique courses from student enrollments
        const coursesMap = new Map();
        list.forEach((e) => {
          const c = e.batch?.course || e.course;
          if (c && c.id) {
            coursesMap.set(c.id, {
              id: c.id,
              title: c.title || "Course Title",
              description: c.description || "Enrolled Course Pathway"
            });
            // Automatically capture and store active enrollment ID for assessment grading
            if (e.id) localStorage.setItem("activeEnrollmentId", e.id);
          }
        });

        const coursesList = Array.from(coursesMap.values());
        if (isMounted) {
          setEnrolledCourses(coursesList);
          if (coursesList.length > 0) {
            setSelectedCourse(coursesList[0]);
          }
        }
      } catch (err) {
        console.error("Failed to load student enrolled courses for assignments", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;
    let isMounted = true;

    (async () => {
      try {
        setLoadingModules(true);
        // Fetch modules for the selected course
        const modRes = await api.get(`/modules/course/${selectedCourse.id}`);
        const mods = modRes?.data?.data || modRes?.data || [];

        if (isMounted) {
          setModules(mods);
          // Automatically open the first module by default, or leave all closed
          if (mods.length > 0) {
            setExpandedModules({ [mods[0].id]: true });
          }
        }

        // Fetch assessments for each module using GET /api/assessments?moduleId=X
        const assessmentMap = {};
        for (const mod of mods) {
          const asmRes = await api.get(`/assessments`, { params: { moduleId: mod.id } }).catch(() => ({ data: { data: [] } }));
          assessmentMap[mod.id] = asmRes?.data?.data || asmRes?.data || [];
        }

        if (isMounted) setAssessmentsByModule(assessmentMap);
      } catch (err) {
        console.error("Failed to load course modules or assessments", err);
      } finally {
        if (isMounted) setLoadingModules(false);
      }
    })();

    return () => { isMounted = false; };
  }, [selectedCourse]);

  const toggleModule = (modId) => {
    setExpandedModules((prev) => ({
      ...prev,
      [modId]: !prev[modId]
    }));
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-400 font-mono text-xs">
        <Loader2 className="animate-spin mr-2 text-emerald-500" size={16} /> Loading your enrolled courses &amp; assignments...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6" style={{ fontFamily: "Inter, sans-serif" }}>
      
      {/* Header and Course Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            Student Assessment Hub
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold font-fraunces mt-2">Assignments &amp; Quizzes</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select your enrolled course to explore modules and participate in assigned quizzes.
          </p>
        </div>

        {enrolledCourses.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {enrolledCourses.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCourse(c)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                  selectedCourse?.id === c.id
                    ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20"
                    : "bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}
      </div>

      {!selectedCourse ? (
        <div className="p-12 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-3">
          <BookOpen size={32} className="mx-auto text-slate-400 opacity-50" />
          <h3 className="text-base font-bold">No Enrolled Courses Found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            You must be enrolled in a course to view and participate in assignments.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          
          <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-900/20 via-teal-900/10 to-transparent border border-emerald-500/20 backdrop-blur-md flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold font-fraunces text-slate-900 dark:text-white">{selectedCourse.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{selectedCourse.description}</p>
            </div>
            <button
              onClick={() => navigate(`/learner/courses/${selectedCourse.id}/grades`)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition cursor-pointer flex items-center gap-1.5"
            >
              <Award size={15} /> My Grades &amp; Marks
            </button>
          </div>

          {loadingModules ? (
            <div className="py-16 text-center text-slate-400 font-mono text-xs">
              <Loader2 className="animate-spin mx-auto mb-2 text-emerald-500" size={18} /> Loading course modules and tasks...
            </div>
          ) : modules.length > 0 ? (
            <div className="space-y-4">
              {modules.map((mod, modIdx) => {
                const moduleAssessments = assessmentsByModule[mod.id] || [];
                const isOpen = !!expandedModules[mod.id];

                return (
                  <div key={mod.id} className="rounded-3xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
                    
                    {/* Module Clickable Accordion Header */}
                    <div 
                      onClick={() => toggleModule(mod.id)}
                      className="p-6 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center border border-emerald-500/20">
                          {modIdx + 1}
                        </span>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{mod.title}</h3>
                          {mod.description && <p className="text-[11px] text-slate-500">{mod.description}</p>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {moduleAssessments.length} Assignment{moduleAssessments.length === 1 ? '' : 's'}
                        </span>
                        {isOpen ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                      </div>
                    </div>

                    {/* Collapsible Assignment List */}
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-slate-200 dark:border-slate-800 space-y-3 animate-fadeIn">
                        {moduleAssessments.length > 0 ? (
                          moduleAssessments.map((asm) => {
                            const isCoding = asm.type === "CODING";
                            return (
                              <div 
                                key={asm.id} 
                                className="p-4 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition hover:border-emerald-500/40"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    {isCoding ? (
                                      <Code size={15} className="text-amber-500 shrink-0" />
                                    ) : (
                                      <HelpCircle size={15} className="text-emerald-500 shrink-0" />
                                    )}
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{asm.title}</h4>
                                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                                      isCoding ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    }`}>
                                      {isCoding ? "Coding Task" : "MCQ Quiz"}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-500 dark:text-slate-400">{asm.description || "Test your knowledge on this module's curriculum."}</p>
                                  <div className="flex items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                                    <span>Total Marks: {asm.totalMarks || 10}</span>
                                    <span>•</span>
                                    <span>{asm.questions?.length || 0} Questions</span>
                                    {asm.duration && (
                                      <>
                                        <span>•</span>
                                        <span className="flex items-center gap-1"><Clock size={11} /> {asm.duration} mins</span>
                                      </>
                                    )}
                                  </div>
                                </div>

                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (isCoding) {
                                      navigate(`/learner/code-execution/${asm.id}`);
                                    } else {
                                      navigate(`/learner/assessments/${asm.id}/take`);
                                    }
                                  }}
                                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider text-white shadow-md transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                                    isCoding 
                                      ? "bg-gradient-to-r from-amber-600 to-orange-600 shadow-amber-500/20 hover:from-amber-500 hover:to-orange-500" 
                                      : "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/20 hover:from-emerald-500 hover:to-teal-500"
                                  }`}
                                >
                                  <CheckCircle size={14} /> Participate Task
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/20 border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                            No assignments or quizzes published for this module yet.
                          </div>
                        )}
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-10 rounded-3xl bg-white/60 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
              No modules found for this course.
            </div>
          )}

        </div>
      )}

    </div>
  );
}
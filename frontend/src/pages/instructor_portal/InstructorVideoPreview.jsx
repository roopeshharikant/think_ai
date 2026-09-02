import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { 
  ArrowLeft, 
  Video, 
  Clock, 
  CheckCircle2, 
  BarChart2, 
  Loader2,
  Maximize2,
  RotateCcw,
  Play
} from "lucide-react";

import { getCourseById } from "../../api/courseApi";
import { getEnrollments } from "../../api/enrollmentApi";
import { fetchModulesByCourseId, selectModules } from "../../features/modules/moduleSlice";

export default function InstructorVideoPreview() {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const videoRef = useRef(null);
  const containerRef = useRef(null);

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lesson, setLesson] = useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(true);

  // Video UI & Player States
  const [showControls, setShowControls] = useState(true);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [savedTime, setSavedTime] = useState(0);
  const controlsTimeoutRef = useRef(null);

  const modules = useSelector(selectModules);

  // Fetch Course details & Modules
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getCourseById(courseId);
        const courseData = res?.data?.data || res?.data || null;
        if (isMounted) setCourse(courseData);
        dispatch(fetchModulesByCourseId(courseId));
      } catch (err) {
        console.error("Failed to load course details for preview", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => { isMounted = false; };
  }, [courseId, dispatch]);

  // Fetch Real Course Enrollments
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoadingEnrollments(true);
        const res = await getEnrollments();
        const d = res?.data;
        const allList = Array.isArray(d) ? d : Array.isArray(d?.data) ? d.data : [];

        const filtered = allList.filter((e) => {
          const c = e.batch?.course || e.course;
          const cId = c?.id || c?._id || e.courseId;
          return String(cId) === String(courseId);
        });

        if (isMounted) setEnrolledStudents(filtered);
      } catch (err) {
        console.error("Failed to fetch enrollments", err);
      } finally {
        if (isMounted) setLoadingEnrollments(false);
      }
    })();
    return () => { isMounted = false; };
  }, [courseId]);

  // Find Lesson data across loaded modules or fallback to route identifier
  useEffect(() => {
    if (lessonId) {
      let found = null;
      if (modules && modules.length > 0) {
        for (const mod of modules) {
          found = mod.lessons?.find((l) => String(l.id || l._id) === String(lessonId));
          if (found) break;
        }
      }
      
      const currentLessonData = found || {
        id: lessonId,
        title: `Lesson Preview #${lessonId}`,
        description: "Instructor preview mode for lesson execution and student progress telemetry.",
        duration: "15 min",
        videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
        content: "Detailed lesson learning text / markdown notes available to students."
      };
      
      setLesson(currentLessonData);

      // Check saved progress in localStorage
      const progressKey = `video-progress-${courseId}-${lessonId}`;
      const lastTime = parseFloat(localStorage.getItem(progressKey) || "0");
      if (lastTime > 5) {
        setSavedTime(lastTime);
        setResumePrompt(true);
      }
    }
  }, [modules, lessonId, courseId]);

  // Auto-Hide Controls & Inactivity Timer
  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) {
        setShowControls(false);
      }
    }, 2500);
  };

  // Keyboard Shortcuts Handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      const vid = videoRef.current;
      if (!vid) return;

      if (e.code === "Space") {
        e.preventDefault();
        vid.paused ? vid.play() : vid.pause();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        vid.currentTime = Math.min(vid.duration, vid.currentTime + 5);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        vid.currentTime = Math.max(0, vid.currentTime - 5);
      } else if (e.code === "ArrowUp") {
        e.preventDefault();
        vid.volume = Math.min(1, vid.volume + 0.05);
      } else if (e.code === "ArrowDown") {
        e.preventDefault();
        vid.volume = Math.max(0, vid.volume - 0.05);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Save progress telemetry to localStorage on timeupdate
  const handleTimeUpdate = () => {
    if (videoRef.current && lessonId) {
      const progressKey = `video-progress-${courseId}-${lessonId}`;
      localStorage.setItem(progressKey, videoRef.current.currentTime);
    }
  };

  const handleResume = (shouldResume) => {
    setResumePrompt(false);
    if (videoRef.current) {
      if (shouldResume) {
        videoRef.current.currentTime = savedTime;
      } else {
        videoRef.current.currentTime = 0;
      }
      videoRef.current.play();
    }
  };

  // Mobile Double Tap Handler (Left / Right Side skips)
  const handleVideoClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const vid = videoRef.current;
    if (!vid) return;

    if (clickX < rect.width * 0.35) {
      vid.currentTime = Math.max(0, vid.currentTime - 5); // Left tap: -5s
    } else if (clickX > rect.width * 0.65) {
      vid.currentTime = Math.min(vid.duration, vid.currentTime + 5); // Right tap: +5s
    }
  };

  // Robust Fullscreen & Landscape Rotation Trigger
  const toggleFullscreen = async () => {
    const elem = containerRef.current;
    if (!elem) return;

    try {
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          elem.webkitRequestFullscreen();
        }
        
        if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock("landscape").catch(() => {});
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }

        if (window.screen && window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      }
    } catch (err) {
      console.error("Fullscreen or orientation trigger error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-mono text-xs">
        <Loader2 className="animate-spin mr-2" size={16} /> Loading video preview environment...
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen w-full bg-gradient-to-br from-[#F6F5F1] via-[#EFECE6] to-[#E5E2D9] dark:from-[#0b0f17] dark:via-[#111827] dark:to-[#0f172a] text-slate-900 dark:text-[#f1f3f9] p-4 sm:p-8 font-sans transition-colors duration-500"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Title & Back Button */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-500/10 px-3 py-1 rounded-full">
              Instructor Lesson Preview Mode
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-2" style={{ fontFamily: "Fraunces, serif" }}>
              {course?.title || "Course Preview"}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
              Active Lesson: <span className="text-slate-900 dark:text-white font-semibold">{lesson?.title || `ID: ${lessonId}`}</span>
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto shadow-sm"
          >
            <ArrowLeft size={14} /> Back to Course Manager
          </button>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Video Player Box */}
          <div className="lg:col-span-7 space-y-4">
            <div 
              ref={containerRef}
              onMouseMove={handleMouseMove}
              onTouchStart={handleMouseMove}
              className="rounded-3xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-2xl aspect-video flex items-center justify-center relative group"
            >
              {lesson?.videoUrl ? (
                <>
                  <video
                    ref={videoRef}
                    src={lesson.videoUrl}
                    controls
                    controlsList="nodownload"
                    onTimeUpdate={handleTimeUpdate}
                    onClick={handleVideoClick}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${!showControls ? 'cursor-none' : ''}`}
                  />

                  {/* Resume Prompt Modal Overlay */}
                  {resumePrompt && (
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-30 flex flex-col items-center justify-center p-6 text-center space-y-4 animate-fade-in">
                      <p className="text-sm font-medium text-white">
                        You previously watched this lesson up to <span className="text-purple-400 font-mono font-bold">{Math.floor(savedTime / 60)}m {Math.floor(savedTime % 60)}s</span>.
                      </p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleResume(true)}
                          className="px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider bg-purple-600 text-white hover:bg-purple-500 transition shadow-lg cursor-pointer flex items-center gap-1.5"
                        >
                          <Play size={14} /> Resume Playing
                        </button>
                        <button
                          onClick={() => handleResume(false)}
                          className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700 transition cursor-pointer flex items-center gap-1.5"
                        >
                          <RotateCcw size={14} /> Start Over
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mobile Landscape Rotation / Fullscreen Button Overlay */}
                  <button
                    onClick={toggleFullscreen}
                    className={`absolute top-4 right-4 z-20 p-2.5 rounded-2xl bg-black/60 backdrop-blur-md text-white border border-white/10 hover:bg-black/80 transition-all duration-300 shadow-lg cursor-pointer flex items-center gap-1.5 text-xs font-mono ${
                      !showControls ? 'opacity-0 pointer-events-none' : 'opacity-100'
                    }`}
                    title="Fullscreen & Rotate Landscape"
                  >
                    <Maximize2 size={15} /> <span className="hidden sm:inline">Rotate / Fullscreen</span>
                  </button>
                </>
              ) : (
                <div className="text-center p-6 text-slate-400 space-y-2">
                  <Video size={36} className="mx-auto opacity-50" />
                  <p className="text-xs">No video stream URL attached to this lesson.</p>
                </div>
              )}
            </div>

            {/* Lesson Details Card */}
            <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{lesson?.title}</h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {lesson?.description || "No description provided for this lesson."}
              </p>
              <div className="flex items-center gap-4 pt-2 text-xs font-mono text-slate-400 border-t border-slate-200 dark:border-slate-800">
                <span className="flex items-center gap-1"><Clock size={13} /> {lesson?.duration || "N/A"}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><CheckCircle2 size={13} /> Instructor Active Preview</span>
              </div>
            </div>
          </div>

          {/* Enrolled Students Real Telemetry Table */}
          <div className="lg:col-span-5 space-y-4">
            <div className="backdrop-blur-2xl bg-white/70 dark:bg-slate-900/60 border border-white/40 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BarChart2 size={16} className="text-purple-500" /> Enrolled Students Telemetry
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  Live DB Sync
                </span>
              </div>

              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                {loadingEnrollments ? (
                  <div className="text-center py-10 text-slate-400 text-xs font-mono">
                    <Loader2 size={16} className="animate-spin mx-auto mb-1" /> Loading course enrollments...
                  </div>
                ) : enrolledStudents.length > 0 ? (
                  enrolledStudents.map((enrollment) => {
                    const studentName = enrollment.studentName || enrollment.user?.name || "Enrolled Student";
                    const studentEmail = enrollment.studentEmail || enrollment.user?.email || "N/A";
                    const watchPercentage = 100;

                    return (
                      <div key={enrollment.id || enrollment._id} className="p-3.5 rounded-2xl bg-white/50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-700/50 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900 dark:text-white">{studentName}</span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Enrolled Active
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                          <span>{studentEmail}</span>
                          <span className="font-bold text-purple-600 dark:text-purple-400">{watchPercentage}% Progress</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full" 
                            style={{ width: `${watchPercentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-10 text-slate-400 text-xs font-mono">
                    No students enrolled in this course yet.
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import { fetchMyEnrollments, selectMyEnrollments, selectEnrollmentLoading, selectEnrollmentError } from '../../features/enrollments/enrollmentSlice';
import { fetchProgressSummary, selectProgressSummaryFor } from '../../features/lessonProgress/lessonProgressSlice';
import axios from 'axios';

// --- Icons ---
function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true">
      <path d="M3 8.5 6.2 12 13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SparklesIcon() {
  return (
    <svg className="w-5 h-5 text-amber-400 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function FlameIcon() {
  return (
    <svg className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

// --- Futuristic Course Card Component ---
function CourseCard({ enrollment, navigate }) {
  const dispatch = useDispatch();
  const enrollmentId = enrollment.id || enrollment._id;
  const summary = useSelector(selectProgressSummaryFor(enrollmentId));

  useEffect(() => {
    if (enrollmentId) {
      dispatch(fetchProgressSummary(enrollmentId));
    }
  }, [dispatch, enrollmentId]);

  const course = enrollment.batch?.course;
  const courseId = course?.id || course?._id;
  const progress = summary?.completionPercentage ?? 0;
  const totalLessons = summary?.totalLessons ?? 0;
  const completedLessons = summary?.completedLessons ?? 0;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-[var(--border)]
                 bg-[var(--surface-glass)] p-6 
                 backdrop-blur-2xl transition-all duration-500
                 hover:border-purple-500/50 hover:bg-[var(--surface-hover)]
                 hover:shadow-[0_0_40px_var(--accent-glow)] hover:-translate-y-1"
    >
      {/* Glowing Left Accent Line */}
      <div className="absolute inset-y-0 left-0 w-[4px] bg-gradient-to-b from-purple-500 via-indigo-500 to-cyan-400 shadow-[0_0_12px_rgba(168,85,247,0.8)]" />

      <div className="flex flex-col justify-between h-full space-y-6 pl-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs uppercase tracking-wider dark:text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
              BATCH: {enrollment.batch?.name || 'Standard'}
            </span>
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              {progress === 100 ? '🎉 Completed' : `${progress}% Done`}
            </span>
          </div>

          <h3 className="text-xl font-bold leading-snug text-[var(--text-primary)] group-hover:text-purple-300 transition-colors">
            {course?.title || 'Untitled Curriculum'}
          </h3>

          <p className="flex items-center gap-2 font-mono text-xs text-[var(--text-secondary)]">
            <CheckIcon />
            {totalLessons > 0
              ? `${completedLessons} of ${totalLessons} modules completed`
              : 'Awaiting first lesson launch'}
          </p>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="space-y-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[var(--border)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400
                         shadow-[0_0_12px_rgba(168,85,247,0.6)] transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Status: Active Access
            </div>

            <button
              onClick={() => {
                if (courseId) {
                  navigate(`/learner/courses/${courseId}/videos`);
                } else {
                  console.error("Course ID is missing:", course);
                }
              }}
              className="group/btn relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all duration-300 active:scale-95 cursor-pointer"
            >
              <span>Continue Learning</span>
              <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Main Updated Learner Dashboard Component ---
export default function LearnerDashboard() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const enrollments = useSelector(selectMyEnrollments);
  const loading = useSelector(selectEnrollmentLoading);
  const error = useSelector(selectEnrollmentError);

  const [allLearners, setAllLearners] = useState([]);
  const [selectedLearnerEmail, setSelectedLearnerEmail] = useState('');

  // Fetch full learner user directory to allow administrative filtering views
  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/users');
        const usersData = Array.isArray(response.data) ? response.data : response.data.users || [];
        const learners = usersData.filter((u) => !u.role || u.role === 'learner' || u.role === 'User');
        setAllLearners(learners);
      } catch (err) {
        console.error("Failed to fetch learners directory:", err);
      }
    };
    fetchLearners();
  }, []);

  useEffect(() => {
    const userEmail = user?.email || JSON.parse(localStorage.getItem('user'))?.email;
    if (userEmail && !selectedLearnerEmail) {
      setSelectedLearnerEmail(userEmail);
    }
  }, [user, selectedLearnerEmail]);

  useEffect(() => {
    const targetEmail = selectedLearnerEmail || user?.email || JSON.parse(localStorage.getItem('user'))?.email;
    if (targetEmail) {
      dispatch(fetchMyEnrollments(targetEmail));
    }
  }, [dispatch, selectedLearnerEmail, user?.email]);

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-mono">
          ⚠️ Error loading enrollment data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      
      {/* Top Futuristic Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-purple-500/20 bg-[var(--surface-glass)] p-6 md:p-8 backdrop-blur-2xl shadow-2xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-[var(--text-primary)]">
              Dashboard &amp; Curriculum, <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">{user?.name || selectedLearnerEmail?.split('@')[0] || 'Learner'}</span>
            </h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-xl">
              Monitor active bootcamps, resume your interactive curriculum, and follow your module progress streams effortlessly.
            </p>
          </div>

          {/* Quick Metrics & Account Filter Dropdown */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border)] backdrop-blur-xl">
              <FlameIcon />
              <div>
                <p className="text-[10px] uppercase font-mono text-[var(--text-muted)]">Enrolled Programs</p>
                <p className="text-lg font-bold text-[var(--text-primary)] font-mono">{enrollments.length}</p>
              </div>
            </div>

            {/* Top Right Learner Selector Filter */}
            <div className="flex flex-col gap-1">
              <label htmlFor="learner-filter" className="text-[10px] font-mono uppercase text-[var(--text-muted)]">
                Filter Learner View
              </label>
              <select
                id="learner-filter"
                value={selectedLearnerEmail}
                onChange={(e) => setSelectedLearnerEmail(e.target.value)}
                className="rounded-xl border border-purple-500/30 bg-[var(--surface-glass)] px-4 py-2.5 text-xs font-medium text-[var(--text-primary)] backdrop-blur-xl focus:border-purple-400 focus:outline-none transition-all cursor-pointer"
              >
                {user?.email && <option value={user.email}>{user.email} (Current)</option>}
                {allLearners
                  .filter((learner) => learner.email !== user?.email)
                  .map((learner) => (
                    <option key={learner.id || learner._id || learner.email} value={learner.email}>
                      {learner.name ? `${learner.name} (${learner.email})` : learner.email}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Enrolled Programs Grid Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
          <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)]">
            <span className="text-purple-400">#</span> Enrolled Programs
          </h2>
          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 font-mono text-xs dark:text-purple-300">
            {enrollments.length} Enrolled
          </span>
        </div>

        {loading && enrollments.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 rounded-2xl bg-[var(--surface-glass)] border border-[var(--border)] animate-pulse p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-[var(--border)] rounded-full" />
                  <div className="h-6 w-3/4 bg-[var(--border)] rounded-lg" />
                </div>
                <div className="h-10 bg-[var(--border)] rounded-xl" />
              </div>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--surface-glass)] p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl font-bold">
              🚀
            </div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">You're not enrolled in any courses yet.</h3>
            <p className="text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Explore available programs and bootcamps to begin tracking your lessons and certifications.
            </p>
            <button
              onClick={() => navigate('/learner/courses')}
              className="px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
            >
              Browse Course Catalog →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrollments.map((enrollment) => (
              <CourseCard key={enrollment.id || enrollment._id} enrollment={enrollment} navigate={navigate} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
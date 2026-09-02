import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import KPICard from '../../components/admin/KPICard';
import {
  fetchCourses,
  selectCourses,
  selectCoursesLoading,
  selectCoursesPagination
} from '../../features/courses/courseSlice';

export default function AdminDashboardHome() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const courses = useSelector(selectCourses) ?? [];
  const coursesLoading = useSelector(selectCoursesLoading);
  const pagination = useSelector(selectCoursesPagination);

  const totalCourses = pagination?.total ? pagination.total : courses.length;

  useEffect(() => {
    dispatch(fetchCourses({ page: 1, limit: 1000 }));
  }, [dispatch]);

  const addedThisMonth = courses.filter((c) => {
    if (!c.createdAt) return false;
    const created = new Date(c.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  const kpis = [
    {
      label: 'Total Courses',
      value: coursesLoading ? '...' : String(totalCourses),
      change: coursesLoading ? 'Loading metrics...' : `${addedThisMonth} added this month`,
      positive: true,
    },
    { label: 'Revenue (MTD)', value: '\u2014', change: 'Awaiting backend endpoint', positive: false },
    { label: 'Active Learners', value: '\u2014', change: 'Awaiting backend endpoint', positive: false },
    { label: 'Pending Approvals', value: '\u2014', change: 'Awaiting backend endpoint', positive: false },
  ];

  return (
    // Added pt-20 or pt-24 here to push the component down below the fixed header
    <div className="relative flex flex-col pt-20 px-4 sm:px-6 lg:px-8 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      {/* Background Glow */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header Section */}
      <div className="relative z-10 shrink-0 flex items-start justify-between gap-4 pt-2 pb-4 bg-transparent">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-fuchsia-600 dark:from-purple-200 dark:to-fuchsia-400 tracking-wide">
            Dashboard
          </h1>
          <p className="text-sm text-gray-600 dark:text-purple-300/60 mt-1 font-medium tracking-wider">
            Platform overview and key metrics.
          </p>
        </div>

        <button
          onClick={() => navigate('/learner')}
          className="shrink-0 rounded-lg border border-purple-500/30 bg-white dark:bg-black/20 px-3 py-2 font-mono text-xs
                     text-purple-700 dark:text-purple-300/70 shadow-sm transition-colors hover:border-purple-500 hover:text-purple-900 dark:hover:text-purple-100"
        >
          Preview Learner Portal →
        </button>
      </div>

      {/* Main Content Area */}
      <div className="pb-6 space-y-4 sm:space-y-6">
        {/* KPI Section with Loading Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative z-10">
          {coursesLoading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 rounded-2xl bg-white dark:bg-[#2b2b2b]/40 border border-gray-200 dark:border-[#3f3f3f] animate-pulse p-5 flex flex-col justify-between shadow-sm">
                <div className="h-4 bg-purple-500/20 rounded w-1/2"></div>
                <div className="h-6 bg-purple-500/20 rounded w-1/4"></div>
              </div>
            ))
          ) : (
            kpis.map((kpi) => (
              <div key={kpi.label} className="transform hover:-translate-y-1 transition-transform duration-300">
                <KPICard {...kpi} />
              </div>
            ))
          )}
        </div>

        {/* Charts / Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 relative z-10 pb-6">
          <div className="lg:col-span-2 flex flex-col bg-white dark:bg-gradient-to-b dark:from-[#2b2b2b]/60 dark:to-[#212121]/80 backdrop-blur-2xl rounded-2xl p-5 md:p-6 border border-gray-200 dark:border-[#3f3f3f] shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-h-[220px]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-purple-100">Enrollment Trend</h2>
              <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">Coming Soon</span>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-purple-300/40 text-sm border-2 border-dashed border-gray-200 dark:border-purple-500/20 rounded-xl bg-gray-50 dark:bg-black/20 group hover:border-purple-500/40 transition-colors min-h-[140px]">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 opacity-50 group-hover:opacity-85 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
              <p className="tracking-widest uppercase text-[10px] sm:text-xs font-semibold">Awaiting Telemetry Data</p>
            </div>
          </div>

          <div className="flex flex-col bg-white dark:bg-gradient-to-b dark:from-[#2b2b2b]/60 dark:to-[#212121]/80 backdrop-blur-2xl rounded-2xl p-5 md:p-6 border border-gray-200 dark:border-[#3f3f3f] shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] min-h-[220px]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-purple-100">Recent Activity</h2>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 dark:text-purple-300/40 text-sm border-2 border-dashed border-gray-200 dark:border-purple-500/20 rounded-xl bg-gray-50 dark:bg-black/20 group hover:border-purple-500/40 transition-colors px-4 text-center min-h-[140px]">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 opacity-50 group-hover:opacity-85 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="tracking-widest uppercase text-[10px] sm:text-xs font-semibold">Activity Feed Offline</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
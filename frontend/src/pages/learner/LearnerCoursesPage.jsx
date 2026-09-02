import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import CourseCard from '../../pages/courses/CourseCard'; // Adjust path if needed
import {
  fetchCourses,
  selectCourses,
  selectCoursesLoading,
  selectCoursesError,
} from '../../features/courses/courseSlice';

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

export default function LearnerCoursesPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const rawCourses = useSelector(selectCourses);
  const loading = useSelector(selectCoursesLoading);
  const error = useSelector(selectCoursesError);

  const currentCourses = useMemo(() => {
    if (Array.isArray(rawCourses)) return rawCourses;
    if (rawCourses && Array.isArray(rawCourses.courses)) return rawCourses.courses;
    return [];
  }, [rawCourses]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    dispatch(fetchCourses({ page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch }));
  }, [dispatch, currentPage, debouncedSearch]);

  const handleViewCourse = (course) => {
    const courseId = course.id || course._id;
    navigate(`/learner/courses/${courseId}/courseDetails`);
  };

  const hasNextPage = currentCourses.length === ITEMS_PER_PAGE;

  if (error) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center max-w-7xl mx-auto px-4">
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 font-mono flex flex-col gap-3">
          <span>⚠️ Error loading course catalog: {error}</span>
          <button
            onClick={() => dispatch(fetchCourses({ page: currentPage, limit: ITEMS_PER_PAGE, search: debouncedSearch }))}
            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-xl text-xs uppercase tracking-wider font-bold transition self-start cursor-pointer"
          >
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-6 bg-slate-50 dark:bg-[#151821] text-slate-900 dark:text-[#f1f3f9] transition-colors duration-300"
      style={{
        msOverflowStyle: 'none',  /* IE and Edge */
        scrollbarWidth: 'none',   /* Firefox */
      }}
    >
      {/* Hide scrollbar for Chrome, Safari and Opera */}
      <style>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Course Cards Grid Section */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-[#262b38] pb-4">
          <h1 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Course <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">Catalog</span>
          </h1>
          <div className="w-full md:w-80 relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <SearchIcon />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search courses by title..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-[#222736] border border-slate-200 dark:border-[#313849] text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
            />
          </div>
          <span className="rounded-full bg-purple-500/10 border border-purple-500/20 px-3 py-1 font-mono text-xs text-purple-600 dark:text-purple-300 self-start md:self-auto">
            {currentCourses.length} Programs Loaded
          </span>
        </div>

        {loading && currentCourses.length === 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-80 rounded-2xl bg-white dark:bg-[#1a1e2b] border border-slate-200 dark:border-[#262b38] animate-pulse p-6 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="h-4 w-24 bg-slate-200 dark:bg-[#222736] rounded-full" />
                  <div className="h-28 w-full bg-slate-200 dark:bg-[#222736] rounded-xl" />
                  <div className="h-6 w-3/4 bg-slate-200 dark:bg-[#222736] rounded-lg" />
                </div>
                <div className="h-10 bg-slate-200 dark:bg-[#222736] rounded-full" />
              </div>
            ))}
          </div>
        ) : currentCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 dark:border-[#262b38] bg-white dark:bg-[#1a1e2b] p-12 text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 text-2xl font-bold">
              🔍
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No courses found matching your query.</h3>
            <p className="text-sm text-slate-500 dark:text-[#94a3b8] max-w-md mx-auto">
              Try adjusting your search keywords or clear the filter to review the complete list of programs.
            </p>
            <button
              onClick={() => setSearch('')}
              className="px-6 py-3 rounded-full text-xs font-bold uppercase tracking-wider text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-lg shadow-purple-500/25 transition-all cursor-pointer"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCourses.map((course) => (
              <CourseCard key={course.id || course._id} course={course} onView={handleViewCourse} />
            ))}
          </div>
        )}

        {/* Pagination Toolbar */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-[#262b38]">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1 || loading}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${currentPage === 1 || loading
                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-[#1a1e2b] border-slate-200 dark:border-[#262b38] text-slate-400'
                : 'bg-white dark:bg-[#1a1e2b] border-slate-200 dark:border-[#313849] hover:border-purple-500 text-slate-700 dark:text-white cursor-pointer shadow-sm'
              }`}
          >
            ← Previous Page
          </button>

          <span className="font-mono text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#222736] px-4 py-2 rounded-xl border border-slate-200 dark:border-[#313849]">
            Page {currentPage}
          </span>

          <button
            onClick={() => setCurrentPage((prev) => prev + 1)}
            disabled={!hasNextPage || loading}
            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${!hasNextPage || loading
                ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-[#1a1e2b] border-slate-200 dark:border-[#262b38] text-slate-400'
                : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-transparent hover:from-purple-500 hover:to-indigo-500 cursor-pointer shadow-md shadow-purple-500/25'
              }`}
          >
            Next Page →
          </button>
        </div>
      </div>
    </div>
  );
}
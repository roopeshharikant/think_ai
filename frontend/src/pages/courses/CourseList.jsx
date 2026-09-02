import React from 'react';
import { useSelector } from 'react-redux';
import { selectUser } from '../../features/auth/authSlice';
import CourseCard from './CourseCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import ErrorState from '../../components/common/ErrorState';

export default function CourseList({
  courses,
  loading,
  error,
  search,
  setSearch,
  currentPage,
  setCurrentPage,
  hasNextPage,
  onEdit,
  onDelete,
  onView,
  onRetry,
}) {
  const user = useSelector(selectUser);
  const isAdmin = user?.role === 'Admin' || user?.role === 'ADMIN' || user?.isAdmin;
  const sortedCourses = Array.isArray(courses) ? [...courses].sort((a, b) => (a.id || 0) - (b.id || 0)) : [];

  return (
    <div className="relative z-10 w-full bg-white dark:bg-[#2b2b2b] backdrop-blur-2xl rounded-2xl p-4 sm:p-6 border border-gray-200 dark:border-[#3f3f3f] shadow-sm space-y-6">
      
      {/* Search Input */}
      <div className="max-w-sm relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by course name..."
          className="w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] text-gray-900 dark:text-white placeholder-gray-400 focus:border-purple-500 rounded-xl px-4 py-2.5 text-sm outline-none transition-all"
        />
        <svg className="absolute right-3 top-3 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
      </div>

      {loading && (
        <div className="py-20 flex items-center justify-center">
          <LoadingSpinner label="Loading courses..." className="text-purple-500" />
        </div>
      )}

      {!loading && error && (
        <div className="py-20 flex items-center justify-center">
          <ErrorState message={error} onRetry={onRetry} />
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {sortedCourses.map((c) => (
              <CourseCard 
                key={c.id || c._id} 
                course={c} 
                isAdmin={isAdmin} 
                onEdit={onEdit} 
                onDelete={onDelete} 
                onView={onView} 
              />
            ))}
            
            {sortedCourses.length === 0 && (
              <div className="col-span-full py-16 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-[#212121]/40">
                <p className="text-gray-500 dark:text-gray-400 text-xs tracking-widest uppercase">No courses found.</p>
              </div>
            )}
          </div>

          {/* Pagination Controls */}
          {(currentPage > 1 || hasNextPage) && (
            <div className="flex justify-center items-center gap-4 pt-4 border-t border-gray-200 dark:border-[#3f3f3f]">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition-all text-xs font-semibold cursor-pointer"
              >
                &larr; Prev
              </button>
              <span className="text-gray-600 dark:text-gray-400 text-xs font-medium tracking-wider uppercase">
                Page <strong className="text-gray-900 dark:text-white">{currentPage}</strong>
              </span>
              <button
                onClick={() => setCurrentPage((prev) => prev + 1)}
                disabled={!hasNextPage}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition-all text-xs font-semibold cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
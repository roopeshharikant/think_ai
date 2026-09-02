import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  runGlobalSearch,
  clearSearch,
  selectSearchCourses,
  selectSearchModules,
  selectSearchLessons,
  selectSearchLoading,
  selectSearchTotalCount,
} from '../../features/search/searchSlice';

export default function GlobalSearch() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const debounceRef = useRef(null);

  const courses = useSelector(selectSearchCourses);
  const modules = useSelector(selectSearchModules);
  const lessons = useSelector(selectSearchLessons);
  const loading = useSelector(selectSearchLoading);
  const totalCount = useSelector(selectSearchTotalCount);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!input.trim()) {
      dispatch(clearSearch());
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      dispatch(runGlobalSearch(input));
      setOpen(true);
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [input, dispatch]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const goToCourse = (courseId) => {
    navigate(`/learner/courses/${courseId}`);
    setOpen(false);
    setInput('');
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative flex items-center">
        {/* Search Icon positioned neatly on the left */}
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>

        {/* Input Field with pl-10 padding to prevent icon overlap */}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => input.trim() && setOpen(true)}
          placeholder="courses, modules, lessons..."
          className="w-full bg-white dark:bg-[#212631] border border-slate-200 dark:border-[#3e4658] rounded-xl pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-all shadow-inner"
        />
      </div>

      {open && (
        <div className="absolute left-0 right-0 mt-2 max-h-96 overflow-y-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1a1e2b] shadow-2xl z-50">
          {loading && <p className="px-4 py-4 text-xs text-slate-400">Searching...</p>}

          {!loading && totalCount === 0 && (
            <p className="px-4 py-4 text-xs text-slate-400">No results for "{input}".</p>
          )}

          {!loading && courses.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-purple-500">Courses</p>
              {courses.map((c) => (
                <button
                  key={c.id}
                  onClick={() => goToCourse(c.id)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 cursor-pointer transition-colors"
                >
                  {c.title}
                </button>
              ))}
            </div>
          )}

          {!loading && modules.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-purple-500">Modules</p>
              {modules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => m.course?.id && goToCourse(m.course.id)}
                  className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-purple-500/10 cursor-pointer transition-colors"
                >
                  {m.title}
                  {m.course?.title && <span className="text-slate-400"> · {m.course.title}</span>}
                </button>
              ))}
            </div>
          )}

          {!loading && lessons.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-wider text-purple-500">Lessons</p>
              {lessons.map((l) => (
                <div key={l.id} className="px-4 py-2 text-sm text-slate-700 dark:text-slate-200">
                  {l.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
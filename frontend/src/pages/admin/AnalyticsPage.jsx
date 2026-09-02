import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BarChart3, TrendingUp, CheckCircle, Award, Loader2, Filter } from 'lucide-react';

import {
  fetchEnrollmentTrends,
  fetchCourseEnrollments,
  fetchCourseCompletionRates,
  fetchAssessmentAnalytics,
  selectEnrollmentTrends,
  selectCourseEnrollments,
  selectCourseCompletionRates,
  selectAssessmentAnalyticsData
} from '../../features/analytics/analyticsSlice';

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const trends = useSelector(selectEnrollmentTrends);
  const courseEnrollments = useSelector(selectCourseEnrollments);
  const completionRates = useSelector(selectCourseCompletionRates);
  const assessmentData = useSelector(selectAssessmentAnalyticsData);

  const [period, setPeriod] = useState('MONTHLY');

  useEffect(() => {
    dispatch(fetchEnrollmentTrends({ period }));
    dispatch(fetchCourseEnrollments({ period }));
    dispatch(fetchCourseCompletionRates({ period }));
    dispatch(fetchAssessmentAnalytics({ period }));
  }, [dispatch, period]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
            Platform Telemetry
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-slate-900 dark:text-white" style={{ fontFamily: "Fraunces, serif" }}>
            Admin Analytics Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-2 font-mono text-xs">
          <Filter size={14} className="text-slate-400" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-slate-900 dark:text-white outline-none cursor-pointer"
          >
            <option value="DAILY">Daily</option>
            <option value="MONTHLY">Monthly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>

      {/* Assessment Overview Cards */}
      {assessmentData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Total Submissions</span>
            <span className="text-2xl font-black text-slate-900 dark:text-white">{assessmentData.totalSubmissions}</span>
          </div>
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Average Score</span>
            <span className="text-2xl font-black text-emerald-500">{assessmentData.averageScore}</span>
          </div>
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Overall Pass Rate</span>
            <span className="text-2xl font-black text-teal-400">{assessmentData.passRate}%</span>
          </div>
          <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-1">
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Highest Score</span>
            <span className="text-2xl font-black text-purple-400">{assessmentData.highestScore}</span>
          </div>
        </div>
      )}

      {/* Course Completion Rates & Trends Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Award size={16} className="text-purple-500" /> Course Completion Rates
          </h3>
          <div className="space-y-3">
            {completionRates?.length > 0 ? (
              completionRates.map((c) => (
                <div key={c.courseId} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between font-bold text-slate-900 dark:text-white">
                    <span>{c.courseName}</span>
                    <span className="text-purple-500">{c.completionRate}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: `${c.completionRate}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-mono text-center py-6">No completion data available.</p>
            )}
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <TrendingUp size={16} className="text-emerald-500" /> Enrollment Trends
          </h3>
          <div className="space-y-3">
            {trends?.length > 0 ? (
              trends.map((t, idx) => (
                <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-600 dark:text-slate-300">{t.period}</span>
                  <span className="font-bold text-emerald-500">{t.enrollments} enrollments</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-mono text-center py-6">No enrollment trends recorded for this period.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
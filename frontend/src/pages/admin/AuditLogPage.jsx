import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ShieldAlert, Download, Loader2, Filter } from 'lucide-react';

import {
  fetchAuditLogs,
  selectAuditLogs,
  selectAuditLogsLoading
} from '../../features/auditLogs/auditLogSlice';
import { exportAuditLogsUrl } from '../../api/auditLogApi';

export default function AuditLogPage() {
  const dispatch = useDispatch();
  const logs = useSelector(selectAuditLogs);
  const loading = useSelector(selectAuditLogsLoading);

  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    dispatch(fetchAuditLogs({ role: roleFilter }));
  }, [dispatch, roleFilter]);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-600 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full">
            Security &amp; Compliance
          </span>
          <h1 className="text-2xl font-bold tracking-tight mt-2 text-slate-900 dark:text-white" style={{ fontFamily: "Fraunces, serif" }}>
            System Audit Logs
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-mono text-slate-900 dark:text-white outline-none cursor-pointer shadow-sm"
          >
            <option value="">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Instructor">Instructor</option>
            <option value="TA">TA</option>
            <option value="Learner">Learner</option>
          </select>

          <a
            href={exportAuditLogsUrl({ role: roleFilter }, 'csv')}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-md flex items-center gap-1.5 cursor-pointer font-mono"
          >
            <Download size={14} /> Export CSV
          </a>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-4 font-bold">ID</th>
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">Actor Role</th>
                <th className="p-4 font-bold">Action</th>
                <th className="p-4 font-bold">Target User</th>
                <th className="p-4 font-bold">Role Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <Loader2 size={18} className="animate-spin mx-auto mb-1" /> Loading audit logs...
                  </td>
                </tr>
              ) : logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                    <td className="p-4 font-bold text-slate-900 dark:text-white">#{log.id}</td>
                    <td className="p-4 text-slate-500">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-500 font-bold text-[10px]">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-emerald-600 dark:text-emerald-400">{log.action}</td>
                    <td className="p-4">{log.targetUserName || `ID: ${log.targetUserId}`}</td>
                    <td className="p-4">
                      {log.oldRole && log.newRole ? (
                        <span className="text-slate-400">
                          {log.oldRole} → <strong className="text-amber-500">{log.newRole}</strong>
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    No audit log entries found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
import React from 'react';

const ROLE_STYLES = {
  Learner: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30',
  Instructor: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30',
  TA: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
  Admin: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30',
};

export default function UserDetails({ user, onAction, canManageUsers }) {
  return (
    <tr className="border-b border-gray-200 dark:border-[#3f3f3f] hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
      <td className="p-4 text-gray-900 dark:text-gray-200">
        <p className="font-bold">{user.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{user.email}</p>
      </td>
      <td className="p-4">
        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase border whitespace-nowrap ${ROLE_STYLES[user.role] || ROLE_STYLES.Learner}`}>
          {user.role}
        </span>
      </td>
      <td className="p-4">
        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-semibold tracking-wider ${user.status === 'inactive' ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400'}`}>
          {user.status || 'active'}
        </span>
      </td>
      <td className="p-4 text-right">
        {canManageUsers ? (
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onAction('toggleStatus', user)}
              title="Toggle Status"
              className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500/10 transition-all inline-flex items-center justify-center cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
              </svg>
            </button>
            <button
              onClick={() => onAction('edit', user)}
              title="Edit Role"
              className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-all inline-flex items-center justify-center cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
              </svg>
            </button>
            <button
              onClick={() => onAction('delete', user)}
              title="Delete User"
              className="p-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 transition-all inline-flex items-center justify-center cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
              </svg>
            </button>
          </div>
        ) : (
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">View Only</span>
        )}
      </td>
    </tr>
  );
}
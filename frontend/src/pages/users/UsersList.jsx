import React from 'react';
import UserDetails from './UserDetails';

export default function UsersList({
  currentUsers,
  onAction,
  canManageUsers,
  currentPage,
  totalPages,
  indexOfFirstItem,
  indexOfLastItem,
  totalUsers,
  onPageChange
}) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-auto min-h-0 border border-gray-200 dark:border-[#3f3f3f] rounded-xl relative bg-white dark:bg-[#2b2b2b]/50 shadow-sm">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-gray-100 dark:bg-[#212121] z-10 shadow-sm">
            <tr className="border-b border-gray-200 dark:border-[#3f3f3f] text-left text-xs text-gray-500 dark:text-gray-400 uppercase">
              <th className="p-4 font-semibold">User</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
            {currentUsers.map((user) => {
              const uId = user.id || user._id;
              return (
                <UserDetails
                  key={uId}
                  user={user}
                  onAction={onAction}
                  canManageUsers={canManageUsers}
                />
              );
            })}

            {currentUsers.length === 0 && (
              <tr>
                <td colSpan={4} className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-800 rounded-xl">
                  <p className="text-sm tracking-widest uppercase mt-4">No users match your criteria.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 0 && (
        <div className="shrink-0 flex flex-col sm:flex-row justify-between items-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-[#3f3f3f]">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium tracking-wide">
            Showing <strong className="text-gray-900 dark:text-gray-200">{indexOfFirstItem + 1}</strong> to <strong className="text-gray-900 dark:text-gray-200">{Math.min(indexOfLastItem, totalUsers)}</strong> of <strong className="text-gray-900 dark:text-gray-200">{totalUsers}</strong> users
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/[0.02] border border-gray-300 dark:border-[#3f3f3f] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-white/[0.05] transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Prev
            </button>
            <div className="flex items-center px-4 py-2 rounded-lg bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-[#3f3f3f] text-xs font-bold text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </div>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-white/[0.02] border border-gray-300 dark:border-[#3f3f3f] text-gray-700 dark:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-white/[0.05] transition-all text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
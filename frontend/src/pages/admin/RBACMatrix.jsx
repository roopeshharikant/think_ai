import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMatrix,
  toggleRolePermission,
  selectRoles,
  selectPermissions,
  selectGrants,
  selectRbacLoading,
  selectRbacToggling,
  selectRbacError,
} from '../../features/rbac/rbacSlice';

export default function RBACMatrix() {
  const dispatch = useDispatch();
  const roles = useSelector(selectRoles);
  const permissions = useSelector(selectPermissions);
  const grants = useSelector(selectGrants);
  const loading = useSelector(selectRbacLoading);
  const toggling = useSelector(selectRbacToggling);
  const error = useSelector(selectRbacError);

  useEffect(() => {
    dispatch(fetchMatrix());
  }, [dispatch]);

  const handleToggle = (role, permission, currentlyGranted) => {
    dispatch(toggleRolePermission({ role, permission, granted: !currentlyGranted }));
  };

  if (loading) return <div className="p-6 text-gray-500 dark:text-gray-400">Loading RBAC matrix…</div>;
  if (error) return <div className="p-6 text-red-600 dark:text-red-400 font-medium">Error: {error}</div>;
  if (!roles || roles.length === 0) return <div className="p-6 text-gray-500 dark:text-gray-400">No roles configured.</div>;
  
  return (
    <div className="p-4 sm:p-6 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-1">
          RBAC Permission Matrix
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Toggle grants or revokes a permission for a role directly.
        </p>
      </div>

      <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-[#212121]/50 border-b border-gray-200 dark:border-[#3f3f3f] text-gray-700 dark:text-gray-300 uppercase text-xs tracking-wider">
                <th className="px-6 py-4 font-semibold">Permission</th>
                {roles.map((role) => (
                  <th key={role} className="px-6 py-4 font-semibold text-center text-gray-900 dark:text-white">
                    {role}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-[#3f3f3f]">
              {permissions.map((perm) => (
                <tr key={perm} className="hover:bg-gray-50/50 dark:hover:bg-[#3f3f3f]/20 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">{perm}</td>
                  {roles.map((role) => {
                    const direct = (grants[role] || []).includes(perm);
                    return (
                      <td key={role + perm} className="px-6 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={direct}
                          disabled={toggling}
                          onChange={() => handleToggle(role, perm, direct)}
                          className={`w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-[#3f3f3f] dark:bg-[#212121] ${toggling ? 'cursor-wait opacity-50' : 'cursor-pointer'
                            }`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
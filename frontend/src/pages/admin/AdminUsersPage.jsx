import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import InputField from "../../components/common/InputField";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ErrorState from "../../components/common/ErrorState";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { usePermission } from "../../hooks/usePermission";
import useSessionTimeout from "../../hooks/useSessionTimeout";

import AddUserModal from "../../pages/users/AddUserModal";
import EditUserModal from "../../pages/users/EditUserModal";
import UsersList from "../../pages/users/UsersList";

import {
  fetchUsers,
  createUser,
  updateUser,
  deleteUser,
  selectAdminUsers,
  selectAdminUsersLoading,
  selectAdminUsersError,
} from "../../features/adminUsers/adminUserSlice";

export default function AdminUsersPage() {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const dispatch = useDispatch();
  const rawUsers = useSelector(selectAdminUsers) ?? [];
  const loading = useSelector(selectAdminUsersLoading);
  const error = useSelector(selectAdminUsersError);
  useSessionTimeout();

  const [confirmState, setConfirmState] = useState({ open: false, action: null, payload: null });

  const canManageUsers = usePermission('manage_users') || usePermission('admin');

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const users = useMemo(() => {
    return [...rawUsers].sort((a, b) => {
      const idA = Number(a.id || a._id) || 0;
      const idB = Number(b.id || b._id) || 0;
      return idA - idB;
    });
  }, [rawUsers]);

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [search, roleFilter, users]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, roleFilter]);

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  const handleActionClick = (actionType, user) => {
    if (actionType === 'edit') {
      setSelectedUser(user);
      setIsEditModalOpen(true);
    } else if (actionType === 'delete') {
      askConfirm('delete', user);
    } else if (actionType === 'toggleStatus') {
      askConfirm('toggleStatus', user);
    }
  };

  const handleSaveNewUser = async (userData) => {
    const result = await dispatch(createUser(userData));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('User created successfully', { theme: "dark" });
      setIsAddModalOpen(false);
    } else {
      toast.error(result.payload || 'Failed to create user', { theme: "dark" });
    }
  };

  const handleUpdateUser = async (userData) => {
    const { id, ...data } = userData;
    const result = await dispatch(updateUser({ userId: id, data }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('User updated successfully', { theme: "dark" });
      setIsEditModalOpen(false);
    } else {
      toast.error(result.payload || 'Failed to update user', { theme: "dark" });
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'inactive' ? 'active' : 'inactive';
    const result = await dispatch(updateUser({ userId: user.id || user._id, data: { status: newStatus } }));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success(`User status updated to ${newStatus}`, { theme: "dark" });
    } else {
      toast.error(result.payload || 'Failed to update status', { theme: "dark" });
    }
  };

  const handleDeleteUser = async (userId) => {
    const result = await dispatch(deleteUser(userId));
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('User deleted successfully', { theme: "dark" });
    } else {
      toast.error(result.payload || 'Failed to delete user', { theme: "dark" });
    }
  };

  const askConfirm = (action, payload) => setConfirmState({ open: true, action, payload });

  const handleConfirmed = async () => {
    const { action, payload } = confirmState;
    const userId = payload?.id || payload?._id;
    if (action === 'delete') await handleDeleteUser(userId);
    if (action === 'toggleStatus') await handleToggleStatus(payload);
    setConfirmState({ open: false, action: null, payload: null });
  };

  const confirmMessages = {
    delete: `Permanently delete "${confirmState.payload?.name}"? This cannot be undone.`,
    toggleStatus: `Set "${confirmState.payload?.name}" to ${confirmState.payload?.status === 'inactive' ? 'active' : 'inactive'}?`,
  };

  return (
    <div className="relative flex flex-col h-full space-y-4 sm:space-y-6 overflow-hidden pb-2 text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <div className="flex items-center justify-between shrink-0 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage learners, instructors, TAs and admins.</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-6 py-2 text-sm font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 text-white rounded-xl transition-all shadow-md cursor-pointer"
        >
          + New User
        </button>
      </div>


      <div className="flex-1 flex flex-col bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] rounded-2xl p-4 sm:p-6 space-y-4 min-h-0 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-4 sm:items-center shrink-0">
          <div className="w-full sm:max-w-md">
            <InputField
              label="Search Users"
              id="user-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email"
            />
          </div>
          <div className="flex gap-2 flex-wrap sm:ml-auto pt-2 sm:pt-0">
            {['all', 'Learner', 'Instructor', 'TA', 'Admin'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${roleFilter === role
                    ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-bold'
                    : 'text-gray-600 dark:text-gray-400 border-gray-300 dark:border-[#3f3f3f] hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
              >
                {role === 'all' ? 'All Roles' : role}
              </button>
            ))}
          </div>
        </div>

        {loading && <div className="flex-1 flex items-center justify-center"><LoadingSpinner label="Loading users..." /></div>}

        {!loading && error && (
          <div className="flex-1 flex items-center justify-center">
            <ErrorState message={error} onRetry={() => dispatch(fetchUsers())} />
          </div>
        )}

        {!loading && !error && (
          <UsersList
            currentUsers={currentUsers}
            onAction={handleActionClick}
            canManageUsers={canManageUsers}
            currentPage={currentPage}
            totalPages={totalPages}
            indexOfFirstItem={indexOfFirstItem}
            indexOfLastItem={indexOfLastItem}
            totalUsers={filteredUsers.length}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      <ConfirmDialog
        open={confirmState.open}
        title="Confirm action"
        message={confirmMessages[confirmState.action] || 'Are you sure you want to proceed?'}
        danger={confirmState.action === 'toggleStatus' || confirmState.action === 'delete'}
        onConfirm={handleConfirmed}
        onCancel={() => setConfirmState({ open: false, action: null, payload: null })}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSaveNewUser}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSave={handleUpdateUser}
      />
    </div>
  );
}
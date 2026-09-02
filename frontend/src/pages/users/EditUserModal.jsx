import React, { useState, useEffect } from 'react';
import InputField from '../../components/common/InputField';
import Button from '../../components/common/Button';

export default function EditUserModal({ isOpen, onClose, user, onSave }) {
  const [formData, setFormData] = useState({ name: '', email: '', role: 'Learner' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role || 'Learner',
      });
      setErrors({});
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const userId = user.id || user._id;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    setErrors({});
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    await onSave({ id: userId, ...formData });
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#2b2b2b] border border-gray-200 dark:border-[#3f3f3f] w-full max-w-md rounded-2xl p-6 shadow-2xl text-gray-900 dark:text-gray-100">
        <h2 className="text-xl font-bold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <InputField
              label="Name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name}</p>}
          </div>
          <div>
            <InputField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            {errors.email && <p className="text-xs text-rose-500 mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full bg-gray-50 dark:bg-[#212121] border border-gray-300 dark:border-[#3f3f3f] rounded-xl p-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-purple-500"
            >
              <option value="Learner">Learner</option>
              <option value="Instructor">Instructor</option>
              <option value="TA">TA</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
                    <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-gray-100 dark:bg-[#212121] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#3f3f3f] transition"
            >
              Cancel
            </button>
            <Button
              type="submit"
              label={loading ? "Saving..." : "Save Changes"}
              disabled={loading}
            />
          </div>
        </form>
      </div>
    </div>
  );
}
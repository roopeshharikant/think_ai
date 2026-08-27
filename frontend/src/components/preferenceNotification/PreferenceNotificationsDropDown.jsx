import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  markAllAsRead 
} from '../../features/preferenceNotification/preferenceNotificationSlice';

export default function NotificationDropdown({ isOpen, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const notificationsList = useSelector((state) => state.notifications?.notificationsList) || [];
  const unreadCount = useSelector((state) => state.notifications?.unreadCount) || 0;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose?.();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Handle clicking an individual notification item (marks read & navigates to checkout/preferences)
  const handleItemClick = (item) => {
    // If it's a cart item with a course ID, navigate to checkout or course details
    if (item.courseId) {
      navigate(`/learner/courses/${item.courseId}/checkout`);
    } else {
      // Default navigation to preferences page
      navigate('/learner/settings/notifications');
    }
    onClose?.();
  };

  return (
    <div ref={dropdownRef} className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 overflow-hidden text-slate-100">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/90">
        <h3 className="text-sm font-bold text-white">Notifications</h3>
        {unreadCount > 0 && (
          <button 
            onClick={() => dispatch(markAllAsRead())}
            className="text-xs text-purple-400 hover:text-purple-300 cursor-pointer"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50">
        {notificationsList.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-400">
            No new notifications
          </div>
        ) : (
          notificationsList.map((item) => (
            <div 
              key={item.id} 
              onClick={() => handleItemClick(item)}
              className="p-3 hover:bg-slate-800/50 transition-colors flex gap-3 items-start cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                🛒
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-white">{item.title}</p>
                <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">{item.message}</p>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer link to full preferences page */}
      <div className="p-2 border-t border-slate-800 text-center bg-slate-900/90">
        <button 
          onClick={() => {
            navigate('/learner/settings/notifications');
            onClose?.();
          }}
          className="text-xs font-medium text-purple-400 hover:text-purple-300 block w-full py-1 cursor-pointer"
        >
          Manage Notification Preferences &rarr;
        </button>
      </div>
    </div>
  );
}
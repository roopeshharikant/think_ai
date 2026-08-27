import api from './axios';

export const getPreferences = (userId) =>
  api.get(`/notifications/preferences/${userId}`);

export const updatePreferences = (userId, updates) =>
  api.put(`/notifications/preferences/${userId}`, updates);

export const getQueueStatus = () =>
  api.get('/notifications/queue/status');

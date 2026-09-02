import api from './axios';

export const getAuditLogs = (filters = {}) => {
  const params = new URLSearchParams(filters);
  return api.get(`/audit-logs?${params.toString()}`);
};

export const exportAuditLogsUrl = (filters = {}, format = 'csv') => {
  const params = new URLSearchParams({ ...filters, format });
  return `${api.defaults.baseURL}/audit-logs/export?${params.toString()}`;
};
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

const initialState = {
  logs: [],
  loading: false,
  error: null,
};

// Fetch audit logs with optional filters (role, action, from, to)
export const fetchAuditLogs = createAsyncThunk(
  'auditLogs/fetchLogs',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.action) params.append('action', filters.action);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);

      const res = await api.get(`/audit-logs?${params.toString()}`);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load audit logs');
    }
  }
);

const auditLogSlice = createSlice({
  name: 'auditLogs',
  initialState,
  reducers: {
    clearAuditLogError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action) => {
        state.loading = false;
        state.logs = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAuditLogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.logs = [];
      });
  },
});

export const { clearAuditLogError } = auditLogSlice.actions;

export const selectAuditLogs = (state) => state.auditLogs.logs;
export const selectAuditLogsLoading = (state) => state.auditLogs.loading;
export const selectAuditLogsError = (state) => state.auditLogs.error;

export default auditLogSlice.reducer;
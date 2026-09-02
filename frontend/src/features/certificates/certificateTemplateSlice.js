import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getActiveCertificateTemplate,
  getAllCertificateTemplates,
  createCertificateTemplate,
  updateCertificateTemplate,
  deleteCertificateTemplate,
} from '../../api/certificateTemplateApi';

const initialState = {
  templates: [],
  activeTemplate: null,
  loading: false,
  saving: false,
  error: null,
};

export const fetchActiveTemplate = createAsyncThunk(
  'certificateTemplates/fetchActive',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getActiveCertificateTemplate();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load active template');
    }
  }
);

export const fetchAllTemplates = createAsyncThunk(
  'certificateTemplates/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const res = await getAllCertificateTemplates();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load templates');
    }
  }
);

export const createTemplateThunk = createAsyncThunk(
  'certificateTemplates/create',
  async (data, { rejectWithValue }) => {
    try {
      const res = await createCertificateTemplate(data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create template');
    }
  }
);

export const updateTemplateThunk = createAsyncThunk(
  'certificateTemplates/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateCertificateTemplate(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update template');
    }
  }
);

export const deleteTemplateThunk = createAsyncThunk(
  'certificateTemplates/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteCertificateTemplate(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete template');
    }
  }
);

const certificateTemplateSlice = createSlice({
  name: 'certificateTemplates',
  initialState,
  reducers: {
    clearTemplateError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Active
      .addCase(fetchActiveTemplate.fulfilled, (state, action) => {
        state.activeTemplate = action.payload;
      })
      // Fetch All
      .addCase(fetchAllTemplates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTemplates.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = Array.isArray(action.payload) ? action.payload : [];
      })
      .addCase(fetchAllTemplates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create
      .addCase(createTemplateThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createTemplateThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.templates.unshift(action.payload);
        if (action.payload.isActive) state.activeTemplate = action.payload;
      })
      .addCase(createTemplateThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateTemplateThunk.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.templates.findIndex((t) => t.id === updated.id);
        if (index !== -1) state.templates[index] = updated;
        if (updated.isActive) state.activeTemplate = updated;
      })
      // Delete
      .addCase(deleteTemplateThunk.fulfilled, (state, action) => {
        state.templates = state.templates.filter((t) => t.id !== action.payload);
      });
  },
});

export const { clearTemplateError } = certificateTemplateSlice.actions;

export const selectAllTemplates = (state) => state.certificateTemplates.templates;
export const selectActiveTemplate = (state) => state.certificateTemplates.activeTemplate;
export const selectTemplateLoading = (state) => state.certificateTemplates.loading;
export const selectTemplateSaving = (state) => state.certificateTemplates.saving;
export const selectTemplateError = (state) => state.certificateTemplates.error;

export default certificateTemplateSlice.reducer;
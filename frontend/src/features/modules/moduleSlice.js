import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getModuleById,
  getModulesByCourseId,
  createModule as createModuleApi,
  updateModule as updateModuleApi,
  deleteModule as deleteModuleApi,
} from '../../api/moduleApi';

const initialState = {
  items: [],
  loading: false,
  saving: false,
  error: null,
  currentModule: null,
};

export const fetchModulesByCourseId = createAsyncThunk(
  'modules/fetchModulesByCourseId',
  async (courseId, { rejectWithValue }) => {
    try {
      const response = await getModulesByCourseId(courseId);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load modules');
    }
  }
);

export const fetchModuleById = createAsyncThunk(
  'modules/fetchModuleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getModuleById(id);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load module');
    }
  }
);

// data: { title, description, courseId }
export const createModuleThunk = createAsyncThunk(
  'modules/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await createModuleApi(data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create module');
    }
  }
);

// { id, data: { title, description } }
export const updateModuleThunk = createAsyncThunk(
  'modules/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await updateModuleApi(id, data);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update module');
    }
  }
);

export const deleteModuleThunk = createAsyncThunk(
  'modules/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteModuleApi(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete module');
    }
  }
);

const moduleSlice = createSlice({
  name: 'modules',
  initialState,
  reducers: {
    clearModuleError: (state) => { state.error = null; },
    clearModules: (state) => { state.items = []; },
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchModulesByCourseId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModulesByCourseId.fulfilled, (state, action) => {
        state.loading = false;
        const data = action.payload?.data;
        state.items = Array.isArray(data) ? data : (Array.isArray(data?.modules) ? data.modules : []);
      })
      .addCase(fetchModulesByCourseId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.items = [];
      })
      // fetch one
      .addCase(fetchModuleById.fulfilled, (state, action) => {
        state.currentModule = action.payload;
      })
      // create
      .addCase(createModuleThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createModuleThunk.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload);
      })
      .addCase(createModuleThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // update
      .addCase(updateModuleThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateModuleThunk.fulfilled, (state, action) => {
        state.saving = false;
        const idx = state.items.findIndex((m) => m.id === action.payload.id);
        if (idx !== -1) state.items[idx] = action.payload;
      })
      .addCase(updateModuleThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // delete
      .addCase(deleteModuleThunk.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      })
      .addCase(deleteModuleThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearModuleError, clearModules } = moduleSlice.actions;

export const selectModules = (state) => state.modules.items;
export const selectModulesLoading = (state) => state.modules.loading;
export const selectModulesSaving = (state) => state.modules.saving;
export const selectModulesError = (state) => state.modules.error;
export const selectCurrentModule = (state) => state.modules.currentModule;

export default moduleSlice.reducer;
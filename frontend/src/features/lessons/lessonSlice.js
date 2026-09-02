import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getLessonById,
  getLessonsByModuleId,
  createLesson as createLessonApi,
  updateLesson as updateLessonApi,
  deleteLesson as deleteLessonApi,
} from '../../api/lessonApi';

const initialState = {
  byModuleId: {}, // { [moduleId]: Lesson[] }
  loading: false,
  saving: false,
  error: null,
  currentLesson: null,
};

export const fetchLessonsByModuleId = createAsyncThunk(
  'lessons/fetchLessonsByModuleId',
  async (moduleId, { rejectWithValue }) => {
    try {
      const response = await getLessonsByModuleId(moduleId);
      const data = response.data?.data;
      const lessons = Array.isArray(data) ? data : (Array.isArray(data?.lessons) ? data.lessons : []);
      return { moduleId, lessons };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load lessons');
    }
  }
);

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchLessonById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await getLessonById(id);
      return response.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load lesson');
    }
  }
);

// { moduleId, data: { title, description, content, videoUrl, duration, order, moduleId } }
export const createLessonThunk = createAsyncThunk(
  'lessons/create',
  async ({ moduleId, data }, { rejectWithValue }) => {
    try {
      const response = await createLessonApi({ ...data, moduleId });
      return { moduleId, lesson: response.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create lesson');
    }
  }
);

// { id, moduleId, data }
export const updateLessonThunk = createAsyncThunk(
  'lessons/update',
  async ({ id, moduleId, data }, { rejectWithValue }) => {
    try {
      const response = await updateLessonApi(id, data);
      return { moduleId, lesson: response.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update lesson');
    }
  }
);

// { id, moduleId }
export const deleteLessonThunk = createAsyncThunk(
  'lessons/delete',
  async ({ id, moduleId }, { rejectWithValue }) => {
    try {
      await deleteLessonApi(id);
      return { id, moduleId };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete lesson');
    }
  }
);

const lessonSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    clearLessonError: (state) => { state.error = null; },
    setCurrentLesson: (state, action) => { state.currentLesson = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      // fetch list
      .addCase(fetchLessonsByModuleId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLessonsByModuleId.fulfilled, (state, action) => {
        state.loading = false;
        state.byModuleId[action.payload.moduleId] = action.payload.lessons;
      })
      .addCase(fetchLessonsByModuleId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetch one
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.currentLesson = action.payload;
      })
      // create
      .addCase(createLessonThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createLessonThunk.fulfilled, (state, action) => {
        state.saving = false;
        const { moduleId, lesson } = action.payload;
        if (!state.byModuleId[moduleId]) state.byModuleId[moduleId] = [];
        state.byModuleId[moduleId].push(lesson);
      })
      .addCase(createLessonThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // update
      .addCase(updateLessonThunk.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(updateLessonThunk.fulfilled, (state, action) => {
        state.saving = false;
        const { moduleId, lesson } = action.payload;
        const list = state.byModuleId[moduleId] || [];
        const idx = list.findIndex((l) => l.id === lesson.id);
        if (idx !== -1) list[idx] = lesson;
      })
      .addCase(updateLessonThunk.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload;
      })
      // delete
      .addCase(deleteLessonThunk.fulfilled, (state, action) => {
        const { id, moduleId } = action.payload;
        state.byModuleId[moduleId] = (state.byModuleId[moduleId] || []).filter((l) => l.id !== id);
      })
      .addCase(deleteLessonThunk.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearLessonError, setCurrentLesson } = lessonSlice.actions;

// Shared reference so "no lessons yet" doesn't produce a new array identity
// on every call — returning a fresh [] here is what triggers the
// "Selector unknown returned a different result" warning.
const EMPTY_LESSONS = [];

export const selectLessonsByModuleId = (moduleId) => (state) =>
  state.lessons.byModuleId[moduleId] || EMPTY_LESSONS;
export const selectLessonsLoading = (state) => state.lessons.loading;
export const selectLessonsSaving = (state) => state.lessons.saving;
export const selectLessonsError = (state) => state.lessons.error;
export const selectCurrentLesson = (state) => state.lessons.currentLesson;

export default lessonSlice.reducer;
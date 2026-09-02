import { createSlice, createAsyncThunk, createSelector } from '@reduxjs/toolkit';
import { 
  getAllAssessments, 
  createAssessment, 
  updateAssessment, 
  deleteAssessment, 
  getAssessmentById, 
  startAssessment,
  submitAssessment, 
  getAssessmentAnalytics,
  getEnrollmentAssessmentStatus,
  createCodingQuestion,
  updateCodingQuestion,
  deleteCodingQuestion
} from '../../api/assessmentApi';

const initialState = {
  assessments: [],
  currentAssessment: null,
  activeSubmission: null,
  analyticsMap: {},
  enrollmentStatus: null,
  enrollmentStatusLoading: false,
  loading: false,
  submitting: false,
  submitResult: null,
  error: null,
};

export const fetchAssessmentsByModuleId = createAsyncThunk(
  'assessments/fetchByModuleId',
  async (moduleId, { rejectWithValue }) => {
    try {
      const res = await getAllAssessments(moduleId);
      return { moduleId, assessments: res.data.data || res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load assessments');
    }
  }
);

export const fetchAssessmentById = createAsyncThunk(
  'assessments/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getAssessmentById(id);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load assessment');
    }
  }
);

export const startAssessmentThunk = createAsyncThunk(
  'assessments/start',
  async ({ assessmentId, enrollmentId }, { rejectWithValue }) => {
    try {
      const res = await startAssessment(assessmentId, enrollmentId);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to start assessment');
    }
  }
);

export const createAssessmentThunk = createAsyncThunk(
  'assessments/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await createAssessment(payload);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create assessment');
    }
  }
);

export const updateAssessmentThunk = createAsyncThunk(
  'assessments/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await updateAssessment(id, data);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update assessment');
    }
  }
);

export const deleteAssessmentThunk = createAsyncThunk(
  'assessments/delete',
  async (id, { rejectWithValue }) => {
    try {
      await deleteAssessment(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete assessment');
    }
  }
);

export const fetchAssessmentAnalytics = createAsyncThunk(
  'assessments/fetchAnalytics',
  async (id, { rejectWithValue }) => {
    try {
      const res = await getAssessmentAnalytics(id);
      return { id, analytics: res.data.data || res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch assessment analytics');
    }
  }
);

export const fetchEnrollmentAssessmentStatus = createAsyncThunk(
  'assessments/fetchEnrollmentStatus',
  async (enrollmentId, { rejectWithValue }) => {
    try {
      const res = await getEnrollmentAssessmentStatus(enrollmentId);
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load assessment status');
    }
  }
);

export const submitAssessmentAnswers = createAsyncThunk(
  'assessments/submit',
  async ({ assessmentId, enrollmentId, answers }, { rejectWithValue }) => {
    try {
      const res = await submitAssessment(assessmentId, { enrollmentId, answers });
      return res.data.data || res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to submit assessment');
    }
  }
);

const assessmentSlice = createSlice({
  name: 'assessments',
  initialState,
  reducers: {
    clearAssessmentError: (state) => { state.error = null; },
    clearCurrentAssessment: (state) => {
      state.currentAssessment = null;
      state.activeSubmission = null;
      state.submitResult = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEnrollmentAssessmentStatus.pending, (state) => {
        state.enrollmentStatusLoading = true;
      })
      .addCase(fetchEnrollmentAssessmentStatus.fulfilled, (state, action) => {
        state.enrollmentStatusLoading = false;
        state.enrollmentStatus = action.payload;
      })
      .addCase(fetchEnrollmentAssessmentStatus.rejected, (state, action) => {
        state.enrollmentStatusLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAssessmentsByModuleId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentsByModuleId.fulfilled, (state, action) => {
        state.loading = false;
        const { moduleId, assessments } = action.payload;
        state.assessments = [
          ...state.assessments.filter((a) => a.moduleId !== moduleId),
          ...assessments,
        ];
      })
      .addCase(fetchAssessmentsByModuleId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchAssessmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAssessmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAssessment = action.payload;
      })
      .addCase(fetchAssessmentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(startAssessmentThunk.fulfilled, (state, action) => {
        state.activeSubmission = action.payload;
      })
      .addCase(createAssessmentThunk.fulfilled, (state, action) => {
        state.assessments.push(action.payload);
      })
      .addCase(updateAssessmentThunk.fulfilled, (state, action) => {
        const index = state.assessments.findIndex((a) => a.id === action.payload.id);
        if (index !== -1) {
          state.assessments[index] = action.payload;
        }
        if (state.currentAssessment?.id === action.payload.id) {
          state.currentAssessment = action.payload;
        }
      })
      .addCase(deleteAssessmentThunk.fulfilled, (state, action) => {
        const id = action.payload;
        state.assessments = state.assessments.filter((a) => a.id !== id);
      })
      .addCase(fetchAssessmentAnalytics.fulfilled, (state, action) => {
        const { id, analytics } = action.payload;
        state.analyticsMap[id] = analytics;
      })
      .addCase(submitAssessmentAnswers.pending, (state) => {
        state.submitting = true;
      })
      .addCase(submitAssessmentAnswers.fulfilled, (state, action) => {
        state.submitting = false;
        state.submitResult = action.payload;
      })
      .addCase(submitAssessmentAnswers.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload;
      });
  },
});

export const { clearAssessmentError, clearCurrentAssessment } = assessmentSlice.actions;

export const selectAssessmentsByModuleId = (moduleId) =>
  createSelector(
    (state) => state.assessments.assessments,
    (assessments) => assessments.filter((a) => !moduleId || a.moduleId === moduleId)
  );

export const selectCurrentAssessment = (state) => state.assessments.currentAssessment;
export const selectActiveSubmission = (state) => state.assessments.activeSubmission;
export const selectAssessmentsLoading = (state) => state.assessments.loading;
export const selectAssessmentSubmitting = (state) => state.assessments.submitting;
export const selectSubmitResult = (state) => state.assessments.submitResult;
export const selectAssessmentError = (state) => state.assessments.error;
export const selectEnrollmentAssessmentStatus = (state) => state.assessments.enrollmentStatus;
export const selectEnrollmentStatusLoading = (state) => state.assessments.enrollmentStatusLoading;
export const selectAssessmentAnalytics = (assessmentId) => (state) =>
  state.assessments.analyticsMap[assessmentId] || null;

export default assessmentSlice.reducer;
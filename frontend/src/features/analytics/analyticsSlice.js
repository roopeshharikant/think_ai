import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getEnrollmentTrends,
  getCourseEnrollments,
  getCourseCompletionRates,
  getAssessmentAnalytics,
} from '../../api/analyticsApi';

const initialState = {
  enrollmentTrends: [],
  courseEnrollments: [],
  courseCompletionRates: [],
  assessmentAnalytics: null,
  loading: false,
  error: null,
};

export const fetchEnrollmentTrends = createAsyncThunk(
  'analytics/fetchEnrollmentTrends',
  async (params, { rejectWithValue }) => {
    try {
      const res = await getEnrollmentTrends(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load enrollment trends');
    }
  }
);

export const fetchCourseEnrollments = createAsyncThunk(
  'analytics/fetchCourseEnrollments',
  async (params, { rejectWithValue }) => {
    try {
      const res = await getCourseEnrollments(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load course enrollments');
    }
  }
);

export const fetchCourseCompletionRates = createAsyncThunk(
  'analytics/fetchCourseCompletionRates',
  async (params, { rejectWithValue }) => {
    try {
      const res = await getCourseCompletionRates(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load completion rates');
    }
  }
);

export const fetchAssessmentAnalytics = createAsyncThunk(
  'analytics/fetchAssessmentAnalytics',
  async (params, { rejectWithValue }) => {
    try {
      const res = await getAssessmentAnalytics(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load assessment analytics');
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearAnalyticsError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Enrollment Trends
      .addCase(fetchEnrollmentTrends.fulfilled, (state, action) => {
        state.enrollmentTrends = action.payload.data;
      })
      // Course Enrollments
      .addCase(fetchCourseEnrollments.fulfilled, (state, action) => {
        state.courseEnrollments = action.payload.data;
      })
      // Course Completion Rates
      .addCase(fetchCourseCompletionRates.fulfilled, (state, action) => {
        state.courseCompletionRates = action.payload.data;
      })
      // Assessment Analytics
      .addCase(fetchAssessmentAnalytics.fulfilled, (state, action) => {
        state.assessmentAnalytics = action.payload.data;
      });
  },
});

export const { clearAnalyticsError } = analyticsSlice.actions;

export const selectEnrollmentTrends = (state) => state.analytics.enrollmentTrends;
export const selectCourseEnrollments = (state) => state.analytics.courseEnrollments;
export const selectCourseCompletionRates = (state) => state.analytics.courseCompletionRates;
export const selectAssessmentAnalyticsData = (state) => state.analytics.assessmentAnalytics;
export const selectAnalyticsLoading = (state) => state.analytics.loading;

export default analyticsSlice.reducer;
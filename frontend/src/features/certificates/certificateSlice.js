import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  checkCertificateEligibility,
  getCertificateByEnrollment,
} from '../../api/certificateApi';

const initialState = {
  eligibilityMap: {},       // enrollmentId -> eligibility data object
  byEnrollmentId: {},       // enrollmentId -> certificate object
  loading: false,
  eligibilityLoading: false,
  error: null,
};

export const fetchCertificateEligibility = createAsyncThunk(
  'certificates/fetchEligibility',
  async (enrollmentId, { rejectWithValue }) => {
    try {
      const response = await checkCertificateEligibility(enrollmentId);
      return { enrollmentId, eligibility: response.data.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to check certificate eligibility');
    }
  }
);

export const fetchCertificateByEnrollment = createAsyncThunk(
  'certificates/fetchByEnrollment',
  async (enrollmentId, { rejectWithValue }) => {
    try {
      const response = await getCertificateByEnrollment(enrollmentId);
      return { enrollmentId, certificate: response.data.data };
    } catch (err) {
      if (err.response?.status === 404) return { enrollmentId, certificate: null };
      return rejectWithValue(err.response?.data?.message || 'Failed to load certificate');
    }
  }
);

const certificateSlice = createSlice({
  name: 'certificates',
  initialState,
  reducers: {
    clearCertificateError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Eligibility
      .addCase(fetchCertificateEligibility.pending, (state) => {
        state.eligibilityLoading = true;
        state.error = null;
      })
      .addCase(fetchCertificateEligibility.fulfilled, (state, action) => {
        state.eligibilityLoading = false;
        state.eligibilityMap[action.payload.enrollmentId] = action.payload.eligibility;
      })
      .addCase(fetchCertificateEligibility.rejected, (state, action) => {
        state.eligibilityLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Certificate by Enrollment
      .addCase(fetchCertificateByEnrollment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCertificateByEnrollment.fulfilled, (state, action) => {
        state.loading = false;
        state.byEnrollmentId[action.payload.enrollmentId] = action.payload.certificate;
      })
      .addCase(fetchCertificateByEnrollment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearCertificateError } = certificateSlice.actions;

export const selectEligibilityFor = (enrollmentId) => (state) =>
  state.certificates.eligibilityMap[enrollmentId] || null;

export const selectCertificateForEnrollment = (enrollmentId) => (state) =>
  state.certificates.byEnrollmentId[enrollmentId] || null;

export const selectCertificateLoading = (state) => state.certificates.loading;
export const selectEligibilityLoading = (state) => state.certificates.eligibilityLoading;
export const selectCertificateError = (state) => state.certificates.error;

export default certificateSlice.reducer;
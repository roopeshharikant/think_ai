import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { runCode as runCodeApi, submitSolution as submitSolutionApi,  practiceRun as practiceRunApi, } from '../../api/codeExecutionApi';

const initialState = {
  status: 'idle', // idle | running | success | error
  mode: null,     // 'run' | 'submit'
  errorMessage: null,

  // populated after a Run
  run: null, // { status, stdout, stderr, compileOutput, time, memory }

  // populated after a Submit
  submission: null, // { verdict, score, totalMarks, percentage, testCases, results }
};

export const runCode = createAsyncThunk(
  'codeExecution/runCode',
  async ({ language, code, stdin = '', submissionId, questionId, testCaseId }, { rejectWithValue }) => {
    try {
      return await runCodeApi({ language, code, stdin, submissionId, questionId, testCaseId });
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Run failed');
    }
  }
);

export const submitSolution = createAsyncThunk(
  'codeExecution/submitSolution',
  async ({ submissionId, questionId, language, code }, { rejectWithValue }) => {
    try {
      return await submitSolutionApi({ submissionId, questionId, language, code });
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Submit failed');
    }
  }
);

export const practiceRun = createAsyncThunk(
  'codeExecution/practiceRun',
  async ({ language, code, stdin = '' }, { rejectWithValue }) => {
    try {
      return await practiceRunApi({ language, code, stdin });
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message || 'Run failed');
    }
  }
);


const codeExecutionSlice = createSlice({
  name: 'codeExecution',
  initialState,
  reducers: {
    resetExecution: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // ---- Run ----
      .addCase(runCode.pending, (state) => {
        Object.assign(state, initialState, { status: 'running', mode: 'run' });
      })
      .addCase(runCode.fulfilled, (state, action) => {
        const r = action.payload;
        state.status = r.status?.id === 3 ? 'success' : 'error';
        state.run = r;
        state.errorMessage = r.status?.id === 3 ? null : (r.message || r.status?.description || 'Execution failed');
      })
      .addCase(runCode.rejected, (state, action) => {
        state.status = 'error';
        state.errorMessage = action.payload || 'Run failed';
      })

      // ---- Submit ----
      .addCase(submitSolution.pending, (state) => {
        Object.assign(state, initialState, { status: 'running', mode: 'submit' });
      })
      .addCase(submitSolution.fulfilled, (state, action) => {
        const r = action.payload;
        state.status = r.verdict === 'ACCEPTED' ? 'success' : 'error';
        state.submission = r;
        state.errorMessage = r.verdict === 'ACCEPTED' ? null : r.verdict;
      })
      .addCase(submitSolution.rejected, (state, action) => {
        state.status = 'error';
        state.errorMessage = action.payload || 'Submit failed';
      })
      .addCase(practiceRun.pending, (state) => {
        Object.assign(state, initialState, { status: 'running', mode: 'practice' });
      })
      .addCase(practiceRun.fulfilled, (state, action) => {
        const r = action.payload;
        state.status = r.status?.id === 3 ? 'success' : 'error';
        state.run = r;
        state.errorMessage = r.status?.id === 3 ? null : (r.message || r.status?.description || 'Execution failed');
      })
      .addCase(practiceRun.rejected, (state, action) => {
        state.status = 'error';
        state.errorMessage = action.payload || 'Run failed';
      });

  },
});

export const { resetExecution } = codeExecutionSlice.actions;
export default codeExecutionSlice.reducer;
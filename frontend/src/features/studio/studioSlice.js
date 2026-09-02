import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getStudioSession, joinStudioSession } from "../../api/studioApi";

export const fetchStudioSession = createAsyncThunk(
  "studio/fetchSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await getStudioSession(sessionId);
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch studio session");
    }
  }
);

export const joinSessionThunk = createAsyncThunk(
  "studio/joinSession",
  async (sessionId, { rejectWithValue }) => {
    try {
      const response = await joinStudioSession(sessionId);
      return response.data?.data || response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to join session");
    }
  }
);

const studioSlice = createSlice({
  name: "studio",
  initialState: {
    currentSession: null,
    attendees: [],
    polls: [],
    messages: [],
    loading: false,
    error: null,
  },
  reducers: {
    setLiveAttendees: (state, action) => {
      state.attendees = action.payload;
    },
    appendStudioMessage: (state, action) => {
      state.messages.push(action.payload);
    },
    updateActivePolls: (state, action) => {
      state.polls = action.payload;
    },
    updateAttendeeState: (state, action) => {
      const { userId, changes } = action.payload;
      const attendee = state.attendees.find(a => a.userId === userId);
      if (attendee) {
        Object.assign(attendee, changes);
      }
    },
    clearStudioState: (state) => {
      state.currentSession = null;
      state.attendees = [];
      state.polls = [];
      state.messages = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStudioSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchStudioSession.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSession = action.payload;
        state.attendees = action.payload.attendees || [];
        state.polls = action.payload.polls || [];
        state.messages = action.payload.messages || [];
      })
      .addCase(fetchStudioSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(joinSessionThunk.fulfilled, (state, action) => {
        state.currentSession = action.payload;
        state.attendees = action.payload.attendees || [];
      });
  },
});

export const { 
  setLiveAttendees, 
  appendStudioMessage, 
  updateActivePolls, 
  updateAttendeeState,
  clearStudioState 
} = studioSlice.actions;

export const selectStudioSession = (state) => state.studio.currentSession;
export const selectStudioAttendees = (state) => state.studio.attendees;
export const selectStudioMessages = (state) => state.studio.messages;
export const selectStudioPolls = (state) => state.studio.polls;
export const selectStudioLoading = (state) => state.studio.loading;

export default studioSlice.reducer;
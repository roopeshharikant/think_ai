import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { searchCourses, searchModules, searchLessons } from '../../api/searchApi';

const initialState = {
  query: '',
  courses: [],
  modules: [],
  lessons: [],
  loading: false,
  error: null,
};

export const runGlobalSearch = createAsyncThunk(
  'search/run',
  async (query, { rejectWithValue }) => {
    if (!query || query.trim().length < 2) {
      return { query, courses: [], modules: [], lessons: [] };
    }
    try {
      const [coursesResult, modulesResult, lessonsResult] = await Promise.allSettled([
        searchCourses(query),
        searchModules(query),
        searchLessons(query),
      ]);
      return {
        query,
        courses: coursesResult.status === 'fulfilled' ? coursesResult.value : [],
        modules: modulesResult.status === 'fulfilled' ? modulesResult.value : [],
        lessons: lessonsResult.status === 'fulfilled' ? lessonsResult.value : [],
      };
    } catch (err) {
      return rejectWithValue(err.message || 'Search failed');
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    clearSearch: (state) => {
      state.query = '';
      state.courses = [];
      state.modules = [];
      state.lessons = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runGlobalSearch.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(runGlobalSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.query = action.payload.query;
        state.courses = action.payload.courses;
        state.modules = action.payload.modules;
        state.lessons = action.payload.lessons;
      })
      .addCase(runGlobalSearch.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = searchSlice.actions;

export const selectSearchQuery = (state) => state.search.query;
export const selectSearchCourses = (state) => state.search.courses;
export const selectSearchModules = (state) => state.search.modules;
export const selectSearchLessons = (state) => state.search.lessons;
export const selectSearchLoading = (state) => state.search.loading;
export const selectSearchTotalCount = (state) =>
  state.search.courses.length + state.search.modules.length + state.search.lessons.length;

export default searchSlice.reducer;
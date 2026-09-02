import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import {
  getUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
} from '../../api/adminUserApi'

const initialState = {
  items: [],
  loading: false,
  error: null,
}

const getId = (u) => u?.id || u?._id

export const fetchUsers = createAsyncThunk(
  'adminUsers/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getUsersApi()
      const payload = response.data?.data
      return Array.isArray(payload) ? payload : []
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load users')
    }
  }
)

export const createUser = createAsyncThunk(
  'adminUsers/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await createUserApi(userData)
      return response.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create user')
    }
  }
)

export const updateUser = createAsyncThunk(
  'adminUsers/updateUser',
  async ({ userId, data }, { rejectWithValue }) => {
    try {
      const response = await updateUserApi(userId, data)
      return response.data.data
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update user')
    }
  }
)

export const deleteUser = createAsyncThunk(
  'adminUsers/deleteUser',
  async (userId, { rejectWithValue }) => {
    try {
      await deleteUserApi(userId)
      return userId
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete user')
    }
  }
)

const adminUserSlice = createSlice({
  name: 'adminUsers',
  initialState,
  reducers: {
    clearAdminUserError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false
        state.items = Array.isArray(action.payload) ? action.payload : []
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      .addCase(createUser.fulfilled, (state, action) => {
        if (action.payload) state.items.push(action.payload)
      })
      .addCase(createUser.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        if (!action.payload) return
        const index = state.items.findIndex((u) => getId(u) === getId(action.payload))
        if (index !== -1) state.items[index] = action.payload
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.items = state.items.filter((u) => getId(u) !== action.payload)
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload
      })
  },
})

export const { clearAdminUserError } = adminUserSlice.actions

export const selectAdminUsers = (state) => state.adminUsers.items
export const selectAdminUsersLoading = (state) => state.adminUsers.loading
export const selectAdminUsersError = (state) => state.adminUsers.error

export default adminUserSlice.reducer
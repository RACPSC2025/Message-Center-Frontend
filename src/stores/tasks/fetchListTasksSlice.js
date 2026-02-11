import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

export const fetchListTasksSpecial = createAsyncThunk(
  'tasks/list_tasks_special',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/amatia/tasklist_api/list_tasks', data);
      return response?.data;
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const fetchListTasksSpecialSlice = createSlice({
  name: 'fetchListTasksSpecial',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchListTasksSpecial.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchListTasksSpecial.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchListTasksSpecial.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      });
  }
});

export default fetchListTasksSpecialSlice.reducer;
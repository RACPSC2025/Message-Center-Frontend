import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

export const dashboardMessageImportant = createAsyncThunk(
  'dashboard/messagesImportant',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/message_center_api/tasklist_api/dashboard_message_important_amatia_express', data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardMessageImportantSlice = createSlice({
  name: 'dashboardMessageImportant',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(dashboardMessageImportant.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(dashboardMessageImportant.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(dashboardMessageImportant.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default dashboardMessageImportantSlice.reducer;

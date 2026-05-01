import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

export const dashboardMessageRead = createAsyncThunk(
  'dashboard/messagesRead',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/message_center_api/tasklist_api/dashboard_message_read_amatia_express', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardMessageReadSlice = createSlice({
  name: 'dashboardMessageRead',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(dashboardMessageRead.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(dashboardMessageRead.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(dashboardMessageRead.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default dashboardMessageReadSlice.reducer;

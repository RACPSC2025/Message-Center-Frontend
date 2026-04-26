import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

export const dashboardMessageUnread = createAsyncThunk(
  'dashboard/messagesUnread',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/message_center_api/tasklist_api/dashboard_message_unread_amatia_express', data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const dashboardMessageUnreadSlice = createSlice({
  name: 'dashboardMessageUnread',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(dashboardMessageUnread.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(dashboardMessageUnread.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(dashboardMessageUnread.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default dashboardMessageUnreadSlice.reducer;

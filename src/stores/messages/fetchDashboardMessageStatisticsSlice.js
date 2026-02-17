import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  error: null,
  data: {
    total_message_count: 0,
    unread_message_count: 0,
    important_message_count: 0,
    archived_message_count: 0
  }
};

export const fetchDashboardMessageStatistics = createAsyncThunk(
  'dashboardMessageStatistics/fetch',
  async (formData, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/tasklist_api/get_dashboard_message_statistics_amatia_express',
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const fetchDashboardMessageStatisticsSlice = createSlice({
  name: 'dashboardMessageStatistics',
  initialState,
  reducers: {
    resetStatistics: (state) => {
      state.data = initialState.data;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardMessageStatistics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardMessageStatistics.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.status === 1) {
          state.data = action.payload.data;
        }
      })
      .addCase(fetchDashboardMessageStatistics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetStatistics } = fetchDashboardMessageStatisticsSlice.actions;
export default fetchDashboardMessageStatisticsSlice.reducer;
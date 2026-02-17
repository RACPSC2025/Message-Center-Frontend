import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
//import axiosInstance from '../../api/axiosInstance';
import axiosInstance from '../../lib/axios';

export const fetchFindingsStats = createAsyncThunk(
  'findings/fetchStats',
  async (params = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key]) {
          queryParams.append(key, params[key]);
        }
      });

      const response = await axiosInstance.get(
        `/message_center_api/inspecciones_api/stats?${queryParams.toString()}`
      );
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

const fetchFindingsStatsSlice = createSlice({
  name: 'findingsStats',
  initialState: {
    loading: false,
    data: null,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFindingsStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFindingsStats.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload?.data || null;
      })
      .addCase(fetchFindingsStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default fetchFindingsStatsSlice.reducer;
// src/stores/findings/fetchFindingDetailsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: null,
  error: null
};

export const fetchFindingDetails = createAsyncThunk(
  'findingDetails/fetchFindingDetails',
  async (id, { rejectWithValue }) => {
    try {
      console.log('🔍 Fetching finding details for ID:', id);
      
      const response = await axiosInstance.get(`/message_center_api/inspecciones_api/detail/${id}`);
      
      console.log('✅ Finding details:', response.data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue('Failed to fetch finding details');
      }
    } catch (error) {
      console.error('❌ Error fetching details:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const fetchFindingDetailsSlice = createSlice({
  name: 'findingDetails',
  initialState,
  reducers: {
    resetFindingDetails: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFindingDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFindingDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchFindingDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetFindingDetails } = fetchFindingDetailsSlice.actions;
export default fetchFindingDetailsSlice.reducer;
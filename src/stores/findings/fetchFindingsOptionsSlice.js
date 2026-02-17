// src/stores/findings/fetchFindingsOptionsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: {
    status: [],
    finding_sources: [],
    finding_types: [],
    finding_classification: [],
    reporters: [],
    contractors: [],
    area_options: [],
    gerencia_options: [],
    risk_levels: [],
    employees: [],
    positions: [],
    basic_causes: [],
    immediate_causes: [],
    hazards: [],
    sub_hazards: [],
    potential_losses: [],
    unsafe_acts_behavior: [],
    users: []
  },
  error: null
};

export const fetchFindingsOptions = createAsyncThunk(
  'findingsOptions/fetchFindingsOptions',
  async (_, { rejectWithValue }) => {
    try {
      // RUTA CORRECTA
      const response = await axiosInstance.get('/message_center_api/inspecciones_api/get_dropdown_options');
      
      console.log('✅ Options:', response.data);
      
      if (response.data.success) {
        return response.data.data;
      } else {
        return rejectWithValue('Failed to fetch options');
      }
    } catch (error) {
      console.error('❌ Error options:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const fetchFindingsOptionsSlice = createSlice({
  name: 'findingsOptions',
  initialState,
  reducers: {
    resetOptions: (state) => {
      state.data = initialState.data;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFindingsOptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFindingsOptions.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(fetchFindingsOptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetOptions } = fetchFindingsOptionsSlice.actions;
export default fetchFindingsOptionsSlice.reducer;
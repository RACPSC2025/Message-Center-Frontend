// src/stores/findings/fetchFindingsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 0
  },
  error: null
};

export const fetchFindings = createAsyncThunk(
  'findings/fetchFindings',
  async (params, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(params).forEach(key => {
        if (params[key] !== '' && params[key] !== null && params[key] !== undefined) {
          queryParams.append(key, params[key]);
        }
      });
      
      const queryString = queryParams.toString();
      // RUTA CORRECTA
      const url = `/message_center_api/inspecciones_api/list${queryString ? `?${queryString}` : ''}`;
      
      console.log('🔍 Fetching findings:', url);
      
      const response = await axiosInstance.get(url);
      
      console.log('✅ Response:', response.data);
      
      return {
        data: response.data.data || [],
        pagination: response.data.pagination || {}
      };
    } catch (error) {
      console.error('❌ Error:', error);
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateFinding = createAsyncThunk(
  'findings/updateFinding',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.put(
        `/message_center_api/inspecciones_api/update/${id}`,
        data
      );
      
      if (response.data.success) {
        return response.data.data;
      }
      
      return rejectWithValue(response.data.message);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Error al actualizar');
    }
  }
);

const fetchFindingsSlice = createSlice({
  name: 'findings',
  initialState,
  reducers: {
    resetFindings: (state) => {
      state.data = [];
      state.pagination = initialState.pagination;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFindings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFindings.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchFindings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetFindings } = fetchFindingsSlice.actions;
export default fetchFindingsSlice.reducer;
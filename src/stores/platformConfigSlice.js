import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../lib/axios';
import defaultConfig from '../config/defaultConfig.json';

const initialState = {
  loading: false,
  data: defaultConfig,
  error: null,
  fetchedFromApi: false
};

export const fetchPlatformConfig = createAsyncThunk(
  'platformConfig/fetchPlatformConfig',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/api/configuration/');
      
      // Si la respuesta es vacía o no tiene datos, retornar null para usar el default
      if (!response.data || Object.keys(response.data).length === 0) {
        return null;
      }
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const platformConfigSlice = createSlice({
  name: 'platformConfig',
  initialState,
  reducers: {
    resetToDefaultConfig: (state) => {
      state.data = defaultConfig;
      state.fetchedFromApi = false;
    },
    updateConfig: (state, action) => {
      state.data = { ...state.data, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlatformConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlatformConfig.fulfilled, (state, action) => {
        state.loading = false;
        // Si hay datos de la API, usar esos; si no, mantener el default
        if (action.payload) {
          state.data = action.payload;
          state.fetchedFromApi = true;
        }
      })
      .addCase(fetchPlatformConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        // En caso de error, mantener la configuración por defecto
        state.data = defaultConfig;
      });
  }
});

export const { resetToDefaultConfig, updateConfig } = platformConfigSlice.actions;

export default platformConfigSlice.reducer;

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../lib/axios';
import defaultConfig from '../config/defaultConfig.json';
import { deepMerge } from '../config/generalConfig';

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
      const response = await axiosInstance.get('/message_center_api/legal_api/get_configuration_amatia_express');
      const configuration = response?.data?.configuration;

      // Si la respuesta es vacía o no tiene configuración, retornar null para usar el default
      if (!configuration || Object.keys(configuration).length === 0) {
        return null;
      }

      return configuration;
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
          state.data = deepMerge(JSON.parse(JSON.stringify(defaultConfig)), action.payload);
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

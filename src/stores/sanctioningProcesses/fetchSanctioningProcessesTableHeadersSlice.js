import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: {},
  error: null
};

export const fetchSanctioningProcessesTableHeaders = createAsyncThunk(
  'sanctioningProcesses/sanctioning_processes_table_headers_amatia_expres',
  async (language = 'es', { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('selected_language', language);

      const response = await axiosInstance.post(
        '/message_center_api/Sanctioning_Processes_api/sanctioning_processes_table_headers_amatia_expres',
        formData
      );

      return response?.data;
    } catch (error) {
      return rejectWithValue(error?.response?.data || error.message);
    }
  }
);

const fetchSanctioningProcessesTableHeadersSlice = createSlice({
  name: 'fetchSanctioningProcessesTableHeaders',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchSanctioningProcessesTableHeaders.pending, (state) => {
      state.loading = true;
    });

    builder.addCase(fetchSanctioningProcessesTableHeaders.rejected, (state, action) => {
      state.loading = false;
      state.data = {};
      state.error = action.payload || action.error.message;
    });

    builder.addCase(fetchSanctioningProcessesTableHeaders.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload || {};
      state.error = null;
    });
  }
});

export default fetchSanctioningProcessesTableHeadersSlice.reducer;

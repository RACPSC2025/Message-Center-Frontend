import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  actionList: {
    loading: false,
    data: [],
    error: null
  },
  actionCount: {
    loading: false,
    data: [],
    error: null
  }
};

// Async thunk for fetching action list
export const fetchActionList = createAsyncThunk(
  'actions/dashboard_actions',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        // '/message_center_api/action_api/dashboard_actions_amatia_express',
        '/message_center_api/action_api/get_actions_amatia_express',
        data
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for fetching action count
export const fetchActionCount = createAsyncThunk(
  'action/count',
  async (payload = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/action_api/get_action_counts_amatia_express',
        payload
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchActionSlice = createSlice({
  name: 'actionData',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    // Action List reducers
    builder.addCase(fetchActionList.pending, (state) => {
      state.actionList.loading = true;
    });
    builder.addCase(fetchActionList.rejected, (state, action) => {
      state.actionList.loading = false;
      state.actionList.data = [];
      state.actionList.error = action.error.message;
    });
    builder.addCase(fetchActionList.fulfilled, (state, action) => {
      state.actionList.loading = false;
      // Convertir action_id a numérico en los datos recibidos
      const processedData = action.payload;
      if (processedData?.data && Array.isArray(processedData.data)) {
        processedData.data = processedData.data.map(item => {
          const convertedId = item.action_id ? parseInt(item.action_id, 10) : item.action_id;
          return {
            ...item,
            action_id: convertedId
          };
        });
      }
      state.actionList.data = processedData;
      state.actionList.error = null;
    });

    // Action Count reducers
    builder.addCase(fetchActionCount.pending, (state) => {
      state.actionCount.loading = true;
    });
    builder.addCase(fetchActionCount.rejected, (state, action) => {
      state.actionCount.loading = false;
      state.actionCount.data = [];
      state.actionCount.error = action.error.message;
    });
    builder.addCase(fetchActionCount.fulfilled, (state, action) => {
      state.actionCount.loading = false;
      state.actionCount.data = action.payload;
      state.actionCount.error = null;
    });
  }
});

export default fetchActionSlice.reducer;

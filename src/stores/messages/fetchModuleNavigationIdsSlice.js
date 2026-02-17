import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  error: null,
  data: null
};

export const fetchModuleNavigationIds = createAsyncThunk(
  'moduleNavigation/fetchIds',
  async (params, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('module_string', params.module_string);
      formData.append('module_table', params.module_table);
      formData.append('module_table_record_id', params.module_table_record_id);

      const response = await axiosInstance.post(
        '/tasklist_api/get_module_navigation_ids_amatia_express',
        formData
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const fetchModuleNavigationIdsSlice = createSlice({
  name: 'moduleNavigation',
  initialState,
  reducers: {
    resetNavigationIds: (state) => {
      state.data = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchModuleNavigationIds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchModuleNavigationIds.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload?.status === 1) {
          state.data = action.payload.data;
        }
      })
      .addCase(fetchModuleNavigationIds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { resetNavigationIds } = fetchModuleNavigationIdsSlice.actions;
export default fetchModuleNavigationIdsSlice.reducer;
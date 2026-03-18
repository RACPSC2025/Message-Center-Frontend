import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

// Async thunk para actualizar una acción
export const updateAction = createAsyncThunk(
  'actions/dashboard_actions_update_amatia_express',
  async (data = {}, { rejectWithValue }) => {
    try {
      // console.log('[API] Actualizando acción con datos:', data);
      const response = await axiosInstance.post(
        '/message_center_api/action_api/dashboard_actions_update_amatia_express',
        data
      );

      // console.log('[API] Respuesta de actualización:', response?.data);
      return response?.data;
    } catch (error) {
      // console.error('[API] Error al actualizar acción:', error);
      return rejectWithValue(error.message);
    }
  }
);

const updateActionSlice = createSlice({
  name: 'updateAction',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(updateAction.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateAction.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(updateAction.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default updateActionSlice.reducer;

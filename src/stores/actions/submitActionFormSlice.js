import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

// TODO: Utilizar más adelante, ha sido duplicada el endpoint muestra error 500
/* Reportan que aparentemente se trata de un problema de 
autenticación en el backend, así que de manera provisional se estará usando submitActionForm*/
export const submitActionForm2 = createAsyncThunk(
  'actions/action_form_submit_original',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/action_api/action_form_submit',
        data
      );

      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const submitActionForm = createAsyncThunk(
  'actions/action_form_submit',
  async (data = {}, { rejectWithValue }) => {
    try {
      const payload = {
        ...data,
        action_source: data?.action_source || 'hs_action'
      };

      const response = await axiosInstance.post(
        '/message_center_api/action_api/action_form_submit_amatia_express',
        payload
      );

      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const submitActionFormSlice = createSlice({
  name: 'submitActionForm',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(submitActionForm.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(submitActionForm.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(submitActionForm.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default submitActionFormSlice.reducer;

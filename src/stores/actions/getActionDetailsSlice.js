import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

export const getActionDetails = createAsyncThunk(
  'actions/get_action_detail',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/action_api/get_action_detail',
        data
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getActionResumeIA = createAsyncThunk(
  'actions/get_resume_ia',
  async (text, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/action_api/get_resume_ia',
        { dato: text }
      );

      // Aseguramos que la respuesta tenga el formato esperado
      const iaData = response?.data;

      // Si existe contenido de texto
      const resumenIA =
        iaData?.content && iaData.content.length > 0
          ? iaData.content[0].text
          : 'Sin resumen disponible';

      return resumenIA; // ← devolvemos solo el texto útil
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);


export const getDeepAnalysis = createAsyncThunk(
  'actions/get_deep_analysis_ia',
  async (text, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/action_api/get_deep_analysis_ia',
        { dato: text }
      );

      // Aseguramos que la respuesta tenga el formato esperado
      const iaData = response?.data;

      // Si existe contenido de texto
      const resumenIA =
        iaData?.content && iaData.content.length > 0
          ? iaData.content[0].text
          : 'Sin análisis disponible';

      return resumenIA; // ← devolvemos solo el texto útil
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

export const getActionCorrectionIA = createAsyncThunk(
  'actions/get_correction_ia',
  async (text, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/action_api/get_correction_ia',
        { dato: text }
      );

      // Aseguramos que la respuesta tenga el formato esperado
      const iaData = response?.data;

      // Si existe contenido de texto
      const resumenIA =
        iaData?.content && iaData.content.length > 0
          ? iaData.content[0].text
          : 'Sin corrección disponible';

      return resumenIA; // ← devolvemos solo el texto útil
    } catch (error) {
      if (error.response && error.response.data.message) {
        return rejectWithValue(error.response.data.message);
      } else {
        return rejectWithValue(error.message);
      }
    }
  }
);

const getActionDetailsSlice = createSlice({
  name: 'getActionDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getActionDetails.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(getActionDetails.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(getActionDetails.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default getActionDetailsSlice.reducer;

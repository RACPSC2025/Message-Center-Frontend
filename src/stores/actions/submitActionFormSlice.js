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
      const normalizedActionSource =
        data?.action_source
        || data?.module_string_id
        || data?.action_table
        || 'hs_action';

      const payload = {
        ...data,
        action_source: normalizedActionSource,

        // API expects reviewer_person_id. Some responses/forms expose reviewer_person.
        reviewer_person_id: data?.reviewer_person_id || data?.reviewer_person || '',

        // API expects responsible_person for hs_action and responsible_person_id for all_action_plan.
        responsible_person: data?.responsible_person || data?.responsibe_person || '',
        responsible_person_id:
          data?.responsible_person_id
          || data?.responsible_person
          || data?.responsibe_person
          || '',

        // API expects level_1..level_4 but edit responses can expose db column names.
        level_1: data?.level_1 || data?.id_region || '',
        level_2: data?.level_2 || data?.id_planta || '',
        level_3: data?.level_3 || data?.level3 || '',
        level_4: data?.level_4 || data?.level4 || '',

        // API expects hs_causes key.
        hs_causes: data?.hs_causes || data?.hs_cause || ''
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

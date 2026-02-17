import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: null,
  error: null
};

export const updateMessageFlag = createAsyncThunk(
  'messages/updateMessageFlag',
  async (data, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('/tasklist_api/update_message_flag_amatia_express', data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const updateMessageFlagSlice = createSlice({
  name: 'updateMessageFlag',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(updateMessageFlag.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(updateMessageFlag.rejected, (state, action) => {
      state.loading = false;
      state.data = null;
      state.error = action.error.message;
    });
    builder.addCase(updateMessageFlag.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default updateMessageFlagSlice.reducer;
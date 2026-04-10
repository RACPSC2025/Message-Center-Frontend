import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null
};

const normalizeCommentsPayload = (payload = {}) => {
  const apiData = payload?.data;

  if (Array.isArray(apiData)) {
    return {
      ...payload,
      data: {
        responsible_comments: apiData,
        reviewer_comments: [],
        other_comments: [],
        attachments: []
      }
    };
  }

  return {
    ...payload,
    data: {
      responsible_comments: apiData?.responsible_comments || [],
      reviewer_comments: apiData?.reviewer_comments || [],
      other_comments: apiData?.other_comments || [],
      attachments: apiData?.attachments || [],
      action_id: apiData?.action_id,
      action_table: apiData?.action_table,
      source_table: apiData?.source_table,
      responsible_person: apiData?.responsible_person,
      reviewer_person: apiData?.reviewer_person
    }
  };
};

export const fetchActionComments = createAsyncThunk(
  'comments/list_action_comments',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/action_api/get_actions_list_comments_amatia_express',
        data
      );
      return normalizeCommentsPayload(response?.data);
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchActionComments2 = createAsyncThunk(
  'comments/list_action_comments_original',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(
        '/message_center_api/action_api/list_action_comments',
        data
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchActionCommentsSlice = createSlice({
  name: 'fetchActionComments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(fetchActionComments.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchActionComments.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(fetchActionComments.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;
    });
  }
});

export default fetchActionCommentsSlice.reducer;

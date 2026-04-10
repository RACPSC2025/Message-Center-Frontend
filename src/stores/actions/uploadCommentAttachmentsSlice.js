import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  data: [],
  error: null,
  lastUpload: {
    status: null,
    task_id: null,
    logtask_id: null,
    comment_id: null,
    updated_at: null
  }
};

/*
export const uploadCommentAttachments = createAsyncThunk(
  'comments/upload_comment_attachments',
  async (data = {}, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post('tasklist_api/upload_comment_attachments', data);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);
*/

export const uploadCommentAttachments = createAsyncThunk(
  'comments/upload_comment_attachments_amatia_express',
  async (data = {}, { rejectWithValue }) => {
    try {
      const payload = data?.formData ?? data;
      const response = await axiosInstance.post('tasklist_api/upload_comment_attachments_amatia_express', payload);
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const uploadActionCommentAttachments = createAsyncThunk(
  'comments/upload_action_comment_attachments_amatia_express',
  async (data = {}, { rejectWithValue }) => {
    try {
      const payload = data?.formData ?? data;
      const response = await axiosInstance.post(
        '/message_center_api/action_api/upload_comments_attachment_amatia_express',
        payload
      );
      return response?.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);


const uploadCommentAttachmentsSlice = createSlice({
  name: 'uploadCommentAttachments',
  initialState,
  reducers: {
    clearUploadAttachmentFocus: (state) => {
      state.lastUpload = {
        status: null,
        task_id: null,
        logtask_id: null,
        comment_id: null,
        updated_at: null
      };
    }
  },
  extraReducers: (builder) => {
    builder.addCase(uploadCommentAttachments.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(uploadCommentAttachments.rejected, (state, action) => {
      state.loading = false;
      state.data = [];
      state.error = action.error.message;
    });
    builder.addCase(uploadCommentAttachments.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;

      const status = Number(action?.payload?.status);
      state.lastUpload = {
        status: Number.isFinite(status) ? status : null,
        task_id: action?.payload?.task_id ?? action?.meta?.arg?.task_id ?? null,
        logtask_id: action?.payload?.logtask_id ?? null,
        comment_id: action?.payload?.comment_id ?? null,
        updated_at: new Date().toISOString()
      };
    });

    builder.addCase(uploadActionCommentAttachments.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(uploadActionCommentAttachments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(uploadActionCommentAttachments.fulfilled, (state, action) => {
      state.loading = false;
      state.data = action.payload;
      state.error = null;

      const status = Number(action?.payload?.status);
      state.lastUpload = {
        status: Number.isFinite(status) ? status : null,
        task_id: action?.meta?.arg?.task_id ?? null,
        logtask_id: action?.meta?.arg?.logtask_id ?? null,
        comment_id: action?.payload?.data?.comment_id ?? action?.meta?.arg?.comment_id ?? null,
        updated_at: new Date().toISOString()
      };
    });
  }
});

export const { clearUploadAttachmentFocus } = uploadCommentAttachmentsSlice.actions;

export default uploadCommentAttachmentsSlice.reducer;

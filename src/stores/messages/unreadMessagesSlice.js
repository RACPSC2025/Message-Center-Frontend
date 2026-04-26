import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

// Thunk para obtener el contador de mensajes no leídos
export const fetchUnreadMessagesCount = createAsyncThunk(
  'unreadMessages/fetchCount',
  async (userId, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (userId) {
        formData.append('user_id', userId);
      }
      
      const response = await axiosInstance.post(
        '/message_center_api/tasklist_api/get_unread_messages_count',
        formData
      );
      
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { count: 0 });
    }
  }
);

const unreadMessagesSlice = createSlice({
  name: 'unreadMessages',
  initialState: {
    count: 0,
    loading: false,
    error: null,
    lastUpdated: null
  },
  reducers: {
    incrementUnreadCount: (state) => {
      state.count += 1;
      state.lastUpdated = new Date().toISOString();
    },
    decrementUnreadCount: (state) => {
      if (state.count > 0) {
        state.count -= 1;
      }
      state.lastUpdated = new Date().toISOString();
    },
    resetUnreadCount: (state) => {
      state.count = 0;
      state.lastUpdated = new Date().toISOString();
    },
    setUnreadCount: (state, action) => {
      state.count = action.payload;
      state.lastUpdated = new Date().toISOString();
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUnreadMessagesCount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUnreadMessagesCount.fulfilled, (state, action) => {
        state.loading = false;
        state.count = action.payload.count || 0;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchUnreadMessagesCount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.count = 0;
      });
  }
});

export const { 
  incrementUnreadCount, 
  decrementUnreadCount, 
  resetUnreadCount,
  setUnreadCount 
} = unreadMessagesSlice.actions;

export default unreadMessagesSlice.reducer;
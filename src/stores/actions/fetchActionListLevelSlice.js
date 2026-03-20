import { createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

export const fetchActionListLevel = createAsyncThunk(
  'actions/list-level',
  async (data, { rejectWithValue }) => {
    const { level, formData = {} } = data;

    // Action_api currently supports organization levels 1..4.
    if (![1, 2, 3, 4].includes(Number(level))) {
      return rejectWithValue(`Unsupported action level: ${level}`);
    }

    try {
      const response = await axiosInstance.post(
        `/message_center_api/action_api/list_level${level}`,
        formData
      );
      return {
        level,
        data: response?.data || []
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

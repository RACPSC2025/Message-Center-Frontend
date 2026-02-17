import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axios';

const initialState = {
  loading: false,
  level1Options: [],
  level2Options: [],
  level3Options: [],
  level4Options: [],
  level5Options: [],
  error: null
};

export const fetchTaskListLevel = createAsyncThunk(
  'task/list-level',
  async (data, { rejectWithValue }) => {
    const { level, formData = {} } = data;
    const levelUrl = level == 1 ? 'list_level1' : `get_level${level}`;

    try {
      const response = await axiosInstance.post(`/tasklist_api/${levelUrl}`, formData);
      return {
        level,
        data: response?.data || []
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const fetchTaskListLevelSlice = createSlice({
  name: 'fetchTaskListLevel',
  initialState,
  reducers: {
    resetLevels: (state) => {
      state.level1Options = [];
      state.level2Options = [];
      state.level3Options = [];
      state.level4Options = [];
      state.level5Options = [];
      state.error = null;
    },
    resetLevel2AndBelow: (state) => {
      state.level2Options = [];
      state.level3Options = [];
      state.level4Options = [];
      state.level5Options = [];
    },
    resetLevel3AndBelow: (state) => {
      state.level3Options = [];
      state.level4Options = [];
      state.level5Options = [];
    },
    resetLevel4AndBelow: (state) => {
      state.level4Options = [];
      state.level5Options = [];
    },
    resetLevel5: (state) => {
      state.level5Options = [];
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchTaskListLevel.pending, (state, action) => {
      state.loading = true;
    });
    builder.addCase(fetchTaskListLevel.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message;
    });
    builder.addCase(fetchTaskListLevel.fulfilled, (state, action) => {
      state.loading = false;
      state.error = null;
      
      const { level, data } = action.payload;
      
      // Almacenar los datos en el nivel correspondiente
      switch (level) {
        case 1:
          state.level1Options = data;
          break;
        case 2:
          state.level2Options = data;
          break;
        case 3:
          state.level3Options = data;
          break;
        case 4:
          state.level4Options = data;
          break;
        case 5:
          state.level5Options = data;
          break;
        default:
          break;
      }
    });
  }
});

export const { 
  resetLevels, 
  resetLevel2AndBelow, 
  resetLevel3AndBelow, 
  resetLevel4AndBelow,
  resetLevel5 
} = fetchTaskListLevelSlice.actions;

export default fetchTaskListLevelSlice.reducer;
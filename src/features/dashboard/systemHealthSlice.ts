import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { SystemHealth, SystemHealthState } from '../../common/types';
import { fetchSystemHealthAPI } from './systemHealthAPI'; // Ensure this path and export name are correct
import { logout } from '../auth/authSlice';

const initialState: SystemHealthState = { status: null, loading: false, error: null };

export const fetchSystemHealth = createAsyncThunk<SystemHealth, void, { rejectValue: string }>(
  'systemHealth/fetchSystemHealth',
  // Explicitly name the first argument if preferred, even if unused
  async (_arg: void, { rejectWithValue }) => {
    try {
      // Calling the imported function
      return await fetchSystemHealthAPI();
    } catch (error: any) {
      // Ensure the string is correctly terminated
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch system health');
    }
  }
);

const systemHealthSlice = createSlice({
  name: 'systemHealth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystemHealth.pending, (state) => {
        state.loading = true; state.error = null;
      })
      .addCase(fetchSystemHealth.fulfilled, (state, action: PayloadAction<SystemHealth>) => {
        state.loading = false; state.status = action.payload; state.error = null;
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.loading = false;
        // Provide a default offline status on error
        state.status = { database: 'offline', yolo_service: 'offline', ollama_service: 'offline' };
        state.error = action.payload ?? 'Failed to fetch system health';
      })
      .addCase(logout, (state) => {
        state.status = null; state.loading = false; state.error = null;
      });
  },
});

export const selectSystemHealth = (state: RootState) => state.systemHealth.status;
export const selectSystemHealthLoading = (state: RootState) => state.systemHealth.loading;
export const selectSystemHealthError = (state: RootState) => state.systemHealth.error;
export default systemHealthSlice.reducer;

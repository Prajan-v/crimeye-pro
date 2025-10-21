import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { AiDetection, DetectionsState } from '../../common/types';
import { fetchIncidentsAPI } from './incidentsAPI';
import { logout } from '../auth/authSlice';

const MAX_INCIDENTS_IN_STATE = 100;

const initialState: DetectionsState = { detections: [], status: 'idle', error: null };

export const fetchIncidents = createAsyncThunk<AiDetection[], number | void, { rejectValue: string }>(
  'incidents/fetchIncidents',
  async (limit = 50, { rejectWithValue }) => {
    try {
      return await fetchIncidentsAPI(limit);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch incidents');
    }
  }
);

const incidentsSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    addIncident: (state, action: PayloadAction<AiDetection>) => {
      const exists = state.detections.some(d => d.id === action.payload.id || (d.camera_id ===
        action.payload.camera_id && d.timestamp === action.payload.timestamp));
      if (!exists) {
        state.detections.unshift(action.payload);
        if (state.detections.length > MAX_INCIDENTS_IN_STATE) {
          state.detections.pop();
        }
      } else {
        console.warn(`[Incidents Slice] Incident ID ${action.payload.id} already exists, skipping add.`);
      }
    },
    clearIncidents: (state) => {
      state.detections = [];
      state.status = 'idle';
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncidents.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchIncidents.fulfilled, (state, action: PayloadAction<AiDetection[]>) => {
        state.status = 'succeeded';
        const existingIds = new Set(state.detections.map(d => d.id));
        const newDetections = action.payload.filter(d => !existingIds.has(d.id));
        state.detections = [...state.detections, ...newDetections]
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .slice(0, MAX_INCIDENTS_IN_STATE);
        state.error = null;
      })
      .addCase(fetchIncidents.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to fetch incidents';
      })
      .addCase(logout, (state) => {
        state.detections = [];
        state.status = 'idle';
        state.error = null;
      });
  },
});

export const { addIncident, clearIncidents } = incidentsSlice.actions;
export const selectAllIncidents = (state: RootState) => state.incidents.detections;
export const selectIncidentsStatus = (state: RootState) => state.incidents.status;
export const selectIncidentsError = (state: RootState) => state.incidents.error;
export const selectRecentIncidents = (state: RootState, count: number = 5) =>
  state.incidents.detections.slice(0, count);

export default incidentsSlice.reducer;

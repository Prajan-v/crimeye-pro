import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { CameraResponse, fetchCamerasAPI } from './liveFeedsAPI';

export type Camera = CameraResponse;

type AsyncStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface LiveFeedsState {
  cameras: CameraResponse[];
  status: AsyncStatus;
  error: string | null;
}

const initialState: LiveFeedsState = {
  cameras: [],
  status: 'idle',
  error: null,
};

const createTimestamp = () => new Date().toISOString();

const DESKTOP_CAMERA_ID = 'DESKTOP_WEBCAM';

const demoCameras: CameraResponse[] = [
  {
    id: 'DEMO_ENTRANCE',
    name: 'HQ Main Entrance',
    rtsp_url: 'rtsp://demo.local/entrance',
    location: 'Ground Floor',
    status: 'online',
    is_system_camera: false,
    created_at: createTimestamp(),
  },
  {
    id: 'DEMO_PARKING',
    name: 'Parking Structure',
    rtsp_url: 'rtsp://demo.local/parking',
    location: 'Basement Level 2',
    status: 'buffering',
    is_system_camera: false,
    created_at: createTimestamp(),
  },
  {
    id: 'DEMO_WAREHOUSE',
    name: 'Warehouse Interior',
    rtsp_url: 'rtsp://demo.local/warehouse',
    location: 'Storage Bay 4',
    status: 'offline',
    is_system_camera: false,
    created_at: createTimestamp(),
  },
];

const desktopCamera: CameraResponse = {
  id: DESKTOP_CAMERA_ID,
  name: 'Operator Desktop Camera',
  rtsp_url: 'rtsp://localhost:8554/demo',
  location: 'Control Room',
  status: 'online',
  is_system_camera: true,
  created_at: createTimestamp(),
};

const mergeCameras = (payload: CameraResponse[] = []): CameraResponse[] => {
  const combined = [...payload];

  const upsert = (camera: CameraResponse) => {
    if (!combined.some((existing) => existing.id === camera.id)) {
      combined.push(camera);
    }
  };

  demoCameras.forEach(upsert);
  upsert(desktopCamera);

  return combined;
};

export const fetchCameras = createAsyncThunk<CameraResponse[], void, { rejectValue: string }>(
  'liveFeeds/fetchCameras',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchCamerasAPI();
    } catch (error: any) {
      const fallbackMessage = 'Failed to fetch camera feeds.';
      if (error?.response?.data?.detail) {
        return rejectWithValue(error.response.data.detail);
      }
      if (error?.message) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue(fallbackMessage);
    }
  }
);

const liveFeedsSlice = createSlice({
  name: 'liveFeeds',
  initialState,
  reducers: {
    setCameraStatus: (
      state,
      action: PayloadAction<{ id: string; status: CameraResponse['status'] }>
    ) => {
      const camera = state.cameras.find((cam) => cam.id === action.payload.id);
      if (camera) {
        camera.status = action.payload.status;
      }
    },
    upsertCamera: (state, action: PayloadAction<CameraResponse>) => {
      const index = state.cameras.findIndex((cam) => cam.id === action.payload.id);
      if (index >= 0) {
        state.cameras[index] = action.payload;
      } else {
        state.cameras.push(action.payload);
      }
    },
    clearCameras: (state) => {
      state.cameras = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCameras.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCameras.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.cameras = mergeCameras(action.payload);
        state.error = null;
      })
      .addCase(fetchCameras.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Unable to load camera feeds.';
        state.cameras = mergeCameras();
      });
  },
});

export const { setCameraStatus, upsertCamera, clearCameras } = liveFeedsSlice.actions;

export const selectCameras = (state: RootState): Camera[] => state.liveFeeds.cameras;
export const selectCamerasStatus = (state: RootState) => state.liveFeeds.status;
export const selectLiveFeedsError = (state: RootState) => state.liveFeeds.error;

export default liveFeedsSlice.reducer;

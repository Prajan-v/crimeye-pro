import apiClient from '../../lib/axios';

export interface CameraResponse {
  id: string;
  name: string;
  rtsp_url: string;
  location?: string | null;
  status: 'online' | 'offline' | 'error' | 'buffering';
  is_system_camera: boolean;
  created_at: string;
}

export const fetchCamerasAPI = async (): Promise<CameraResponse[]> => {
  const response = await apiClient.get<CameraResponse[]>('/cameras');
  if (!Array.isArray(response.data)) {
    throw new Error('Invalid camera response format.');
  }
  return response.data;
};

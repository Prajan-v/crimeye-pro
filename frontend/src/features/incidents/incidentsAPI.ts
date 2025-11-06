import apiClient from '../../lib/axios';
import axios from 'axios';
import { FASTAPI_URL } from '../../config';
import { AiDetection } from '../../common/types';

export const fetchIncidentsAPI = async (limit: number = 50): Promise<AiDetection[]> => {
  const response = await apiClient.get<AiDetection[]>('/analysis/detections', { params: { limit } });
  if (!Array.isArray(response.data)) throw new Error('Invalid data format for incidents.');
  return response.data;
};

export const reportDemoDetectionAPI = async (detection: AiDetection): Promise<void> => {
  await apiClient.post('/analysis/report_detection', detection, {
    headers: { 'Content-Type': 'application/json' },
  });
};

export const sendDemoEmailAPI = async (payload?: { camera_name?: string; threat_level?: string; message?: string }): Promise<void> => {
  await axios.post(`${FASTAPI_URL}/api/notify/demo`, payload || {}, {
    headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': 'demo' },
  });
};

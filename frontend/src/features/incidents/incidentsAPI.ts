import apiClient from '../../lib/axios';
import { AiDetection } from '../../common/types';
export const fetchIncidentsAPI = async (limit: number = 50): Promise<AiDetection[]> => {
const response = await apiClient.get<AiDetection[]>('/analysis/detections', { params: { limit } });
if (!Array.isArray(response.data)) throw new Error("Invalid data format for incidents.");
return response.data;
};

import apiClient from '../../lib/axios';
import { SystemHealth } from '../../common/types';
export const fetchSystemHealthAPI = async (): Promise<SystemHealth> => {
const response = await apiClient.get<SystemHealth>('/system/health');
return response.data;
};

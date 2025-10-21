import apiClient from '../../lib/axios';
import { AuthResponse, UserResponse, LoginCredentials, RegisterCredentials } from
'../../common/types';
export const loginAPI = async (credentials: LoginCredentials): Promise<AuthResponse> => {
const response = await apiClient.post<AuthResponse>('/auth/login', credentials);
return response.data;
};
export const registerAPI = async (credentials: RegisterCredentials): Promise<{ id: number;
username: string; email?: string }> => {
const response = await apiClient.post<{ id: number; username: string; email?: string
}>('/auth/register', credentials);
return response.data;
};
export const fetchMeAPI = async (): Promise<UserResponse> => {
const response = await apiClient.get<UserResponse>('/auth/me');
return response.data;
};

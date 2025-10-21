import axios, { InternalAxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../config';
import { store } from '../app/store';
import { logout } from '../features/auth/authSlice';
const apiClient = axios.create({
baseURL: API_BASE_URL + '/api',
headers: { 'Content-Type': 'application/json' },
timeout: 15000,
});
apiClient.interceptors.request.use(
(config): InternalAxiosRequestConfig => {
const token = store.getState().auth.token;
if (token && config.headers) {
config.headers['Authorization'] = `Bearer ${token}`;
}
return config;
},
(error) => {
console.error('Axios Request Interceptor Error:', error);
return Promise.reject(error);
}
);
apiClient.interceptors.response.use(
(response) => response,
(error) => {
console.error('Axios Response Interceptor Error:', error.response ? `Status ${error.response.status} for ${error.config.url}` : error.message);
const originalRequest = error.config;
if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
originalRequest._retry = true;
console.warn('Unauthorized (401). Dispatching logout.');
store.dispatch(logout());
if (window.location.pathname !== '/login') {
console.log("Redirecting to /login due to 401 error.");
window.location.href = '/login';
}
}
return Promise.reject(error);
}
);
export default apiClient;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { User, AuthState, LoginCredentials, RegisterCredentials, AuthResponse, UserResponse
} from '../../common/types';
import { loginAPI, registerAPI, fetchMeAPI } from './authAPI';
import { jwtDecode } from 'jwt-decode';
const getInitialAuthState = (): AuthState => {
const token = localStorage.getItem('crimeeye_token');
if (token) {
try {
const decoded: { exp: number } = jwtDecode(token);
if (decoded.exp * 1000 > Date.now()) {
return { user: null, token, status: 'idle', error: null };
} else { localStorage.removeItem('crimeeye_token'); }
} catch (e) { localStorage.removeItem('crimeeye_token'); }
}
return { user: null, token: null, status: 'idle', error: null };
};
const initialState: AuthState = getInitialAuthState();
export const loginUser = createAsyncThunk<AuthResponse, LoginCredentials, { rejectValue: string }>(
'auth/loginUser', async (credentials, { rejectWithValue }) => {
try {
const response = await loginAPI(credentials);
localStorage.setItem('crimeeye_token', response.token);
return response;
} catch (error: any) {
return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
}
}
);
export const registerUser = createAsyncThunk<void, RegisterCredentials, { rejectValue: string }>(
'auth/registerUser', async (credentials, { rejectWithValue }) => {
try { await registerAPI(credentials); } catch (error: any) {
return rejectWithValue(error.response?.data?.message || error.message || 'Registration failed');
}
}
);
export const fetchCurrentUser = createAsyncThunk<UserResponse, void, { rejectValue: string; state: RootState }>(
'auth/fetchCurrentUser', async (_, { rejectWithValue, getState, dispatch }) => {
const token = getState().auth.token;
if (!token) return rejectWithValue('No token available.');
try {
const user = await fetchMeAPI();
return user;
} catch (error: any) {
const message = error.response?.data?.message || error.message || 'Failed to fetch user';
if (error.response?.status !== 401) dispatch(logout());
return rejectWithValue(message);
}
}
);
const authSlice = createSlice({
name: 'auth',
initialState,
reducers: {
logout: (state) => {
state.user = null; state.token = null; state.status = 'idle'; state.error = null;
localStorage.removeItem('crimeeye_token');
},
clearAuthError: (state) => { state.error = null; }
},
extraReducers: (builder) => {
builder
.addCase(loginUser.pending, (state) => { state.status = 'loading'; state.error = null; })
.addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => { state.status = 'succeeded'; state.token = action.payload.token; state.error = null; })
.addCase(loginUser.rejected, (state, action) => { state.status = 'failed'; state.token = null; state.user = null; state.error = action.payload ?? 'Login failed'; })
.addCase(fetchCurrentUser.pending, (state) => { if (!state.user) state.status = 'loading'; })
.addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<UserResponse>) => { state.status = 'succeeded'; state.user = action.payload; state.error = null; })
.addCase(fetchCurrentUser.rejected, (state, action) => { if (action.payload !== 'No token available.') { state.status = 'failed'; state.error = action.payload ?? 'Failed session'; } else { state.status = 'idle'; } })
.addCase(registerUser.pending, (state) => { state.status = 'loading'; state.error = null; })
.addCase(registerUser.fulfilled, (state) => { state.status = 'idle'; state.error = null; })
.addCase(registerUser.rejected, (state, action) => { state.status = 'failed'; state.error = action.payload ?? 'Registration failed'; });
},
});
export const { logout, clearAuthError } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectisAuthenticated = (state: RootState) => !!state.auth.token;
export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectAuthError = (state: RootState) => state.auth.error;
export default authSlice.reducer;

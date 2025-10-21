import { configureStore, combineReducers, Tuple } from '@reduxjs/toolkit';
import { Middleware } from '@reduxjs/toolkit'; // Import Middleware type
import authReducer from '../features/auth/authSlice';
import incidentsReducer from '../features/incidents/incidentsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import systemHealthReducer from '../features/dashboard/systemHealthSlice';
import { socketMiddleware } from '../services/socket.middleware';

// 1. Combine reducers first
const rootReducer = combineReducers({
  auth: authReducer,
  incidents: incidentsReducer,
  dashboard: dashboardReducer,
  systemHealth: systemHealthReducer,
});

// 2. Define RootState based on the combined reducer BEFORE store configuration
export type RootState = ReturnType<typeof rootReducer>;

// 3. Define the type for socketMiddleware explicitly if needed, referencing RootState
const typedSocketMiddleware: Middleware<{}, RootState> = socketMiddleware;

// 4. Configure the store
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    new Tuple(typedSocketMiddleware, ...getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['incidents/addIncident'],
        ignoredActionPaths: ['payload.timestamp'],
      },
      immutableCheck: false,
    })),
  devTools: process.env.NODE_ENV !== 'production',
});

// 5. Define AppDispatch based on the configured store
export type AppDispatch = typeof store.dispatch;


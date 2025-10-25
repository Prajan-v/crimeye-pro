import { configureStore, combineReducers, Tuple } from '@reduxjs/toolkit';
import { Middleware } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import incidentsReducer from '../features/incidents/incidentsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';
import systemHealthReducer from '../features/dashboard/systemHealthSlice';
import { socketMiddleware } from '../services/socket.middleware';
const rootReducer = combineReducers({
  auth: authReducer,
  incidents: incidentsReducer,
  dashboard: dashboardReducer,
  systemHealth: systemHealthReducer,
});
export type RootState = ReturnType<typeof rootReducer>;
const typedSocketMiddleware: Middleware<{}, RootState> = socketMiddleware;
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
export type AppDispatch = typeof store.dispatch;

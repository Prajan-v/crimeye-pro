import { Middleware } from '@reduxjs/toolkit';
import { io, Socket } from 'socket.io-client';
import { WEBSOCKET_URL } from '../config';
import { RootState } from '../app/store';
import { addIncident } from '../features/incidents/incidentsSlice';
import { AiDetection } from '../common/types';
export const wsConnect = () => ({ type: 'WS_CONNECT' } as const);
export const wsDisconnect = () => ({ type: 'WS_DISCONNECT' } as const);
const wsConnected = () => ({ type: 'WS_CONNECTED' } as const);
const wsDisconnected = () => ({ type: 'WS_DISCONNECTED' } as const);
const wsError = (error: string) => ({ type: 'WS_ERROR', payload: error } as const);
type WsAction =
  | ReturnType<typeof wsConnect>
  | ReturnType<typeof wsDisconnect>
  | ReturnType<typeof wsConnected>
  | ReturnType<typeof wsDisconnected>
  | ReturnType<typeof wsError>;
let socket: Socket | null = null;
export const socketMiddleware: Middleware<{}, RootState> = store => next => action => {
  const typedAction = action as WsAction;
  switch (typedAction.type) {
    case 'WS_CONNECT':
      if (socket !== null) {
        socket.close();
      }
      const token = store.getState().auth.token;
      if (!token) {
        console.error('[Socket Middleware] No token found, cannot connect.');
        store.dispatch(wsError('Authentication token not found.'));
        break;
      }
      console.log('[Socket Middleware] Connecting...');
      socket = io(WEBSOCKET_URL, {
        transports: ['websocket'],
        auth: { token }
      });
      socket.on('connect', () => {
        console.log('[Socket Middleware] Connected.');
        store.dispatch(wsConnected());
      });
      socket.on('disconnect', (reason) => {
        console.log('[Socket Middleware] Disconnected:', reason);
        store.dispatch(wsDisconnected());
        socket = null;
      });
      socket.on('connect_error', (error) => {
        console.error('[Socket Middleware] Connection Error:', error.message);
        store.dispatch(wsError(error.message));
        socket?.close();
        socket = null;
      });
      socket.on('new_detection', (detection: AiDetection) => {
        console.log('[Socket Middleware] Received new detection:', detection);
        if (detection && detection.id && detection.timestamp) {
           store.dispatch(addIncident(detection));
        } else {
           console.warn('[Socket Middleware] Received invalid detection data:', detection);
        }
      });
      break;
    case 'WS_DISCONNECT':
      if (socket !== null) {
        console.log('[Socket Middleware] Disconnecting...');
        socket.close();
      }
      socket = null;
      store.dispatch(wsDisconnected());
      break;
    default:
      return next(action);
  }
};

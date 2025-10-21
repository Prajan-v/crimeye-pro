export interface User { id: number; username: string; email?: string; created_at?: string; }
export interface AuthState { user: User | null; token: string | null; status: 'idle' | 'loading' | 'succeeded' | 'failed'; error: string | null | undefined; }
export interface AuthResponse { token: string; }
export interface UserResponse extends User { created_at: string; }
export type ThreatLevel = 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | 'UNKNOWN';
export interface AiDetection { id: number; timestamp: string; camera_id: string; image_path: string | null; yolo_alerts: string[]; llm_report: string; threat_level: ThreatLevel; }
export interface DetectionsState { detections: AiDetection[]; status: 'idle' | 'loading' | 'succeeded' | 'failed'; error: string | null | undefined; }
export interface SystemHealth { database: 'online' | 'offline' | string; yolo_service: 'online' | 'offline'; ollama_service: 'online' | 'offline'; }
export interface SystemHealthState { status: SystemHealth | null; loading: boolean; error: string | null | undefined; }
export interface AlertFrequencyDataPoint { time: string; count: number; }
export type ChartThreatLevel = 'low' | 'medium' | 'high' | 'critical';
export interface ThreatDistributionDataPoint { name: Capitalize<ChartThreatLevel>; value: number; fill: string; }
export interface LoginCredentials { username: string; password: string; }
export interface RegisterCredentials { username: string; password: string; email?: string; }

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { AlertFrequencyDataPoint, ThreatDistributionDataPoint, AiDetection, ChartThreatLevel
} from '../../common/types';
import { theme } from '../../common/styles/theme';
import { logout } from '../auth/authSlice';
interface DashboardState {
alertFrequency: AlertFrequencyDataPoint[];
threatDistribution: ThreatDistributionDataPoint[];
status: 'idle' | 'loading' | 'succeeded' | 'failed';
error: string | null | undefined;
lastUpdated: number | null;
}
const initialState: DashboardState = { alertFrequency: [], threatDistribution: [], status: 'idle',
error: null, lastUpdated: null };
const calculateFrequency = (detections: AiDetection[]): AlertFrequencyDataPoint[] => {
const now = Date.now();
const oneHourAgo = now - 60 * 60 * 1000;
const intervalMinutes = 5;
const numIntervals = 60 / intervalMinutes;
const slots: { time: string; count: number }[] = [];
for (let i = numIntervals - 1; i >= 0; i--) {
const intervalEnd = new Date(now - i * intervalMinutes * 60 * 1000);
const intervalStartLabel = new Date(intervalEnd.getTime() - intervalMinutes * 60 * 1000);
const label = intervalStartLabel.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit',
hour12: false });
slots.push({ time: label, count: 0 });
}
detections.forEach((d) => {
const detectionTime = new Date(d.timestamp).getTime();
if (detectionTime >= oneHourAgo && detectionTime <= now) {
const minutesAgo = (now - detectionTime) / (60 * 1000);
const intervalIndex = numIntervals - 1 - Math.floor(minutesAgo / intervalMinutes);
if (intervalIndex >= 0 && intervalIndex < numIntervals) {
slots[intervalIndex].count++;
}
}
});
return slots;
};
const calculateDistribution = (detections: AiDetection[]): ThreatDistributionDataPoint[] => {
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);
const counts: Record<ChartThreatLevel, number> = { low: 0, medium: 0, high: 0, critical: 0 };
detections.forEach((d) => {
const detectionTime = new Date(d.timestamp).getTime();
if (detectionTime >= todayStart.getTime()) {
const level = d.threat_level?.toLowerCase() as ChartThreatLevel;
if (level && level in counts) counts[level]++;
}
});
const levelsInOrder: ChartThreatLevel[] = ['low', 'medium', 'high', 'critical'];
return levelsInOrder.map(level => ({
name: (level.charAt(0).toUpperCase() + level.slice(1)) as Capitalize<ChartThreatLevel>,
value: counts[level],
fill: theme.colors.threat[level] || theme.colors.text.muted
})).filter(item => item.value > 0);
};
const dashboardSlice = createSlice({
name: 'dashboard',
initialState,
reducers: {
updateChartData: (state, action: PayloadAction<AiDetection[]>) => {
const allDetections = action.payload;
try {
state.alertFrequency = calculateFrequency(allDetections);
state.threatDistribution = calculateDistribution(allDetections);
state.lastUpdated = Date.now();
state.status = 'succeeded';
state.error = null;
} catch (calcError: any) {
console.error("Error calculating chart data:", calcError);
state.status = 'failed';
state.error = "Error processing detection data for charts.";
}
},
clearDashboardData: (state) => {
state.alertFrequency = []; state.threatDistribution = []; state.lastUpdated = null;
state.status = 'idle'; state.error = null;
}
},
extraReducers: (builder) => {
builder.addCase(logout, (state) => {
state.alertFrequency = []; state.threatDistribution = []; state.lastUpdated = null;
state.status = 'idle'; state.error = null;
});
}
});
export const { updateChartData, clearDashboardData } = dashboardSlice.actions;
export const selectAlertFrequency = (state: RootState) => state.dashboard.alertFrequency;
export const selectThreatDistribution = (state: RootState) =>
state.dashboard.threatDistribution;
export const selectDashboardStatus = (state: RootState) => state.dashboard.status;
export const selectDashboardError = (state: RootState) => state.dashboard.error;
export default dashboardSlice.reducer;

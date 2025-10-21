import { AlertFrequencyDataPoint, ThreatDistributionDataPoint, ChartThreatLevel } from
'../../common/types';
import { theme } from '../../common/styles/theme';
export const fetchAlertFrequencyAPI = async (): Promise<AlertFrequencyDataPoint[]> => {
await new Promise(resolve => setTimeout(resolve, 100));
return []; // Client-side calculation
};
export const fetchThreatDistributionAPI = async (): Promise<ThreatDistributionDataPoint[]> =>
{
await new Promise(resolve => setTimeout(resolve, 100));
const levels: Capitalize<ChartThreatLevel>[] = ['Low', 'Medium', 'High', 'Critical'];
return levels.map(level => ({
name: level, value: 0,
fill: theme.colors.threat[level.toLowerCase() as ChartThreatLevel] ||
theme.colors.text.muted
}));
};

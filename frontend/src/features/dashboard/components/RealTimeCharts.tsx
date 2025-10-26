import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Shield, AlertTriangle, Camera, Activity } from 'react-feather';
import { useWebSocket } from '../../../hooks/useWebSocket';
import axios from 'axios';

const ChartsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const ChartCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.md};
`;

const ChartTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`;

const StatCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  position: relative;
  overflow: hidden;
`;

const StatValue = styled.div<{ color?: string }>`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: 700;
  color: ${({ color, theme }) => color || theme.colors.accent.primary};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const StatLabel = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: 500;
`;

const LiveIndicator = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  color: ${({ theme }) => theme.colors.status.success};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: 600;
`;

const PulseDot = styled.div`
  width: 8px;
  height: 8px;
  background: ${({ theme }) => theme.colors.status.success};
  border-radius: 50%;
  animation: pulse 2s infinite;
`;

interface AnalyticsData {
  summary: {
    totalDetections: number;
    highThreat: number;
    mediumThreat: number;
    lowThreat: number;
    activeCameras: number;
    todayDetections: number;
  };
  trends: Array<{
    timestamp: string;
    detections: number;
    highThreat: number;
    mediumThreat: number;
    lowThreat: number;
  }>;
  threats: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  cameras: Array<{
    name: string;
    uptime: number;
    status: string;
  }>;
  topObjects: Array<{
    name: string;
    count: number;
  }>;
}

const RealTimeCharts: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // WebSocket connection for real-time updates
  const { isConnected, sendMessage } = useWebSocket({
    url: 'ws://localhost:8000/ws',
    onMessage: (message) => {
      if (message.type === 'analytics_update') {
        setData(message.data);
        setLastUpdate(new Date());
      }
    }
  });

  // Fetch initial data
  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [summaryRes, trendsRes, threatsRes, camerasRes, objectsRes] = await Promise.all([
          axios.get('http://localhost:8000/api/analytics/summary'),
          axios.get('http://localhost:8000/api/analytics/trends'),
          axios.get('http://localhost:8000/api/analytics/threats'),
          axios.get('http://localhost:8000/api/analytics/cameras'),
          axios.get('http://localhost:8000/api/analytics/top-objects')
        ]);

        setData({
          summary: summaryRes.data,
          trends: trendsRes.data,
          threats: threatsRes.data,
          cameras: camerasRes.data,
          topObjects: objectsRes.data
        });
        setLoading(false);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setLoading(false);
      }
    };

    fetchAnalytics();
    
    // Subscribe to analytics updates
    if (isConnected) {
      sendMessage({ type: 'subscribe_analytics' });
    }

    // Refresh data every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000);
    return () => clearInterval(interval);
  }, [isConnected, sendMessage]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Activity size={48} style={{ animation: 'spin 1s linear infinite' }} />
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <AlertTriangle size={48} />
        <p>No analytics data available</p>
      </div>
    );
  }

  return (
    <>
      {/* Real-time Stats Cards */}
      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <LiveIndicator>
            <PulseDot />
            LIVE
          </LiveIndicator>
          <StatValue color="#10B981">{data.summary.totalDetections}</StatValue>
          <StatLabel>Total Detections</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <LiveIndicator>
            <PulseDot />
            LIVE
          </LiveIndicator>
          <StatValue color="#EF4444">{data.summary.highThreat}</StatValue>
          <StatLabel>High Threat Alerts</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <LiveIndicator>
            <PulseDot />
            LIVE
          </LiveIndicator>
          <StatValue color="#FFD700">{data.summary.activeCameras}</StatValue>
          <StatLabel>Active Cameras</StatLabel>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <LiveIndicator>
            <PulseDot />
            LIVE
          </LiveIndicator>
          <StatValue color="#3B82F6">{data.summary.todayDetections}</StatValue>
          <StatLabel>Today's Detections</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Real-time Charts */}
      <ChartsContainer>
        {/* Detection Trends Chart */}
        <ChartCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <ChartTitle>
            <TrendingUp size={20} />
            Detection Trends (Last 24 Hours)
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis 
                dataKey="timestamp" 
                stroke="#a0a0a0"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleTimeString()}
              />
              <YAxis stroke="#a0a0a0" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Area
                type="monotone"
                dataKey="detections"
                stackId="1"
                stroke="#FFD700"
                fill="url(#detectionGradient)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="highThreat"
                stackId="2"
                stroke="#EF4444"
                fill="#EF4444"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
          <defs>
            <linearGradient id="detectionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#FFD700" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#FFD700" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
        </ChartCard>

        {/* Threat Distribution Pie Chart */}
        <ChartCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <ChartTitle>
            <Shield size={20} />
            Threat Distribution
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.threats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.threats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Top Detected Objects Bar Chart */}
        <ChartCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7 }}
        >
          <ChartTitle>
            <Activity size={20} />
            Top Detected Objects
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.topObjects} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis type="number" stroke="#a0a0a0" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#a0a0a0" 
                fontSize={12}
                width={80}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Bar dataKey="count" fill="#FFD700" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Camera Status Chart */}
        <ChartCard
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8 }}
        >
          <ChartTitle>
            <Camera size={20} />
            Camera Status & Uptime
          </ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.cameras}>
              <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
              <XAxis 
                dataKey="name" 
                stroke="#a0a0a0" 
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#a0a0a0" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#2a2a2a',
                  border: '1px solid #404040',
                  borderRadius: '8px',
                  color: '#ffffff'
                }}
              />
              <Bar 
                dataKey="uptime" 
                fill="#10B981"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </ChartsContainer>

      {/* Last Update Indicator */}
      <div style={{ 
        textAlign: 'center', 
        color: '#a0a0a0', 
        fontSize: '0.875rem',
        marginTop: '1rem'
      }}>
        Last updated: {lastUpdate.toLocaleTimeString()} • 
        WebSocket: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
      </div>
    </>
  );
};

export default RealTimeCharts;


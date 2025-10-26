const colors = {
  // Black and Gold Theme
  bgDark: '#0a0a0a',
  bgLight: '#1a1a1a',
  bgSurface: '#2a2a2a',
  bgElevated: '#3a3a3a',
  textPrimary: '#ffffff',
  textSecondary: '#d4d4d4',
  textMuted: '#a0a0a0',
  accentPrimary: '#FFD700', // Gold
  accentSecondary: '#FFA500', // Orange Gold
  accentTertiary: '#FF6B35', // Deep Orange
  statusSuccess: '#10B981',
  statusWarning: '#F59E0B',
  statusError: '#EF4444',
  statusInfo: '#3B82F6',
  threatCritical: '#EF4444',
  threatHigh: '#F59E0B',
  threatMedium: '#FFD700',
  threatLow: '#10B981',
  threatNone: '#10B981',
  threatUnknown: '#6B7280',
  border: '#404040',
  shadow: 'rgba(0, 0, 0, 0.8)',
  glassBackground: 'rgba(26, 26, 26, 0.8)',
  glassBorder: 'rgba(255, 215, 0, 0.2)',
  glowSuccess: '#10B981',
  glowWarning: '#F59E0B',
  glowError: '#EF4444',
};

export const theme = {
  colors: {
    background: {
      primary: colors.bgDark,
      secondary: colors.bgLight,
      surface: colors.bgSurface,
      elevated: colors.bgElevated,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
      muted: colors.textMuted,
    },
    accent: {
      primary: colors.accentPrimary,
      secondary: colors.accentSecondary,
      tertiary: colors.accentTertiary,
    },
    status: {
      success: colors.statusSuccess,
      warning: colors.statusWarning,
      error: colors.statusError,
      info: colors.statusInfo,
    },
    threat: {
      critical: colors.threatCritical,
      high: colors.threatHigh,
      medium: colors.threatMedium,
      low: colors.threatLow,
      none: colors.threatNone,
      unknown: colors.threatUnknown,
    },
    glass: {
      background: colors.glassBackground,
      border: colors.glassBorder,
    },
    glow: {
      success: colors.glowSuccess,
      warning: colors.glowWarning,
      error: colors.glowError,
      primary: colors.accentPrimary,
    },
    glowSuccess: colors.glowSuccess,
    glowWarning: colors.glowWarning,
    glowError: colors.glowError,
    glowPrimary: colors.accentPrimary,
    border: colors.border,
    shadow: colors.shadow,
  },
  fonts: {
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'Fira Code', 'Courier New', monospace",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
  },
  spacing: {
    xxs: '0.125rem',
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  borderRadius: {
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    xl: '1rem',
    full: '9999px',
  },
  shadows: {
    sm: `0 1px 2px 0 ${colors.shadow}`,
    md: `0 4px 6px -1px ${colors.shadow}`,
    lg: `0 10px 15px -3px ${colors.shadow}`,
    xl: `0 20px 25px -5px ${colors.shadow}`,
    glow: `0 0 15px 0 ${colors.accentPrimary}33`,
    glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
    glowPrimary: `0 0 20px 0 ${colors.accentPrimary}66`,
    glowSuccess: `0 0 20px 0 ${colors.glowSuccess}66`,
    glowWarning: `0 0 20px 0 ${colors.glowWarning}66`,
    glowError: `0 0 20px 0 ${colors.glowError}66`,
  },
  transitions: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  animations: {
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    `,
  },
  effects: {
    glassmorphism: `
      background: ${colors.glassBackground};
      backdrop-filter: blur(16px) saturate(180%);
      -webkit-backdrop-filter: blur(16px) saturate(180%);
      border: 1px solid ${colors.glassBorder};
    `,
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
} as const;

export type AppTheme = typeof theme;

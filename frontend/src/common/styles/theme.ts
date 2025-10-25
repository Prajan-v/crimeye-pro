const colors = {
  // Futuristic Dark Backgrounds
  bgDark: '#0a0e27',
  bgLight: '#1a1d29',
  bgSurface: '#1e2230',
  bgElevated: '#252a3a',
  
  // Text Colors
  textPrimary: '#ffffff',
  textSecondary: '#b8c5d1',
  textMuted: '#6b7280',
  
  // Electric Blue/Cyan Accents
  accentPrimary: '#00D9FF',
  accentSecondary: '#0099FF',
  accentTertiary: '#00BFFF',
  
  // Status Colors
  statusSuccess: '#00FF88',
  statusWarning: '#FFD700',
  statusError: '#FF3B30',
  statusInfo: '#00D9FF',
  
  // Risk Level Colors
  threatCritical: '#FF3B30',
  threatHigh: '#FF6B35',
  threatMedium: '#FFD700',
  threatLow: '#00FF88',
  threatNone: '#00FF88',
  threatUnknown: '#6b7280',
  
  // UI Colors
  border: '#2a3441',
  shadow: 'rgba(0, 0, 0, 0.8)',
  
  // Glow Colors
  glowPrimary: 'rgba(0, 217, 255, 0.3)',
  glowSecondary: 'rgba(0, 153, 255, 0.2)',
  glowSuccess: 'rgba(0, 255, 136, 0.3)',
  glowWarning: 'rgba(255, 215, 0, 0.3)',
  glowError: 'rgba(255, 59, 48, 0.3)',
  
  // Glassmorphism
  glassBg: 'rgba(30, 34, 48, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.1)',
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
    glow: {
      primary: colors.glowPrimary,
      secondary: colors.glowSecondary,
      success: colors.glowSuccess,
      warning: colors.glowWarning,
      error: colors.glowError,
    },
    glass: {
      background: colors.glassBg,
      border: colors.glassBorder,
    },
    border: colors.border,
    shadow: colors.shadow,
  },
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    heading: "'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
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
    'xxs': '0.125rem',
    'xs': '0.25rem',
    'sm': '0.5rem',
    'md': '1rem',
    'lg': '1.5rem',
    'xl': '2rem',
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
    glowPrimary: `0 0 20px ${colors.glowPrimary}`,
    glowSecondary: `0 0 15px ${colors.glowSecondary}`,
    glowSuccess: `0 0 20px ${colors.glowSuccess}`,
    glowWarning: `0 0 20px ${colors.glowWarning}`,
    glowError: `0 0 20px ${colors.glowError}`,
    glass: `0 8px 32px 0 ${colors.shadow}`,
  },
  transitions: {
    fast: '150ms ease-in-out',
    base: '250ms ease-in-out',
    slow: '350ms ease-in-out',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
  },
  effects: {
    glassmorphism: `
      background: ${colors.glassBg};
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid ${colors.glassBorder};
    `,
    glow: `
      box-shadow: 0 0 20px ${colors.glowPrimary};
    `,
    glowHover: `
      box-shadow: 0 0 30px ${colors.glowPrimary};
    `,
    cornerAccent: `
      position: relative;
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border: 2px solid transparent;
        border-image: linear-gradient(45deg, ${colors.accentPrimary}, ${colors.accentSecondary}) 1;
        border-radius: inherit;
        pointer-events: none;
      }
    `,
  },
  animations: {
    pulse: `
      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    `,
    float: `
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      animation: float 3s ease-in-out infinite;
    `,
    glow: `
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px ${colors.glowPrimary}; }
        50% { box-shadow: 0 0 30px ${colors.glowPrimary}, 0 0 40px ${colors.glowPrimary}; }
      }
      animation: glow 2s ease-in-out infinite;
    `,
    scanline: `
      @keyframes scanline {
        0% { transform: translateY(-100%); }
        100% { transform: translateY(100vh); }
      }
      animation: scanline 2s linear infinite;
    `,
  },
} as const;

export type AppTheme = typeof theme;

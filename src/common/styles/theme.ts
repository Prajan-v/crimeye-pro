// New Dark Theme (Inspired by image-14-1593x1080.png)
const colors = {
bgDark: '#000000',
bgLight: '#111111', // Primary surface background
bgSurface: '#1C1C1E', // Cards, inputs (iOS dark)
bgElevated: '#2C2C2E', // Hover, elevated
textPrimary: '#F2F2F7', // Main text (iOS light)
textSecondary: '#AEAEB2', // Subdued text
textMuted: '#636366', // Muted/disabled
accentPrimary: '#00A9A5', // Professional Muted Teal Accent
accentSecondary: '#4EBEB9',
statusSuccess: '#34C759', // Green
statusWarning: '#FF9500', // Orange
statusError: '#FF3B30', // Red
statusinfo: '#007AFF', // Blue
threatCritical: '#FF3B30', // Red
threatHigh: '#FF9500', // Orange
threatMedium: '#FFCC00', // Yellow
threatLow: '#AEAEB2', // Muted text
threatNone: '#34C759', // Green
threatUnknown: '#636366', // Muted
border: '#3A3A3C', // Borders for cards, inputs
shadow: 'rgba(0, 0, 0, 0.7)', // Darker shadow
};
export const theme = {
colors: {
background: { primary: colors.bgDark, secondary: colors.bgLight, surface: colors.bgSurface, elevated: colors.bgElevated },
text: { primary: colors.textPrimary, secondary: colors.textSecondary, muted: colors.textMuted },
accent: { primary: colors.accentPrimary, secondary: colors.accentSecondary },
status: { success: colors.statusSuccess, warning: colors.statusWarning, error: colors.statusError, info: colors.statusinfo },
threat: { critical: colors.threatCritical, high: colors.threatHigh, medium: colors.threatMedium, low: colors.threatLow, none: colors.threatNone, unknown: colors.threatUnknown },
},
border: colors.border, shadow: colors.shadow,
fonts: { primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", mono: "'Fira Code', 'Courier New', monospace" },
fontSizes: { xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem' },
spacing: { 'xxs': '0.125rem', 'xs': '0.25rem', 'sm': '0.5rem', 'md': '1rem', 'lg': '1.5rem', 'xl': '2rem', '2xl': '3rem' },
borderRadius: { sm: '0.25rem', md: '0.5rem', lg: '0.75rem', xl: '1rem', full: '9999px' },
shadows: { sm: `0 1px 2px 0 ${colors.shadow}`, md: `0 4px 6px -1px ${colors.shadow}`, lg: `0 10px 15px -3px ${colors.shadow}`, xl: `0 20px 25px -5px ${colors.shadow}`, glow: `0 0 15px 0 ${colors.accentPrimary}33` },
transitions: { fast: '150ms ease-in-out', base: '250ms ease-in-out', slow: '350ms ease-in-out' },
breakpoints: { sm: '640px', md: '768px', lg: '1024px', xl: '1280px' }
} as const;
export type AppTheme = typeof theme;

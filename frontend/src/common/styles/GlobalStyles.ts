import { createGlobalStyle } from 'styled-components';
import { AppTheme } from './theme';
type ThemedProps = { theme: AppTheme };
export const GlobalStyles = createGlobalStyle<ThemedProps>`
:root { color-scheme: dark; }
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; scrollbar-width: thin; scrollbar-color: ${({ theme }) => theme.colors.background.surface} ${({ theme }) => theme.colors.background.secondary}; }
body { font-family: ${({ theme }) => theme.fonts.primary}; background-color: ${({ theme }) => theme.colors.background.primary}; color: ${({ theme }) => theme.colors.text.primary}; line-height: 1.6; min-height: 100vh; overflow-x: hidden; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
#root { min-height: 100vh; display: flex; flex-direction: column; }
a { text-decoration: none; color: ${({ theme }) => theme.colors.accent.primary}; transition: color ${({ theme }) => theme.transitions.fast}; }
a:hover { color: ${({ theme }) => theme.colors.accent.secondary}; }
button { font-family: inherit; cursor: pointer; border: none; outline: none; background: none; padding: 0; color: inherit; }
input, textarea, select { font-family: inherit; outline: none; border: 1px solid ${({ theme }) => theme.colors.border}; background-color: ${({ theme }) => theme.colors.background.surface}; color: ${({ theme }) => theme.colors.text.primary}; border-radius: ${({ theme }) => theme.borderRadius.md}; padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md}; font-size: ${({ theme }) => theme.fontSizes.base}; transition: border-color ${({ theme }) => theme.transitions.base}, box-shadow ${({ theme }) => theme.transitions.base}; }
input:focus, textarea:focus, select:focus { border-color: ${({ theme }) => theme.colors.accent.primary}; box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.accent.primary}33; }
input::placeholder, textarea::placeholder { color: ${({ theme }) => theme.colors.text.muted}; }
input:-webkit-autofill, input:-webkit-autofill:hover, input:-webkit-autofill:focus, input:-webkit-autofill:active { -webkit-box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.background.surface} inset !important; box-shadow: 0 0 0 1000px ${({ theme }) => theme.colors.background.surface} inset !important; -webkit-text-fill-color: ${({ theme }) => theme.colors.text.primary} !important; transition: background-color 5000s ease-in-out 0s; caret-color: ${({ theme }) => theme.colors.text.primary}; }
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: ${({ theme }) => theme.colors.background.secondary}; }
::-webkit-scrollbar-thumb { background-color: ${({ theme }) => theme.colors.background.surface}; border-radius: ${({ theme }) => theme.borderRadius.full}; border: 2px solid ${({ theme }) => theme.colors.background.secondary}; }
::-webkit-scrollbar-thumb:hover { background-color: ${({ theme }) => theme.colors.text.muted}; }
.recharts-default-tooltip { background: ${({ theme }) => theme.colors.background.elevated} !important; border: 1px solid ${({ theme }) => theme.colors.border} !important; border-radius: ${({ theme }) => theme.borderRadius.md} !important; box-shadow: ${({ theme }) => theme.shadows.lg} !important; padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md} !important; }
.recharts-tooltip-label { color: ${({ theme }) => theme.colors.text.secondary} !important; font-size: ${({ theme }) => theme.fontSizes.sm} !important; margin-bottom: ${({ theme }) => theme.spacing.sm} !important; border-bottom: 1px solid ${({ theme }) => theme.colors.border} !important; padding-bottom: ${({ theme }) => theme.spacing.sm} !important; }
.recharts-tooltip-item { color: ${({ theme }) => theme.colors.text.primary} !important; font-size: ${({ theme }) => theme.fontSizes.sm} !important; }
.recharts-tooltip-item-name, .recharts-tooltip-item-separator { color: ${({ theme }) => theme.colors.text.secondary} !important; }
.react-tooltip { background-color: ${({ theme }) => theme.colors.background.elevated} !important; color: ${({ theme }) => theme.colors.text.primary} !important; border-radius: ${({ theme }) => theme.borderRadius.sm} !important; font-size: ${({ theme }) => theme.fontSizes.xs} !important; padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm} !important; box-shadow: ${({ theme }) => theme.shadows.md} !important; z-index: 9999 !important; }
`;

// src/styled.d.ts
import 'styled-components';
// Make sure this path correctly points to your theme file
import { AppTheme } from './common/styles/theme';

declare module 'styled-components' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  export interface DefaultTheme extends AppTheme {}
}

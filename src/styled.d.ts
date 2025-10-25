import 'styled-components';
import { AppTheme } from './common/styles/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}

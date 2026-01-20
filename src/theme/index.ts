export * from './colors';
export * from './spacing';

import { colors } from './colors';
import { spacing, borderRadius, fontSize, fontWeight, fontFamily, typography, shadows } from './spacing';

export const theme = {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
  fontFamily,
  typography,
  shadows,
};

export type Theme = typeof theme;

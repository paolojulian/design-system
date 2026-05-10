import { P_TOKEN_VALUES } from './tokens';

export const P_COLORS = {
  black: P_TOKEN_VALUES.color.neutral[950],
  white: P_TOKEN_VALUES.color.neutral[0],
  primary: P_TOKEN_VALUES.color.brand[600],
  secondary: P_TOKEN_VALUES.color.accent[600],
  gray: {
    darker: P_TOKEN_VALUES.color.neutral[600],
    DEFAULT: P_TOKEN_VALUES.color.neutral[400],
    lighter: P_TOKEN_VALUES.color.neutral[200],
  },
};

export type PColors = keyof typeof P_COLORS;

import colors from 'tailwindcss/colors';

export const P_COLORS = {
  black: '#0D0D0D',
  white: '#FCF5ED',
  primary: '#CE5A67',
  secondary: '#F4BF96',
  gray: {
    darker: colors.stone[500],
    DEFAULT: '#A3A3A3',
    lighter: '#e0e6ed',
  },
};

export type PColors = keyof typeof P_COLORS;

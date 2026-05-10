import { cva } from 'class-variance-authority';

type FontVariants =
  | 'serif'
  | 'body'
  | 'body-wide'
  | 'heading'
  | 'heading-lg'
  | 'heading-xl';

const fontVariantsMap = {
  serif: 'p-typography--serif',
  body: 'p-typography--body',
  'body-wide': 'p-typography--body-wide',
  heading: 'p-typography--heading',
  'heading-lg': 'p-typography--heading-lg',
  'heading-xl': 'p-typography--heading-xl',
} satisfies Record<FontVariants, string>;

export const PTypographyVariants = cva('p-typography', {
  variants: {
    variant: fontVariantsMap,
  },
  defaultVariants: {
    variant: 'body',
  },
});

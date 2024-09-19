import { cva } from 'class-variance-authority';

type FontVariants =
  | 'serif'
  | 'body'
  | 'body-wide'
  | 'heading'
  | 'heading-lg'
  | 'heading-xl';

const fontVariantsMap = {
  serif: 'font-serif',
  body: 'text-base',
  'body-wide': 'text-sm tracking-[0.40em] font-medium',
  heading: 'text-[1.5rem] md:text-4xl tracking-[-0.01em] font-medium',
  'heading-lg':
    'text-[2.5rem] md:text-[4rem] tracking-[-0.01em] font-medium leading-[2.75rem] md:leading-[4.5rem]',
  'heading-xl':
    'text-[4rem] md:text-[7rem] tracking-[-0.01em] leading-[3.5rem] md:leading-[6rem] font-medium',
} satisfies Record<FontVariants, string>;

export const PTypographyVariants = cva('font-sans', {
  variants: {
    variant: fontVariantsMap,
  },
  defaultVariants: {
    variant: 'body',
  },
});

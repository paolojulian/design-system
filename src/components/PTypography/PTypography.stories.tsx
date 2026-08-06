import { type Meta, type StoryObj } from '@storybook/react';
import { PTypography } from '.';
import { P_COLORS } from '../../constants';

const meta: Meta<typeof PTypography> = {
  title: 'Components/PTypography',
  component: PTypography,
  parameters: {
    backgrounds: {
      values: [{ name: 'Dark', value: P_COLORS.black }],
      default: 'Dark',
    },
  },
  decorators: [
    (Story) => (
      // Specimens sit on an inverted ground. This used to be a hardcoded black
      // background plus a `text-white` class on every story, but the package
      // ships tokens and component CSS — not Tailwind's utility layer — so the
      // class resolved to nothing and every specimen rendered near-black on
      // black: invisible, and a 1.11:1 axe contrast failure.
      //
      // `surface-inverse` and `text-inverse` are a matched pair that flip
      // together, so this stays legible in dark mode too — where a fixed black
      // ground would have reproduced exactly the same bug. `color` inherits, so
      // it covers every variant without touching their args.
      <div
        style={{
          backgroundColor: 'var(--p-color-surface-inverse)',
          color: 'var(--p-color-text-inverse)',
        }}
      >
        <Story />
      </div>
    ),
  ],
};

type Story = StoryObj<typeof PTypography>;

export const Body: Story = {
  name: 'Body',
  args: {
    variant: 'body',
    children: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
               Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
               Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
               nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
               reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
               Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
               deserunt mollit anim id est laborum.`,
  },
};

export const BodyMedium: Story = {
  name: 'Body Medium',
  args: {
    variant: 'body-medium',
    children: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
               Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
               Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
               nisi ut aliquip ex ea commodo consequat.`,
  },
};

export const BodyWide: Story = {
  name: 'Body Wide',
  args: {
    variant: 'body-wide',
    children: 'AVANT GARDE',
  },
};

export const Heading: Story = {
  name: 'Heading',
  args: {
    variant: 'heading',
    children: 'This is a heading',
  },
};

export const HeadingLg: Story = {
  name: 'Heading LG',
  args: {
    variant: 'heading-lg',
    children: 'This is a large heading',
  },
};

export const HeadingXL: Story = {
  name: 'Heading XL',
  args: {
    variant: 'heading-xl',
    children: 'THIS IS THE LARGEST HEADING',
  },
};

export const Serif: Story = {
  name: 'Serif',
  args: {
    variant: 'serif',
    children: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
               Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
               Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris 
               nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
               reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. 
               Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia 
               deserunt mollit anim id est laborum.`,
  },
};

export default meta;

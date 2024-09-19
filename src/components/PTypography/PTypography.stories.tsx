import { type Meta, type StoryObj } from '@storybook/react';
import { PTypography } from '.';

const meta: Meta<typeof PTypography> = {
  title: 'PipzTypography',
  component: PTypography,
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

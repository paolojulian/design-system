import { type Meta, type StoryObj } from '@storybook/react';
import { PSectionHeader } from '.';
import { P_COLORS } from '../../constants';

const meta: Meta<typeof PSectionHeader> = {
  title: 'PSectionHeader',
  component: PSectionHeader,
  parameters: {
    backgrounds: {
      values: [{ name: 'Dark', value: P_COLORS.black }],
      default: 'Dark',
    },
  },
};

type Story = StoryObj<typeof PSectionHeader>;

export const Default: Story = {
  name: 'Default',
  args: {
    title: 'SECTION HEADER',
  },
};

export default meta;

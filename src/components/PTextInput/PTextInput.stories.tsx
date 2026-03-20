import { type Meta, type StoryObj } from '@storybook/react';
import { PTextInput } from '.';

const meta: Meta<typeof PTextInput> = {
  title: 'PTextInput',
  component: PTextInput,
  args: {
    label: 'Label',
  },
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'date'],
    },
  },
};

type Story = StoryObj<typeof PTextInput>;

export const Default: Story = {
  name: 'Default',
};

export const Filled: Story = {
  name: 'Filled',
  args: {
    defaultValue: 'Some value',
  },
};

export const Password: Story = {
  name: 'Password',
  args: {
    type: 'password',
    label: 'Password',
    defaultValue: 'supersecret',
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    isError: true,
    errorMessage: 'This field is required.',
    defaultValue: 'bad input',
  },
};

export const WithRightAdornment: Story = {
  name: 'With Right Adornment',
  args: {
    rightAdornment: 'kg',
    label: 'Weight',
  },
};

export const CustomColors: Story = {
  name: 'Custom Colors (token override)',
  args: {
    label: 'Custom themed input',
    className: '[--p-input-ring:#8b5cf6] [--p-input-label-focus:#8b5cf6] [--p-input-bg:#f5f3ff]',
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const Required: Story = {
  name: 'Required',
  args: {
    required: true,
    label: 'Email',
    type: 'email',
  },
};

export default meta;

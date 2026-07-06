import { type Meta, type StoryObj } from '@storybook/react';
import { PCheckbox } from '.';

const meta: Meta<typeof PCheckbox> = {
  title: 'Components/PCheckbox',
  component: PCheckbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Email me about account activity',
  },
  argTypes: {
    label: { description: 'Visible label — doubles as the accessible name and part of the hit area.' },
    description: { description: 'Supporting copy shown below the label. Wired via `aria-describedby`.' },
    indeterminate: { description: 'Renders the mixed/tri-state affordance via the native `indeterminate` property.' },
    isError: { description: 'Puts the control into an error state (red box + error message).' },
    errorMessage: { description: 'Shown below the field when `isError` is true. Announced via `role="alert"`.' },
    disabled: { description: 'Prevents interaction and applies a muted visual style.' },
    checked: { control: 'boolean' },
  },
};

type Story = StoryObj<typeof PCheckbox>;

export const Default: Story = {
  name: 'Default',
};

export const Checked: Story = {
  name: 'Checked',
  args: {
    defaultChecked: true,
  },
};

export const Indeterminate: Story = {
  name: 'Indeterminate',
  args: {
    label: 'Select all rows',
    indeterminate: true,
  },
};

export const WithDescription: Story = {
  name: 'With Description',
  args: {
    label: 'Enable two-factor authentication',
    description: 'Require a verification code at sign-in for every session.',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    label: 'Managed by your administrator',
    disabled: true,
    defaultChecked: true,
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    label: 'Accept the terms and conditions',
    isError: true,
    errorMessage: 'You must accept the terms to continue.',
  },
};

export const WithLongLabel: Story = {
  name: 'With Long Label',
  args: {
    label:
      'Send me occasional product updates, security advisories, and operational notices about scheduled maintenance windows for my workspace.',
    description: 'You can unsubscribe from non-essential messages at any time.',
  },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: {
    label: 'Enable two-factor authentication',
    description: 'Require a verification code at sign-in for every session.',
    defaultChecked: true,
  },
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [{ name: 'Dark', value: '#111111' }],
    },
  },
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: {
    label: 'Email me about account activity',
    description: 'Delivered to the address on your profile.',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export default meta;

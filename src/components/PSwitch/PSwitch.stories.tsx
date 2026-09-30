import { type Meta, type StoryObj } from '@storybook/react';
import { PSwitch } from '.';

const meta: Meta<typeof PSwitch> = {
  title: 'Pipz/PSwitch',
  component: PSwitch,
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
    label: 'Enable desktop notifications',
  },
  argTypes: {
    label: { description: 'Visible label — doubles as the accessible name and part of the hit area.' },
    description: { description: 'Supporting copy shown below the label. Wired via `aria-describedby`.' },
    isError: { description: 'Puts the control into an error state.' },
    errorMessage: { description: 'Shown below the field when `isError` is true. Announced via `role="alert"`.' },
    disabled: { description: 'Prevents interaction and applies a muted visual style.' },
    checked: { control: 'boolean' },
  },
};

type Story = StoryObj<typeof PSwitch>;

export const Default: Story = {
  name: 'Default (Off)',
};

export const On: Story = {
  name: 'On',
  args: {
    defaultChecked: true,
  },
};

export const WithDescription: Story = {
  name: 'With Description',
  args: {
    label: 'Automatic backups',
    description: 'Runs a full workspace backup every night at 02:00 UTC.',
    defaultChecked: true,
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    label: 'Maintenance mode (locked by policy)',
    disabled: true,
    defaultChecked: true,
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    label: 'Share usage analytics',
    isError: true,
    errorMessage: 'Analytics could not be enabled. Try again.',
  },
};

export const WithLongLabel: Story = {
  name: 'With Long Label',
  args: {
    label:
      'Automatically pause non-critical background jobs when the workspace enters a scheduled maintenance window.',
    description: 'Instant setting — changes apply immediately, no save required.',
  },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: {
    label: 'Automatic backups',
    description: 'Runs a full workspace backup every night at 02:00 UTC.',
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
    description: 'Delivered while this tab stays open.',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export default meta;

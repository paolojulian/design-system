import { type Meta, type StoryObj } from '@storybook/react';
import { PSegmentedControl } from '.';

const meta: Meta<typeof PSegmentedControl> = {
  title: 'Pipz/PSegmentedControl',
  component: PSegmentedControl,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'One choice among two to five options drawn as one bordered control, the chosen segment filled. A form control like PSelect, not a view switcher: it takes a label, posts under `name`, and carries an error. Arrow keys move and select like a native radio group.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Paid so far',
    options: [
      { value: 'none', label: '0' },
      { value: 'half', label: '50%' },
      { value: 'custom', label: 'Custom' },
      { value: 'full', label: 'Full' },
    ],
    fullWidth: true,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
  },
};

type Story = StoryObj<typeof PSegmentedControl>;

export const Default: Story = {};

export const Selected: Story = {
  args: { defaultValue: 'half', description: 'How much of the total the guest has already paid.' },
};

export const Small: Story = {
  args: { size: 'sm', label: 'Range', options: [{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }] },
};

export const Disabled: Story = {
  args: { disabled: true, description: 'Pick the dates to see the total.' },
};

export const OneDisabledOption: Story = {
  name: 'One Disabled Option',
  args: {
    options: [
      { value: 'none', label: '0' },
      { value: 'half', label: '50%', disabled: true },
      { value: 'custom', label: 'Custom' },
      { value: 'full', label: 'Full' },
    ],
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: { defaultValue: 'custom', isError: true, errorMessage: "Paid can't be more than the total." },
};

export const InAForm: Story = {
  name: 'In A Form',
  args: { name: 'paid', defaultValue: 'full' },
  parameters: {
    docs: { description: { story: 'With `name`, the chosen value posts with the surrounding form through a hidden input.' } },
  },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: { defaultValue: 'full' },
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: { default: 'Dark', values: [{ name: 'Dark', value: '#111111' }] },
  },
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: { defaultValue: 'half' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export default meta;

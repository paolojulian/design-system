import { type Meta, type StoryObj } from '@storybook/react';
import { PFormField } from '.';
import { PTextInput } from '../PTextInput';
import { PTextArea } from '../PTextArea';
import { PSelect } from '../PSelect';

const meta: Meta<typeof PFormField> = {
  title: 'Pipz/PFormField',
  component: PFormField,
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
    label: 'Work email',
  },
  argTypes: {
    label: { description: 'Visible label associated with the control via htmlFor/id.' },
    hint: { description: 'Supporting copy shown below the control when there is no error.' },
    error: { description: 'Error message. Replaces the hint and is announced via role="alert".' },
    required: { description: 'Marks the control required — communicated in text and aria-required.' },
    disabled: { description: 'Disables the wrapped control (merged with the control’s own disabled).' },
  },
};

type Story = StoryObj<typeof PFormField>;

export const Default: Story = {
  name: 'Default',
  render: (args) => (
    <PFormField {...args}>
      <PTextInput type="email" autoComplete="email" />
    </PFormField>
  ),
};

export const WithHint: Story = {
  name: 'With Hint',
  args: {
    label: 'Work email',
    hint: 'We only use this to send workspace notifications.',
  },
  render: Default.render,
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    label: 'Work email',
    error: 'Enter a valid email address.',
  },
  render: Default.render,
};

export const Required: Story = {
  name: 'Required',
  args: {
    label: 'Work email',
    required: true,
    hint: 'Required to create your account.',
  },
  render: Default.render,
};

export const DisabledControl: Story = {
  name: 'Disabled Control',
  args: {
    label: 'Workspace URL',
    disabled: true,
    hint: 'Managed by your administrator.',
  },
  render: (args) => (
    <PFormField {...args}>
      <PTextInput defaultValue="acme.example.com" />
    </PFormField>
  ),
};

export const LongLabelAndError: Story = {
  name: 'Long Label + Long Error',
  args: {
    label:
      'Primary billing contact email address used for invoices, receipts, and dunning notices',
    required: true,
    error:
      'This address is already associated with another workspace. Enter a different email, or contact support to merge the two workspaces into one billing account.',
  },
  render: Default.render,
};

export const WrapsAnyControl: Story = {
  name: 'Wraps Any Control',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <PFormField label="Full name" hint="As it appears on official documents.">
        <PTextInput autoComplete="name" />
      </PFormField>
      <PFormField label="Environment" required>
        <PSelect
          options={[
            { value: 'prod', label: 'Production' },
            { value: 'staging', label: 'Staging' },
            { value: 'dev', label: 'Development' },
          ]}
        />
      </PFormField>
      <PFormField label="Notes" error="Notes cannot be empty.">
        <PTextArea />
      </PFormField>
    </div>
  ),
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: {
    label: 'Work email',
    required: true,
    hint: 'We only use this to send workspace notifications.',
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: Default.render,
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: {
    label: 'Work email',
    required: true,
    error: 'Enter a valid email address.',
  },
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [{ name: 'Dark', value: '#111111' }],
    },
  },
  // Render on the real theme background so contrast reflects the app surface.
  render: (args) => (
    <div style={{ background: 'var(--p-color-background)', padding: 24 }}>
      <PFormField {...args}>
        <PTextInput type="email" autoComplete="email" />
      </PFormField>
    </div>
  ),
};

export default meta;

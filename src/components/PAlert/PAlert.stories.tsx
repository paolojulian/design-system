import { type Meta, type StoryObj } from '@storybook/react';
import { PAlert } from '.';

const meta: Meta<typeof PAlert> = {
  title: 'Components/PAlert',
  component: PAlert,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 560 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: 'info',
    title: 'Scheduled maintenance',
    children: 'Reporting will be read-only on Sunday 02:00–03:00 UTC.',
  },
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['info', 'success', 'warning', 'danger'],
      description: 'Status role. Selects icon + color; icon always accompanies color.',
    },
    title: { description: 'Bold lead-in shown above the message.' },
    onDismiss: { description: 'When set, renders a dismiss button and is called on activation.' },
    action: { control: false, description: 'Inline action (link or button) below the message.' },
  },
};

type Story = StoryObj<typeof PAlert>;

export const Info: Story = { name: 'Info' };

export const Success: Story = {
  name: 'Success',
  args: {
    variant: 'success',
    title: 'Invoice sent',
    children: 'Invoice #10428 was emailed to billing@acme.co.',
  },
};

export const Warning: Story = {
  name: 'Warning',
  args: {
    variant: 'warning',
    title: 'Seat limit almost reached',
    children: 'You have used 19 of 20 seats. Add seats before inviting more members.',
  },
};

export const Danger: Story = {
  name: 'Danger',
  args: {
    variant: 'danger',
    title: 'Payment failed',
    children: 'We could not charge the card on file. Update it to avoid interruption.',
  },
};

export const MessageOnly: Story = {
  name: 'Message Only (no title)',
  args: {
    variant: 'info',
    title: undefined,
    children: 'Changes are saved automatically as you type.',
  },
};

export const WithAction: Story = {
  name: 'With Action',
  args: {
    variant: 'warning',
    title: 'Verify your email',
    children: 'A verification link was sent to you 3 days ago.',
    action: { label: 'Resend link', onClick: () => alert('Resent') },
  },
};

export const Dismissible: Story = {
  name: 'Dismissible',
  args: {
    variant: 'success',
    title: 'Backup complete',
    children: 'Last night’s workspace backup finished successfully.',
    onDismiss: () => alert('Dismissed'),
  },
};

export const WithLongText: Story = {
  name: 'With Long Text',
  args: {
    variant: 'danger',
    title: 'Deployment rolled back',
    children:
      'The 4.7.0 deployment was automatically rolled back after the health check failed on 3 of 4 regions. Traffic is now served by the previous stable release; no customer data was affected. Review the incident timeline and re-run the pipeline once the failing migration has been corrected.',
    action: { label: 'View incident', href: '#' },
    onDismiss: () => alert('Dismissed'),
  },
};

export const AllVariants: Story = {
  name: 'All Variants',
  render: () => (
    <div style={{ display: 'grid', gap: '0.75rem' }}>
      <PAlert variant="info" title="Info">
        A neutral, informational message.
      </PAlert>
      <PAlert variant="success" title="Success">
        The operation completed successfully.
      </PAlert>
      <PAlert variant="warning" title="Warning">
        Something needs your attention soon.
      </PAlert>
      <PAlert variant="danger" title="Danger">
        A problem occurred and needs action.
      </PAlert>
    </div>
  ),
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: {
    variant: 'warning',
    title: 'Seat limit almost reached',
    children: 'You have used 19 of 20 seats. Add seats before inviting more members.',
    action: { label: 'Manage seats', href: '#' },
    onDismiss: () => alert('Dismissed'),
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  // Paint the real themed background so the translucent status tints composite
  // over dark (as they would in a real dark app), not over the light iframe body.
  render: () => (
    <div
      style={{
        display: 'grid',
        gap: '0.75rem',
        background: 'var(--p-color-background)',
        padding: '1.5rem',
      }}
    >
      <PAlert variant="info" title="Info">
        A neutral, informational message.
      </PAlert>
      <PAlert variant="success" title="Success">
        The operation completed successfully.
      </PAlert>
      <PAlert variant="warning" title="Warning">
        Something needs your attention soon.
      </PAlert>
      <PAlert variant="danger" title="Danger" onDismiss={() => undefined}>
        A problem occurred and needs action.
      </PAlert>
    </div>
  ),
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [{ name: 'Dark', value: '#111111' }],
    },
  },
};

export default meta;

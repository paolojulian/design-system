import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PButton } from '../PButton';
import { PSheet, type PSheetProps } from '.';

type HarnessProps = PSheetProps & { defaultOpen?: boolean; triggerLabel?: string };

function SheetHarness({ defaultOpen = false, triggerLabel = 'Open sheet', ...props }: HarnessProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <PButton onClick={() => setOpen(true)}>{triggerLabel}</PButton>
      <PSheet {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta: Meta<typeof SheetHarness> = {
  title: 'Pipz/PSheet',
  component: PSheet,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    viewport: { defaultViewport: 'mobile1' },
  },
  args: {
    title: 'Sort orders',
    description: 'Pick how the list is ordered.',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <PButton variant="ghost" fullWidth>Newest first</PButton>
        <PButton variant="ghost" fullWidth>Oldest first</PButton>
        <PButton variant="ghost" fullWidth>Highest value</PButton>
      </div>
    ),
  },
  render: (args) => <SheetHarness {...(args as HarnessProps)} />,
};

type Story = StoryObj<typeof SheetHarness>;

export const Default: Story = { args: { defaultOpen: true } };

export const WithFooter: Story = {
  name: 'With Footer Actions',
  args: {
    defaultOpen: true,
    title: 'Apply filters',
    description: 'Narrow down the list.',
    footer: (
      <>
        <PButton variant="tertiary" fullWidth>Reset</PButton>
        <PButton fullWidth>Apply</PButton>
      </>
    ),
  },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: { defaultOpen: true },
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: { default: 'Dark', values: [{ name: 'Dark', value: '#111111' }] },
  },
};

export default meta;

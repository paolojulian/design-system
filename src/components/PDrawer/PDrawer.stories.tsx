import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PButton } from '../PButton';
import { PTextInput } from '../PTextInput';
import { PDrawer, type PDrawerProps } from '.';

type HarnessProps = PDrawerProps & { defaultOpen?: boolean; triggerLabel?: string };

function DrawerHarness({ defaultOpen = false, triggerLabel = 'Open drawer', ...props }: HarnessProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <PButton onClick={() => setOpen(true)}>{triggerLabel}</PButton>
      <PDrawer {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta: Meta<typeof DrawerHarness> = {
  title: 'Pipz/PDrawer',
  component: PDrawer,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    title: 'Order details',
    description: 'Reference #A-10294',
    children: (
      <dl style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '0.5rem 1.5rem', margin: 0 }}>
        <dt>Customer</dt>
        <dd style={{ margin: 0 }}>Marisol Vega</dd>
        <dt>Status</dt>
        <dd style={{ margin: 0 }}>Fulfilled</dd>
        <dt>Total</dt>
        <dd style={{ margin: 0 }}>$1,248.00</dd>
      </dl>
    ),
  },
  render: (args) => <DrawerHarness {...(args as HarnessProps)} />,
};

type Story = StoryObj<typeof DrawerHarness>;

export const Default: Story = { args: { defaultOpen: true } };

export const LeftSide: Story = {
  name: 'Left Side',
  args: { defaultOpen: true, side: 'left', title: 'Filters', description: 'Refine the results.' },
};

export const WithFilters: Story = {
  name: 'With Filters (Footer)',
  args: {
    defaultOpen: true,
    title: 'Filters',
    description: 'Refine the results.',
    children: (
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <PTextInput label="Search term" />
        <PTextInput label="Owner" />
        <PTextInput label="Tag" />
      </form>
    ),
    footer: (
      <>
        <PButton variant="tertiary">Reset</PButton>
        <PButton>Apply</PButton>
      </>
    ),
  },
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: { defaultOpen: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
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

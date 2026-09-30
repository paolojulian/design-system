import { type Meta, type StoryObj } from '@storybook/react';
import { useRef, useState } from 'react';
import { PButton } from '../PButton';
import { PCheckbox } from '../PCheckbox';
import { PPopover, type PPopoverProps } from '.';

type HarnessProps = Omit<PPopoverProps, 'open' | 'onClose' | 'anchorRef'> & {
  defaultOpen?: boolean;
  /** Pushes the trigger to the bottom of the canvas to show flipping. */
  alignBottom?: boolean;
};

function PopoverHarness({ defaultOpen = false, alignBottom = false, ...props }: HarnessProps) {
  const [open, setOpen] = useState(defaultOpen);
  const triggerRef = useRef<HTMLButtonElement>(null);

  return (
    <div
      style={{ display: 'flex', gap: '0.5rem', ...(alignBottom ? { minHeight: '90vh', alignItems: 'flex-end' } : {}) }}
    >
      <PButton
        ref={triggerRef}
        variant="secondary"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((current) => !current)}
      >
        Filter orders
      </PButton>
      <PPopover
        {...props}
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={triggerRef}
        footer={
          <>
            <PButton variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Reset
            </PButton>
            <PButton size="sm" onClick={() => setOpen(false)}>
              Apply
            </PButton>
          </>
        }
      />
      <PButton variant="secondary">Export</PButton>
    </div>
  );
}

const meta: Meta<typeof PopoverHarness> = {
  title: 'Pipz/PPopover',
  // The props table documents PPopover; the harness only supplies the state and anchor.
  component: PPopover as unknown as typeof PopoverHarness,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A small anchored panel for filters, pickers, and help. Opens on click, stays non-modal, and closes on Escape (focus returns to the trigger), a press outside, or focus leaving it. It renders in the top layer, so overflow and z-index on ancestors cannot clip it, and flips above its anchor when there is no room below. Up to the `sm` breakpoint it becomes a `PSheet`; pass `mobile="popover"` to keep the popover.',
      },
    },
  },
  args: {
    title: 'Filter orders',
    placement: 'bottom-start',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '14rem' }}>
        <PCheckbox label="Paid" defaultChecked />
        <PCheckbox label="Awaiting payment" />
        <PCheckbox label="Refunded" />
      </div>
    ),
  },
  render: (args) => <PopoverHarness {...(args as HarnessProps)} />,
};

type Story = StoryObj<typeof PopoverHarness>;

export const Default: Story = { args: { defaultOpen: true } };

export const EndAligned: Story = {
  name: 'End Aligned',
  args: { defaultOpen: true, placement: 'bottom-end' },
};

export const FlipsAbove: Story = {
  name: 'Flips Above Near The Bottom Edge',
  args: { defaultOpen: true, alignBottom: true },
  parameters: { layout: 'padded' },
};

export const MobileSheet: Story = {
  name: 'Mobile Sheet',
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

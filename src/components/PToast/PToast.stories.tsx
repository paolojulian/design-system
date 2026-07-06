import { type Meta, type StoryObj } from '@storybook/react';
import { useEffect, type ReactNode } from 'react';
import { PToastProvider, toast, type PToastInput } from '.';
import { PButton } from '../PButton';

/**
 * PToast is driven by the imperative `toast.*` API, not props — so stories mount
 * a `PToastProvider` and either fire toasts from a trigger or seed them on mount.
 */
const meta: Meta<typeof PToastProvider> = {
  title: 'Components/PToast',
  component: PToastProvider,
  parameters: {
    layout: 'fullscreen',
  },
};

type Story = StoryObj<typeof PToastProvider>;

/** Seeds toasts on mount and clears them on unmount (deterministic for tests). */
function Seed({ items }: { items: PToastInput[] }) {
  useEffect(() => {
    items.forEach((item) => toast(item));
    return () => toast.clear();
    // Seed exactly once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

function Stage({ children }: { children?: ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', padding: '2rem', background: 'var(--p-color-background)' }}>
      {children}
    </div>
  );
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <p style={{ maxWidth: '32rem', margin: 0, color: 'var(--p-color-text-muted)' }}>{children}</p>
  );
}

/** Provider + seeded toasts + an explanatory caption (keeps #storybook-root non-empty). */
function Demo({ caption, items, max }: { caption: ReactNode; items: PToastInput[]; max?: number }) {
  return (
    <PToastProvider max={max}>
      <Stage>
        <Caption>{caption}</Caption>
      </Stage>
      <Seed items={items} />
    </PToastProvider>
  );
}

const VARIANT_ITEMS: PToastInput[] = [
  { variant: 'info', title: 'Export queued', message: 'Your report is being generated.', duration: null },
  { variant: 'success', title: 'Saved', message: 'Your changes were saved.', duration: null },
  { variant: 'warning', title: 'Seat limit', message: '19 of 20 seats used.', duration: null },
  { variant: 'danger', title: 'Save failed', message: 'We could not reach the server.', duration: null },
];

export const Playground: Story = {
  name: 'Playground (imperative API)',
  render: () => (
    <PToastProvider>
      <Stage>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
          <PButton onClick={() => toast.info('Report export queued.')}>Info</PButton>
          <PButton onClick={() => toast.success('Settings saved.', { title: 'Saved' })}>
            Success
          </PButton>
          <PButton
            onClick={() =>
              toast.warning('You are approaching your seat limit.', { title: 'Heads up' })
            }
          >
            Warning
          </PButton>
          <PButton
            onClick={() =>
              toast.error('We could not save your changes.', {
                title: 'Save failed',
                action: { label: 'Retry' },
              })
            }
          >
            Error
          </PButton>
        </div>
      </Stage>
    </PToastProvider>
  ),
};

export const Variants: Story = {
  name: 'Variants',
  render: () => (
    <Demo
      max={4}
      caption="One toast per status role. Icon + colored accent bar communicate state together."
      items={VARIANT_ITEMS}
    />
  ),
};

export const StackedQueue: Story = {
  name: 'Stacked Queue (max 3 visible)',
  render: () => (
    <Demo
      caption="Five toasts were fired; only three are shown. The rest queue and appear as slots free up."
      items={[1, 2, 3, 4, 5].map((n) => ({
        variant: 'info',
        title: `Toast ${n}`,
        message: `Notification number ${n} in the queue.`,
        duration: null,
      }))}
    />
  ),
};

export const WithAction: Story = {
  name: 'With Action',
  render: () => (
    <Demo
      caption="Toasts can carry a single inline action; activating it also dismisses the toast."
      items={[
        {
          variant: 'danger',
          title: 'Upload failed',
          message: 'network-config.yaml could not be uploaded.',
          duration: null,
          action: { label: 'Retry upload' },
        },
      ]}
    />
  ),
};

export const PauseOnHover: Story = {
  name: 'Pause on Hover',
  render: () => (
    <PToastProvider>
      <Stage>
        <PButton
          onClick={() => toast.info('Auto-dismisses in 1.2s — hover to pause.', { duration: 1200 })}
        >
          Show toast
        </PButton>
      </Stage>
    </PToastProvider>
  ),
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport (swipe to dismiss)',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => (
    <Demo
      caption="On mobile the stack sits at the bottom, full-width above the safe area. Swipe sideways to dismiss."
      items={[
        {
          variant: 'success',
          title: 'Saved',
          message: 'Swipe this toast sideways to dismiss it.',
          duration: null,
        },
      ]}
    />
  ),
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [{ name: 'Dark', value: '#111111' }],
    },
  },
  render: () => (
    <Demo max={4} caption="All variants on the dark theme surface tokens." items={VARIANT_ITEMS} />
  ),
};

export default meta;

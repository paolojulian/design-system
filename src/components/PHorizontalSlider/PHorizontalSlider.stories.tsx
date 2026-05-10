import { type Meta, type StoryObj } from '@storybook/react';
import { PHorizontalSlider } from '.';
import { PTypography } from '../PTypography';

const items = [
  'Pipeline overview',
  'Risk review',
  'Contract queue',
  'Account health',
  'Renewal forecast',
  'Support load',
];

function SliderCard({ index, title }: { index: number; title: string }) {
  return (
    <article
      style={{
        width: 260,
        minHeight: 180,
        border: '1px solid var(--p-color-border)',
        background: 'var(--p-color-surface)',
        padding: 'var(--p-space-4)',
      }}
    >
      <PTypography variant="body-wide" style={{ color: 'var(--p-color-text-muted)' }}>
        {String(index + 1).padStart(2, '0')}
      </PTypography>
      <div style={{ marginTop: 'var(--p-space-8)' }}>
        <PTypography variant="heading">{title}</PTypography>
      </div>
    </article>
  );
}

const meta: Meta<typeof PHorizontalSlider> = {
  title: 'Components/PHorizontalSlider',
  component: PHorizontalSlider,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ariaLabel: 'Featured content',
    children: items.map((item, index) => (
      <SliderCard key={item} index={index} title={item} />
    )),
  },
  argTypes: {
    ariaLabel: {
      description: 'Accessible label for the keyboard-focusable scroll region.',
    },
    gap: {
      description: 'Gap between slider items. Accepts any CSS gap value.',
    },
    snap: {
      description: 'Enables or disables horizontal snap alignment.',
    },
    scrollerClassName: {
      description: 'Applied to the scrollable region.',
    },
    listClassName: {
      description: 'Applied to the inner list.',
    },
    itemClassName: {
      description: 'Applied to each generated list item.',
    },
  },
};

type Story = StoryObj<typeof PHorizontalSlider>;

export const Default: Story = {
  name: 'Default',
};

export const Compact: Story = {
  name: 'Compact',
  args: {
    gap: 'var(--p-space-2)',
  },
};

export const FreeScroll: Story = {
  name: 'Free Scroll',
  args: {
    snap: false,
  },
};

export default meta;

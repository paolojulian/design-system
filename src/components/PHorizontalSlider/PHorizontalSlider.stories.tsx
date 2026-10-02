import { type CSSProperties } from 'react';
import { type Meta, type StoryObj } from '@storybook/react';
import { PHorizontalSlider } from '.';
import { PButton } from '../PButton';
import { PCard } from '../PCard';

type SliderStoryItem = {
  title: string;
  width: number;
};

const items: SliderStoryItem[] = [
  {
    title: 'Pipeline overview',
    width: 300,
  },
  {
    title: 'Risk review',
    width: 300,
  },
  {
    title: 'Contract queue',
    width: 300,
  },
  {
    title: 'Account health',
    width: 300,
  },
  {
    title: 'Renewal forecast',
    width: 300,
  },
  {
    title: 'Support load',
    width: 300,
  },
];

const meta: Meta<typeof PHorizontalSlider> = {
  title: 'Pipz/PHorizontalSlider',
  component: PHorizontalSlider,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    ariaLabel: 'Featured content',
    children: items.map((item, index) => (
      <PCard key={item.title} prefix={String(index + 1).padStart(2, '0')} {...item} />
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
    controls: {
      description: 'Shows previous/next buttons and a position counter below the slider.',
    },
    showCounter: {
      description: 'Shows the "1 / 8" counter next to the controls.',
    },
    previousLabel: {
      description: 'Accessible label for the previous button.',
    },
    nextLabel: {
      description: 'Accessible label for the next button.',
    },
    controlsClassName: {
      description: 'Applied to the controls row.',
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

export const WithControls: Story = {
  name: 'With Controls',
  args: {
    controls: true,
    ariaLabel: 'Featured reports',
  },
};

const panelStyle = (width: string): CSSProperties => ({
  display: 'grid',
  alignContent: 'end',
  boxSizing: 'border-box',
  width,
  height: '22rem',
  padding: 'var(--p-space-6)',
  border: '1px solid var(--p-color-border)',
  borderRadius: 'var(--p-radius-sm)',
  background: 'var(--p-color-surface-subtle)',
  color: 'var(--p-color-text)',
  fontFamily: 'var(--p-font-family-sans)',
});

/** Items can be anything, at any width. The slider only lays them out and scrolls them. */
export const MixedContent: Story = {
  name: 'Mixed Content',
  args: {
    controls: true,
    ariaLabel: 'Stories',
    gap: 'var(--p-space-4)',
    children: [
      <figure key="quote" style={{ ...panelStyle('min(78vw, 20rem)'), margin: 0 }}>
        <blockquote style={{ margin: 0, fontSize: 'var(--p-font-size-heading-sm)' }}>
          “The team picked up the phone on the first ring.”
        </blockquote>
        <figcaption style={{ marginTop: 'var(--p-space-4)', color: 'var(--p-color-text-muted)' }}>
          Ana, daughter of a client
        </figcaption>
      </figure>,
      <div key="wide" style={panelStyle('min(86vw, 32rem)')}>
        <strong>A wider panel</strong>
        <span style={{ color: 'var(--p-color-text-muted)' }}>Widths don't need to match.</span>
      </div>,
      <PCard key="card" title="A design-system card" prefix="03" width={300} />,
      <div key="action" style={panelStyle('min(78vw, 20rem)')}>
        <PButton variant="secondary">Interactive content works too</PButton>
      </div>,
      ...items.slice(0, 3).map((item, index) => (
        <PCard key={item.title} prefix={String(index + 5).padStart(2, '0')} {...item} />
      )),
    ],
  },
};

export default meta;

import { type Meta, type StoryObj } from '@storybook/react';
import { PHorizontalSlider } from '.';
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
  title: 'Components/PHorizontalSlider',
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

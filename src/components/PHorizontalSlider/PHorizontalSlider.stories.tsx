import { type Meta, type StoryObj } from '@storybook/react';
import { PHorizontalSlider } from '.';
import { PCard } from '../PCard';

const items = [
  {
    title: 'Pipeline overview',
    description: 'Scan open opportunities and handoff points.',
    eyebrow: 'Sales',
  },
  {
    title: 'Risk review',
    eyebrow: 'Control',
  },
  {
    title: 'Contract queue',
    description: 'Track approvals across legal and finance.',
    eyebrow: 'Legal',
  },
  {
    title: 'Account health',
    description: 'Monitor renewal posture and support load.',
    eyebrow: 'Success',
  },
  {
    title: 'Renewal forecast',
    eyebrow: 'Finance',
  },
  {
    title: 'Support load',
    description: 'Review request volume and current response risk.',
    eyebrow: 'Service',
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
      <PCard
        key={item.title}
        prefix={String(index + 1).padStart(2, '0')}
        eyebrow={item.eyebrow}
        title={item.title}
        description={item.description}
      />
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

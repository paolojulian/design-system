import { type Meta, type StoryObj } from '@storybook/react';
import { PButton } from '.';

function ArrowRightIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 10h12" />
      <path d="m11 5 5 5-5 5" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M10 4v12" />
      <path d="M4 10h12" />
    </svg>
  );
}

const meta: Meta<typeof PButton> = {
  title: 'Components/PButton',
  component: PButton,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger', 'ghost'],
      description: 'Visual treatment mapped to semantic action tokens.',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Control size. Medium and large meet the enterprise touch target by default.',
    },
    fullWidth: {
      description: 'Expands the button to fill its container.',
    },
    isLoading: {
      description: 'Shows a spinner and disables interaction while preserving the label.',
    },
    href: {
      description: 'When provided, renders the component as an anchor with button styling.',
    },
    disabled: {
      description: 'Disables button interaction. Anchors use `aria-disabled` and are removed from tab order.',
    },
    leftIcon: {
      description: 'Decorative icon rendered before the label.',
    },
    rightIcon: {
      description: 'Decorative icon rendered after the label.',
    },
  },
};

type Story = StoryObj<typeof PButton>;

export const Primary: Story = {
  name: 'Primary',
};

export const Secondary: Story = {
  name: 'Secondary',
  args: {
    variant: 'secondary',
  },
};

export const Tertiary: Story = {
  name: 'Tertiary',
  args: {
    variant: 'tertiary',
  },
};

export const Danger: Story = {
  name: 'Danger',
  args: {
    variant: 'danger',
    children: 'Delete record',
  },
};

export const Ghost: Story = {
  name: 'Ghost',
  args: {
    variant: 'ghost',
  },
};

export const WithIcons: Story = {
  name: 'With Icons',
  args: {
    leftIcon: <PlusIcon />,
    rightIcon: <ArrowRightIcon />,
    children: 'Create item',
  },
};

export const Loading: Story = {
  name: 'Loading',
  args: {
    isLoading: true,
    children: 'Saving',
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
  },
};

export const Link: Story = {
  name: 'Link',
  args: {
    href: '#',
    children: 'Open details',
    rightIcon: <ArrowRightIcon />,
  },
};

export const Sizes: Story = {
  name: 'Sizes',
  render: () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
      <PButton size="sm">Small</PButton>
      <PButton size="md">Medium</PButton>
      <PButton size="lg">Large</PButton>
    </div>
  ),
};

export const Variants: Story = {
  name: 'Variants',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
      <PButton>Primary</PButton>
      <PButton variant="secondary">Secondary</PButton>
      <PButton variant="tertiary">Tertiary</PButton>
      <PButton variant="danger">Danger</PButton>
      <PButton variant="ghost">Ghost</PButton>
    </div>
  ),
};

export const FullWidth: Story = {
  name: 'Full Width',
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    fullWidth: true,
    children: 'Continue',
  },
};

export default meta;

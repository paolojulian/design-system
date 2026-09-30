import { type Meta, type StoryObj } from '@storybook/react';
import { EButton, type EButtonTone, type EButtonVariant } from '.';
import '../ElleStories.css';

function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
      <path d="M10 4v12" />
      <path d="M4 10h12" />
    </svg>
  );
}

const meta: Meta<typeof EButton> = {
  title: 'Elle/EButton',
  component: EButton,
  tags: ['autodocs'],
  globals: { design: 'elle' },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Apple’s four button styles. Import from `@paolojulian.dev/design-system/elle`. Gray buttons are meant for white surfaces (cards, grouped lists): in light mode the gray fill equals the grouped page background.',
      },
    },
  },
  args: {
    children: 'Continue',
    variant: 'filled',
    tone: 'default',
    size: 'md',
    shape: 'capsule',
  },
  argTypes: {
    variant: { control: 'select', options: ['filled', 'tinted', 'gray', 'plain'] },
    tone: { control: 'select', options: ['default', 'destructive'] },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    shape: { control: 'select', options: ['capsule', 'rounded'] },
  },
};

export default meta;
type Story = StoryObj<typeof EButton>;

export const Filled: Story = {};

const VARIANTS: EButtonVariant[] = ['filled', 'tinted', 'gray', 'plain'];
const TONES: EButtonTone[] = ['default', 'destructive'];

export const Variants: Story = {
  render: () => (
    <div className="elle-story elle-story--surface">
      {TONES.map((tone) => (
        <div key={tone} className="elle-story__row">
          {VARIANTS.map((variant) => (
            <EButton key={variant} variant={variant} tone={tone} data-testid={`${variant}-${tone}`}>
              {tone === 'destructive' ? 'Delete' : variant[0].toUpperCase() + variant.slice(1)}
            </EButton>
          ))}
        </div>
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="elle-story__row">
      <EButton size="sm">Small</EButton>
      <EButton size="md">Medium</EButton>
      <EButton size="lg">Large</EButton>
    </div>
  ),
};

export const Shapes: Story = {
  render: () => (
    <div className="elle-story__row">
      <EButton shape="capsule">Capsule</EButton>
      <EButton shape="rounded">Rounded</EButton>
      <EButton shape="rounded" variant="tinted" leftIcon={<PlusIcon />}>
        Add
      </EButton>
    </div>
  ),
};

export const Loading: Story = {
  render: () => (
    <div className="elle-story">
      <div className="elle-story__row">
        <EButton data-testid="label-idle">Save changes</EButton>
        <EButton data-testid="label-loading" isLoading>
          Save changes
        </EButton>
      </div>
      <div className="elle-story__row">
        <EButton data-testid="icon-idle" variant="tinted" leftIcon={<PlusIcon />}>
          Save changes
        </EButton>
        <EButton data-testid="icon-loading" variant="tinted" leftIcon={<PlusIcon />} isLoading>
          Save changes
        </EButton>
      </div>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="elle-story__row">
      <EButton disabled>Filled</EButton>
      <EButton variant="tinted" disabled>
        Tinted
      </EButton>
      <EButton variant="plain" disabled>
        Plain
      </EButton>
    </div>
  ),
};

export const Link: Story = {
  args: {
    href: '#settings',
    variant: 'plain',
    children: 'Open settings',
  },
};

export const FullWidth: Story = {
  parameters: { layout: 'padded' },
  render: () => (
    <div className="elle-story elle-story--narrow">
      <EButton fullWidth size="lg">
        Continue
      </EButton>
      <EButton fullWidth size="lg" variant="plain">
        Not now
      </EButton>
    </div>
  ),
};

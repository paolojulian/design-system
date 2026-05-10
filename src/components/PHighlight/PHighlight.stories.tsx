import { type Meta, type StoryObj } from '@storybook/react';
import { PTypography } from '../PTypography';
import { PHighlight } from '.';

const meta: Meta<typeof PHighlight> = {
  title: 'Components/PHighlight',
  component: PHighlight,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  args: {
    children: 'SIMPLE',
    variant: 'primary',
  },
  argTypes: {
    as: {
      description: 'Rendered element. Defaults to span for inline typography emphasis.',
    },
    appearance: {
      control: 'select',
      options: ['text', 'background'],
      description: 'Text-only emphasis by default, or a filled highlight background.',
    },
    variant: {
      control: 'select',
      options: ['primary', 'danger', 'warning', 'success', 'info', 'neutral'],
      description: 'Semantic highlight treatment.',
    },
    color: {
      control: 'color',
      description: 'Custom highlight color. Text color by default, background color in background mode.',
    },
    textColor: {
      control: 'color',
      description: 'Custom foreground color for background mode.',
    },
  },
};

type Story = StoryObj<typeof PHighlight>;

export const Default: Story = {
  name: 'Default',
};

export const HeroUseCase: Story = {
  name: 'Hero Use Case',
  render: () => (
    <div style={{ textAlign: 'center' }}>
      <PTypography variant="heading-xl">KEEPING</PTypography>
      <PTypography variant="heading-xl">THINGS</PTypography>
      <PTypography variant="heading-xl">
        <PHighlight>SIMPLE</PHighlight>
      </PTypography>
      <PTypography variant="heading-xl">SINCE</PTypography>
      <PTypography variant="heading-xl">2017</PTypography>
    </div>
  ),
};

export const Variants: Story = {
  name: 'Variants',
  render: () => (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
      <PHighlight>Primary</PHighlight>
      <PHighlight variant="danger">Danger</PHighlight>
      <PHighlight variant="warning">Warning</PHighlight>
      <PHighlight variant="success">Success</PHighlight>
      <PHighlight variant="info">Info</PHighlight>
      <PHighlight variant="neutral">Neutral</PHighlight>
    </div>
  ),
};

export const CustomColor: Story = {
  name: 'Custom Color',
  args: {
    color: '#111111',
    children: 'CUSTOM',
  },
};

export const Background: Story = {
  name: 'Background',
  args: {
    appearance: 'background',
    children: 'SIMPLE',
  },
};

export const CustomBackground: Story = {
  name: 'Custom Background',
  args: {
    appearance: 'background',
    color: '#111111',
    textColor: '#ffffff',
    children: 'CUSTOM',
  },
};

export const InlineCopy: Story = {
  name: 'Inline Copy',
  render: () => (
    <PTypography variant="body">
      Keep the content scannable and use <PHighlight variant="warning">one clear emphasis</PHighlight>{' '}
      per sentence.
    </PTypography>
  ),
};

export default meta;

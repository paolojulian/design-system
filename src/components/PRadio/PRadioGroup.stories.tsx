import { type Meta, type StoryObj } from '@storybook/react';
import { type ComponentType } from 'react';
import { PRadio } from './PRadio';
import { PRadioGroup } from './PRadioGroup';

const meta: Meta<typeof PRadioGroup> = {
  title: 'Pipz/PRadioGroup',
  component: PRadioGroup,
  // Storybook types this map as `ComponentType<unknown>`, which nothing with
  // required props satisfies — props are contravariant, so `unknown` is not
  // assignable to PRadio's `{ value, label }`. The cast is the documented way
  // to register a subcomponent for the autodocs props table; it affects the
  // docs page only, never the rendered story.
  subcomponents: { PRadio: PRadio as ComponentType<unknown> },
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Deployment environment',
  },
  argTypes: {
    label: { description: 'Group label rendered as the `<legend>`; names the radiogroup.' },
    description: { description: 'Supporting copy shown below the label.' },
    orientation: {
      control: 'inline-radio',
      options: ['vertical', 'horizontal'],
      description: 'Lays radios out in a row instead of the default stack.',
    },
    isError: { description: 'Puts the group into an error state.' },
    errorMessage: { description: 'Shown below the group when `isError` is true. Announced via `role="alert"`.' },
    disabled: { description: 'Disables every radio in the group.' },
  },
};

type Story = StoryObj<typeof PRadioGroup>;

const options = (
  <>
    <PRadio value="production" label="Production" />
    <PRadio value="staging" label="Staging" />
    <PRadio value="development" label="Development" />
  </>
);

export const Default: Story = {
  name: 'Default',
  args: {
    defaultValue: 'staging',
    children: options,
  },
};

export const WithDescription: Story = {
  name: 'With Description',
  args: {
    description: 'Applies to the next scheduled deploy only.',
    defaultValue: 'production',
    children: options,
  },
};

export const Horizontal: Story = {
  name: 'Horizontal Layout',
  args: {
    label: 'Billing cycle',
    orientation: 'horizontal',
    defaultValue: 'monthly',
    children: (
      <>
        <PRadio value="monthly" label="Monthly" />
        <PRadio value="annual" label="Annual" />
      </>
    ),
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    defaultValue: 'staging',
    children: options,
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    label: 'Approval level',
    isError: true,
    errorMessage: 'Select an approval level to continue.',
    children: (
      <>
        <PRadio value="standard" label="Standard" />
        <PRadio value="elevated" label="Elevated" />
        <PRadio value="admin" label="Administrator" />
      </>
    ),
  },
};

export const WithLongLabel: Story = {
  name: 'With Long Label',
  args: {
    label: 'Data retention policy',
    defaultValue: 'ninety',
    children: (
      <>
        <PRadio
          value="thirty"
          label="Keep operational logs for 30 days, then archive to cold storage automatically."
        />
        <PRadio
          value="ninety"
          label="Keep operational logs for 90 days to satisfy the standard compliance window."
        />
      </>
    ),
  },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: {
    description: 'Applies to the next scheduled deploy only.',
    defaultValue: 'production',
    children: options,
  },
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [{ name: 'Dark', value: '#111111' }],
    },
  },
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: {
    defaultValue: 'staging',
    children: options,
  },
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
};

export default meta;

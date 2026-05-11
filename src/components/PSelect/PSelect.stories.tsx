import { type Meta, type StoryObj } from '@storybook/react';
import { PSelect } from '.';

const accountOptions = [
  { value: 'northstar', label: 'Northstar Capital', group: 'Active accounts' },
  { value: 'acme', label: 'Acme Industrial', group: 'Active accounts' },
  { value: 'atlas', label: 'Atlas Foods', group: 'Active accounts' },
  { value: 'archived', label: 'Archived portfolio', group: 'Other', disabled: true },
];

const meta: Meta<typeof PSelect> = {
  title: 'Components/PSelect',
  component: PSelect,
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
    label: 'Account',
    options: accountOptions,
  },
  argTypes: {
    label: {
      description: 'Visible label used by the native select and floating field treatment.',
    },
    options: {
      description: 'Native select options. Options with the same group render inside an optgroup.',
    },
    placeholder: {
      description: 'Initial empty option shown before a value is selected.',
    },
    density: {
      control: 'select',
      options: ['standard', 'compact'],
      description: 'Adjusts the field height while preserving the Combobox visual language.',
    },
    variant: {
      control: 'select',
      options: ['floating', 'inline'],
      description: 'Floating is for form fields. Inline is for compact utility controls.',
    },
    hideLabel: {
      description: 'Visually hides the label while keeping the native select accessible name.',
    },
    helperText: {
      description: 'Shown below the field when there is no error.',
    },
    isError: {
      description: 'Puts the field into an error state.',
    },
    errorMessage: {
      description: 'Shown below the field when `isError` is true. Announced via `role="alert"`.',
    },
  },
};

type Story = StoryObj<typeof PSelect>;

export const Default: Story = {
  name: 'Default',
};

export const Filled: Story = {
  name: 'Filled',
  args: {
    defaultValue: 'acme',
  },
};

export const Compact: Story = {
  name: 'Compact',
  args: {
    density: 'compact',
    defaultValue: 'northstar',
  },
};

export const Inline: Story = {
  name: 'Inline',
  args: {
    label: 'Rows per page',
    variant: 'inline',
    density: 'compact',
    hideLabel: true,
    defaultValue: '20',
    options: [
      { value: '10', label: '10 / page' },
      { value: '20', label: '20 / page' },
      { value: '50', label: '50 / page' },
    ],
  },
};

export const WithHelperText: Story = {
  name: 'With Helper Text',
  args: {
    helperText: 'Choose the account this record belongs to.',
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    isError: true,
    errorMessage: 'Select an account.',
    required: true,
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    defaultValue: 'northstar',
  },
};

export default meta;

import { type Meta, type StoryObj } from '@storybook/react';
import { PTextArea } from '.';

const meta: Meta<typeof PTextArea> = {
  title: 'Components/PTextArea',
  component: PTextArea,
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
    label: 'Label',
  },
  argTypes: {
    label: {
      description: 'Visible label — doubles as the floating label and the placeholder.',
    },
    helperText: {
      description: 'Shown below the field when there is no error.',
    },
    isError: {
      description: 'Puts the field into an error state (red ring + error message).',
    },
    errorMessage: {
      description: 'Shown below the field when `isError` is true. Announced via `role="alert"`.',
    },
    rows: {
      description: 'Number of visible text rows. Defaults to 4.',
    },
    disabled: {
      description: 'Prevents interaction and applies a muted visual style.',
    },
    readOnly: {
      description: 'Prevents editing but keeps the field focusable and selectable.',
    },
    required: {
      description: 'Marks the field as required for form validation.',
    },
    className: {
      description:
        'Applied to the root wrapper. Prefer semantic token overrides such as `[--p-textarea-ring:var(--p-color-info)]`.',
    },
    textareaClassName: {
      description: 'Applied to the inner `<textarea>` element for layout / spacing overrides.',
    },
  },
};

type Story = StoryObj<typeof PTextArea>;

export const Default: Story = {
  name: 'Default',
};

export const Filled: Story = {
  name: 'Filled',
  args: {
    defaultValue: 'Some longer text content that spans multiple lines in the textarea field.',
  },
};

export const WithHelperText: Story = {
  name: 'With Helper Text',
  args: {
    label: 'Bio',
    helperText: 'Maximum 300 characters.',
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    isError: true,
    errorMessage: 'This field is required.',
    defaultValue: 'bad input',
  },
};

export const WithErrorAndHelperText: Story = {
  name: 'Error Overrides Helper Text',
  args: {
    label: 'Bio',
    helperText: 'Maximum 300 characters.',
    isError: true,
    errorMessage: 'Input exceeds maximum length.',
    defaultValue: 'Way too long...',
  },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  args: {
    readOnly: true,
    defaultValue: 'Cannot edit this content.',
    helperText: 'This field is read-only.',
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this content.',
  },
};

export const Required: Story = {
  name: 'Required',
  args: {
    required: true,
    label: 'Message',
  },
};

export const CustomRows: Story = {
  name: 'Custom Rows',
  args: {
    label: 'Detailed description',
    rows: 8,
  },
};

export const CustomColors: Story = {
  name: 'Custom Colors (token override)',
  args: {
    label: 'Custom themed textarea',
    className:
      '[--p-textarea-ring:var(--p-color-info)] [--p-textarea-label-focus:var(--p-color-info)] [--p-textarea-bg:var(--p-color-info-surface)]',
  },
};

export default meta;

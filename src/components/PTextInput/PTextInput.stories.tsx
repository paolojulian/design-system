import { type Meta, type StoryObj } from '@storybook/react';
import { PTextInput } from '.';

const meta: Meta<typeof PTextInput> = {
  title: 'Components/PTextInput',
  component: PTextInput,
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
    type: {
      control: 'select',
      options: ['text', 'password', 'email', 'number', 'tel', 'date'],
      description: 'HTML input type. Password type enables the show/hide toggle automatically.',
    },
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
    rightAdornment: {
      description: 'Decorative element placed on the trailing edge. Ignored when `type="password"`.',
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
        'Applied to the root wrapper element. Prefer semantic token overrides such as `[--p-input-ring:var(--p-color-info)]`.',
    },
    inputClassName: {
      description: 'Applied to the inner `<input>` element for layout / spacing overrides.',
    },
  },
};

type Story = StoryObj<typeof PTextInput>;

export const Default: Story = {
  name: 'Default',
};

export const Filled: Story = {
  name: 'Filled',
  args: {
    defaultValue: 'Some value',
  },
};

export const WithHelperText: Story = {
  name: 'With Helper Text',
  args: {
    label: 'Email',
    type: 'email',
    helperText: 'We will never share your email with anyone.',
  },
};

export const Password: Story = {
  name: 'Password',
  args: {
    type: 'password',
    label: 'Password',
    defaultValue: 'supersecret',
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
    label: 'Email',
    type: 'email',
    helperText: 'We will never share your email.',
    isError: true,
    errorMessage: 'Please enter a valid email address.',
    defaultValue: 'not-an-email',
  },
};

export const WithRightAdornment: Story = {
  name: 'With Right Adornment',
  args: {
    rightAdornment: 'kg',
    label: 'Weight',
  },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  args: {
    readOnly: true,
    defaultValue: 'Cannot edit this',
    helperText: 'This field is read-only.',
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    disabled: true,
    defaultValue: 'Cannot edit this',
  },
};

export const Required: Story = {
  name: 'Required',
  args: {
    required: true,
    label: 'Email',
    type: 'email',
  },
};

export const CustomColors: Story = {
  name: 'Custom Colors (token override)',
  args: {
    label: 'Custom themed input',
    className:
      '[--p-input-ring:var(--p-color-info)] [--p-input-bg:var(--p-color-info-surface)]',
  },
};

export default meta;

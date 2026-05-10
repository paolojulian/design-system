import { type Meta, type StoryObj } from '@storybook/react';
import { PDatePicker, PDatePickerPresets } from '.';
import { PTextInput } from '../PTextInput';

const meta: Meta<typeof PDatePicker> = {
  title: 'Components/PDatePicker',
  component: PDatePicker,
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
    label: 'Date',
    locale: 'en-US',
  },
  argTypes: {
    label: {
      description: 'Visible field label.',
    },
    value: {
      description: 'Controlled ISO date value in yyyy-mm-dd format.',
    },
    defaultValue: {
      description: 'Initial ISO date value in yyyy-mm-dd format.',
    },
    presets: {
      description: 'Optional quick date actions shown before the custom calendar trigger.',
    },
    customLabel: {
      description: 'Label for the calendar-opening preset button.',
    },
    showCustom: {
      description: 'Shows the custom calendar action when presets are present.',
    },
    presetColumns: {
      control: 'select',
      options: ['auto', 2, 3, 4],
      description: 'Controls the preset grid column count. Use auto for responsive fitting.',
    },
    min: {
      description: 'Minimum selectable ISO date.',
    },
    max: {
      description: 'Maximum selectable ISO date.',
    },
    helperText: {
      description: 'Shown below the picker when there is no error.',
    },
    isError: {
      description: 'Puts the picker into an error state.',
    },
    errorMessage: {
      description: 'Shown below the picker when `isError` is true.',
    },
  },
};

type Story = StoryObj<typeof PDatePicker>;

export const Standard: Story = {
  name: 'Standard',
  args: {
    label: 'Due date',
    defaultValue: '2026-05-10',
    helperText: 'Choose a date from the calendar.',
  },
};

export const WithPresets: Story = {
  name: 'With Presets',
  args: {
    label: 'Report date',
    presets: [PDatePickerPresets.today, PDatePickerPresets.yesterday],
    customLabel: 'Custom',
    presetColumns: 3,
    helperText: 'Use a quick date or choose a custom date.',
  },
};

export const ManyPresets: Story = {
  name: 'Many Presets',
  args: {
    label: 'Reporting date',
    presets: [
      PDatePickerPresets.today,
      PDatePickerPresets.yesterday,
      PDatePickerPresets.tomorrow,
      PDatePickerPresets.startOfMonth,
    ],
    customLabel: 'Custom',
    helperText: 'Auto layout adapts when teams expose more quick actions.',
  },
};

export const AlternatePresets: Story = {
  name: 'Alternate Presets',
  args: {
    label: 'Schedule date',
    presets: [PDatePickerPresets.yesterday, PDatePickerPresets.tomorrow],
    customLabel: 'Custom',
    presetColumns: 3,
  },
};

export const PresetsOnly: Story = {
  name: 'Presets Only',
  args: {
    label: 'SLA date',
    presets: [
      PDatePickerPresets.today,
      PDatePickerPresets.tomorrow,
      PDatePickerPresets.startOfMonth,
      PDatePickerPresets.endOfMonth,
    ],
    showCustom: false,
    presetColumns: 2,
    helperText: 'Restrict selection to approved operational dates.',
  },
};

export const Empty: Story = {
  name: 'Empty',
  args: {
    label: 'Start date',
  },
};

export const WithBounds: Story = {
  name: 'With Bounds',
  args: {
    label: 'Booking date',
    defaultValue: '2026-05-10',
    min: '2026-05-05',
    max: '2026-05-20',
    helperText: 'Only dates within the booking window can be selected.',
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    label: 'Contract date',
    isError: true,
    errorMessage: 'Select a valid contract date.',
  },
};

export const SampleWithOtherFields: Story = {
  name: 'Sample With Other Fields',
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', width: 360 }}>
      <PTextInput label="Project name" defaultValue="Enterprise rollout" />
      <PDatePicker
        label="Report date"
        presets={[PDatePickerPresets.today, PDatePickerPresets.yesterday]}
        customLabel="Custom"
        presetColumns={3}
        helperText="Opening the calendar expands the field area."
      />
      <PTextInput label="Owner" defaultValue="Operations" />
      <PTextInput label="Reference" />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
  decorators: [(Story) => <Story />],
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    label: 'Locked date',
    defaultValue: '2026-05-10',
    disabled: true,
  },
};

export default meta;

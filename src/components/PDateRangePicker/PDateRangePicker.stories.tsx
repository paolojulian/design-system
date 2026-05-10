import { type Meta, type StoryObj } from "@storybook/react";
import { PDateRangePicker, PDateRangePickerPresets } from ".";

const meta: Meta<typeof PDateRangePicker> = {
  title: "Components/PDateRangePicker",
  component: PDateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 360 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: "Date range",
    locale: "en-US",
  },
  argTypes: {
    label: {
      description: "Visible field label.",
    },
    value: {
      description: "Controlled ISO date range.",
    },
    defaultValue: {
      description: "Initial ISO date range.",
    },
    presets: {
      description:
        "Optional quick range actions shown before the custom calendar trigger.",
    },
    customLabel: {
      description: "Label for the calendar-opening preset button.",
    },
    showCustom: {
      description: "Shows the custom calendar action when presets are present.",
    },
    presetColumns: {
      control: "select",
      options: ["auto", 2, 3, 4],
      description:
        "Controls the preset grid column count. Use auto for responsive fitting.",
    },
    min: {
      description: "Minimum selectable ISO date.",
    },
    max: {
      description: "Maximum selectable ISO date.",
    },
    helperText: {
      description: "Shown below the picker when there is no error.",
    },
    isError: {
      description: "Puts the picker into an error state.",
    },
    errorMessage: {
      description: "Shown below the picker when `isError` is true.",
    },
  },
};

type Story = StoryObj<typeof PDateRangePicker>;

export const Standard: Story = {
  name: "Standard",
  args: {
    label: "Report range",
    defaultValue: { start: "2026-05-01", end: "2026-05-10" },
    helperText: "Choose a start and end date.",
  },
};

export const WithPresets: Story = {
  name: "With Presets",
  args: {
    label: "Analytics range",
    presets: [PDateRangePickerPresets.last7Days, PDateRangePickerPresets.thisMonth],
    customLabel: "Custom",
    presetColumns: 3,
    helperText: "Use a quick range or choose a custom range.",
  },
};

export const ManyPresets: Story = {
  name: "Many Presets",
  args: {
    label: "Analytics range",
    presets: [
      PDateRangePickerPresets.last7Days,
      PDateRangePickerPresets.last14Days,
      PDateRangePickerPresets.last30Days,
      PDateRangePickerPresets.thisMonth,
    ],
    customLabel: "Custom",
    helperText: "Auto layout adapts when teams expose more quick ranges.",
  },
};

export const PresetsOnly: Story = {
  name: "Presets Only",
  args: {
    label: "Analytics range",
    presets: [
      PDateRangePickerPresets.last7Days,
      PDateRangePickerPresets.last14Days,
      PDateRangePickerPresets.last30Days,
      PDateRangePickerPresets.monthToDate,
      PDateRangePickerPresets.yearToDate,
    ],
    showCustom: false,
    presetColumns: 2,
    helperText: "Restrict the report to approved enterprise ranges.",
  },
};

export const Empty: Story = {
  name: "Empty",
  args: {
    label: "Booking range",
  },
};

export const WithBounds: Story = {
  name: "With Bounds",
  args: {
    label: "Booking window",
    defaultValue: { start: "2026-05-10", end: "2026-05-15" },
    min: "2026-05-05",
    max: "2026-05-20",
    helperText: "Only dates within the booking window can be selected.",
  },
};

export const WithError: Story = {
  name: "With Error",
  args: {
    label: "Contract range",
    isError: true,
    errorMessage: "Select a valid start and end date.",
  },
};

export const Disabled: Story = {
  name: "Disabled",
  args: {
    label: "Locked range",
    defaultValue: { start: "2026-05-01", end: "2026-05-10" },
    disabled: true,
  },
};

export default meta;

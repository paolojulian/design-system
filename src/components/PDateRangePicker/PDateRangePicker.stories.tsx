import { type Meta, type StoryObj } from "@storybook/react";
import { useState } from "react";
import { PButton } from "../PButton";
import { PCheckbox } from "../PCheckbox";
import { PModal } from "../PModal";
import { PDateRangePicker, PDateRangePickerPresets } from ".";

const meta: Meta<typeof PDateRangePicker> = {
  title: "Pipz/PDateRangePicker",
  component: PDateRangePicker,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Pick a date range by clicking or dragging. A click before the start moves the start; any later click moves the end (1 → 9 → 5 selects 1–5), and clicking the start or end day itself changes nothing, so there is no zero-length range. The Start date / End date fields above the calendar show both dates and highlight the one the next click completes. Drag across days to select a span, or drag a range edge to move just that edge. The calendar opens in a PPopover with two months side by side on wide screens, one month on tablets, and a bottom sheet of vertically stacked months on phones. It stays open until Done, Escape, or a press outside; Clear dates empties it. Keyboard: arrows, Home/End, and PageUp/PageDown move focus; Enter or Space selects with the same rules as a click.",
      },
    },
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
    numberOfMonths: {
      control: "inline-radio",
      options: [1, 2],
      description: "Months side by side from the `md` breakpoint. Below it one month shows; on mobile a scrolling stack.",
    },
    summaryUnit: {
      control: "inline-radio",
      options: ["days", "nights"],
      description: "Counts the range as inclusive days or as nights (stays).",
    },
  },
};

type Story = StoryObj<typeof PDateRangePicker>;

export const Standard: Story = {
  name: "Standard",
  args: {
    label: "Report range",
    defaultValue: { start: "2026-05-01", end: "2026-05-10" },
    helperText: "Click or drag to choose dates.",
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

export const Stay: Story = {
  name: "Stay (Nights)",
  args: {
    label: "Check-in – Check-out",
    defaultValue: { start: "2026-05-18", end: "2026-05-23" },
    summaryUnit: "nights",
    helperText: "Counts nights instead of days.",
  },
};

export const OneMonth: Story = {
  name: "One Month",
  args: {
    label: "Report range",
    defaultValue: { start: "2026-05-01", end: "2026-05-10" },
    numberOfMonths: 1,
  },
};

export const MobileViewport: Story = {
  name: "Mobile Viewport",
  args: {
    label: "Booking range",
    defaultValue: { start: "2026-05-18", end: "2026-05-21" },
  },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};

function ModalHarness() {
  const [open, setOpen] = useState(true);

  return (
    <>
      <PButton onClick={() => setOpen(true)}>Block dates</PButton>
      <PModal
        open={open}
        onClose={() => setOpen(false)}
        title="Block dates"
        description="Guests can't book the ticked properties for these dates."
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <PCheckbox label="Ocean View Suite" />
          <PCheckbox label="Pine Ridge Cabin" />
          <PDateRangePicker label="Check-in – Check-out" placeholder="Pick dates" summaryUnit="nights" locale="en-US" />
        </div>
      </PModal>
    </>
  );
}

export const InsideModal: Story = {
  name: "Inside Modal",
  render: () => <ModalHarness />,
  parameters: {
    docs: {
      description: {
        story:
          "A modal locks page scroll, so the calendar must stay inside the viewport on its own: when it fits on neither side of the field it slides back on screen, overlapping the field.",
      },
    },
  },
};

export const DarkTheme: Story = {
  name: "Dark Theme",
  args: {
    label: "Report range",
    defaultValue: { start: "2026-05-01", end: "2026-05-10" },
  },
  globals: { theme: "dark" },
  parameters: {
    backgrounds: { default: "Dark", values: [{ name: "Dark", value: "#111111" }] },
  },
};

export default meta;

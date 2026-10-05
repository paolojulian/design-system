import { type Meta, type StoryObj } from '@storybook/react';
import { PDateRangeCalendar } from '.';

const meta: Meta<typeof PDateRangeCalendar> = {
  title: 'Pipz/PDateRangeCalendar',
  component: PDateRangeCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          "The PDateRangePicker calendar without a trigger or popover, always on the page, like Airbnb's listing calendar. Same selection rules (a click before the start moves the start; any later click moves the end), drag, keyboard model, and summary header. Two months side by side from the `md` breakpoint, one below it. It never takes focus on mount.",
      },
    },
  },
  args: {
    label: 'Stay dates',
    locale: 'en-US',
  },
  argTypes: {
    numberOfMonths: { control: 'inline-radio', options: [1, 2] },
    summaryUnit: { control: 'inline-radio', options: ['days', 'nights'] },
  },
};

type Story = StoryObj<typeof PDateRangeCalendar>;

export const Default: Story = {
  args: { defaultValue: { start: '2026-05-18', end: '2026-05-23' } },
};

export const Empty: Story = {};

export const Nights: Story = {
  args: {
    label: 'Check-in – Check-out',
    defaultValue: { start: '2026-05-18', end: '2026-05-23' },
    summaryUnit: 'nights',
  },
};

export const OneMonth: Story = {
  name: 'One Month',
  args: { defaultValue: { start: '2026-05-04', end: '2026-05-08' }, numberOfMonths: 1 },
};

export const WithBounds: Story = {
  name: 'With Bounds',
  args: { defaultValue: { start: '2026-05-10', end: '2026-05-15' }, min: '2026-05-05', max: '2026-06-20' },
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: { defaultValue: { start: '2026-05-18', end: '2026-05-23' } },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: { defaultValue: { start: '2026-05-18', end: '2026-05-23' } },
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: { default: 'Dark', values: [{ name: 'Dark', value: '#111111' }] },
  },
};

export const BlockedDates: Story = {
  name: 'Blocked Dates',
  args: {
    label: 'Check-in – Check-out',
    defaultValue: { start: '2026-10-27', end: '2026-10-30' },
    disabledDates: ['2026-11-01', '2026-11-02'],
    summaryUnit: 'nights',
  },
  parameters: {
    docs: {
      description: {
        story:
          "Nov 1 and Nov 2 are blocked with `disabledDates`, drawn as hatched cells. A range can never include one.",
      },
    },
  },
};

export const StayCalendar: Story = {
  name: 'Stay Calendar (nights)',
  args: {
    label: 'Check-in – Check-out',
    summaryUnit: 'nights',
    disabledUnit: 'night',
    disabledDates: ['2026-10-20', '2026-10-21', '2026-10-22', '2026-11-05'],
    defaultMonth: '2026-10-01',
    renderDayContent: (date: Date) => (date.getDay() === 5 || date.getDay() === 6 ? '5,200' : '4,500'),
  },
  parameters: {
    docs: {
      description: {
        story:
          "A listing calendar. `disabledUnit=\"night\"` makes a blocked date a booked NIGHT: Oct 20–22 are taken, so Oct 20 can't start a stay - but pick Oct 17 and Oct 20 is offered as the checkout, and Oct 23 (the guest's checkout day) is free to start the next one. A click past the stay restarts there; a drag stops at the checkout. `defaultMonth` opens on October with nothing selected, and `renderDayContent` prints the nightly rate under each day.",
      },
    },
  },
};

export const DefaultMonth: Story = {
  name: 'Default Month',
  args: { defaultMonth: '2027-03-15' },
  parameters: {
    docs: { description: { story: 'Opens on March 2027 with nothing selected. A selected start always wins over `defaultMonth`.' } },
  },
};

export const WithoutEdges: Story = {
  name: 'Without Edges',
  args: {
    label: 'Check-in – Check-out',
    defaultValue: { start: '2026-05-18', end: '2026-05-23' },
    summaryUnit: 'nights',
    numberOfMonths: 1,
    showEdges: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`showEdges={false}` drops the Check-in / Check-out fields and keeps the title. For a form that prints the picked dates itself (a booking form with its own summary line), so they are not shown twice.',
      },
    },
  },
};

export const FullWidth: Story = {
  name: 'Full Width',
  args: {
    label: 'Check-in – Check-out',
    defaultValue: { start: '2026-05-18', end: '2026-05-23' },
    summaryUnit: 'nights',
    numberOfMonths: 1,
    showEdges: false,
    fullWidth: true,
    trimWeeks: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          '`trimWeeks` drops the blank sixth row, so Clear dates sits right under the last week. `fullWidth` stretches the calendar to its container instead of the fixed month width, so the day cells grow with the space - a form column, a phone-wide sheet.',
      },
    },
  },
};

export default meta;

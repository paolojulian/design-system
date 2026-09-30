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
          "The PDateRangePicker calendar without a trigger or popover, always on the page, like Airbnb's listing calendar. Same selection rules (Start date / End date fields; after the start, clicks move the end; a click before the start begins again), drag, keyboard model, and summary header. Two months side by side from the `md` breakpoint, one below it. It never takes focus on mount.",
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

export default meta;

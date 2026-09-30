import { type Meta, type StoryObj } from '@storybook/react';
import { PDateCalendar } from '.';

const meta: Meta<typeof PDateCalendar> = {
  title: 'Pipz/PDateCalendar',
  component: PDateCalendar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'The PDatePicker calendar without a trigger or popover, always on the page. Click or press Enter/Space on a day to select it; arrows, Home/End and PageUp/PageDown move focus. It never takes focus on mount.',
      },
    },
  },
  args: {
    label: 'Due date',
    locale: 'en-US',
  },
};

type Story = StoryObj<typeof PDateCalendar>;

export const Default: Story = { args: { defaultValue: '2026-05-10' } };

export const Empty: Story = {};

export const WithBounds: Story = {
  name: 'With Bounds',
  args: { defaultValue: '2026-05-10', min: '2026-05-05', max: '2026-05-25' },
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: { defaultValue: '2026-05-10' },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: { defaultValue: '2026-05-10' },
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: { default: 'Dark', values: [{ name: 'Dark', value: '#111111' }] },
  },
};

export default meta;

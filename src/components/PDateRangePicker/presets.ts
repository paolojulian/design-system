import { addDays, addMonths, endOfMonth, getToday, startOfMonth, toIsoDate } from './dateRangeUtils';
import type { PDateRangePickerPreset } from './types';

export const PDateRangePickerPresets = {
  thisWeek: {
    label: 'This week',
    value: () => {
      const today = getToday();
      const weekStart = addDays(today, -today.getDay());

      return {
        start: toIsoDate(weekStart),
        end: toIsoDate(addDays(weekStart, 6)),
      };
    },
  },
  last7Days: {
    label: 'Last 7 days',
    value: () => {
      const today = getToday();
      return {
        start: toIsoDate(addDays(today, -6)),
        end: toIsoDate(today),
      };
    },
  },
  last14Days: {
    label: 'Last 14 days',
    value: () => {
      const today = getToday();
      return {
        start: toIsoDate(addDays(today, -13)),
        end: toIsoDate(today),
      };
    },
  },
  last30Days: {
    label: 'Last 30 days',
    value: () => {
      const today = getToday();
      return {
        start: toIsoDate(addDays(today, -29)),
        end: toIsoDate(today),
      };
    },
  },
  thisMonth: {
    label: 'This month',
    value: () => {
      const today = getToday();
      const start = startOfMonth(today);
      const end = endOfMonth(today);

      return {
        start: toIsoDate(start),
        end: toIsoDate(end),
      };
    },
  },
  lastMonth: {
    label: 'Last month',
    value: () => {
      const today = getToday();
      const lastMonth = addMonths(today, -1);

      return {
        start: toIsoDate(startOfMonth(lastMonth)),
        end: toIsoDate(endOfMonth(lastMonth)),
      };
    },
  },
  monthToDate: {
    label: 'Month to date',
    value: () => {
      const today = getToday();
      const start = startOfMonth(today);

      return {
        start: toIsoDate(start),
        end: toIsoDate(today),
      };
    },
  },
  yearToDate: {
    label: 'Year to date',
    value: () => {
      const today = getToday();

      return {
        start: toIsoDate(new Date(today.getFullYear(), 0, 1)),
        end: toIsoDate(today),
      };
    },
  },
} satisfies Record<string, PDateRangePickerPreset>;

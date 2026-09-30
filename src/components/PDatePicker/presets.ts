import { addDays, getToday, startOfMonth } from '../calendar/dateUtils';
import type { PDatePickerPreset } from './types';

export const PDatePickerPresets = {
  today: { label: 'Today', value: () => getToday() },
  yesterday: { label: 'Yesterday', value: () => addDays(getToday(), -1) },
  tomorrow: { label: 'Tomorrow', value: () => addDays(getToday(), 1) },
  startOfMonth: { label: 'Start of month', value: () => startOfMonth(getToday()) },
  endOfMonth: {
    label: 'End of month',
    value: () => {
      const today = getToday();
      return new Date(today.getFullYear(), today.getMonth() + 1, 0);
    },
  },
} satisfies Record<string, PDatePickerPreset>;

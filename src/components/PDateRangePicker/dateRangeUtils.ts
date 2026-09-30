import { toLocalDate, toIsoDate, getDateLabel } from '../calendar/dateUtils';
import type { PDateRangePickerPreset, PDateRangeValue } from './types';

export * from '../calendar/dateUtils';

export function normalizeRange(startDate: Date | null, endDate: Date | null): PDateRangeValue {
  if (!startDate && !endDate) {
    return {};
  }

  if (startDate && endDate && endDate < startDate) {
    return {
      start: toIsoDate(endDate),
      end: toIsoDate(startDate),
    };
  }

  return {
    start: toIsoDate(startDate),
    end: toIsoDate(endDate),
  };
}

export function resolvePresetRange(preset: PDateRangePickerPreset) {
  return typeof preset.value === 'function' ? preset.value() : preset.value;
}

export function getRangeDates(value: PDateRangeValue | undefined) {
  return {
    startDate: toLocalDate(value?.start),
    endDate: toLocalDate(value?.end),
  };
}

export function isSameRange(a: PDateRangeValue | undefined, b: PDateRangeValue | undefined) {
  return Boolean(a?.start && a?.end && a.start === b?.start && a.end === b?.end);
}

export function getRangeLabel(value: PDateRangeValue | undefined, placeholder: string, locale?: string) {
  const { startDate, endDate } = getRangeDates(value);

  if (startDate && endDate) {
    return `${getDateLabel(startDate, locale)} - ${getDateLabel(endDate, locale)}`;
  }

  if (startDate) {
    return `${getDateLabel(startDate, locale)} -`;
  }

  if (endDate) {
    return `- ${getDateLabel(endDate, locale)}`;
  }

  return placeholder;
}

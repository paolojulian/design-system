import type { HTMLAttributes, ReactNode } from 'react';
import type { DateBlockerUnit } from './rangeSelection';

export type { DateBlockerUnit };

export type PDateRangePickerRef = HTMLDivElement;
export type PDateRangePickerChangeSource = 'preset' | 'calendar';
export type PDateRangePickerPresetColumns = 2 | 3 | 4 | 'auto';
export type PDateRangePickerSummaryUnit = 'days' | 'nights';

export type PDateRangeValue = {
  start?: string;
  end?: string;
};

export type PDateRangePickerPreset = {
  label: string;
  value: PDateRangeValue | (() => PDateRangeValue);
};

export type PDateRangePickerProps = {
  /** Visible label. Optional inside a `PFormField`, which owns the label. */
  label?: string;
  value?: PDateRangeValue;
  defaultValue?: PDateRangeValue;
  onValueChange?: (
    value: PDateRangeValue,
    details: { startDate: Date | null; endDate: Date | null; source: PDateRangePickerChangeSource },
  ) => void;
  presets?: PDateRangePickerPreset[];
  customLabel?: string;
  showCustom?: boolean;
  presetColumns?: PDateRangePickerPresetColumns;
  placeholder?: string;
  helperText?: string;
  isError?: boolean;
  errorMessage?: string;
  min?: string;
  max?: string;
  nameStart?: string;
  nameEnd?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** ISO dates (`YYYY-MM-DD`) that can't be picked, e.g. `['2026-11-01', '2026-11-02']`. */
  disabledDates?: string[];
  /**
   * A rule for unavailable days (every Sunday, holidays…), combined with
   * `disabledDates`. Blocked days are shown hatched, not selectable,
   * and no range may include one. Keep it cheap and stable (memoize); it runs per day.
   */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * What a disabled date blocks. `day` (default): the whole day, so no range may
   * include it. `night`: the night that starts on it, for stays - the date can't
   * start or sit inside a range, but it can end one: a booked night's date is
   * the previous guest's checkout day, and is offered as such once a start is held.
   */
  disabledUnit?: DateBlockerUnit;
  /** The month to open on when nothing is selected, as an ISO date in it. Defaults to today's month. */
  defaultMonth?: string;
  /**
   * Extra content inside each day cell, after the number - a price, a marker.
   * Decorative: the cell's accessible name stays the date. Keep it cheap; it runs per visible day.
   */
  renderDayContent?: (date: Date) => ReactNode;
  /** Months shown side by side on wide viewports (from the `md` breakpoint). Defaults to 2. */
  numberOfMonths?: 1 | 2;
  /** How the calendar header counts a range: inclusive `days` (default) or `nights` for stays. */
  summaryUnit?: PDateRangePickerSummaryUnit;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'defaultValue' | 'onChange'>;

export type FocusableElement = { focus: () => void };

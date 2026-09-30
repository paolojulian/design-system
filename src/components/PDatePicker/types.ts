import type { HTMLAttributes } from 'react';

export type PDatePickerRef = HTMLDivElement;
export type PDatePickerChangeSource = 'preset' | 'calendar';
export type PDatePickerPresetColumns = 2 | 3 | 4 | 'auto';

export type PDatePickerPreset = {
  label: string;
  value: string | Date | (() => string | Date);
};

export type PDatePickerProps = {
  /** Visible label. Optional inside a `PFormField`, which owns the label. */
  label?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (
    value: string,
    details: { date: Date | null; source: PDatePickerChangeSource },
  ) => void;
  presets?: PDatePickerPreset[];
  customLabel?: string;
  showCustom?: boolean;
  presetColumns?: PDatePickerPresetColumns;
  placeholder?: string;
  helperText?: string;
  isError?: boolean;
  errorMessage?: string;
  min?: string;
  max?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  locale?: string;
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** ISO dates (`YYYY-MM-DD`) that can't be picked, e.g. `['2026-11-01', '2026-11-02']`. */
  disabledDates?: string[];
  /**
   * A rule for unavailable days (every Sunday, holidays…), combined with
   * `disabledDates`. Blocked days are shown struck through and not
   * selectable. Keep it cheap and stable (memoize); it runs per day.
   */
  isDateDisabled?: (date: Date) => boolean;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'defaultValue' | 'onChange'>;

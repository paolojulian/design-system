import type { HTMLAttributes } from 'react';

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
  /** Months shown side by side on wide viewports (from the `md` breakpoint). Defaults to 2. */
  numberOfMonths?: 1 | 2;
  /** How the calendar header counts a range: inclusive `days` (default) or `nights` for stays. */
  summaryUnit?: PDateRangePickerSummaryUnit;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'defaultValue' | 'onChange'>;

export type FocusableElement = { focus: () => void };

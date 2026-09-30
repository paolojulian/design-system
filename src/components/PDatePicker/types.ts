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
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'defaultValue' | 'onChange'>;

import type { MouseEvent } from 'react';
import cn from '../../utils/cn';
import { isSameRange, resolvePresetRange } from './dateRangeUtils';
import type { PDateRangePickerPreset, PDateRangeValue } from './types';

type DateRangePresetsProps = {
  presets: PDateRangePickerPreset[];
  selectedValue: PDateRangeValue | undefined;
  disabled: boolean;
  labelId?: string;
  messageId?: string;
  isFixedColumns: boolean;
  onPresetClick: (preset: PDateRangePickerPreset) => void;
  /** The calendar-opening "Custom" button; omitted when it is hidden. */
  custom?: {
    label: string;
    panelId: string;
    isOpen: boolean;
    isActive: boolean;
    onToggle: (event: MouseEvent<HTMLButtonElement>) => void;
  };
};

export function DateRangePresets({
  presets,
  selectedValue,
  disabled,
  labelId,
  messageId,
  isFixedColumns,
  onPresetClick,
  custom,
}: DateRangePresetsProps) {
  return (
    <div
      aria-describedby={messageId}
      aria-labelledby={labelId}
      className={cn('p-date-range-picker__presets', isFixedColumns && 'p-date-range-picker__presets--fixed')}
      role="group"
    >
      {presets.map((preset) => {
        const isActive = isSameRange(resolvePresetRange(preset), selectedValue);

        return (
          <button
            key={preset.label}
            type="button"
            className={cn('p-date-range-picker__preset', isActive && 'p-date-range-picker__preset--active')}
            disabled={disabled}
            aria-pressed={isActive}
            onClick={() => onPresetClick(preset)}
          >
            {preset.label}
          </button>
        );
      })}
      {custom ? (
        <button
          type="button"
          className={cn('p-date-range-picker__preset', custom.isActive && 'p-date-range-picker__preset--active')}
          disabled={disabled}
          aria-controls={custom.panelId}
          aria-expanded={custom.isOpen}
          aria-pressed={custom.isActive}
          onClick={custom.onToggle}
        >
          {custom.label}
        </button>
      ) : null}
    </div>
  );
}

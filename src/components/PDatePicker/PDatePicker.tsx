import { forwardRef, useId, useMemo, useRef, useState, type CSSProperties } from 'react';
import { CalendarIcon } from '../../icons';
import cn from '../../utils/cn';
import { getDateLabel, getToday, isSameDay, toIsoDate, toLocalDate } from '../calendar/dateUtils';
import { useFieldControl } from '../PFormField';
import { PPopover } from '../PPopover';
import { DatePickerCalendar } from './DatePickerCalendar';
import type { PDatePickerChangeSource, PDatePickerPreset, PDatePickerProps, PDatePickerRef } from './types';
import './PDatePicker.css';

export { PDatePickerPresets } from './presets';
export type {
  PDatePickerChangeSource,
  PDatePickerPreset,
  PDatePickerPresetColumns,
  PDatePickerProps,
  PDatePickerRef,
} from './types';

function resolvePresetDate(preset: PDatePickerPreset) {
  const value = typeof preset.value === 'function' ? preset.value() : preset.value;
  return toLocalDate(value);
}

export const PDatePicker = forwardRef<PDatePickerRef, PDatePickerProps>(
  (
    {
      label,
      value,
      defaultValue,
      onValueChange,
      presets = [],
      customLabel = 'Custom',
      showCustom = true,
      presetColumns = 'auto',
      placeholder = 'Select date',
      helperText,
      isError: isErrorProp = false,
      errorMessage,
      min,
      max,
      name,
      disabled: disabledProp = false,
      readOnly = false,
      required: requiredProp = false,
      locale,
      weekStartsOn = 0,
      className,
      id,
      style,
      ...props
    },
    ref,
  ) => {
    const field = useFieldControl({
      id,
      invalid: isErrorProp,
      required: requiredProp,
      disabled: disabledProp,
    });
    const { withinField } = field;
    // Inside a PFormField the wrapper owns invalid/required/disabled/label.
    const isError = field.invalid;
    const disabled = field.disabled ?? false;
    const required = field.required ?? false;

    const generatedId = useId();
    const rootId = id ?? generatedId;
    const ownLabelId = `${rootId}-label`;
    // Names internal regions: the field's label when wrapped, else our own.
    const labelId = withinField ? field.labelId : ownLabelId;
    const triggerId = withinField ? field.id : undefined;
    const panelId = `${rootId}-panel`;
    const helperId = `${rootId}-helper`;
    const errorId = `${rootId}-error`;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const [isOpen, setIsOpen] = useState(false);
    const selectedValue = isControlled ? value : internalValue;
    const selectedDate = toLocalDate(selectedValue);
    const today = useMemo(getToday, []);
    const minDate = toLocalDate(min);
    const maxDate = toLocalDate(max);
    const calendarTriggerRef = useRef<HTMLButtonElement | null>(null);
    const hasPresets = presets.length > 0;
    const shouldRenderCustom = hasPresets ? showCustom : true;
    const presetColumnsStyle =
      presetColumns === 'auto'
        ? undefined
        : ({
            '--p-date-picker-preset-columns': String(presetColumns),
          } as CSSProperties);
    const messageId = withinField
      ? field.describedBy
      : isError && errorMessage
        ? errorId
        : helperText
          ? helperId
          : undefined;
    const displayValue = selectedDate ? getDateLabel(selectedDate, locale) : placeholder;
    const selectedMatchesPreset = hasPresets
      ? presets.some((preset) => isSameDay(resolvePresetDate(preset), selectedDate))
      : false;
    const isCustomActive = isOpen || Boolean(selectedDate && !selectedMatchesPreset);

    const setDateValue = (date: Date | null, source: PDatePickerChangeSource) => {
      const nextValue = toIsoDate(date);

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue, { date, source });
    };

    const openCalendar = (trigger: HTMLButtonElement) => {
      if (disabled || readOnly) {
        return;
      }

      calendarTriggerRef.current = trigger;
      setIsOpen(true);
    };

    const closeCalendar = (restoreFocus = false) => {
      setIsOpen(false);

      if (restoreFocus) {
        calendarTriggerRef.current?.focus();
      }
    };

    const handlePresetClick = (preset: PDatePickerPreset) => {
      if (disabled || readOnly) {
        return;
      }

      const presetDate = resolvePresetDate(preset);
      setDateValue(presetDate, 'preset');
      closeCalendar();
    };

    const handleDaySelect = (date: Date) => {
      if (disabled || readOnly) {
        return;
      }

      setDateValue(date, 'calendar');
      closeCalendar(true);
    };

    return (
      <div
        {...props}
        ref={ref}
        id={rootId}
        style={presetColumnsStyle ? { ...style, ...presetColumnsStyle } : style}
        className={cn(
          'p-date-picker',
          hasPresets && 'p-date-picker--with-presets',
          isError && 'p-date-picker--error',
          disabled && 'p-date-picker--disabled',
          // Inside a field there is no floating label, so drop its top padding.
          withinField && 'p-date-picker--bare',
          className,
        )}
      >
        {/* Label renders only when standalone; inside a field the wrapper owns it. */}
        {!withinField && hasPresets ? (
          <div id={ownLabelId} className="p-date-picker__label">
            <span>{label}</span>
            <span className={cn('p-date-picker__label-value', !selectedDate && 'p-date-picker__label-value--empty')}>
              {displayValue}
            </span>
          </div>
        ) : null}

        {hasPresets ? (
          <div
            aria-describedby={messageId}
            aria-labelledby={labelId}
            className={cn(
              'p-date-picker__presets',
              presetColumns !== 'auto' && 'p-date-picker__presets--fixed',
            )}
            role="group"
          >
            {presets.map((preset) => {
              const presetDate = resolvePresetDate(preset);
              const isActive = isSameDay(presetDate, selectedDate);

              return (
                <button
                  key={preset.label}
                  type="button"
                  className={cn('p-date-picker__preset', isActive && 'p-date-picker__preset--active')}
                  disabled={disabled}
                  aria-pressed={isActive}
                  onClick={() => handlePresetClick(preset)}
                >
                  {preset.label}
                </button>
              );
            })}
            {shouldRenderCustom ? (
              <button
                type="button"
                className={cn(
                  'p-date-picker__preset',
                  isCustomActive && 'p-date-picker__preset--active',
                )}
                disabled={disabled}
                aria-controls={panelId}
                aria-expanded={isOpen}
                aria-pressed={isCustomActive}
                onClick={(event) => (isOpen ? closeCalendar(true) : openCalendar(event.currentTarget))}
              >
                {customLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <button
            type="button"
            id={triggerId}
            className={cn(
              'p-date-picker__trigger',
              !selectedDate && 'p-date-picker__trigger--empty',
              selectedDate && 'p-date-picker__trigger--filled',
              isOpen && 'p-date-picker__trigger--open',
            )}
            disabled={disabled}
            aria-controls={panelId}
            aria-describedby={messageId}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            // Standalone: name from label + value. Inside a field: the field
            // label plus the value name the trigger via aria-labelledby.
            aria-label={withinField ? undefined : `${label}: ${displayValue}`}
            aria-labelledby={withinField ? `${labelId} ${rootId}-value` : undefined}
            onClick={(event) => (isOpen ? closeCalendar(true) : openCalendar(event.currentTarget))}
          >
            {!withinField ? (
              <>
                <span
                  id={ownLabelId}
                  className={cn(
                    'p-date-picker__trigger-label p-date-picker__trigger-floating-label',
                    isError && 'p-date-picker__trigger-label--error',
                  )}
                  aria-hidden="true"
                >
                  {label}
                </span>
                <span
                  className={cn(
                    'p-date-picker__trigger-label p-date-picker__trigger-placeholder-label',
                    isError && 'p-date-picker__trigger-label--error',
                  )}
                  aria-hidden="true"
                >
                  {label}
                </span>
              </>
            ) : null}
            <span id={`${rootId}-value`} className="p-date-picker__trigger-value">{displayValue}</span>
            <span className="p-date-picker__trigger-icon">
              <CalendarIcon />
            </span>
          </button>
        )}

        <input type="hidden" name={name} value={selectedValue ?? ''} required={required} />

        <PPopover
          id={panelId}
          open={isOpen}
          onClose={() => closeCalendar()}
          anchorRef={calendarTriggerRef}
          title={label ?? placeholder}
        >
          <DatePickerCalendar
            id={`${panelId}-calendar`}
            selectedDate={selectedDate}
            today={today}
            minDate={minDate}
            maxDate={maxDate}
            locale={locale}
            weekStartsOn={weekStartsOn}
            onSelect={handleDaySelect}
          />
        </PPopover>

        {!withinField && isError && errorMessage ? (
          <p id={errorId} role="alert" className="p-date-picker__message p-date-picker__message--error">
            {errorMessage}
          </p>
        ) : null}

        {!withinField && !isError && helperText ? (
          <p id={helperId} className="p-date-picker__message">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

PDatePicker.displayName = 'PDatePicker';

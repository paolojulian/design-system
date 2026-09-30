import { forwardRef, useId, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { CalendarIcon } from '../../icons';
import cn from '../../utils/cn';
import { P_TOKEN_VALUES } from '../../constants/tokens';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { PButton } from '../PButton';
import { useFieldControl } from '../PFormField';
import { PPopover } from '../PPopover';
import { POPOVER_SHEET_QUERY } from '../PPopover/mediaQueries';
import { DateRangeCalendar, type DateRangeCalendarLayout } from './DateRangeCalendar';
import { DateRangePresets } from './DateRangePresets';
import {
  getRangeDates,
  getRangeLabel,
  getToday,
  isSameRange,
  normalizeRange,
  resolvePresetRange,
  toDateBlocker,
  toIsoDate,
  toLocalDate,
} from './dateRangeUtils';
import type { DayRange } from './rangeSelection';
import type {
  PDateRangePickerChangeSource,
  PDateRangePickerPreset,
  PDateRangePickerProps,
  PDateRangePickerRef,
  PDateRangeValue,
} from './types';
import './PDateRangePicker.css';

export { PDateRangePickerPresets } from './presets';
export type {
  PDateRangePickerChangeSource,
  PDateRangePickerPreset,
  PDateRangePickerPresetColumns,
  PDateRangePickerProps,
  PDateRangePickerRef,
  PDateRangePickerSummaryUnit,
  PDateRangeValue,
} from './types';

export const PDateRangePicker = forwardRef<PDateRangePickerRef, PDateRangePickerProps>(
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
      placeholder = 'Select range',
      helperText,
      isError: isErrorProp = false,
      errorMessage,
      min,
      max,
      nameStart,
      nameEnd,
      disabled: disabledProp = false,
      readOnly = false,
      required: requiredProp = false,
      locale,
      weekStartsOn = 0,
      disabledDates,
      isDateDisabled,
      numberOfMonths = 2,
      summaryUnit = 'days',
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
    const [internalValue, setInternalValue] = useState<PDateRangeValue>(defaultValue ?? {});
    const [isOpen, setIsOpen] = useState(false);
    const selectedValue = isControlled ? value : internalValue;
    const { startDate, endDate } = getRangeDates(selectedValue);
    const today = useMemo(getToday, []);
    const dateBlocker = useMemo(() => toDateBlocker(disabledDates, isDateDisabled), [disabledDates, isDateDisabled]);
    const minDate = toLocalDate(min);
    const maxDate = toLocalDate(max);
    const calendarTriggerRef = useRef<HTMLButtonElement | null>(null);
    const isSheet = useMediaQuery(POPOVER_SHEET_QUERY);
    const isWide = useMediaQuery(`(min-width: ${P_TOKEN_VALUES.breakpoint.md})`);
    const calendarLayout: DateRangeCalendarLayout = isSheet
      ? { kind: 'stack' }
      : { kind: 'columns', count: isWide ? numberOfMonths : 1 };
    const hasPresets = presets.length > 0;
    const shouldRenderCustom = hasPresets ? showCustom : true;
    const presetColumnsStyle =
      presetColumns === 'auto'
        ? undefined
        : ({
            '--p-date-range-picker-preset-columns': String(presetColumns),
          } as CSSProperties);
    const hasCompleteRange = Boolean(selectedValue?.start && selectedValue?.end);
    const messageId = withinField
      ? field.describedBy
      : isError && errorMessage
        ? errorId
        : helperText
          ? helperId
          : undefined;
    const displayValue = getRangeLabel(selectedValue, placeholder, locale);
    const selectedMatchesPreset = hasPresets
      ? presets.some((preset) => isSameRange(resolvePresetRange(preset), selectedValue))
      : false;
    const isCustomActive = isOpen || Boolean(hasCompleteRange && !selectedMatchesPreset);

    const setRangeValue = (range: PDateRangeValue, source: PDateRangePickerChangeSource) => {
      const { startDate: nextStartDate, endDate: nextEndDate } = getRangeDates(range);
      const normalizedRange = normalizeRange(nextStartDate, nextEndDate);

      if (!isControlled) {
        setInternalValue(normalizedRange);
      }

      const normalizedDates = getRangeDates(normalizedRange);

      onValueChange?.(normalizedRange, {
        startDate: normalizedDates.startDate,
        endDate: normalizedDates.endDate,
        source,
      });
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

    const toggleCalendar = (event: MouseEvent<HTMLButtonElement>) =>
      isOpen ? closeCalendar(true) : openCalendar(event.currentTarget);

    const handlePresetClick = (preset: PDateRangePickerPreset) => {
      if (disabled || readOnly) {
        return;
      }

      setRangeValue(resolvePresetRange(preset), 'preset');
      closeCalendar();
    };

    const handleCalendarChange = (range: DayRange) => {
      setRangeValue({ start: toIsoDate(range.start), end: toIsoDate(range.end) }, 'calendar');
    };

    return (
      <div
        {...props}
        ref={ref}
        id={rootId}
        style={presetColumnsStyle ? { ...style, ...presetColumnsStyle } : style}
        className={cn(
          'p-date-range-picker',
          hasPresets && 'p-date-range-picker--with-presets',
          isError && 'p-date-range-picker--error',
          disabled && 'p-date-range-picker--disabled',
          // Inside a field there is no floating label, so drop its top padding.
          withinField && 'p-date-range-picker--bare',
          className,
        )}
      >
        {/* Label renders only when standalone; inside a field the wrapper owns it. */}
        {!withinField && hasPresets ? (
          <div id={ownLabelId} className="p-date-range-picker__label">
            <span>{label}</span>
            <span
              className={cn(
                'p-date-range-picker__label-value',
                !hasCompleteRange && 'p-date-range-picker__label-value--empty',
              )}
            >
              {displayValue}
            </span>
          </div>
        ) : null}

        {hasPresets ? (
          <DateRangePresets
            presets={presets}
            selectedValue={selectedValue}
            disabled={disabled}
            labelId={labelId}
            messageId={messageId}
            isFixedColumns={presetColumns !== 'auto'}
            onPresetClick={handlePresetClick}
            custom={
              shouldRenderCustom
                ? { label: customLabel, panelId, isOpen, isActive: isCustomActive, onToggle: toggleCalendar }
                : undefined
            }
          />
        ) : (
          <button
            type="button"
            id={triggerId}
            className={cn(
              'p-date-range-picker__trigger',
              !hasCompleteRange && 'p-date-range-picker__trigger--empty',
              hasCompleteRange && 'p-date-range-picker__trigger--filled',
              isOpen && 'p-date-range-picker__trigger--open',
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
            onClick={toggleCalendar}
          >
            {!withinField ? (
              <>
                <span
                  id={ownLabelId}
                  className={cn(
                    'p-date-range-picker__trigger-label p-date-range-picker__trigger-floating-label',
                    isError && 'p-date-range-picker__trigger-label--error',
                  )}
                  aria-hidden="true"
                >
                  {label}
                </span>
                <span
                  className={cn(
                    'p-date-range-picker__trigger-label p-date-range-picker__trigger-placeholder-label',
                    isError && 'p-date-range-picker__trigger-label--error',
                  )}
                  aria-hidden="true"
                >
                  {label}
                </span>
              </>
            ) : null}
            <span id={`${rootId}-value`} className="p-date-range-picker__trigger-value">{displayValue}</span>
            <span className="p-date-range-picker__trigger-icon">
              <CalendarIcon />
            </span>
          </button>
        )}

        <input type="hidden" name={nameStart} value={selectedValue?.start ?? ''} required={required} />
        <input type="hidden" name={nameEnd} value={selectedValue?.end ?? ''} required={required} />

        <PPopover
          id={panelId}
          open={isOpen}
          onClose={() => closeCalendar()}
          anchorRef={calendarTriggerRef}
          title={label ?? placeholder}
          footer={
            <>
              <PButton
                variant="ghost"
                size="sm"
                disabled={!startDate && !endDate}
                onClick={() => handleCalendarChange({ start: null, end: null })}
              >
                Clear dates
              </PButton>
              <PButton size="sm" onClick={() => closeCalendar(true)}>
                Done
              </PButton>
            </>
          }
        >
          <DateRangeCalendar
            id={`${panelId}-calendar`}
            layout={calendarLayout}
            range={{ start: startDate, end: endDate }}
            today={today}
            minDate={minDate}
            maxDate={maxDate}
            locale={locale}
            weekStartsOn={weekStartsOn}
            isDateDisabled={dateBlocker}
            summaryUnit={summaryUnit}
            onRangeChange={handleCalendarChange}
          />
        </PPopover>

        {!withinField && isError && errorMessage ? (
          <p id={errorId} role="alert" className="p-date-range-picker__message p-date-range-picker__message--error">
            {errorMessage}
          </p>
        ) : null}

        {!withinField && !isError && helperText ? (
          <p id={helperId} className="p-date-range-picker__message">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

PDateRangePicker.displayName = 'PDateRangePicker';

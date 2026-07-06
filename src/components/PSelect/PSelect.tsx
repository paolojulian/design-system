import {
  forwardRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type SelectHTMLAttributes,
} from 'react';
import cn from '../../utils/cn';
import './PSelect.css';
import { useFieldControl } from '../PFormField';

export type PSelectRef = HTMLSelectElement;
export type PSelectDensity = 'standard' | 'compact';
export type PSelectVariant = 'floating' | 'inline';

export type PSelectOption = {
  value: string | number;
  label: ReactNode;
  disabled?: boolean;
  group?: string;
};

export type PSelectProps = {
  className?: string;
  selectClassName?: string;
  /** Visible label. Optional inside a `PFormField`, which owns the label. */
  label?: string;
  options: PSelectOption[];
  placeholder?: string;
  helperText?: string;
  isError?: boolean;
  errorMessage?: string;
  density?: PSelectDensity;
  variant?: PSelectVariant;
  hideLabel?: boolean;
  onValueChange?: (value: string, option: PSelectOption | null) => void;
} & Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'aria-describedby' | 'aria-label' | 'children' | 'className' | 'onChange'
> & {
  onChange?: (event: ChangeEvent<HTMLSelectElement>) => void;
};

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}

function getSelectValue(value: SelectHTMLAttributes<HTMLSelectElement>['value']) {
  if (Array.isArray(value)) {
    return value[0] ?? '';
  }

  return value ?? '';
}

export const PSelect = forwardRef<PSelectRef, PSelectProps>(
  (
    {
      className,
      selectClassName,
      label,
      options,
      placeholder = 'Select an option',
      helperText,
      id,
      isError = false,
      errorMessage,
      density = 'standard',
      variant = 'floating',
      hideLabel = false,
      disabled,
      required,
      value,
      defaultValue,
      onChange,
      onValueChange,
      style,
      ...props
    },
    ref,
  ) => {
    const field = useFieldControl({ id, invalid: isError, required, disabled });
    const selectId = field.id;
    const errorId = `${selectId}-error`;
    const helperId = `${selectId}-helper`;
    const { withinField } = field;
    const invalid = field.invalid;
    const controlDisabled = field.disabled;
    const controlRequired = field.required;
    const isControlled = value !== undefined;
    const [internalValue, setInternalValue] = useState(getSelectValue(defaultValue));
    const selectedValue = getSelectValue(isControlled ? value : internalValue);
    const hasValue = selectedValue !== '';
    const describedBy = withinField
      ? field.describedBy
      : [
          isError && errorMessage ? errorId : null,
          !isError && helperText ? helperId : null,
        ]
          .filter(Boolean)
          .join(' ') || undefined;

    const groupedOptions = options.reduce<Array<{ group: string | null; options: PSelectOption[] }>>(
      (accumulator, option) => {
        const group = option.group ?? null;
        const existingGroup = accumulator.find((item) => item.group === group);

        if (existingGroup) {
          existingGroup.options.push(option);
          return accumulator;
        }

        accumulator.push({ group, options: [option] });
        return accumulator;
      },
      [],
    );

    const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
      const { value: nextValue } = event.currentTarget as unknown as { value: string };

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      onChange?.(event);
      onValueChange?.(
        nextValue,
        options.find((option) => String(option.value) === nextValue) ?? null,
      );
    };

    return (
      <div
        className={cn(
          'p-select',
          `p-select--${density}`,
          `p-select--${variant}`,
          // Inside a field there is no floating label, so drop its top padding.
          withinField && 'p-select--bare',
          hasValue && 'p-select--filled',
          invalid && 'p-select--error',
          controlDisabled && 'p-select--disabled',
          className,
        )}
        style={style}
      >
        <div className="p-select__field">
          <select
            {...props}
            id={selectId}
            ref={ref}
            value={value}
            defaultValue={value === undefined ? defaultValue ?? '' : undefined}
            disabled={controlDisabled}
            required={controlRequired}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            aria-required={controlRequired}
            aria-disabled={controlDisabled}
            className={cn('p-select__control', invalid && 'p-select__control--error', selectClassName)}
            onChange={handleChange}
          >
            {placeholder ? (
              <option value="" disabled={required} aria-label={placeholder}>
                {''}
              </option>
            ) : null}

            {groupedOptions.map((group) =>
              group.group ? (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map((option) => (
                    <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                      {option.label}
                    </option>
                  ))}
                </optgroup>
              ) : (
                group.options.map((option) => (
                  <option key={String(option.value)} value={option.value} disabled={option.disabled}>
                    {option.label}
                  </option>
                ))
              ),
            )}
          </select>

          {/* Labels render only when standalone; inside a field the wrapper owns them. */}
          {!withinField &&
            (variant === 'floating' ? (
              <>
                <span
                  aria-hidden="true"
                  className={cn(
                    'p-select__label p-select__floating-label',
                    hideLabel && 'p-select__label--hidden',
                    invalid && 'p-select__label--error',
                  )}
                >
                  {label}
                </span>

                <label
                  htmlFor={selectId}
                  className={cn('p-select__label p-select__placeholder-label', hideLabel && 'p-select__label--hidden')}
                >
                  {placeholder || label}
                </label>
              </>
            ) : (
              <label
                htmlFor={selectId}
                className={cn('p-select__label p-select__inline-label', hideLabel && 'p-select__label--hidden')}
              >
                {label}
              </label>
            ))}

          <span className="p-select__chevron" aria-hidden="true">
            <ChevronDownIcon />
          </span>
        </div>

        {!withinField && isError && errorMessage ? (
          <p id={errorId} role="alert" className="p-select__message p-select__message--error">
            {errorMessage}
          </p>
        ) : null}

        {!withinField && !isError && helperText ? (
          <p id={helperId} className="p-select__message">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

PSelect.displayName = 'PSelect';

import { type ReactNode, useCallback, useId, useMemo, useState } from 'react';
import './PRadio.css';
import cn from '../../utils/cn';
import { PRadioGroupContext } from './radioGroupContext';

export type PRadioGroupProps = {
  /** Applied to the root wrapper element. */
  className?: string;
  /** Group label rendered as the `<legend>`; names the radiogroup for AT. */
  label: ReactNode;
  /** Supporting copy shown below the label. Wired via `aria-describedby`. */
  description?: ReactNode;
  /**
   * Shared `name` for the native radios. Generated when omitted — required
   * for native single-selection and arrow-key movement between radios.
   */
  name?: string;
  /** Controlled selected value. */
  value?: string;
  /** Initial selected value when uncontrolled. */
  defaultValue?: string;
  /** Fired with the newly selected radio value. */
  onChange?: (value: string) => void;
  /** Lays radios out in a row instead of the default stack. */
  orientation?: 'vertical' | 'horizontal';
  /** Disables every radio in the group. */
  disabled?: boolean;
  isError?: boolean;
  /** Shown below the group when `isError` is true. Announced via `role="alert"`. */
  errorMessage?: ReactNode;
  /** `PRadio` children. */
  children: ReactNode;
};

export function PRadioGroup({
  className,
  label,
  description,
  name,
  value,
  defaultValue,
  onChange,
  orientation = 'vertical',
  disabled = false,
  isError = false,
  errorMessage,
  children,
}: PRadioGroupProps) {
  const reactId = useId();
  const groupName = name ?? `radio-group-${reactId}`;
  const legendId = `${reactId}-legend`;
  const errorId = `${reactId}-error`;
  const descriptionId = `${reactId}-description`;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<string | undefined>(defaultValue);
  const selectedValue = isControlled ? value : internalValue;

  const onSelect = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalValue(next);
      }
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const describedBy =
    [
      isError && errorMessage ? errorId : null,
      description ? descriptionId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

  const contextValue = useMemo(
    () => ({
      name: groupName,
      value: selectedValue,
      isError,
      groupDisabled: disabled,
      describedBy,
      onSelect,
    }),
    [groupName, selectedValue, isError, disabled, describedBy, onSelect],
  );

  return (
    <fieldset
      className={cn('p-radio-group', isError && 'p-radio-group--error', className)}
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={describedBy}
      aria-invalid={isError || undefined}
    >
      <legend id={legendId} className="p-radio-group__legend">
        {label}
      </legend>

      {description && (
        <p id={descriptionId} className="p-radio-group__message p-radio-group__message--description">
          {description}
        </p>
      )}

      <div
        className={cn(
          'p-radio-group__options',
          orientation === 'horizontal' && 'p-radio-group__options--horizontal',
        )}
      >
        <PRadioGroupContext.Provider value={contextValue}>
          {children}
        </PRadioGroupContext.Provider>
      </div>

      {isError && errorMessage && (
        <p id={errorId} role="alert" className="p-radio-group__message p-radio-group__message--error">
          {errorMessage}
        </p>
      )}
    </fieldset>
  );
}

PRadioGroup.displayName = 'PRadioGroup';

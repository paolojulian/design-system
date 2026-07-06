import { type ReactNode, useId, useMemo } from 'react';
import './PFormField.css';
import cn from '../../utils/cn';
import { FormFieldContext, type FormFieldContextValue } from './FormFieldContext';

export type PFormFieldProps = {
  /**
   * Applied to the root wrapper element.
   * Override design tokens via CSS custom properties, e.g.:
   *   `[--p-form-field-gap:var(--p-space-1)]`
   */
  className?: string;
  /** Visible label. Associated with the control via `htmlFor`/`id`. */
  label: ReactNode;
  /** Supporting copy shown below the control when there is no error. */
  hint?: ReactNode;
  /**
   * Error message. When set, the field is invalid: the message replaces the
   * hint, is announced via `role="alert"`, and wired to the control.
   */
  error?: ReactNode;
  /** Marks the control required — communicated in text and via `aria-required`. */
  required?: boolean;
  /** Disables the wrapped control (merged with the control's own `disabled`). */
  disabled?: boolean;
  /**
   * Base id for the control and its messages. Auto-generated when omitted; pass
   * one only when you need a stable, predictable id.
   */
  id?: string;
  /** The control this field wraps (PTextInput, PSelect, …). */
  children: ReactNode;
};

/**
 * One shared field contract: renders the label, optional hint, error message,
 * and required marker, and publishes id / aria wiring through context so any
 * opted-in control renders the same way without re-implementing form chrome.
 */
export function PFormField({
  className,
  label,
  hint,
  error,
  required = false,
  disabled = false,
  id,
  children,
}: PFormFieldProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const labelId = `${controlId}-label`;
  const errorId = `${controlId}-error`;
  const hintId = `${controlId}-hint`;

  const invalid = error != null && error !== false;
  // Error replaces the hint, matching the control family's message convention.
  const describedById = invalid ? errorId : hint != null && hint !== false ? hintId : undefined;

  const contextValue = useMemo<FormFieldContextValue>(
    () => ({ controlId, labelId, describedById, invalid, required, disabled }),
    [controlId, labelId, describedById, invalid, required, disabled],
  );

  return (
    <div
      className={cn(
        'p-form-field',
        invalid && 'p-form-field--error',
        disabled && 'p-form-field--disabled',
        className,
      )}
    >
      <label id={labelId} htmlFor={controlId} className="p-form-field__label">
        <span>{label}</span>
        {required && (
          <span className="p-form-field__required">
            <span aria-hidden="true">*</span>
            <span className="p-form-field__sr-only"> (required)</span>
          </span>
        )}
      </label>

      <div className="p-form-field__control">
        <FormFieldContext.Provider value={contextValue}>{children}</FormFieldContext.Provider>
      </div>

      {invalid ? (
        <p id={errorId} role="alert" className="p-form-field__message p-form-field__message--error">
          {error}
        </p>
      ) : hint != null && hint !== false ? (
        <p id={hintId} className="p-form-field__message p-form-field__message--hint">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

PFormField.displayName = 'PFormField';

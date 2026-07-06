import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import './PSwitch.css';
import cn from '../../utils/cn';

export type PSwitchRef = HTMLInputElement;

export type PSwitchProps = {
  /**
   * Applied to the root wrapper element.
   * Override design tokens via CSS custom properties, e.g.:
   *   `[--p-switch-on:var(--p-color-success)]`
   */
  className?: string;
  /** Visible label. Doubles as the accessible name and part of the hit area. */
  label: ReactNode;
  /** Supporting copy shown below the label. Wired via `aria-describedby`. */
  description?: ReactNode;
  isError?: boolean;
  /** Shown below the field when `isError` is true. Announced via `role="alert"`. */
  errorMessage?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'role' | 'aria-describedby' | 'children'
>;

export const PSwitch = forwardRef<PSwitchRef, PSwitchProps>(
  (
    {
      className,
      label,
      description,
      isError = false,
      errorMessage,
      id,
      disabled,
      checked,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const descriptionId = `${inputId}-description`;

    const describedBy = [
      isError && errorMessage ? errorId : null,
      description ? descriptionId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div
        className={cn(
          'p-switch',
          isError && 'p-switch--error',
          disabled && 'p-switch--disabled',
          className,
        )}
      >
        <label htmlFor={inputId} className="p-switch__main">
          <span className="p-switch__control">
            <input
              {...props}
              id={inputId}
              ref={ref}
              type="checkbox"
              role="switch"
              checked={checked}
              disabled={disabled}
              className="p-switch__input"
              aria-invalid={isError || undefined}
              aria-describedby={describedBy}
            />
            <span aria-hidden="true" className="p-switch__track">
              <span className="p-switch__thumb" />
            </span>
          </span>
          <span className="p-switch__label">{label}</span>
        </label>

        {isError && errorMessage && (
          <p id={errorId} role="alert" className="p-switch__message p-switch__message--error">
            {errorMessage}
          </p>
        )}

        {description && (
          <p id={descriptionId} className="p-switch__message p-switch__message--description">
            {description}
          </p>
        )}
      </div>
    );
  },
);

PSwitch.displayName = 'PSwitch';

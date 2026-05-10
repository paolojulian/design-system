import { forwardRef, type InputHTMLAttributes, type ReactNode, useId, useState } from 'react';
import './PTextInput.css';
import cn from '../../utils/cn';

export type PTextInputRef = HTMLInputElement;

export type PTextInputProps = {
  /**
   * Applied to the root wrapper element.
   * Override design tokens via CSS custom properties, e.g.:
   *   `[--p-input-ring:var(--p-color-info)] [--p-input-bg:var(--p-color-info-surface)]`
   */
  className?: string;
  /** Applied to the inner `<input>` element for layout / spacing overrides. */
  inputClassName?: string;
  /** Visible label — doubles as the floating label and the placeholder. */
  label: string;
  /** Shown below the field when there is no error. */
  helperText?: string;
  isError?: boolean;
  /** Shown below the field when `isError` is true. Announced immediately via `role="alert"`. */
  errorMessage?: string;
  /** Decorative element placed on the trailing edge. Ignored when `type="password"`. */
  rightAdornment?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'placeholder' | 'aria-label' | 'aria-describedby'
>;

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="p-text-input__icon"
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className="p-text-input__icon"
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export const PTextInput = forwardRef<PTextInputRef, PTextInputProps>(
  (
    {
      className,
      inputClassName,
      type,
      label,
      helperText,
      id,
      isError = false,
      errorMessage,
      rightAdornment,
      disabled,
      readOnly,
      style,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const isPassword = type === 'password';
    const hasRightAdornment = Boolean(rightAdornment) && !isPassword;
    const [showPassword, setShowPassword] = useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : (type ?? 'text');

    const describedBy = [
      isError && errorMessage ? errorId : null,
      !isError && helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={cn('p-text-input', className)} style={style}>
        <div className="p-text-input__field">
          <input
            {...props}
            id={inputId}
            ref={ref}
            type={inputType}
            disabled={disabled}
            readOnly={readOnly}
            // Empty string required for the CSS peer-not-placeholder-shown trick.
            placeholder=" "
            // Accessibility
            aria-invalid={isError || undefined}
            aria-describedby={describedBy}
            aria-required={props.required}
            aria-disabled={disabled}
            aria-readonly={readOnly}
            autoComplete={props.autoComplete ?? (isPassword ? 'current-password' : undefined)}
            className={cn(
              'p-text-input__control',
              (isPassword || hasRightAdornment) && 'p-text-input__control--adorned',
              isError && 'p-text-input__control--error',
              hasRightAdornment && type === 'date' && 'p-text-input__control--date-adorned',
              inputClassName,
            )}
          />

          {/*
           * Floating label — shown above the value when focused or filled.
           * aria-hidden: the <label> below already provides the accessible name.
           */}
          <span
            aria-hidden="true"
            className={cn(
              'p-text-input__label p-text-input__floating-label',
              isError && 'p-text-input__label--error',
            )}
          >
            {label}
          </span>

          {/*
           * Placeholder label — centered in the field when empty and unfocused.
           * pointer-events-none lets clicks fall through to the input beneath;
           * htmlFor still wires up the accessible name correctly.
           */}
          <label
            htmlFor={inputId}
            className="p-text-input__label p-text-input__placeholder-label"
          >
            {label}
          </label>

          {/* Password toggle */}
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              disabled={disabled}
              className="p-text-input__action"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
              aria-controls={inputId}
            >
              {showPassword ? <EyeIcon /> : <EyeOffIcon />}
            </button>
          )}

          {/* Right adornment — decorative, hidden from assistive tech */}
          {hasRightAdornment && (
            <span aria-hidden="true" className="p-text-input__adornment">
              {rightAdornment}
            </span>
          )}
        </div>

        {/* Error message — announced immediately via role="alert" */}
        {isError && errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="p-text-input__message p-text-input__message--error"
          >
            {errorMessage}
          </p>
        )}

        {/* Helper text — visible only when there is no error */}
        {!isError && helperText && (
          <p
            id={helperId}
            className="p-text-input__message p-text-input__message--helper"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

PTextInput.displayName = 'PTextInput';

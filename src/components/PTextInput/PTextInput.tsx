import { forwardRef, type InputHTMLAttributes, type ReactNode, useId, useState } from 'react';
import '../../index.css';
import cn from '../../utils/cn';

export type PTextInputRef = HTMLInputElement;

export type PTextInputProps = {
  /** Applied to the root wrapper element. */
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
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
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
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
      <div className={cn('relative w-full', className)} style={style}>
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
            // Layout — tall enough for the floating label + value
            'peer h-16 w-full rounded px-4 pt-6 pb-2',
            (isPassword || hasRightAdornment) && 'pr-12',
            // Visuals
            'bg-white text-black',
            'font-sans text-sm outline-none',
            'border border-black focus:border-black',
            // Focus
            'focus:ring-2 focus:ring-primary',
            // Motion
            'transition-all duration-150 ease-in',
            // States
            'disabled:cursor-not-allowed disabled:opacity-50',
            'read-only:cursor-default read-only:bg-gray-lighter',
            isError && 'ring-2 ring-red-500',
            // Date — hide native picker chrome so rightAdornment can replace it
            hasRightAdornment &&
              type === 'date' &&
              '[&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0',
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
            'pointer-events-none absolute top-2 left-4',
            'font-sans text-xs',
            'origin-left transition-all duration-150 ease-in',
            // Hidden by default
            'scale-0 opacity-0',
            isError
              ? 'text-red-500'
              : 'text-gray-darker peer-focus:text-primary',
            // Reveal when focused or filled
            'peer-focus:scale-100 peer-focus:opacity-100',
            'peer-not-placeholder-shown:scale-100 peer-not-placeholder-shown:opacity-100',
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
          className={cn(
            'pointer-events-none absolute top-1/2 left-4 -translate-y-1/2',
            'font-sans text-sm text-black',
            'origin-left transition-all duration-150 ease-in',
            // Collapse when focused or filled
            'peer-focus:scale-0 peer-focus:opacity-0',
            'peer-not-placeholder-shown:scale-0 peer-not-placeholder-shown:opacity-0',
            disabled && 'opacity-50',
          )}
        >
          {label}
        </label>

        {/* Password toggle */}
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            disabled={disabled}
            className={cn(
              'absolute top-1/2 right-4 -translate-y-1/2',
              'text-gray-darker hover:text-black',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary',
              'disabled:pointer-events-none disabled:opacity-50',
            )}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            aria-pressed={showPassword}
            aria-controls={inputId}
          >
            {showPassword ? <EyeIcon /> : <EyeOffIcon />}
          </button>
        )}

        {/* Right adornment — decorative, hidden from assistive tech */}
        {hasRightAdornment && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-gray-darker"
          >
            {rightAdornment}
          </span>
        )}

        {/* Error message — announced immediately via role="alert" */}
        {isError && errorMessage && (
          <p id={errorId} role="alert" className="mt-1 px-4 font-sans text-xs text-red-500">
            {errorMessage}
          </p>
        )}

        {/* Helper text — visible only when there is no error */}
        {!isError && helperText && (
          <p id={helperId} className="mt-1 px-4 font-sans text-xs text-gray-darker">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

PTextInput.displayName = 'PTextInput';

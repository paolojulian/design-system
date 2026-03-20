import { forwardRef, type InputHTMLAttributes, type ReactNode, useId, useState } from 'react';
import '../../index.css';
import './PTextInput.css';
import cn from '../../utils/cn';

export type PTextInputRef = HTMLInputElement;

export type PTextInputProps = {
  /**
   * Applied to the root wrapper element.
   * Use Tailwind v4 arbitrary-var syntax to override design tokens, e.g.:
   *   `[--p-input-ring:blue] [--p-input-bg:#f5f5f5]`
   */
  className?: string;
  /** Applied to the inner `<input>` element for layout / spacing overrides. */
  inputClassName?: string;
  /** Visible label — doubles as the floating label and the placeholder. */
  label: string;
  isError?: boolean;
  /** Shown below the field when `isError` is true. Announced via `role="alert"`. */
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
      id,
      isError = false,
      errorMessage,
      rightAdornment,
      disabled,
      style,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const errorId = `${inputId}-error`;

    const isPassword = type === 'password';
    const hasRightAdornment = Boolean(rightAdornment) && !isPassword;
    const [showPassword, setShowPassword] = useState(false);

    const inputType = isPassword ? (showPassword ? 'text' : 'password') : (type ?? 'text');

    return (
      // CSS custom properties are declared here (.p-text-input) so every
      // descendant can reference them, and consumers can override them by
      // passing `className="[--p-input-ring:blue]"` or `style={{ '--p-input-ring': 'blue' }}`.
      <div className={cn('p-text-input relative w-full', className)} style={style}>
        <input
          {...props}
          id={inputId}
          ref={ref}
          type={inputType}
          disabled={disabled}
          // Empty string required for the CSS peer-not-placeholder-shown trick.
          placeholder=" "
          // Accessibility
          aria-invalid={isError || undefined}
          aria-describedby={isError && errorMessage ? errorId : undefined}
          aria-required={props.required}
          aria-disabled={disabled}
          autoComplete={props.autoComplete ?? (isPassword ? 'current-password' : undefined)}
          className={cn(
            // Layout — tall enough for the floating label + value
            'peer h-16 w-full rounded-xl px-4 pt-6 pb-2',
            (isPassword || hasRightAdornment) && 'pr-12',
            // Visuals — all colors via CSS custom properties
            'bg-(--p-input-bg) text-(--p-input-text)',
            'font-sans text-sm outline-none',
            'border border-(--p-input-border) focus:border-(--p-input-border-focus)',
            // Focus
            'focus:bg-(--p-input-bg-focus)',
            'focus:[--ring-color:var(--p-input-ring)] focus:ring-2',
            // Motion
            'transition-all duration-150 ease-in',
            // States
            'disabled:cursor-not-allowed disabled:opacity-50',
            isError
              ? 'ring-2 ring-red-500'
              : 'focus:ring-2',
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
              : 'text-(--p-input-label) peer-focus:text-(--p-input-label-focus)',
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
            'font-sans text-sm text-(--p-input-text)',
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
              'text-(--p-input-label) hover:text-(--p-input-text)',
              'transition-colors duration-150',
              'focus-visible:outline-2 focus-visible:outline-offset-2',
              'focus-visible:[--outline-color:var(--p-input-ring)]',
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
            className="pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-(--p-input-label)"
          >
            {rightAdornment}
          </span>
        )}

        {/* Error message — announced immediately via role="alert" */}
        {isError && errorMessage && (
          <p
            id={errorId}
            role="alert"
            aria-live="polite"
            className="mt-1 px-4 font-sans text-xs text-red-500"
          >
            {errorMessage}
          </p>
        )}
      </div>
    );
  },
);

PTextInput.displayName = 'PTextInput';

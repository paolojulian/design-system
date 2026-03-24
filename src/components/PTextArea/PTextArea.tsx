import { forwardRef, type TextareaHTMLAttributes, useId } from 'react';
import './PTextArea.css';
import cn from '../../utils/cn';

export type PTextAreaRef = HTMLTextAreaElement;

export type PTextAreaProps = {
  /**
   * Applied to the root wrapper element.
   * Override design tokens via CSS custom properties, e.g.:
   *   `[--p-textarea-ring:blue] [--p-textarea-bg:#f5f5f5]`
   */
  className?: string;
  /** Applied to the inner `<textarea>` element for layout / spacing overrides. */
  textareaClassName?: string;
  /** Visible label — doubles as the floating label and the placeholder. */
  label: string;
  /** Shown below the field when there is no error. */
  helperText?: string;
  isError?: boolean;
  /** Shown below the field when `isError` is true. Announced immediately via `role="alert"`. */
  errorMessage?: string;
} & Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className' | 'placeholder' | 'aria-label' | 'aria-describedby'
>;

// ─── Component ───────────────────────────────────────────────────────────────

export const PTextArea = forwardRef<PTextAreaRef, PTextAreaProps>(
  (
    {
      className,
      textareaClassName,
      label,
      helperText,
      id,
      isError = false,
      errorMessage,
      disabled,
      readOnly,
      rows = 4,
      style,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const describedBy = [
      isError && errorMessage ? errorId : null,
      !isError && helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={cn('p-text-area relative w-full', className)} style={style}>
        <textarea
          {...props}
          id={textareaId}
          ref={ref}
          rows={rows}
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
          className={cn(
            // Layout
            'peer w-full rounded px-4 pt-8 pb-3',
            // Visuals
            'bg-(--p-textarea-bg) text-(--p-textarea-text)',
            'font-sans text-sm outline-none',
            'border border-(--p-textarea-border) focus:border-(--p-textarea-border-focus)',
            // Focus
            'focus:bg-(--p-textarea-bg-focus)',
            'focus:ring-2 focus:ring-(--p-textarea-ring)',
            // Resize
            'resize-y',
            // Motion
            'transition-all duration-150 ease-in',
            // States
            'disabled:cursor-not-allowed disabled:opacity-50',
            'read-only:cursor-default read-only:bg-(--p-textarea-bg-readonly)',
            isError && 'ring-2 ring-red-500',
            textareaClassName,
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
              : 'text-(--p-textarea-label) peer-focus:text-(--p-textarea-label-focus)',
            // Reveal when focused or filled
            'peer-focus:scale-100 peer-focus:opacity-100',
            'peer-not-placeholder-shown:scale-100 peer-not-placeholder-shown:opacity-100',
          )}
        >
          {label}
        </span>

        {/*
         * Placeholder label — sits near the top of the field when empty and unfocused.
         * pointer-events-none lets clicks fall through to the textarea beneath;
         * htmlFor still wires up the accessible name correctly.
         */}
        <label
          htmlFor={textareaId}
          className={cn(
            'pointer-events-none absolute top-4 left-4',
            'font-sans text-sm text-(--p-textarea-text)',
            'origin-left transition-all duration-150 ease-in',
            // Collapse when focused or filled
            'peer-focus:scale-0 peer-focus:opacity-0',
            'peer-not-placeholder-shown:scale-0 peer-not-placeholder-shown:opacity-0',
            disabled && 'opacity-50',
          )}
        >
          {label}
        </label>

        {/* Error message — announced immediately via role="alert" */}
        {isError && errorMessage && (
          <p id={errorId} role="alert" className="mt-1 px-4 font-sans text-xs text-red-500">
            {errorMessage}
          </p>
        )}

        {/* Helper text — visible only when there is no error */}
        {!isError && helperText && (
          <p id={helperId} className="mt-1 px-4 font-sans text-xs text-(--p-textarea-text-helper)">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

PTextArea.displayName = 'PTextArea';

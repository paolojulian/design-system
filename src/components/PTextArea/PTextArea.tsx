import { forwardRef, type TextareaHTMLAttributes, useId } from 'react';
import './PTextArea.css';
import cn from '../../utils/cn';

export type PTextAreaRef = HTMLTextAreaElement;

export type PTextAreaProps = {
  /**
   * Applied to the root wrapper element.
   * Override design tokens via CSS custom properties, e.g.:
   *   `[--p-textarea-ring:var(--p-color-info)] [--p-textarea-bg:var(--p-color-info-surface)]`
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
      <div className={cn('p-text-area', className)} style={style}>
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
            'p-text-area__control',
            isError && 'p-text-area__control--error',
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
            'p-text-area__label p-text-area__floating-label',
            isError && 'p-text-area__label--error',
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
          className="p-text-area__label p-text-area__placeholder-label"
        >
          {label}
        </label>

        {/* Error message — announced immediately via role="alert" */}
        {isError && errorMessage && (
          <p
            id={errorId}
            role="alert"
            className="p-text-area__message p-text-area__message--error"
          >
            {errorMessage}
          </p>
        )}

        {/* Helper text — visible only when there is no error */}
        {!isError && helperText && (
          <p
            id={helperId}
            className="p-text-area__message p-text-area__message--helper"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

PTextArea.displayName = 'PTextArea';

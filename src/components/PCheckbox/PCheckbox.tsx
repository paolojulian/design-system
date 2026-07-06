import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
} from 'react';
import './PCheckbox.css';
import cn from '../../utils/cn';

export type PCheckboxRef = HTMLInputElement;

export type PCheckboxProps = {
  /**
   * Applied to the root wrapper element.
   * Override design tokens via CSS custom properties, e.g.:
   *   `[--p-checkbox-checked-bg:var(--p-color-info)]`
   */
  className?: string;
  /** Visible label. Doubles as the accessible name and part of the hit area. */
  label: ReactNode;
  /** Supporting copy shown below the label. Wired via `aria-describedby`. */
  description?: ReactNode;
  /**
   * Renders the mixed/tri-state affordance. Sets the native `indeterminate`
   * DOM property (there is no matching HTML attribute).
   */
  indeterminate?: boolean;
  isError?: boolean;
  /** Shown below the field when `isError` is true. Announced via `role="alert"`. */
  errorMessage?: ReactNode;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'aria-describedby' | 'children'
>;

function CheckIcon() {
  return (
    <svg
      className="p-checkbox__box-icon p-checkbox__check"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" />
    </svg>
  );
}

function DashIcon() {
  return (
    <svg
      className="p-checkbox__box-icon p-checkbox__dash"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4 8h8" />
    </svg>
  );
}

export const PCheckbox = forwardRef<PCheckboxRef, PCheckboxProps>(
  (
    {
      className,
      label,
      description,
      indeterminate = false,
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

    const innerRef = useRef<HTMLInputElement>(null);
    useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

    // `indeterminate` is a DOM property, not an attribute — keep it in sync.
    useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate, checked]);

    const describedBy = [
      isError && errorMessage ? errorId : null,
      description ? descriptionId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div
        className={cn(
          'p-checkbox',
          isError && 'p-checkbox--error',
          disabled && 'p-checkbox--disabled',
          className,
        )}
      >
        <label htmlFor={inputId} className="p-checkbox__main">
          <span className="p-checkbox__control">
            <input
              {...props}
              id={inputId}
              ref={innerRef}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              className="p-checkbox__input"
              aria-invalid={isError || undefined}
              aria-describedby={describedBy}
            />
            <span aria-hidden="true" className="p-checkbox__box">
              <CheckIcon />
              <DashIcon />
            </span>
          </span>
          <span className="p-checkbox__label">{label}</span>
        </label>

        {isError && errorMessage && (
          <p id={errorId} role="alert" className="p-checkbox__message p-checkbox__message--error">
            {errorMessage}
          </p>
        )}

        {description && (
          <p id={descriptionId} className="p-checkbox__message p-checkbox__message--description">
            {description}
          </p>
        )}
      </div>
    );
  },
);

PCheckbox.displayName = 'PCheckbox';

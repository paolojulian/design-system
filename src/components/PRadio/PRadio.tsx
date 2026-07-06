import { forwardRef, type InputHTMLAttributes, type ReactNode, useId } from 'react';
import './PRadio.css';
import cn from '../../utils/cn';
import { useRadioGroupContext } from './radioGroupContext';

export type PRadioRef = HTMLInputElement;

export type PRadioProps = {
  /** Applied to the radio row wrapper element. */
  className?: string;
  /** Value submitted / reported when this radio is selected. */
  value: string;
  /** Visible label. Doubles as the accessible name and part of the hit area. */
  label: ReactNode;
  /** Disables this radio only (the group can disable all of them). */
  disabled?: boolean;
} & Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'value' | 'name' | 'checked' | 'defaultChecked' | 'children'
>;

export const PRadio = forwardRef<PRadioRef, PRadioProps>(
  ({ className, value, label, disabled, id, ...props }, ref) => {
    const { name, value: groupValue, groupDisabled, isError, describedBy, onSelect } =
      useRadioGroupContext();

    const generatedId = useId();
    const inputId = id ?? generatedId;
    const isDisabled = disabled || groupDisabled;

    return (
      <label
        htmlFor={inputId}
        className={cn('p-radio', isDisabled && 'p-radio--disabled', className)}
      >
        <span className="p-radio__control">
          <input
            {...props}
            id={inputId}
            ref={ref}
            type="radio"
            name={name}
            value={value}
            checked={groupValue === value}
            disabled={isDisabled}
            className="p-radio__input"
            aria-invalid={isError || undefined}
            aria-describedby={describedBy}
            onChange={(event) => {
              onSelect(value);
              props.onChange?.(event);
            }}
          />
          <span aria-hidden="true" className="p-radio__circle">
            <span className="p-radio__dot" />
          </span>
        </span>
        <span className="p-radio__label">{label}</span>
      </label>
    );
  },
);

PRadio.displayName = 'PRadio';

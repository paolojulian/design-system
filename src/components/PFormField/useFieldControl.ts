import { useId } from 'react';
import { useFormField } from './FormFieldContext';

export type FieldControlInput = {
  /** Caller-supplied id, honored only when standalone. */
  id?: string;
  /** Describedby the control computes for its own hint/error, used standalone. */
  describedBy?: string;
  /** The control's own error flag, used standalone. */
  invalid?: boolean;
  /** The control's own required flag. */
  required?: boolean;
  /** The control's own disabled flag. */
  disabled?: boolean;
};

export type FieldControlWiring = {
  /** Effective id for the control element. */
  id: string;
  /**
   * id of the field's label element when inside a `PFormField`, else
   * `undefined`. Composite controls point `aria-labelledby` here so their
   * internal regions inherit the field's visible label as their name.
   */
  labelId: string | undefined;
  /** Effective `aria-describedby`. */
  describedBy: string | undefined;
  /** Effective invalid/error state. */
  invalid: boolean;
  /** Effective required state, or `undefined` when unset. */
  required: boolean | undefined;
  /** Effective disabled state, or `undefined` when unset. */
  disabled: boolean | undefined;
  /**
   * `true` when rendered inside a `PFormField`. Controls use this to suppress
   * their own label / hint / error chrome so the field owns it (no duplication).
   */
  withinField: boolean;
};

/**
 * Resolves a control's id / aria wiring from the enclosing `PFormField` when
 * present, falling back to the control's own props when standalone. Centralizes
 * the "read the field contract, else behave as before" branch every input needs.
 */
export function useFieldControl(local: FieldControlInput = {}): FieldControlWiring {
  const field = useFormField();
  // `useId` must run unconditionally; the value is only used when standalone.
  const generatedId = useId();

  if (field) {
    return {
      id: field.controlId,
      labelId: field.labelId,
      describedBy: field.describedById,
      invalid: field.invalid,
      required: field.required || local.required,
      disabled: field.disabled || local.disabled,
      withinField: true,
    };
  }

  return {
    id: local.id ?? generatedId,
    labelId: undefined,
    describedBy: local.describedBy,
    invalid: local.invalid ?? false,
    required: local.required,
    disabled: local.disabled,
    withinField: false,
  };
}

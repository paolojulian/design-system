import { createContext, useContext } from 'react';

/**
 * The single field contract shared by `PFormField` and every control that opts
 * into it. `PFormField` owns the label / hint / error markup and publishes the
 * wiring here; controls read it and stay "bare" (no duplicated label/message).
 */
export type FormFieldContextValue = {
  /** id applied to the control element; also the label's `htmlFor` target. */
  controlId: string;
  /**
   * id of the rendered label element. Composite controls (combobox, date
   * pickers) point `aria-labelledby` at it to name their internal regions.
   */
  labelId: string;
  /**
   * Space-joined id list for the control's `aria-describedby` (hint and/or
   * error), or `undefined` when there is nothing to describe.
   */
  describedById: string | undefined;
  /** The field is in an invalid / error state. Drives `aria-invalid`. */
  invalid: boolean;
  /** The field is required. Drives `aria-required` / `required`. */
  required: boolean;
  /** The field is disabled. Merged with a control's own `disabled`. */
  disabled: boolean;
};

export const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/**
 * Returns the enclosing `PFormField` contract, or `null` when the control is
 * used standalone. Controls branch on the result: when present they defer their
 * label / hint / error rendering to `PFormField` and read the wiring from here.
 */
export function useFormField(): FormFieldContextValue | null {
  return useContext(FormFieldContext);
}

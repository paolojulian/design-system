import { createContext, useContext } from 'react';

export type PRadioGroupContextValue = {
  name: string;
  value: string | undefined;
  isError: boolean;
  groupDisabled: boolean;
  describedBy: string | undefined;
  onSelect: (value: string) => void;
};

export const PRadioGroupContext = createContext<PRadioGroupContextValue | null>(null);

export function useRadioGroupContext(): PRadioGroupContextValue {
  const context = useContext(PRadioGroupContext);
  if (!context) {
    throw new Error('PRadio must be rendered inside a PRadioGroup.');
  }
  return context;
}

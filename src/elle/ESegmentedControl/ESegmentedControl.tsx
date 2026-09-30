import {
  forwardRef,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ForwardedRef,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
import { devWarning } from '../devWarning';
import './ESegmentedControl.css';

export type ESegmentedOption<T extends string = string> = {
  /** Value reported by `onValueChange` and submitted with the form. */
  value: T;
  /** Visible label. Keep it to a word or two; segments share the width equally. */
  label: ReactNode;
  /** Removes the option from pointer and keyboard selection. */
  disabled?: boolean;
  /** Accessible name when `label` is an icon. */
  'aria-label'?: string;
};

export type ESegmentedControlProps<T extends string = string> = {
  /** Two to five options. */
  options: readonly ESegmentedOption<T>[];
  /** Controlled value. */
  value?: T;
  /** Initial value when uncontrolled. Defaults to the first enabled option. */
  defaultValue?: T;
  /** Fired with the newly selected value. */
  onValueChange?: (value: T) => void;
  /** Names the group. One of `aria-label` or `aria-labelledby` is required. */
  'aria-label'?: string;
  /** Id of a visible element that names the group. */
  'aria-labelledby'?: string;
  /** When set, the selected value is submitted with the surrounding `<form>` under this name. */
  name?: string;
  /** `md` is 36px tall, `sm` 32px; both keep a 44px hit area. */
  size?: 'sm' | 'md';
  /** Stretches the control to fill its container. */
  fullWidth?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Merged last onto the root element. */
  className?: string;
};

export type ESegmentedControlRef = HTMLDivElement;

type Step = 1 | -1 | 'first' | 'last';

/** Next enabled index from `from`, wrapping like a native radio group. */
function findEnabled(enabled: boolean[], from: number, step: Step): number {
  const count = enabled.length;
  if (step === 'first') return enabled.indexOf(true);
  if (step === 'last') return enabled.lastIndexOf(true);
  for (let offset = 1; offset <= count; offset += 1) {
    const index = (((from + offset * step) % count) + count) % count;
    if (enabled[index]) return index;
  }
  return -1;
}

const KEY_STEPS: Record<string, Step> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
  Home: 'first',
  End: 'last',
};

function ESegmentedControlInner<T extends string = string>(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    name,
    size = 'md',
    fullWidth = false,
    disabled = false,
    className,
  }: ESegmentedControlProps<T>,
  ref: ForwardedRef<ESegmentedControlRef>,
) {
  devWarning(!ariaLabel && !ariaLabelledBy, 'ESegmentedControl needs `aria-label` or `aria-labelledby`.');
  devWarning(
    options.length < 2 || options.length > 5,
    `ESegmentedControl takes 2–5 options; got ${options.length}. Use a select or a list for more.`,
  );

  const id = useId();
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const enabled = options.map((option) => !disabled && !option.disabled);
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<T | undefined>(
    () => defaultValue ?? options[findEnabled(enabled, -1, 'first')]?.value,
  );
  const selectedValue = isControlled ? value : internalValue;
  const selectedIndex = options.findIndex((option) => option.value === selectedValue);
  // The tab stop is the selection, or the first enabled option when nothing is selected.
  const tabStop = selectedIndex >= 0 && enabled[selectedIndex] ? selectedIndex : findEnabled(enabled, -1, 'first');

  const select = (index: number) => {
    const option = options[index];
    if (!option || !enabled[index]) return;
    if (!isControlled) setInternalValue(option.value);
    if (option.value !== selectedValue) onValueChange?.(option.value);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = KEY_STEPS[event.key];
    if (step === undefined) return;
    const current = buttons.current.findIndex((button) => button === document.activeElement);
    const next = findEnabled(enabled, current === -1 ? tabStop : current, step);
    if (next === -1) return;
    event.preventDefault();
    select(next);
    buttons.current[next]?.focus();
  };

  const style = {
    '--e-segmented-index': Math.max(selectedIndex, 0),
    '--e-segmented-count': options.length,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      role="radiogroup"
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-disabled={disabled || undefined}
      className={cn('e-segmented', `e-segmented--${size}`, fullWidth && 'e-segmented--full-width', className)}
      style={style}
      onKeyDown={handleKeyDown}
    >
      {selectedIndex >= 0 && <span className="e-segmented__thumb" aria-hidden="true" />}
      {options.map((option, index) => (
        <button
          key={option.value}
          ref={(element) => {
            buttons.current[index] = element;
          }}
          id={`${id}-${index}`}
          type="button"
          role="radio"
          aria-checked={index === selectedIndex}
          aria-label={option['aria-label']}
          tabIndex={index === tabStop ? 0 : -1}
          disabled={!enabled[index]}
          className="e-segmented__option"
          onClick={() => select(index)}
        >
          <span className="e-segmented__label">{option.label}</span>
        </button>
      ))}
      {name && <input type="hidden" name={name} value={selectedValue ?? ''} disabled={disabled} />}
    </div>
  );
}

/** Elle segmented control: one choice among two to five options, with a sliding thumb. */
export const ESegmentedControl = forwardRef(ESegmentedControlInner) as (<T extends string = string>(
  props: ESegmentedControlProps<T> & { ref?: ForwardedRef<ESegmentedControlRef> },
) => ReactElement) & { displayName?: string };

ESegmentedControl.displayName = 'ESegmentedControl';

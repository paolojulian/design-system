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
import './PSegmentedControl.css';

export type PSegmentedOption<T extends string = string> = {
  /** Value reported by `onValueChange` and submitted with the form. */
  value: T;
  /** Visible label. Keep it to a word or two; segments share the width equally. */
  label: ReactNode;
  /** Removes the option from pointer and keyboard selection. */
  disabled?: boolean;
  /** Accessible name when `label` is an icon. */
  'aria-label'?: string;
};

export type PSegmentedControlProps<T extends string = string> = {
  /** Two to five options. */
  options: readonly PSegmentedOption<T>[];
  /** Controlled value. */
  value?: T;
  /** Initial value when uncontrolled. Defaults to the first enabled option. */
  defaultValue?: T;
  /** Fired with the newly selected value. */
  onValueChange?: (value: T) => void;
  /** Visible label above the control; names the group. */
  label?: ReactNode;
  /** Supporting copy under the label. */
  description?: ReactNode;
  /** Names the group when there is no visible `label`. */
  'aria-label'?: string;
  /** Id of a visible element that names the group, when there is no `label`. */
  'aria-labelledby'?: string;
  /** When set, the selected value is submitted with the surrounding `<form>` under this name. */
  name?: string;
  /** `md` is the 44px form control; `sm` is 36px with a 44px hit area. */
  size?: 'sm' | 'md';
  /** Stretches the control to fill its container. */
  fullWidth?: boolean;
  /** Disables every option. */
  disabled?: boolean;
  /** Puts the control into an error state. */
  isError?: boolean;
  /** Shown below the control when `isError` is true. Announced via `role="alert"`. */
  errorMessage?: ReactNode;
  /** Merged last onto the root element. */
  className?: string;
};

export type PSegmentedControlRef = HTMLDivElement;

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

function PSegmentedControlInner<T extends string = string>(
  {
    options,
    value,
    defaultValue,
    onValueChange,
    label,
    description,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    name,
    size = 'md',
    fullWidth = false,
    disabled = false,
    isError = false,
    errorMessage,
    className,
  }: PSegmentedControlProps<T>,
  ref: ForwardedRef<PSegmentedControlRef>,
) {
  const id = useId();
  const labelId = `${id}-label`;
  const descriptionId = `${id}-description`;
  const errorId = `${id}-error`;
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
    '--p-segmented-index': Math.max(selectedIndex, 0),
    '--p-segmented-count': options.length,
  } as CSSProperties;

  const showError = isError && errorMessage;
  const describedBy = [description ? descriptionId : null, showError ? errorId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('p-segmented-field', fullWidth && 'p-segmented-field--full-width', className)}>
      {label ? (
        <span id={labelId} className="p-segmented__label">
          {label}
        </span>
      ) : null}
      {description ? (
        <span id={descriptionId} className="p-segmented__description">
          {description}
        </span>
      ) : null}
      <div
        ref={ref}
        role="radiogroup"
        aria-label={label ? undefined : ariaLabel}
        aria-labelledby={label ? labelId : ariaLabelledBy}
        aria-describedby={describedBy}
        aria-disabled={disabled || undefined}
        aria-invalid={isError || undefined}
        className={cn('p-segmented', `p-segmented--${size}`, fullWidth && 'p-segmented--full-width')}
        style={style}
        onKeyDown={handleKeyDown}
      >
        {selectedIndex >= 0 && <span className="p-segmented__thumb" aria-hidden="true" />}
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
            className="p-segmented__option"
            onClick={() => select(index)}
          >
            <span className="p-segmented__option-label">{option.label}</span>
          </button>
        ))}
        {name && <input type="hidden" name={name} value={selectedValue ?? ''} disabled={disabled} />}
      </div>
      {showError ? (
        <p id={errorId} role="alert" className="p-segmented__error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

/**
 * One choice among two to five options drawn as one bordered control, the
 * chosen segment filled. A form control like PSelect, not a view switcher:
 * it takes a label, posts under `name`, and carries an error. Arrow keys move
 * and select like a native radio group.
 */
export const PSegmentedControl = forwardRef(PSegmentedControlInner) as (<T extends string = string>(
  props: PSegmentedControlProps<T> & { ref?: ForwardedRef<PSegmentedControlRef> },
) => ReactElement) & { displayName?: string };

PSegmentedControl.displayName = 'PSegmentedControl';

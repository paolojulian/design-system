import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type Ref,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
import './EButton.css';

export type EButtonVariant = 'filled' | 'tinted' | 'gray' | 'plain';
export type EButtonTone = 'default' | 'destructive';
export type EButtonSize = 'sm' | 'md' | 'lg';
export type EButtonShape = 'capsule' | 'rounded';
export type EButtonRef = HTMLButtonElement | HTMLAnchorElement;

type EButtonBaseProps = {
  /** Apple's four button styles: a solid fill, a tint of the action color, a neutral gray fill, or text only. */
  variant?: EButtonVariant;
  /** `destructive` maps the color to the danger tokens. Named `tone` so the native ARIA `role` stays untouched. */
  tone?: EButtonTone;
  /** Visual height: `sm` 36px (still a 44px hit area), `md` 44px, `lg` 56px. */
  size?: EButtonSize;
  /** `capsule` is fully rounded; `rounded` uses the medium radius token. */
  shape?: EButtonShape;
  /** Stretches the button to fill its container. */
  fullWidth?: boolean;
  /**
   * Shows a spinner and disables the button without changing its width. The
   * spinner takes the left icon's place; without one it covers the label,
   * which stays in the layout and in the accessible name.
   */
  isLoading?: boolean;
  /** Decorative icon before the label. */
  leftIcon?: ReactNode;
  /** Decorative icon after the label. Hidden while loading. */
  rightIcon?: ReactNode;
  /** The label. */
  children: ReactNode;
  /** Merged last onto the root element. */
  className?: string;
};

type EButtonAsButtonProps = EButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

type EButtonAsAnchorProps = EButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    /** Renders an `<a>` with button styling. */
    href: string;
    /** Anchors use `aria-disabled` and leave the tab order. */
    disabled?: boolean;
    type?: never;
  };

export type EButtonProps = EButtonAsButtonProps | EButtonAsAnchorProps;
type EButtonAnchorElementProps = Omit<EButtonAsAnchorProps, keyof EButtonBaseProps>;
type EButtonButtonElementProps = Omit<EButtonAsButtonProps, keyof EButtonBaseProps>;

/** Elle button: Apple's filled, tinted, gray and plain styles. Import from `@paolojulian.dev/design-system/elle`. */
export const EButton = forwardRef<EButtonRef, EButtonProps>(
  (
    {
      variant = 'filled',
      tone = 'default',
      size = 'md',
      shape = 'capsule',
      fullWidth = false,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const isUnavailable = Boolean(('disabled' in props && props.disabled) || isLoading);
    const spinner = <span className="e-button__spinner" aria-hidden="true" />;
    const buttonClassName = cn(
      'e-button',
      `e-button--${variant}`,
      `e-button--${tone}`,
      `e-button--${size}`,
      `e-button--${shape}`,
      fullWidth && 'e-button--full-width',
      isLoading && 'e-button--loading',
      isLoading && !leftIcon && 'e-button--loading-overlay',
      className,
    );
    const content = (
      <>
        {leftIcon && (
          <span className="e-button__icon" aria-hidden="true">
            {isLoading ? spinner : leftIcon}
          </span>
        )}
        <span className="e-button__label">{children}</span>
        {rightIcon && (
          <span className="e-button__icon e-button__icon--trailing" aria-hidden="true">
            {rightIcon}
          </span>
        )}
        {isLoading && !leftIcon && spinner}
      </>
    );

    if ('href' in props && typeof props.href === 'string') {
      const { disabled: anchorDisabled, onClick, ...anchorProps } = props as EButtonAnchorElementProps;

      const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
        if (isUnavailable) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      };

      return (
        <a
          {...anchorProps}
          ref={ref as Ref<HTMLAnchorElement>}
          className={buttonClassName}
          aria-disabled={isUnavailable || undefined}
          aria-busy={isLoading || undefined}
          data-disabled={anchorDisabled || undefined}
          tabIndex={isUnavailable ? -1 : anchorProps.tabIndex}
          onClick={handleClick}
        >
          {content}
        </a>
      );
    }

    const { type = 'button', disabled: buttonDisabled, ...buttonProps } = props as EButtonButtonElementProps;

    return (
      <button
        {...buttonProps}
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        disabled={Boolean(buttonDisabled || isLoading)}
        className={buttonClassName}
        aria-busy={isLoading || undefined}
      >
        {content}
      </button>
    );
  },
);

EButton.displayName = 'EButton';

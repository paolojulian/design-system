import {
  forwardRef,
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  type MouseEvent,
  type Ref,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
import './PButton.css';

export type PButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'danger' | 'ghost';
export type PButtonSize = 'sm' | 'md' | 'lg';
export type PButtonRef = HTMLButtonElement | HTMLAnchorElement;

type PButtonBaseProps = {
  variant?: PButtonVariant;
  size?: PButtonSize;
  fullWidth?: boolean;
  isActive?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
};

type PButtonAsButtonProps = PButtonBaseProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & {
    href?: undefined;
  };

type PButtonAsAnchorProps = PButtonBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children'> & {
    href: string;
    disabled?: boolean;
    type?: never;
  };

export type PButtonProps = PButtonAsButtonProps | PButtonAsAnchorProps;
type PButtonAnchorElementProps = Omit<PButtonAsAnchorProps, keyof PButtonBaseProps>;
type PButtonButtonElementProps = Omit<PButtonAsButtonProps, keyof PButtonBaseProps>;

export const PButton = forwardRef<PButtonRef, PButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      isActive = false,
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
    const buttonClassName = cn(
      'p-button',
      `p-button--${variant}`,
      `p-button--${size}`,
      fullWidth && 'p-button--full-width',
      isActive && 'p-button--active',
      className,
    );
    const content = (
      <>
        {isLoading ? (
          <span className="p-button__spinner" aria-hidden="true" />
        ) : (
          leftIcon && (
            <span className="p-button__icon" aria-hidden="true">
              {leftIcon}
            </span>
          )
        )}
        <span className="p-button__label">{children}</span>
        {!isLoading && rightIcon && (
          <span className="p-button__icon" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </>
    );

    if ('href' in props && typeof props.href === 'string') {
      const { disabled: anchorDisabled, onClick, ...anchorProps } =
        props as PButtonAnchorElementProps;

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
          data-active={isActive || undefined}
          data-disabled={anchorDisabled || undefined}
          tabIndex={isUnavailable ? -1 : anchorProps.tabIndex}
          onClick={handleClick}
        >
          {content}
        </a>
      );
    }

    const { type = 'button', disabled: buttonDisabled, ...buttonProps } =
      props as PButtonButtonElementProps;

    return (
      <button
        {...buttonProps}
        ref={ref as Ref<HTMLButtonElement>}
        type={type}
        disabled={Boolean(buttonDisabled || isLoading)}
        className={buttonClassName}
        aria-busy={isLoading || undefined}
        data-active={isActive || undefined}
      >
        {content}
      </button>
    );
  },
);

PButton.displayName = 'PButton';

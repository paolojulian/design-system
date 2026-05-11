import {
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
import './PBadge.css';

export type PBadgeVariant = 'primary' | 'danger' | 'warning' | 'success' | 'info' | 'neutral';
export type PBadgeSize = 'sm' | 'md';
export type PBadgeAppearance = 'subtle' | 'solid' | 'outline';
export type PBadgeRef = HTMLElement;

export type PBadgeProps = {
  as?: ElementType;
  variant?: PBadgeVariant;
  size?: PBadgeSize;
  appearance?: PBadgeAppearance;
  isPinging?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  children: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'color'>;

export const PBadge = forwardRef<PBadgeRef, PBadgeProps>(
  (
    {
      as: Element = 'span',
      variant = 'neutral',
      size = 'sm',
      appearance = 'subtle',
      isPinging = false,
      leftIcon,
      rightIcon,
      children,
      className,
      ...props
    },
    ref,
  ) => (
    <Element
      {...props}
      ref={ref}
      className={cn(
        'p-badge',
        `p-badge--${variant}`,
        `p-badge--${size}`,
        `p-badge--${appearance}`,
        isPinging && 'p-badge--pinging',
        className,
      )}
    >
      {leftIcon && (
        <span className="p-badge__icon" aria-hidden="true">
          {leftIcon}
        </span>
      )}
      <span className="p-badge__label">{children}</span>
      {rightIcon && (
        <span className="p-badge__icon" aria-hidden="true">
          {rightIcon}
        </span>
      )}
    </Element>
  ),
);

PBadge.displayName = 'PBadge';

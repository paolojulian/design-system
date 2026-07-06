import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import './PAlert.css';
import cn from '../../utils/cn';
import {
  CheckCircleIcon,
  CloseIcon,
  ExclamationCircleIcon,
  InfoCircleIcon,
  WarningTriangleIcon,
} from '../../icons';

export type PAlertVariant = 'info' | 'success' | 'warning' | 'danger';

export type PAlertAction = {
  /** Visible label for the action control. Doubles as its accessible name. */
  label: ReactNode;
  /** Renders an anchor when set; otherwise a button. */
  href?: string;
  onClick?: () => void;
};

export type PAlertRef = HTMLDivElement;

export type PAlertProps = {
  /** Status role. Selects icon + color; icon always accompanies color. */
  variant?: PAlertVariant;
  /** Bold lead-in shown above the message. */
  title?: ReactNode;
  /** Body copy. */
  children?: ReactNode;
  /** Optional inline action (link or button) shown below the message. */
  action?: PAlertAction;
  /** When provided, a dismiss button is rendered and this is called on activation. */
  onDismiss?: () => void;
  /** Accessible name for the dismiss button. */
  dismissLabel?: string;
  /** Overrides the default per-variant icon. Pass `null` to keep color-only is not allowed. */
  icon?: ReactNode;
  /**
   * ARIA live role. Defaults to `alert` for danger/warning (assertive) and
   * `status` for info/success (polite).
   */
  role?: 'alert' | 'status';
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'title' | 'role' | 'children'>;

const VARIANT_ICON: Record<PAlertVariant, ReactNode> = {
  info: <InfoCircleIcon />,
  success: <CheckCircleIcon />,
  warning: <WarningTriangleIcon />,
  danger: <ExclamationCircleIcon />,
};

const DEFAULT_ROLE: Record<PAlertVariant, 'alert' | 'status'> = {
  info: 'status',
  success: 'status',
  warning: 'alert',
  danger: 'alert',
};

export const PAlert = forwardRef<PAlertRef, PAlertProps>(
  (
    {
      variant = 'info',
      title,
      children,
      action,
      onDismiss,
      dismissLabel = 'Dismiss',
      icon,
      role,
      className,
      ...props
    },
    ref,
  ) => {
    const resolvedRole = role ?? DEFAULT_ROLE[variant];

    return (
      <div
        {...props}
        ref={ref}
        role={resolvedRole}
        className={cn('p-alert', `p-alert--${variant}`, className)}
      >
        <span className="p-alert__icon" aria-hidden="true">
          {icon ?? VARIANT_ICON[variant]}
        </span>

        <div className="p-alert__body">
          {title && <p className="p-alert__title">{title}</p>}
          {children && <div className="p-alert__message">{children}</div>}
          {action &&
            (action.href ? (
              <a className="p-alert__action" href={action.href} onClick={action.onClick}>
                {action.label}
              </a>
            ) : (
              <button type="button" className="p-alert__action" onClick={action.onClick}>
                {action.label}
              </button>
            ))}
        </div>

        {onDismiss && (
          <button
            type="button"
            className="p-alert__dismiss"
            aria-label={dismissLabel}
            onClick={onDismiss}
          >
            <CloseIcon />
          </button>
        )}
      </div>
    );
  },
);

PAlert.displayName = 'PAlert';

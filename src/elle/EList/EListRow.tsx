import { forwardRef, type MouseEvent, type ReactNode } from 'react';
import ChevronRightIcon from '../../icons/chevron-right-icon';
import cn from '../../utils/cn';
import { devWarning } from '../devWarning';
import './EList.css';

export type EListRowAccessory = 'none' | 'chevron' | 'checkmark';

type EListRowBaseProps = {
  /** Primary text. */
  title: ReactNode;
  /** Secondary line under the title. */
  subtitle?: ReactNode;
  /** Icon or avatar before the text. Decorative: hidden from assistive tech. */
  leading?: ReactNode;
  /** Trailing detail text, muted (e.g. the current setting). */
  value?: ReactNode;
  /** Trailing indicator. Defaults to `chevron` for link and button rows, else `none`. */
  accessory?: EListRowAccessory;
  /**
   * A custom trailing control, e.g. a `PSwitch`. The row itself is then not
   * interactive, so a control is never nested inside another. A `PSwitch`
   * here keeps its label for assistive tech; the row title is its visible label.
   */
  trailing?: ReactNode;
  /** `destructive` sets the title in the danger color. */
  tone?: 'default' | 'destructive';
  /** Dims the row and blocks activation. */
  disabled?: boolean;
  /** Merged last onto the `<li>`. */
  className?: string;
};

export type EListRowProps =
  | (EListRowBaseProps & { href: string; onClick?: never })
  | (EListRowBaseProps & { onClick: (event: MouseEvent<HTMLButtonElement>) => void; href?: never })
  | (EListRowBaseProps & { href?: never; onClick?: never });

export type EListRowRef = HTMLLIElement;

function CheckmarkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  );
}

/** One row of an `EList`: a link (`href`), a button (`onClick`), or static content. */
export const EListRow = forwardRef<EListRowRef, EListRowProps>(
  (
    { title, subtitle, leading, value, accessory, trailing, tone = 'default', disabled = false, className, href, onClick },
    ref,
  ) => {
    const hasAction = href !== undefined || onClick !== undefined;
    devWarning(
      trailing !== undefined && hasAction,
      'EListRow got `trailing` together with `href`/`onClick`. A row cannot nest one control inside another; `trailing` wins and the row renders static.',
    );
    const kind = trailing !== undefined ? 'static' : href !== undefined ? 'link' : onClick ? 'button' : 'static';
    const resolvedAccessory = accessory ?? (kind === 'static' ? 'none' : 'chevron');

    const body = (
      <>
        {leading && (
          <span className="e-list-row__leading" aria-hidden="true">
            {leading}
          </span>
        )}
        <span className="e-list-row__body">
          <span className="e-list-row__text">
            <span className="e-list-row__title">{title}</span>
            {subtitle && <span className="e-list-row__subtitle">{subtitle}</span>}
          </span>
          {value && <span className="e-list-row__value">{value}</span>}
          {trailing && <span className="e-list-row__trailing">{trailing}</span>}
          {resolvedAccessory === 'chevron' && <ChevronRightIcon className="e-list-row__chevron" />}
          {resolvedAccessory === 'checkmark' && (
            <span className="e-list-row__checkmark" role="img" aria-label="Selected">
              <CheckmarkIcon />
            </span>
          )}
        </span>
      </>
    );

    const rowClassName = cn(
      'e-list-row',
      `e-list-row--${kind}`,
      tone === 'destructive' && 'e-list-row--destructive',
      disabled && 'e-list-row--disabled',
      className,
    );

    return (
      <li ref={ref} className={rowClassName}>
        {kind === 'link' && (
          <a
            className="e-list-row__content"
            href={disabled ? undefined : href}
            aria-disabled={disabled || undefined}
            role={disabled ? 'link' : undefined}
          >
            {body}
          </a>
        )}
        {kind === 'button' && (
          <button type="button" className="e-list-row__content" disabled={disabled} onClick={onClick}>
            {body}
          </button>
        )}
        {kind === 'static' && <div className="e-list-row__content">{body}</div>}
      </li>
    );
  },
);

EListRow.displayName = 'EListRow';

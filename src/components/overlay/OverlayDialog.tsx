import {
  type CSSProperties,
  type ReactNode,
  type SyntheticEvent,
  useEffect,
  useId,
  useRef,
} from 'react';
import { CloseIcon } from '../../icons';
import cn from '../../utils/cn';
import { lockBodyScroll, unlockBodyScroll } from './scrollLock';
import './overlay.css';

export type OverlayVariant = 'modal' | 'drawer' | 'sheet';

export type OverlayDialogProps = {
  /** Controls visibility. The consumer owns this state. */
  open: boolean;
  /** Called whenever a close is requested (Esc, overlay click, close button). */
  onClose: () => void;
  /** Positioning + animation family. */
  variant: OverlayVariant;
  /** Extra modifier class(es) on the `<dialog>`, e.g. size or side. */
  modifierClassName?: string;
  /** Accessible title. Rendered in the header and wired to `aria-labelledby`. */
  title: ReactNode;
  /** Optional supporting copy under the title. Wired to `aria-describedby`. */
  description?: ReactNode;
  /** Heading level for the title. Defaults to `h2`. */
  headingLevel?: 'h1' | 'h2' | 'h3';
  /** Sticky footer, typically primary/secondary actions. */
  footer?: ReactNode;
  /** Leading node rendered above the header (PSheet grab handle). */
  handle?: ReactNode;
  /** Show the header close button. Defaults to `true`. */
  showClose?: boolean;
  /** `alertdialog` for destructive confirmations, otherwise `dialog`. */
  role?: 'dialog' | 'alertdialog';
  /** Close when the scrim outside the surface is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Close on the Escape key. Defaults to `true`. */
  closeOnEsc?: boolean;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

/**
 * Shared base for PModal, PDrawer, and PSheet. Owns the native `<dialog>`,
 * its `showModal`/`close` lifecycle, scroll lock, Esc/overlay-click policy,
 * and the header/body/footer shell. See SESSION.md for the design decision.
 */
export function OverlayDialog({
  open,
  onClose,
  variant,
  modifierClassName,
  title,
  description,
  headingLevel = 'h2',
  footer,
  handle,
  showClose = true,
  role = 'dialog',
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
  style,
  children,
}: OverlayDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lockedRef = useRef(false);

  const baseId = useId();
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;
  const describedBy = description ? descriptionId : undefined;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (open && !dialog.open) {
      dialog.showModal();
      lockBodyScroll();
      lockedRef.current = true;
    } else if (!open && dialog.open) {
      // CSS (`overlay`/`display` with `allow-discrete`) keeps the surface in the
      // top layer for the exit transition; focus restore happens immediately.
      dialog.close();
      if (lockedRef.current) {
        unlockBodyScroll();
        lockedRef.current = false;
      }
    }
  }, [open]);

  // Release the scroll lock if the overlay unmounts while still open.
  useEffect(
    () => () => {
      if (lockedRef.current) {
        unlockBodyScroll();
        lockedRef.current = false;
      }
    },
    [],
  );

  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    // Always prevent the native close so React state stays the single source of
    // truth (and the exit animation plays). Esc only closes when allowed.
    event.preventDefault();
    if (closeOnEsc) {
      onClose();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (closeOnOverlayClick && event.target === dialogRef.current) {
      onClose();
    }
  };

  const HeadingTag = headingLevel;

  return (
    <dialog
      ref={dialogRef}
      role={role}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
      className={cn('p-overlay', `p-overlay--${variant}`, modifierClassName, className)}
      style={style}
      onCancel={handleCancel}
      onClick={handleClick}
    >
      <div className="p-overlay__surface">
        {handle}
        <header className="p-overlay__header">
          <div className="p-overlay__heading">
            <HeadingTag id={titleId} className="p-overlay__title">
              {title}
            </HeadingTag>
            {description ? (
              <p id={descriptionId} className="p-overlay__description">
                {description}
              </p>
            ) : null}
          </div>
          {showClose ? (
            <button
              type="button"
              className="p-overlay__close"
              onClick={onClose}
              aria-label="Close"
            >
              <CloseIcon className="p-overlay__close-icon" />
            </button>
          ) : null}
        </header>

        {/* tabindex=0 keeps the scrollable body reachable by keyboard. */}
        <div className="p-overlay__body" tabIndex={0}>
          {children}
        </div>

        {footer ? <footer className="p-overlay__footer">{footer}</footer> : null}
      </div>
    </dialog>
  );
}

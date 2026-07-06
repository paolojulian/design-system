import { type ReactNode } from 'react';
import { OverlayDialog } from '../overlay';

export type PModalSize = 'sm' | 'md' | 'lg';

export type PModalProps = {
  /** Whether the modal is open. The consumer owns this state. */
  open: boolean;
  /** Called on any close request (Esc, overlay click, close button). */
  onClose: () => void;
  /** Accessible title, shown in the header. Wired to `aria-labelledby`. */
  title: ReactNode;
  /** Supporting copy under the title. Wired to `aria-describedby`. */
  description?: ReactNode;
  /** Centered width. `sm` stays centered on mobile; `md`/`lg` go full-screen. */
  size?: PModalSize;
  /**
   * Destructive confirmations. Renders as `alertdialog` so assistive tech
   * announces it as a decision, not passive content.
   */
  danger?: boolean;
  /** Sticky footer actions. Stays reachable when the body scrolls. */
  footer?: ReactNode;
  /** Show the header close button. Defaults to `true`. */
  showClose?: boolean;
  /** Close when the scrim is clicked. Defaults to `true`. */
  closeOnOverlayClick?: boolean;
  /** Close on Escape. Defaults to `true`. */
  closeOnEsc?: boolean;
  /** Applied to the `<dialog>`. Override tokens via CSS custom properties. */
  className?: string;
  children?: ReactNode;
};

/**
 * Centered dialog built on the native `<dialog>` top layer. Focus is trapped
 * and restored to the trigger by the platform; scroll lock, Esc, and overlay
 * click are handled by the shared overlay layer.
 */
export function PModal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  danger = false,
  footer,
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
  children,
}: PModalProps) {
  return (
    <OverlayDialog
      open={open}
      onClose={onClose}
      variant="modal"
      modifierClassName={`p-overlay--modal-${size}`}
      role={danger ? 'alertdialog' : 'dialog'}
      title={title}
      description={description}
      footer={footer}
      showClose={showClose}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      className={className}
    >
      {children}
    </OverlayDialog>
  );
}

PModal.displayName = 'PModal';

import { type ReactNode } from 'react';
import { OverlayDialog } from '../overlay';

export type PDrawerSide = 'right' | 'left';

export type PDrawerProps = {
  /** Whether the drawer is open. The consumer owns this state. */
  open: boolean;
  /** Called on any close request (Esc, overlay click, close button). */
  onClose: () => void;
  /** Accessible title, shown in the header. Wired to `aria-labelledby`. */
  title: ReactNode;
  /** Supporting copy under the title. Wired to `aria-describedby`. */
  description?: ReactNode;
  /** Side the panel slides in from. Defaults to `right`. */
  side?: PDrawerSide;
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
 * Side panel for detail views and filters. Full-width on mobile, capped width
 * on tablet and up. Built on the shared overlay layer.
 */
export function PDrawer({
  open,
  onClose,
  title,
  description,
  side = 'right',
  footer,
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
  children,
}: PDrawerProps) {
  return (
    <OverlayDialog
      open={open}
      onClose={onClose}
      variant="drawer"
      modifierClassName={side === 'left' ? 'p-overlay--drawer-left' : undefined}
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

PDrawer.displayName = 'PDrawer';

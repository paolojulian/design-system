import { type ReactNode } from 'react';
import { OverlayDialog } from '../overlay';

export type PSheetProps = {
  /** Whether the sheet is open. The consumer owns this state. */
  open: boolean;
  /** Called on any close request (Esc, overlay click, handle, close button). */
  onClose: () => void;
  /** Accessible title, shown in the header. Wired to `aria-labelledby`. */
  title: ReactNode;
  /** Supporting copy under the title. Wired to `aria-describedby`. */
  description?: ReactNode;
  /** Sticky footer actions. Stays reachable when the body scrolls. */
  footer?: ReactNode;
  /** Show the header close button in addition to the grab handle. Defaults to `true`. */
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
 * Bottom sheet, the preferred mobile overlay pattern. Snaps to content height.
 * The grab handle is a real button so it closes by keyboard as well as pointer.
 */
export function PSheet({
  open,
  onClose,
  title,
  description,
  footer,
  showClose = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  className,
  children,
}: PSheetProps) {
  const handle = (
    <button type="button" className="p-overlay__handle" aria-label="Close" onClick={onClose} />
  );

  return (
    <OverlayDialog
      open={open}
      onClose={onClose}
      variant="sheet"
      title={title}
      description={description}
      footer={footer}
      handle={handle}
      showClose={showClose}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEsc={closeOnEsc}
      className={className}
    >
      {children}
    </OverlayDialog>
  );
}

PSheet.displayName = 'PSheet';

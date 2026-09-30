import { forwardRef, useId, type ReactNode } from 'react';
import cn from '../../utils/cn';
import './EList.css';

export type EListProps = {
  /** Caption above the group. Names the list for assistive tech. */
  header?: ReactNode;
  /** Explanatory caption below the group. */
  footer?: ReactNode;
  /** `true` (default): a rounded group with side margins. `false`: edge to edge, hairlines above and below. */
  inset?: boolean;
  /** `EListRow` elements. */
  children: ReactNode;
  /** Merged last onto the root element. */
  className?: string;
};

export type EListRef = HTMLUListElement;

/** Elle grouped list: the Settings-style inset list. Rows are `EListRow`. */
export const EList = forwardRef<EListRef, EListProps>(
  ({ header, footer, inset = true, children, className }, ref) => {
    const id = useId();
    const headerId = header ? `${id}-header` : undefined;
    const footerId = footer ? `${id}-footer` : undefined;

    return (
      <div className={cn('e-list', inset ? 'e-list--inset' : 'e-list--flush', className)}>
        {header && (
          <p id={headerId} className="e-list__header">
            {header}
          </p>
        )}
        <ul ref={ref} className="e-list__group" aria-labelledby={headerId} aria-describedby={footerId}>
          {children}
        </ul>
        {footer && (
          <p id={footerId} className="e-list__footer">
            {footer}
          </p>
        )}
      </div>
    );
  },
);

EList.displayName = 'EList';

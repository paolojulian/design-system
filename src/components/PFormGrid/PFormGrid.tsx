import { type ElementType, type ReactNode } from 'react';
import './PFormGrid.css';
import cn from '../../utils/cn';

export type PFormGridProps = {
  /**
   * Applied to the grid container.
   * Override the column gap via CSS custom properties, e.g.:
   *   `[--p-form-grid-gap:var(--p-space-8)]`
   */
  className?: string;
  /** The element rendered for the grid container. Defaults to `div`. */
  as?: ElementType;
  /** Fields (typically `PFormField`) laid out across the grid. */
  children: ReactNode;
};

/**
 * Responsive form layout: a single column on mobile, two columns from tablet
 * up. Direct children occupy one cell; wrap a field in `PFormGridItem` with
 * `span="full"` to make it span the full row.
 */
export function PFormGrid({ className, as: Component = 'div', children }: PFormGridProps) {
  return <Component className={cn('p-form-grid', className)}>{children}</Component>;
}

PFormGrid.displayName = 'PFormGrid';

export type PFormGridItemProps = {
  className?: string;
  /** The element rendered for the cell. Defaults to `div`. */
  as?: ElementType;
  /**
   * How many columns the item spans. `1` (default) fills one cell; `'full'`
   * spans the whole row at every breakpoint.
   */
  span?: 1 | 'full';
  children: ReactNode;
};

/**
 * A cell in a `PFormGrid`. Use it only when you need `span="full"`; a plain
 * field child already occupies one cell without a wrapper.
 */
export function PFormGridItem({
  className,
  as: Component = 'div',
  span = 1,
  children,
}: PFormGridItemProps) {
  return (
    <Component
      className={cn('p-form-grid__item', span === 'full' && 'p-form-grid__item--full', className)}
    >
      {children}
    </Component>
  );
}

PFormGridItem.displayName = 'PFormGridItem';

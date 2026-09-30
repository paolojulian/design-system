import { forwardRef, type ReactNode } from 'react';
import cn from '../../utils/cn';
import { devWarning } from '../devWarning';
import '../elle-material.css';
import './ETabBar.css';

export type ETabBarItem = {
  /** Stable id, matched against `activeId`. */
  id: string;
  /** Always-visible label; also the accessible name. */
  label: string;
  /** Decorative icon above the label. */
  icon: ReactNode;
  /** Renders the item as a link. Without it the item is a button that calls `onSelect`. */
  href?: string;
  /** Count or short text shown on the icon, e.g. unread items. */
  badge?: number | string;
  /** Blocks activation. */
  disabled?: boolean;
};

export type ETabBarProps = {
  /** Two to five destinations. */
  items: readonly ETabBarItem[];
  /** Id of the current destination; it gets `aria-current="page"`. */
  activeId: string;
  /** Called with the item id when a button item is pressed. */
  onSelect?: (id: string) => void;
  /** Names the navigation landmark. Defaults to `Primary`. */
  'aria-label'?: string;
  /** `fixed` (default) pins the bar to the bottom of the viewport; `static` leaves it in the flow. */
  position?: 'fixed' | 'static';
  /** Merged last onto the `<nav>`. */
  className?: string;
};

export type ETabBarRef = HTMLElement;

/**
 * Elle tab bar: bottom navigation for phones. It changes pages, so it is a
 * `<nav>` of links (or buttons), not an ARIA tablist.
 */
export const ETabBar = forwardRef<ETabBarRef, ETabBarProps>(
  ({ items, activeId, onSelect, 'aria-label': ariaLabel = 'Primary', position = 'fixed', className }, ref) => {
    devWarning(
      items.length < 2 || items.length > 5,
      `ETabBar takes 2–5 items; got ${items.length}. Move extra destinations into a "More" screen.`,
    );

    return (
      <nav ref={ref} aria-label={ariaLabel} className={cn('e-tabbar', 'e-material', `e-tabbar--${position}`, className)}>
        <ul className="e-tabbar__list">
          {items.map((item) => {
            const isActive = item.id === activeId;
            const content = (
              <>
                <span className="e-tabbar__icon" aria-hidden="true">
                  {item.icon}
                  {item.badge !== undefined && <span className="e-tabbar__badge">{item.badge}</span>}
                </span>
                <span className="e-tabbar__label">{item.label}</span>
              </>
            );
            const shared = {
              className: 'e-tabbar__item',
              'aria-current': isActive ? ('page' as const) : undefined,
              'aria-label': item.badge !== undefined ? `${item.label}, ${item.badge}` : undefined,
            };
            return (
              <li key={item.id} className="e-tabbar__cell">
                {item.href !== undefined ? (
                  <a
                    {...shared}
                    href={item.disabled ? undefined : item.href}
                    role={item.disabled ? 'link' : undefined}
                    aria-disabled={item.disabled || undefined}
                  >
                    {content}
                  </a>
                ) : (
                  <button {...shared} type="button" disabled={item.disabled} onClick={() => onSelect?.(item.id)}>
                    {content}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  },
);

ETabBar.displayName = 'ETabBar';

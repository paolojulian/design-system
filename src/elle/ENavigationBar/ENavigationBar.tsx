import { forwardRef, type ReactNode } from 'react';
import cn from '../../utils/cn';
import '../elle-material.css';
import './ENavigationBar.css';

export type ENavigationBarProps = {
  /** Screen title. Rendered as exactly one heading. */
  title: ReactNode;
  /** `true`: an empty compact bar with a large title block below it. `false` (default): the title sits in the bar. */
  largeTitle?: boolean;
  /** Heading level of the title. Defaults to `h1`. */
  titleAs?: 'h1' | 'h2';
  /** Start of the bar, e.g. a back `EButton variant="plain"`. */
  leading?: ReactNode;
  /** End of the bar, e.g. a "Done" or "Edit" button. */
  trailing?: ReactNode;
  /** Sticks to the top of the scroll container. Defaults to `true`. */
  sticky?: boolean;
  /** Merged last onto the `<header>`. */
  className?: string;
};

export type ENavigationBarRef = HTMLElement;

/** Elle navigation bar: a translucent top bar with a title and actions, optionally a large title. */
export const ENavigationBar = forwardRef<ENavigationBarRef, ENavigationBarProps>(
  ({ title, largeTitle = false, titleAs: Heading = 'h1', leading, trailing, sticky = true, className }, ref) => (
    <header
      ref={ref}
      className={cn(
        'e-navbar',
        'e-material',
        sticky && 'e-navbar--sticky',
        largeTitle && 'e-navbar--large',
        className,
      )}
    >
      <div className="e-navbar__bar">
        <div className="e-navbar__leading">{leading}</div>
        {!largeTitle && <Heading className="e-navbar__title">{title}</Heading>}
        <div className="e-navbar__trailing">{trailing}</div>
      </div>
      {largeTitle && <Heading className="e-navbar__large-title">{title}</Heading>}
    </header>
  ),
);

ENavigationBar.displayName = 'ENavigationBar';

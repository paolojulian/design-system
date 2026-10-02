import {
  Children,
  forwardRef,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons';
import cn from '../../utils/cn';
import { useMediaQuery } from '../../utils/useMediaQuery';
import { nextIndex, scrollTargetFor, visibleIndex } from './sliderPosition';
import './PHorizontalSlider.css';

export type PHorizontalSliderRef = HTMLDivElement;

export type PHorizontalSliderProps = {
  children: ReactNode;
  /** Accessible label for the keyboard-focusable scroll region. */
  ariaLabel?: string;
  /** Gap between slider items. Accepts any CSS gap value. */
  gap?: CSSProperties['gap'];
  /** Disables horizontal snap alignment when free scrolling is preferred. */
  snap?: boolean;
  /** Shows previous/next buttons and a position counter below the slider. */
  controls?: boolean;
  /** Shows the "1 / 8" counter next to the controls. */
  showCounter?: boolean;
  previousLabel?: string;
  nextLabel?: string;
  scrollerClassName?: string;
  listClassName?: string;
  itemClassName?: string;
  controlsClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> & {
    className?: string;
  };

type SliderStyle = CSSProperties & {
  '--p-horizontal-slider-gap'?: CSSProperties['gap'];
};

type SliderPosition = { index: number; atStart: boolean; atEnd: boolean };

/** Where each item rests when snapped to the leading edge, plus the furthest the slider can scroll. */
function measure(scroller: HTMLDivElement) {
  const scrollPadding = parseFloat(getComputedStyle(scroller).scrollPaddingInlineStart) || 0;
  const items = scroller.querySelectorAll<HTMLElement>(':scope > ul > li');
  return {
    targets: Array.from(items, (item) => item.offsetLeft - scrollPadding),
    maxScroll: scroller.scrollWidth - scroller.clientWidth,
  };
}

export const PHorizontalSlider = forwardRef<PHorizontalSliderRef, PHorizontalSliderProps>(
  (
    {
      children,
      ariaLabel = 'Horizontal content',
      gap,
      snap = true,
      controls = false,
      showCounter = true,
      previousLabel = 'Previous',
      nextLabel = 'Next',
      className,
      scrollerClassName,
      listClassName,
      itemClassName,
      controlsClassName,
      style,
      ...props
    },
    ref,
  ) => {
    const scrollerRef = useRef<HTMLDivElement>(null);
    // The item an arrow press is scrolling to; null once the slider settles or the user takes over.
    const pending = useRef<number | null>(null);
    const [position, setPosition] = useState<SliderPosition>({
      index: 0,
      atStart: true,
      atEnd: false,
    });
    const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const count = Children.toArray(children).length;

    const sync = useCallback(() => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const { targets, maxScroll } = measure(scroller);
      const { scrollLeft } = scroller;

      if (
        pending.current !== null &&
        Math.abs(scrollLeft - scrollTargetFor(pending.current, { targets, maxScroll })) < 1
      ) {
        pending.current = null;
      }

      const next = {
        index: visibleIndex({ scrollLeft, maxScroll, targets }),
        atStart: scrollLeft <= 1,
        atEnd: scrollLeft >= maxScroll - 1,
      };
      setPosition((current) =>
        current.index === next.index && current.atStart === next.atStart && current.atEnd === next.atEnd
          ? current
          : next,
      );
    }, []);

    // Button states depend on item and viewport widths, so re-measure whenever either changes.
    useEffect(() => {
      const scroller = scrollerRef.current;
      if (!controls || !scroller) return;
      sync();
      if (typeof ResizeObserver === 'undefined') return;
      const observer = new ResizeObserver(() => sync());
      observer.observe(scroller);
      if (scroller.firstElementChild) observer.observe(scroller.firstElementChild);
      return () => observer.disconnect();
    }, [controls, count, sync]);

    const go = (dir: 1 | -1) => {
      const scroller = scrollerRef.current;
      if (!scroller) return;
      const { targets, maxScroll } = measure(scroller);
      const index = nextIndex({
        pending: pending.current,
        scrollLeft: scroller.scrollLeft,
        maxScroll,
        targets,
        dir,
      });
      pending.current = index;
      scroller.scrollTo({
        left: scrollTargetFor(index, { targets, maxScroll }),
        behavior: reduceMotion ? 'auto' : 'smooth',
      });
    };

    const releasePending = () => {
      pending.current = null;
    };

    const sliderStyle: SliderStyle = {
      ...style,
      ...(gap ? { '--p-horizontal-slider-gap': gap } : {}),
    };
    const fits = position.atStart && position.atEnd;

    return (
      <div
        {...props}
        ref={ref}
        className={cn('p-horizontal-slider', !snap && 'p-horizontal-slider--no-snap', className)}
        style={sliderStyle}
      >
        <div
          ref={scrollerRef}
          aria-label={ariaLabel}
          className={cn('p-horizontal-slider__scroller', scrollerClassName)}
          role="region"
          tabIndex={0}
          {...(controls
            ? {
                onScroll: () => requestAnimationFrame(sync),
                onPointerDown: releasePending,
                onWheel: releasePending,
                onKeyDown: releasePending,
              }
            : {})}
        >
          <ul className={cn('p-horizontal-slider__list', listClassName)}>
            {Children.map(children, (child) => (
              <li className={cn('p-horizontal-slider__item', itemClassName)}>{child}</li>
            ))}
          </ul>
        </div>
        {controls && (
          <div className={cn('p-horizontal-slider__controls', controlsClassName)} hidden={fits}>
            {showCounter && (
              <p aria-live="polite" className="p-horizontal-slider__counter">
                <span className="p-horizontal-slider__counter-current">{position.index + 1}</span>
                {' / '}
                {count}
              </p>
            )}
            <div className="p-horizontal-slider__buttons">
              <button
                type="button"
                aria-label={previousLabel}
                className="p-horizontal-slider__button"
                disabled={position.atStart}
                onClick={() => go(-1)}
              >
                <ChevronLeftIcon aria-hidden="true" />
              </button>
              <button
                type="button"
                aria-label={nextLabel}
                className="p-horizontal-slider__button"
                disabled={position.atEnd}
                onClick={() => go(1)}
              >
                <ChevronRightIcon aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
);

PHorizontalSlider.displayName = 'PHorizontalSlider';

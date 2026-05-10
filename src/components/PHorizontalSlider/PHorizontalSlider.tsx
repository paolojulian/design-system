import {
  Children,
  forwardRef,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
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
  scrollerClassName?: string;
  listClassName?: string;
  itemClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'> & {
    className?: string;
  };

type SliderStyle = CSSProperties & {
  '--p-horizontal-slider-gap'?: CSSProperties['gap'];
};

export const PHorizontalSlider = forwardRef<PHorizontalSliderRef, PHorizontalSliderProps>(
  (
    {
      children,
      ariaLabel = 'Horizontal content',
      gap,
      snap = true,
      className,
      scrollerClassName,
      listClassName,
      itemClassName,
      style,
      ...props
    },
    ref,
  ) => {
    const sliderStyle: SliderStyle = {
      ...style,
      ...(gap ? { '--p-horizontal-slider-gap': gap } : {}),
    };

    return (
      <div
        {...props}
        ref={ref}
        className={cn('p-horizontal-slider', !snap && 'p-horizontal-slider--no-snap', className)}
        style={sliderStyle}
      >
        <div
          aria-label={ariaLabel}
          className={cn('p-horizontal-slider__scroller', scrollerClassName)}
          role="region"
          tabIndex={0}
        >
          <ul className={cn('p-horizontal-slider__list', listClassName)}>
            {Children.map(children, (child) => (
              <li className={cn('p-horizontal-slider__item', itemClassName)}>{child}</li>
            ))}
          </ul>
        </div>
      </div>
    );
  },
);

PHorizontalSlider.displayName = 'PHorizontalSlider';

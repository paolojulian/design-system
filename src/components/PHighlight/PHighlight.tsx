import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
import './PHighlight.css';

export type PHighlightVariant = 'primary' | 'danger' | 'warning' | 'success' | 'info' | 'neutral';
export type PHighlightAppearance = 'text' | 'background';
export type PHighlightRef = HTMLElement;

export type PHighlightProps = {
  as?: ElementType;
  variant?: PHighlightVariant;
  /** Controls whether the highlight is text-only or a filled background. */
  appearance?: PHighlightAppearance;
  /** Custom highlight color. Text color by default, background color for `appearance="background"`. */
  color?: CSSProperties['color'];
  /** Custom foreground color for `appearance="background"`. */
  textColor?: CSSProperties['color'];
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'color' | 'style'>;

type PHighlightStyle = CSSProperties & {
  '--p-highlight-color'?: CSSProperties['color'];
  '--p-highlight-bg'?: CSSProperties['backgroundColor'];
  '--p-highlight-text'?: CSSProperties['color'];
};

export const PHighlight = forwardRef<PHighlightRef, PHighlightProps>(
  (
    {
      as: Element = 'span',
      variant = 'primary',
      appearance = 'text',
      color,
      textColor,
      children,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const highlightStyle: PHighlightStyle = {
      ...style,
      ...(color ? { '--p-highlight-color': color, '--p-highlight-bg': color } : {}),
      ...(textColor ? { '--p-highlight-text': textColor } : {}),
    };

    return (
      <Element
        {...props}
        ref={ref}
        className={cn(
          'p-highlight',
          `p-highlight--${variant}`,
          appearance === 'background' && 'p-highlight--background',
          className,
        )}
        style={highlightStyle}
      >
        {children}
      </Element>
    );
  },
);

PHighlight.displayName = 'PHighlight';

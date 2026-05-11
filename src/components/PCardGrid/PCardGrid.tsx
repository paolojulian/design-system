import {
  forwardRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
import './PCardGrid.css';

export type PCardGridRef = HTMLElement;
export type PCardGridGap = 'none' | 'sm' | 'md' | 'lg';
export type PCardGridColumns = 1 | 2 | 3 | 4;

export type PCardGridResponsiveColumns = {
  mobile?: PCardGridColumns;
  tablet?: PCardGridColumns;
  desktop?: PCardGridColumns;
};

export type PCardGridProps = {
  as?: ElementType;
  columns?: PCardGridColumns | PCardGridResponsiveColumns;
  minCardWidth?: CSSProperties['width'];
  gap?: PCardGridGap;
  align?: 'stretch' | 'start';
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'className' | 'children'>;

type PCardGridStyle = CSSProperties & {
  '--p-card-grid-mobile-columns'?: number;
  '--p-card-grid-tablet-columns'?: number;
  '--p-card-grid-desktop-columns'?: number;
  '--p-card-grid-min-card-width'?: CSSProperties['width'];
};

function getSizeValue(value: CSSProperties['width']) {
  return typeof value === 'number' ? `${value}px` : value;
}

function getColumnConfig(columns: PCardGridProps['columns']) {
  if (!columns) {
    return {
      mobile: 1,
      tablet: 2,
      desktop: 2,
    };
  }

  if (typeof columns === 'number') {
    return {
      mobile: 1,
      tablet: Math.min(columns, 2) as PCardGridColumns,
      desktop: columns,
    };
  }

  return {
    mobile: columns.mobile ?? 1,
    tablet: columns.tablet ?? columns.mobile ?? 2,
    desktop: columns.desktop ?? columns.tablet ?? columns.mobile ?? 2,
  };
}

export const PCardGrid = forwardRef<PCardGridRef, PCardGridProps>(
  (
    {
      as: Element = 'div',
      columns,
      minCardWidth,
      gap = 'none',
      align = 'stretch',
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const columnConfig = getColumnConfig(columns);
    const gridStyle: PCardGridStyle = {
      ...style,
      '--p-card-grid-mobile-columns': columnConfig.mobile,
      '--p-card-grid-tablet-columns': columnConfig.tablet,
      '--p-card-grid-desktop-columns': columnConfig.desktop,
      ...(minCardWidth !== undefined
        ? { '--p-card-grid-min-card-width': getSizeValue(minCardWidth) }
        : {}),
    };

    return (
      <Element
        {...props}
        ref={ref}
        className={cn(
          'p-card-grid',
          `p-card-grid--gap-${gap}`,
          align === 'start' && 'p-card-grid--align-start',
          minCardWidth !== undefined && 'p-card-grid--auto-fit',
          className,
        )}
        style={gridStyle}
      >
        {children}
      </Element>
    );
  },
);

PCardGrid.displayName = 'PCardGrid';

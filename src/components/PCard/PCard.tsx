import {
  forwardRef,
  type AnchorHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
import { PTypography } from '../PTypography';
import './PCard.css';

export type PCardDensity = 'compact' | 'default' | 'spacious';
export type PCardRef = HTMLElement;

type PCardBaseProps = {
  prefix?: ReactNode;
  eyebrow?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  media?: ReactNode;
  actions?: ReactNode;
  density?: PCardDensity;
  fullWidth?: boolean;
  width?: CSSProperties['width'];
  minWidth?: CSSProperties['minWidth'];
  height?: CSSProperties['height'];
  minHeight?: CSSProperties['minHeight'];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

type PCardArticleProps = PCardBaseProps &
  Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'style' | 'title'> & {
    href?: undefined;
  };

type PCardAnchorProps = PCardBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'style' | 'title'> & {
    href: string;
  };

export type PCardProps = PCardArticleProps | PCardAnchorProps;
type PCardAnchorElementProps = Omit<PCardAnchorProps, keyof PCardBaseProps>;
type PCardArticleElementProps = Omit<PCardArticleProps, keyof PCardBaseProps>;
type PCardStyle = CSSProperties & {
  '--p-card-width'?: CSSProperties['width'];
  '--p-card-min-width'?: CSSProperties['minWidth'];
  '--p-card-height'?: CSSProperties['height'];
  '--p-card-min-height'?: CSSProperties['minHeight'];
};

function hasRenderableNode(node: ReactNode) {
  return node !== null && node !== undefined && node !== false && node !== '';
}

function renderMetaNode(node: ReactNode, className: string) {
  if (!hasRenderableNode(node)) {
    return null;
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return (
      <PTypography className={className} variant="body-wide">
        {node}
      </PTypography>
    );
  }

  return <span className={cn(className, 'p-card__meta-custom')}>{node}</span>;
}

function getCardSizeValue(value: CSSProperties['width']) {
  return typeof value === 'number' ? `${value}px` : value;
}

export const PCard = forwardRef<PCardRef, PCardProps>(
  (
    {
      prefix,
      eyebrow,
      title,
      description,
      media,
      actions,
      density = 'default',
      fullWidth = false,
      width,
      minWidth,
      height,
      minHeight,
      className,
      style,
      children,
      ...props
    },
    ref,
  ) => {
    const isInteractive = 'href' in props && typeof props.href === 'string';
    const cardClassName = cn(
      'p-card',
      density !== 'default' && `p-card--${density}`,
      fullWidth && 'p-card--full-width',
      width !== undefined && 'p-card--custom-width',
      minWidth !== undefined && 'p-card--custom-min-width',
      height !== undefined && 'p-card--custom-height',
      minHeight !== undefined && 'p-card--custom-min-height',
      isInteractive && 'p-card--interactive',
      className,
    );
    const cardStyle: PCardStyle = {
      ...style,
      ...(width !== undefined ? { '--p-card-width': getCardSizeValue(width) } : {}),
      ...(minWidth !== undefined ? { '--p-card-min-width': getCardSizeValue(minWidth) } : {}),
      ...(height !== undefined ? { '--p-card-height': getCardSizeValue(height) } : {}),
      ...(minHeight !== undefined ? { '--p-card-min-height': getCardSizeValue(minHeight) } : {}),
    };

    const content = (
      <>
        {hasRenderableNode(media) && <div className="p-card__media">{media}</div>}
        {(hasRenderableNode(prefix) || hasRenderableNode(eyebrow)) && (
          <div className="p-card__meta">
            {renderMetaNode(prefix, 'p-card__prefix')}
            {renderMetaNode(eyebrow, 'p-card__eyebrow')}
          </div>
        )}
        <div className="p-card__body">
          <PTypography as="h3" className="p-card__title" variant="heading">
            {isInteractive ? (
              <a {...(props as PCardAnchorElementProps)} className="p-card__link">
                {title}
              </a>
            ) : (
              title
            )}
          </PTypography>
          {hasRenderableNode(description) ? (
            <PTypography className="p-card__description" variant="body">
              {description}
            </PTypography>
          ) : null}
        </div>
        {hasRenderableNode(children) && <div className="p-card__content">{children}</div>}
        {hasRenderableNode(actions) && <div className="p-card__actions">{actions}</div>}
      </>
    );

    if (isInteractive) {
      return (
        <article ref={ref as React.Ref<HTMLElement>} className={cardClassName} style={cardStyle}>
          {content}
        </article>
      );
    }

    return (
      <article
        {...(props as PCardArticleElementProps)}
        ref={ref as React.Ref<HTMLElement>}
        className={cardClassName}
        style={cardStyle}
      >
        {content}
      </article>
    );
  },
);

PCard.displayName = 'PCard';

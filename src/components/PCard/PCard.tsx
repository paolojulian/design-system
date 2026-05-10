import { forwardRef, type AnchorHTMLAttributes, type HTMLAttributes, type ReactNode } from 'react';
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
  className?: string;
  children?: ReactNode;
};

type PCardArticleProps = PCardBaseProps &
  Omit<HTMLAttributes<HTMLElement>, 'className' | 'children' | 'title'> & {
    href?: undefined;
  };

type PCardAnchorProps = PCardBaseProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'title'> & {
    href: string;
  };

export type PCardProps = PCardArticleProps | PCardAnchorProps;
type PCardAnchorElementProps = Omit<PCardAnchorProps, keyof PCardBaseProps>;
type PCardArticleElementProps = Omit<PCardArticleProps, keyof PCardBaseProps>;

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
      className,
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
      isInteractive && 'p-card--interactive',
      className,
    );

    const content = (
      <>
        {media && <div className="p-card__media">{media}</div>}
        {(prefix || eyebrow) && (
          <div className="p-card__meta">
            {prefix && (
              <PTypography className="p-card__prefix" variant="body-wide">
                {prefix}
              </PTypography>
            )}
            {eyebrow && (
              <PTypography className="p-card__eyebrow" variant="body-wide">
                {eyebrow}
              </PTypography>
            )}
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
          {description ? (
            <PTypography className="p-card__description" variant="body">
              {description}
            </PTypography>
          ) : null}
        </div>
        {children && <div className="p-card__content">{children}</div>}
        {actions && <div className="p-card__actions">{actions}</div>}
      </>
    );

    if (isInteractive) {
      return (
        <article ref={ref as React.Ref<HTMLElement>} className={cardClassName}>
          {content}
        </article>
      );
    }

    return (
      <article
        {...(props as PCardArticleElementProps)}
        ref={ref as React.Ref<HTMLElement>}
        className={cardClassName}
      >
        {content}
      </article>
    );
  },
);

PCard.displayName = 'PCard';

import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';
import cn from '../../utils/cn';
import {
  buildSizes,
  photoKey,
  photoPreview,
  renderMediaImage,
  resolveColumns,
  type PMediaColumns,
  type PMediaGap,
  type PMediaImageRenderer,
  type PMediaResponsiveColumns,
  type PPhoto,
} from '../media';
import './PPhotoGrid.css';

export type PPhotoGridRef = HTMLUListElement;

export type PPhotoGridProps = {
  photos: readonly PPhoto[];
  /** Column count, or per-breakpoint counts. Defaults to 2 / 3 / 4. */
  columns?: PMediaColumns | PMediaResponsiveColumns;
  gap?: PMediaGap;
  /** Tile aspect ratio. Square by default so mixed orientations still align. */
  aspect?: CSSProperties['aspectRatio'];
  /** Overrides the `sizes` attribute derived from `columns`. */
  sizes?: string;
  /** When provided, every tile becomes a button reporting its index. */
  onPhotoClick?: (index: number, photo: PPhoto) => void;
  renderImage?: PMediaImageRenderer;
  /** Accessible name for the list. */
  ariaLabel?: string;
  className?: string;
} & Omit<HTMLAttributes<HTMLUListElement>, 'className' | 'children'>;

type PPhotoGridStyle = CSSProperties & {
  '--p-photo-grid-mobile-columns'?: number;
  '--p-photo-grid-tablet-columns'?: number;
  '--p-photo-grid-desktop-columns'?: number;
  '--p-photo-grid-aspect'?: CSSProperties['aspectRatio'];
};

const DEFAULT_COLUMNS = { mobile: 2, tablet: 3, desktop: 4 } as const;

/**
 * A uniform grid of photo tiles.
 *
 * Tiles are cropped to a fixed aspect ratio with `object-fit: cover`, so a set
 * mixing portrait and landscape frames still reads as an even grid rather than a
 * ragged one. Every tile paints the low-resolution `thumb`; the full-size file is
 * left for whatever opens on click.
 *
 * `onPhotoClick` is optional on purpose. Without it the tree is exactly
 * `<li><img /></li>` — no button, no handler, nothing interactive for a keyboard
 * or screen reader to step through. Pass it only when there is somewhere to go.
 *
 * Renders nothing when `photos` is empty; an empty state is the caller's to
 * design, since "no photos yet" and "no photos matched" want different words.
 */
export const PPhotoGrid = forwardRef<PPhotoGridRef, PPhotoGridProps>(
  (
    {
      photos,
      columns,
      gap = 'sm',
      aspect = '1 / 1',
      sizes,
      onPhotoClick,
      renderImage = renderMediaImage,
      ariaLabel,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    if (photos.length === 0) {
      return null;
    }

    const columnConfig = resolveColumns(columns, DEFAULT_COLUMNS);
    const resolvedSizes = sizes ?? buildSizes(columnConfig);

    const gridStyle: PPhotoGridStyle = {
      ...style,
      '--p-photo-grid-mobile-columns': columnConfig.mobile,
      '--p-photo-grid-tablet-columns': columnConfig.tablet,
      '--p-photo-grid-desktop-columns': columnConfig.desktop,
      '--p-photo-grid-aspect': aspect,
    };

    return (
      <ul
        {...props}
        ref={ref}
        aria-label={ariaLabel}
        className={cn('p-photo-grid', `p-photo-grid--gap-${gap}`, className)}
        style={gridStyle}
      >
        {photos.map((photo, index) => {
          const image = renderImage({
            src: photoPreview(photo),
            alt: photo.alt,
            sizes: resolvedSizes,
            className: 'p-photo-grid__image',
            // The first row is above the fold often enough to be worth the
            // eager fetch; everything after it waits until it is scrolled near.
            loading: index < columnConfig.desktop ? 'eager' : 'lazy',
          });

          return (
            <li key={photoKey(photo, index)} className="p-photo-grid__item">
              {onPhotoClick ? (
                <button
                  type="button"
                  className="p-photo-grid__button"
                  onClick={() => onPhotoClick(index, photo)}
                  aria-label={photo.alt ? `Open ${photo.alt}` : `Open photo ${index + 1}`}
                >
                  {image}
                </button>
              ) : (
                image
              )}
            </li>
          );
        })}
      </ul>
    );
  },
);

PPhotoGrid.displayName = 'PPhotoGrid';

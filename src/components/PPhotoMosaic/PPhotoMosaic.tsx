import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import cn from '../../utils/cn';
import {
  photoKey,
  photoPreview,
  renderMediaImage,
  type PMediaGap,
  type PMediaImageRenderer,
  type PPhoto,
} from '../media';
import './PPhotoMosaic.css';

export type PPhotoMosaicRef = HTMLDivElement;

export type PPhotoMosaicLabels = {
  /** Visible text on the overflow tile. Defaults to `+12`. */
  overflowCount?: (remaining: number) => string;
  /** Accessible name for the overflow tile. */
  overflowTile?: (remaining: number) => string;
  /** Accessible name for every other tile. */
  photoTile?: (photo: PPhoto, index: number) => string;
};

export type PPhotoMosaicProps = {
  photos: readonly PPhoto[];
  /** Tiles shown before the set is summarised as "+N". Defaults to 4. */
  previewCount?: number;
  /** Aspect ratio of the lead tile. */
  heroAspect?: CSSProperties['aspectRatio'];
  /** Aspect ratio of the tiles in the row beneath it. */
  tileAspect?: CSSProperties['aspectRatio'];
  gap?: PMediaGap;
  /** Overrides the `sizes` attribute derived from the layout. */
  sizes?: string;
  /** When provided, every tile becomes a button reporting its index. */
  onPhotoClick?: (index: number, photo: PPhoto) => void;
  renderImage?: PMediaImageRenderer;
  labels?: PPhotoMosaicLabels;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

type PPhotoMosaicStyle = CSSProperties & {
  '--p-photo-mosaic-columns'?: number;
  '--p-photo-mosaic-hero-aspect'?: CSSProperties['aspectRatio'];
  '--p-photo-mosaic-tile-aspect'?: CSSProperties['aspectRatio'];
};

const DEFAULT_LABELS: Required<PPhotoMosaicLabels> = {
  overflowCount: (remaining) => `+${remaining}`,
  overflowTile: (remaining) => `Open the gallery — ${remaining} more photos`,
  photoTile: (photo, index) => (photo.alt ? `Open ${photo.alt}` : `Open photo ${index + 1}`),
};

/**
 * An album preview in the shape Instagram and Facebook use: a wide lead tile
 * above a row of smaller ones, with the rest of the set summarised as "+N" on
 * the last tile.
 *
 * Chosen over a uniform grid because a phone column of identical squares gives
 * every frame the same weight and reads as a contact sheet. A lead tile
 * establishes the set at a size worth looking at, and "+56" communicates depth in
 * one glance instead of asking someone to expand a list they cannot judge yet.
 *
 * Every tile — the overflow one included — reports its own index, so a viewer can
 * open at the photo that was actually tapped. That is what lets this replace an
 * expand/collapse grid outright rather than sit in front of one: there is no
 * second state to maintain, because the full set is browsed elsewhere.
 *
 * Tiles paint `thumb`, which is sized for a phone. Stretched to a desktop lead
 * tile it goes slightly soft — accepted deliberately, since serving full-size
 * files here would cost hundreds of kilobytes per section for pixels that only
 * help large screens. Pass a mid-size `thumb` if that trade stops being worth it.
 */
export const PPhotoMosaic = forwardRef<PPhotoMosaicRef, PPhotoMosaicProps>(
  (
    {
      photos,
      previewCount = 4,
      heroAspect = '3 / 2',
      tileAspect = '1 / 1',
      gap = 'sm',
      sizes,
      onPhotoClick,
      renderImage = renderMediaImage,
      labels,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    // A mosaic with no lead tile is not a mosaic; anything below 1 is a caller
    // bug that should degrade to the smallest sensible layout, not crash.
    const tileCount = Math.max(1, Math.floor(previewCount));
    const [hero, ...rest] = photos.slice(0, tileCount);

    if (!hero) {
      return null;
    }

    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const remaining = photos.length - tileCount;
    const columns = Math.max(1, rest.length);

    // With a single preview tile there is no row to hang the count on, so the
    // lead tile carries it instead.
    const heroCarriesOverflow = rest.length === 0 && remaining > 0;

    const mosaicStyle: PPhotoMosaicStyle = {
      ...style,
      '--p-photo-mosaic-columns': columns,
      '--p-photo-mosaic-hero-aspect': heroAspect,
      '--p-photo-mosaic-tile-aspect': tileAspect,
    };

    const renderTile = (
      photo: PPhoto,
      index: number,
      variant: 'hero' | 'tile',
      overflowCount?: number,
    ) => {
      const isOverflow = overflowCount !== undefined;
      const label = isOverflow
        ? resolvedLabels.overflowTile(overflowCount)
        : resolvedLabels.photoTile(photo, index);

      const image = renderImage({
        src: photoPreview(photo),
        // The scrim hides the photo, so announcing it would describe something
        // nobody can see. The tile's own label carries the meaning instead.
        alt: isOverflow ? '' : photo.alt,
        sizes:
          sizes ??
          (variant === 'hero'
            ? '(min-width: 48rem) 48rem, 100vw'
            : `(min-width: 48rem) ${Math.round(48 / columns)}rem, ${Math.round(100 / columns)}vw`),
        className: 'p-photo-mosaic__image',
        // The lead tile is the section's largest element and almost always in
        // view when the section is; the row beneath it can wait.
        loading: variant === 'hero' ? 'eager' : 'lazy',
      });

      const overlay: ReactNode = isOverflow ? (
        // Inside the button, not floating over it, so the whole tile — count
        // included — is a single target rather than two overlapping ones.
        <span className="p-photo-mosaic__overflow" aria-hidden="true">
          {resolvedLabels.overflowCount(overflowCount)}
        </span>
      ) : null;

      const tileClassName = cn(
        'p-photo-mosaic__tile',
        variant === 'hero' ? 'p-photo-mosaic__tile--hero' : 'p-photo-mosaic__tile--row',
      );

      if (!onPhotoClick) {
        return (
          <div key={photoKey(photo, index)} className={tileClassName}>
            {image}
            {overlay}
          </div>
        );
      }

      return (
        <button
          key={photoKey(photo, index)}
          type="button"
          className={cn(tileClassName, 'p-photo-mosaic__tile--interactive')}
          onClick={() => onPhotoClick(index, photo)}
          aria-label={label}
        >
          {image}
          {overlay}
        </button>
      );
    };

    return (
      <div
        {...props}
        ref={ref}
        className={cn('p-photo-mosaic', `p-photo-mosaic--gap-${gap}`, className)}
        style={mosaicStyle}
      >
        {renderTile(hero, 0, 'hero', heroCarriesOverflow ? remaining : undefined)}

        {rest.length > 0 && (
          <div className="p-photo-mosaic__row">
            {rest.map((photo, offset) => {
              const index = offset + 1;
              // The count belongs on the last visible tile, and only when the
              // set actually continues past it.
              const isLast = index === tileCount - 1;

              return renderTile(
                photo,
                index,
                'tile',
                isLast && remaining > 0 ? remaining : undefined,
              );
            })}
          </div>
        )}
      </div>
    );
  },
);

PPhotoMosaic.displayName = 'PPhotoMosaic';

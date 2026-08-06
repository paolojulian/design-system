import type { ReactNode } from 'react';

/**
 * A single photo in a gallery.
 *
 * Two sources rather than one: tiles are small, lightboxes are not. Handing the
 * grid a 1600px file to paint at 180px moves roughly ten times the bytes for
 * pixels nobody sees, so tiles render `thumb` and only the lightbox reaches for
 * `src`. When there is no separate thumbnail, `src` is used for both.
 */
export type PPhoto = {
  /** Full-resolution source. Requested by the lightbox, never by a tile. */
  src: string;
  /** Low-resolution preview for tiles. Falls back to `src`. */
  thumb?: string;
  /** Alt text. Pass an empty string for a purely decorative photo. */
  alt: string;
};

/** A single clip in a video gallery. */
export type PVideo = {
  /** Video source, loaded only after the clip is played. */
  src: string;
  /** Poster image shown until then. */
  poster: string;
  /** Human-readable clip name, used in the play button's accessible name. */
  name: string;
};

/**
 * Props handed to the image renderer for every tile.
 *
 * The shape is deliberately the intersection of a plain `<img>` and Next.js's
 * `next/image`, so the default renderer and a framework one stay interchangeable.
 */
export type PMediaImageProps = {
  src: string;
  alt: string;
  /** Resolved from the component's column configuration. */
  sizes: string;
  /** Carries `object-fit` and the fill positioning. Always apply it. */
  className: string;
  loading: 'lazy' | 'eager';
};

/**
 * Escape hatch for framework image components.
 *
 * The design system has no framework dependency, so tiles render a plain `<img>`
 * by default. Next.js consumers opt into optimisation by passing a renderer:
 *
 * ```tsx
 * <PPhotoGrid
 *   photos={photos}
 *   renderImage={(props) => <Image {...props} fill />}
 * />
 * ```
 *
 * The tile is already `position: relative`, which is what `fill` needs.
 */
export type PMediaImageRenderer = (props: PMediaImageProps) => ReactNode;

/** Column counts a media grid accepts. */
export type PMediaColumns = 1 | 2 | 3 | 4 | 5 | 6;

/** Per-breakpoint column counts. Breakpoints are the design system's md and lg. */
export type PMediaResponsiveColumns = {
  mobile?: PMediaColumns;
  tablet?: PMediaColumns;
  desktop?: PMediaColumns;
};

/** Gap scale shared by the media grids, mapped onto `--p-space-*`. */
export type PMediaGap = 'none' | 'sm' | 'md' | 'lg';

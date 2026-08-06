import type {
  PMediaColumns,
  PMediaResponsiveColumns,
  PPhoto,
} from './types';

/** Tiles paint the preview; only the lightbox is worth the full-resolution file. */
export function photoPreview(photo: PPhoto) {
  return photo.thumb ?? photo.src;
}

/**
 * A stable React key for a photo.
 *
 * The source alone is not enough — the same shot can legitimately appear twice
 * in one set — so the index disambiguates while the source keeps the key stable
 * when the list is filtered rather than reordered.
 */
export function photoKey(photo: PPhoto, index: number) {
  return `${photo.src}#${index}`;
}

type ResolvedColumns = {
  mobile: PMediaColumns;
  tablet: PMediaColumns;
  desktop: PMediaColumns;
};

/**
 * Normalises the `columns` prop. A bare number is treated as the desktop count,
 * stepping down through tablet so a phone never gets a four-across contact sheet.
 */
export function resolveColumns(
  columns: PMediaColumns | PMediaResponsiveColumns | undefined,
  fallback: ResolvedColumns,
): ResolvedColumns {
  if (columns === undefined) {
    return fallback;
  }

  if (typeof columns === 'number') {
    return {
      mobile: Math.min(columns, 2) as PMediaColumns,
      tablet: Math.min(columns, 3) as PMediaColumns,
      desktop: columns,
    };
  }

  const mobile = columns.mobile ?? fallback.mobile;
  const tablet = columns.tablet ?? columns.mobile ?? fallback.tablet;
  const desktop = columns.desktop ?? columns.tablet ?? columns.mobile ?? fallback.desktop;

  return { mobile, tablet, desktop };
}

/**
 * Derives the `sizes` attribute from the column configuration.
 *
 * Getting this wrong is the single most expensive mistake in a photo grid: with
 * no `sizes`, a responsive source set defaults to `100vw` and every tile
 * downloads a full-width image. The breakpoints below must stay in step with the
 * media queries in the component stylesheets (`--breakpoint-md`, `--breakpoint-lg`).
 */
export function buildSizes({ mobile, tablet, desktop }: ResolvedColumns) {
  const share = (columns: number) => `${Math.round(100 / columns)}vw`;

  return [
    `(min-width: 64rem) ${share(desktop)}`,
    `(min-width: 48rem) ${share(tablet)}`,
    share(mobile),
  ].join(', ');
}

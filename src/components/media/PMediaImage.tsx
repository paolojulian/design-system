import type { PMediaImageRenderer } from './types';

/**
 * Default tile renderer: a plain, lazily-loaded image.
 *
 * `decoding="async"` keeps a wall of tiles from blocking the main thread while
 * they decode — noticeable once a grid gets past a dozen or so images. The
 * positioning and `object-fit` arrive through `className`, so this element and a
 * framework equivalent occupy the same box.
 */
export const renderMediaImage: PMediaImageRenderer = ({
  src,
  alt,
  sizes,
  className,
  loading,
}) => (
  <img
    src={src}
    alt={alt}
    sizes={sizes}
    className={className}
    loading={loading}
    decoding="async"
  />
);

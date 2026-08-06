import Lightbox from 'yet-another-react-lightbox';
import Counter from 'yet-another-react-lightbox/plugins/counter';
import Download from 'yet-another-react-lightbox/plugins/download';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/counter.css';
import cn from '../../utils/cn';
import { photoPreview, type PPhoto } from '../media';
import './PPhotoLightbox.css';

export type PPhotoLightboxLabels = {
  previous?: string;
  next?: string;
  close?: string;
  /** Accessible name for the single-photo download button. */
  download?: string;
  /** Accessible name for the archive link. Receives the photo count. */
  downloadAll?: (count: number) => string;
};

export type PPhotoLightboxProps = {
  photos: readonly PPhoto[];
  /** Index to open at. `null` keeps the lightbox closed. */
  index: number | null;
  onClose: () => void;
  /**
   * Link to a pre-built archive of the whole set. Adds a "download all" action
   * to the toolbar; omit it and the action is not rendered.
   */
  archiveUrl?: string;
  /** Name of the set. Used in labels and to prefix downloaded filenames. */
  label?: string;
  labels?: PPhotoLightboxLabels;
  /** Applied to the lightbox root, where the `--p-photo-lightbox-*` tokens live. */
  className?: string;
};

/**
 * `Jose Albin — Day 1` → `jose-albin-day-1`. The em dash is not `\w`, `\s` or a
 * hyphen-minus, so the first replace drops it and the second collapses the
 * leftover double space into a single separator.
 */
function slugify(value: string) {
  return value
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '-');
}

/**
 * Full-screen photo viewer.
 *
 * Lives behind the `@paolojulian.dev/design-system/gallery` entry point because
 * it is the one component here with a dependency: `yet-another-react-lightbox`,
 * declared as an optional peer. Importing the package's main entry pulls in none
 * of it. Consumers who want the viewer install the peer themselves.
 *
 * The library is worth that seam. Pinch-zoom, momentum swiping and
 * pull-to-dismiss are genuinely hard to get right on iOS, and hand-rolled
 * gesture code is where a photo viewer usually falls apart.
 *
 * Theming goes through `--p-photo-lightbox-*` custom properties rather than the
 * library's own. The library's stylesheet is unlayered, so it beats anything the
 * design system declares in `@layer components` regardless of specificity; the
 * `--yarl__*` variables are therefore set inline, where the cascade cannot reach
 * them, and each one reads a `--p-photo-lightbox-*` token so the values stay
 * overridable from CSS.
 */
export function PPhotoLightbox({
  photos,
  index,
  onClose,
  archiveUrl,
  label,
  labels,
  className,
}: PPhotoLightboxProps) {
  const setSlug = label ? slugify(label) : '';
  const suffix = label ? ` from ${label}` : '';

  const slides = photos.map((photo) => ({
    src: photo.src,
    alt: photo.alt,
    // Prefixing with the set keeps files from different sets apart in a phone's
    // Downloads folder, where every set otherwise contributes bare camera stems
    // like `OM129088.webp`.
    download: {
      url: photo.src,
      filename: [setSlug, photo.src.split('/').pop() ?? 'photo']
        .filter(Boolean)
        .join('-'),
    },
  }));

  // Slides only carry `src`, so the low-resolution stand-in is looked up by it.
  const previewBySrc = new Map(photos.map((photo) => [photo.src, photoPreview(photo)]));

  return (
    <Lightbox
      open={index !== null}
      index={index ?? 0}
      close={onClose}
      slides={slides}
      className={cn('p-photo-lightbox', className)}
      plugins={[Zoom, Counter, Download]}
      // Explicit order so the whole-set link sits next to the single-photo
      // download rather than being prepended ahead of everything.
      toolbar={{
        buttons: [
          'download',
          ...(archiveUrl
            ? [
                <ArchiveLink
                  key="download-all"
                  href={archiveUrl}
                  filename={`${setSlug || 'photos'}.zip`}
                  count={photos.length}
                  label={
                    labels?.downloadAll?.(photos.length) ??
                    `Download all ${photos.length} photos${suffix} as a ZIP file`
                  }
                />,
              ]
            : []),
          'zoom',
          'close',
        ],
      }}
      // `finite` disables wrap-around at both ends, so the last photo does not
      // silently loop back to the first.
      carousel={{ finite: true }}
      // Close is deliberately limited to the X button and pull-down. Backdrop
      // click is off: photos are letterboxed, so a portrait shot on a phone
      // leaves large dead bands beside it that read as part of the viewer —
      // tapping there to look closer would dismiss instead. Instagram and
      // Facebook behave the same way; tap is for the photo, not for exit.
      controller={{ closeOnPullDown: true, closeOnBackdropClick: false }}
      // The default cap is one image pixel per physical pixel: on a DPR-3 phone
      // a 1600px photo would only reach 1600/(375*3) = 1.4x, which does not feel
      // like a zoom at all. 2 puts it near 2.8x, enough to read a face in a
      // crowd shot.
      zoom={{ maxZoomPixelRatio: 2 }}
      counter={{ separator: ' / ' }}
      labels={{
        Previous: labels?.previous ?? 'Previous photo',
        Next: labels?.next ?? 'Next photo',
        Close: labels?.close ?? (label ? `Close the ${label} gallery` : 'Close gallery'),
        Download: labels?.download ?? `Download this photo${suffix}`,
      }}
      // The preview the grid already has cached is painted behind the slide so
      // the viewer is never a black void while the full-size file arrives. The
      // library hides a loading image with `opacity: 0` and centres it with
      // `object-fit: contain`, so a `background-size: contain` layer on a
      // full-size flex-centred wrapper occupies exactly the same rect — the
      // sharp image fades in directly on top of the blurry one. Inline styles
      // rather than a class for the same cascade reason as the tokens above.
      render={{
        slideContainer: ({ slide, children }) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              backgroundImage:
                'src' in slide && previewBySrc.has(slide.src)
                  ? `url("${previewBySrc.get(slide.src)}")`
                  : undefined,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          >
            {children}
          </div>
        ),
      }}
      styles={{
        root: {
          '--yarl__color_backdrop':
            'var(--p-photo-lightbox-backdrop, rgb(0 0 0 / 0.92))',
          '--yarl__color_button':
            'var(--p-photo-lightbox-control, rgb(255 255 255 / 0.8))',
          '--yarl__color_button_active':
            'var(--p-photo-lightbox-control-active, #ffffff)',
        },
      }}
    />
  );
}

PPhotoLightbox.displayName = 'PPhotoLightbox';

/**
 * "Download all" — a plain anchor to a pre-built archive, not a scripted download.
 *
 * That is the whole point of the strategy: a `.zip` is not something a browser
 * renders, so a cross-origin `<a href>` saves it with no CORS, no fetch, no
 * memory spike, and with resume support for free. The single-photo button beside
 * it has to go through fetch and a blob precisely because an image *is*
 * renderable, and the `download` attribute is ignored cross-origin.
 *
 * `download` is still set: it is a no-op cross-origin today, but becomes the
 * filename the moment the bucket is served from the same site or behind a proxy.
 * Until then the saved name comes from the object's stored Content-Disposition.
 *
 * Styled with its own class rather than the library's `yarl__button`, which
 * looks like the obvious reuse but cannot carry a focus ring: that class sets
 * `outline: none` from an unlayered stylesheet, which beats every layered rule
 * here regardless of specificity. The choice was a focus ring without
 * `!important` or one shared class name; the ring won.
 */
function ArchiveLink({
  href,
  filename,
  count,
  label,
}: {
  href: string;
  filename: string;
  count: number;
  label: string;
}) {
  return (
    <a
      href={href}
      download={filename}
      className="p-photo-lightbox__action"
      aria-label={label}
      title={`Download all ${count} photos (ZIP)`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
      >
        <path d="M20 6h-8l-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2zm-7 5h2l-3 3.5L9 11h2V8h2v3z" />
      </svg>
    </a>
  );
}

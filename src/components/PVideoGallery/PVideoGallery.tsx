import {
  forwardRef,
  useId,
  useState,
  type CSSProperties,
  type HTMLAttributes,
} from 'react';
import cn from '../../utils/cn';
import {
  buildSizes,
  renderMediaImage,
  resolveColumns,
  type PMediaColumns,
  type PMediaGap,
  type PMediaImageRenderer,
  type PMediaResponsiveColumns,
  type PVideo,
} from '../media';
import './PVideoGallery.css';

export type PVideoGalleryRef = HTMLDivElement;

export type PVideoGalleryLabels = {
  /** Accessible name for a poster's play button. */
  play?: (video: PVideo, index: number) => string;
  /** Text on the expand toggle. */
  showAll?: (total: number) => string;
  /** Text on the collapse toggle. */
  showFewer?: () => string;
};

export type PVideoGalleryProps = {
  videos: readonly PVideo[];
  /** Posters shown before the toggle is used. Defaults to 6. */
  previewCount?: number;
  /** Column count, or per-breakpoint counts. Defaults to 1 / 2 / 3. */
  columns?: PMediaColumns | PMediaResponsiveColumns;
  gap?: PMediaGap;
  /** Poster aspect ratio. Widescreen by default. */
  aspect?: CSSProperties['aspectRatio'];
  /** Overrides the `sizes` attribute derived from `columns`. */
  sizes?: string;
  renderImage?: PMediaImageRenderer;
  labels?: PVideoGalleryLabels;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'children'>;

type PVideoGalleryStyle = CSSProperties & {
  '--p-video-gallery-mobile-columns'?: number;
  '--p-video-gallery-tablet-columns'?: number;
  '--p-video-gallery-desktop-columns'?: number;
  '--p-video-gallery-aspect'?: CSSProperties['aspectRatio'];
};

const DEFAULT_COLUMNS = { mobile: 1, tablet: 2, desktop: 3 } as const;

const DEFAULT_LABELS: Required<PVideoGalleryLabels> = {
  play: (video, index) => `Play ${video.name || `clip ${index + 1}`}`,
  showAll: (total) => `Show all ${total} clips`,
  showFewer: () => 'Show fewer',
};

/**
 * A wall of video posters that mounts a player only for the clip that was played.
 *
 * That restraint is the entire point of the component. Posters are a few tens of
 * kilobytes; clips are megabytes. A set of a hundred mounted `<video>` elements
 * costs real memory even with `preload="none"`, and any browser that treats the
 * hint as advisory would start pulling a gigabyte down the wire. Nothing here
 * touches the network for video until someone asks for it.
 *
 * Only one clip plays at a time — starting a second replaces the first, which is
 * also what stops several soundtracks from overlapping.
 */
export const PVideoGallery = forwardRef<PVideoGalleryRef, PVideoGalleryProps>(
  (
    {
      videos,
      previewCount = 6,
      columns,
      gap = 'md',
      aspect = '16 / 9',
      sizes,
      renderImage = renderMediaImage,
      labels,
      className,
      style,
      ...props
    },
    ref,
  ) => {
    const [expanded, setExpanded] = useState(false);
    const [playing, setPlaying] = useState<string | null>(null);
    const listId = useId();

    if (videos.length === 0) {
      return null;
    }

    const resolvedLabels = { ...DEFAULT_LABELS, ...labels };
    const columnConfig = resolveColumns(columns, DEFAULT_COLUMNS);
    const resolvedSizes = sizes ?? buildSizes(columnConfig);

    const limit = Math.max(0, Math.floor(previewCount));
    const shown = expanded ? videos : videos.slice(0, limit);
    const remaining = videos.length - limit;

    const galleryStyle: PVideoGalleryStyle = {
      ...style,
      '--p-video-gallery-mobile-columns': columnConfig.mobile,
      '--p-video-gallery-tablet-columns': columnConfig.tablet,
      '--p-video-gallery-desktop-columns': columnConfig.desktop,
      '--p-video-gallery-aspect': aspect,
    };

    return (
      <div
        {...props}
        ref={ref}
        className={cn('p-video-gallery', `p-video-gallery--gap-${gap}`, className)}
        style={galleryStyle}
      >
        <ul id={listId} className="p-video-gallery__list">
          {shown.map((video, index) => (
            <li key={video.src} className="p-video-gallery__item">
              {playing === video.src ? (
                <video
                  src={video.src}
                  poster={video.poster}
                  controls
                  autoPlay
                  playsInline
                  // `preload` still matters after mount: without it a browser
                  // may buffer beyond what autoplay actually needs.
                  preload="none"
                  className="p-video-gallery__player"
                />
              ) : (
                <button
                  type="button"
                  className="p-video-gallery__poster"
                  onClick={() => setPlaying(video.src)}
                  aria-label={resolvedLabels.play(video, index)}
                >
                  {renderImage({
                    src: video.poster,
                    // The button's label already names the clip; repeating it
                    // here would announce the same thing twice.
                    alt: '',
                    sizes: resolvedSizes,
                    className: 'p-video-gallery__image',
                    loading: index < columnConfig.desktop ? 'eager' : 'lazy',
                  })}
                  <span className="p-video-gallery__play" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="currentColor" focusable="false">
                      <path d="M8 5.14v13.72a.5.5 0 0 0 .76.43l11.44-6.86a.5.5 0 0 0 0-.86L8.76 4.71a.5.5 0 0 0-.76.43Z" />
                    </svg>
                  </span>
                </button>
              )}
            </li>
          ))}
        </ul>

        {remaining > 0 && (
          <button
            type="button"
            className="p-video-gallery__toggle"
            onClick={() => setExpanded((previous) => !previous)}
            aria-expanded={expanded}
            aria-controls={listId}
          >
            {expanded ? resolvedLabels.showFewer() : resolvedLabels.showAll(videos.length)}
          </button>
        )}
      </div>
    );
  },
);

PVideoGallery.displayName = 'PVideoGallery';

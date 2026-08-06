import type { PPhoto, PVideo } from './types';

/**
 * Deterministic placeholder imagery for stories and UI tests.
 *
 * Generated as inline SVG data URIs rather than pulled from a photo service:
 * Chromatic and Playwright both need every story to paint identically on every
 * run, and a remote image is the fastest way to make a visual-diff suite flaky.
 * These also work with no network at all, which is what the storybook-smoke and
 * gallery specs rely on.
 */
function swatch(hue: number, label: string, width: number, height: number) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="hsl(${hue} 45% 62%)"/>
      <stop offset="100%" stop-color="hsl(${(hue + 40) % 360} 40% 34%)"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#g)"/>
  <text x="50%" y="50%" fill="rgba(255,255,255,0.92)" font-family="sans-serif" font-size="${Math.round(Math.min(width, height) / 5)}" font-weight="700" text-anchor="middle" dominant-baseline="central">${label}</text>
</svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const SUBJECTS = [
  'Ceremony',
  'First look',
  'Speeches',
  'The toast',
  'Dance floor',
  'Golden hour',
  'Table setting',
  'Confetti',
  'Cake cutting',
  'Sparklers',
  'Portraits',
  'Last dance',
];

/** `count` photos with distinct hues, so tile order is obvious in a snapshot. */
export function samplePhotos(count: number): PPhoto[] {
  return Array.from({ length: count }, (_, index) => {
    const subject = SUBJECTS[index % SUBJECTS.length];
    const hue = (index * 47) % 360;

    return {
      // Labelled differently from `thumb` so stories prove the tiles paint the
      // preview and only the lightbox reaches for the full-size file. The two
      // share an aspect ratio on purpose: the lightbox paints the preview behind
      // the slide as a blur-up placeholder, and that only lines up when both
      // variants crop identically — which is how a real export pipeline emits
      // them, and what the story should therefore show.
      src: swatch(hue, `${subject} — full`, 1600, 1067),
      thumb: swatch(hue, subject, 400, 267),
      alt: `${subject}, photo ${index + 1}`,
    };
  });
}

/** `count` clips. The sources are intentionally unplayable placeholders. */
export function sampleVideos(count: number): PVideo[] {
  return Array.from({ length: count }, (_, index) => {
    const subject = SUBJECTS[index % SUBJECTS.length];

    return {
      src: `https://example.invalid/clips/clip-${index + 1}.mp4`,
      poster: swatch((index * 61) % 360, subject, 640, 360),
      name: `${subject} clip ${index + 1}`,
    };
  });
}

# Paolo Julian —Design System

This is my own personal design system used across my websites.
The design system can be accessed here:

- Storybook: [https://design-system.paolojulian.dev]

## Development

This design system is made with Vite, React and TailwindCSS

## Installation
```bash
npm install @paolojulian.dev/design-system
```

### Tailwind Config
```js
// tailwind.config.js
import type { Config } from 'tailwindcss';
import colors from 'tailwindcss/colors';

const config: Pick<Config, 'content' | 'presets' | 'theme'> = {
  presets: [
    require('@paolojulian.dev/design-system/tailwind-config/tailwind.config.js'),
  ],
  content: ['./src/**/*.tsx'],
  theme: {
    extend: {
      // Your custom styles
    },
  },
};

export default config;
```

### Styles
```css
@import '@paolojulian.dev/design-system/style.css';
@import '@paolojulian.dev/design-system/fonts.css';
```

## Design Tokens

The runtime token contract is published through CSS custom properties in `theme.css`.
Use semantic tokens for product UI, then component tokens for focused overrides.

```css
@import '@paolojulian.dev/design-system/theme.css';

.surface {
  background: var(--p-color-surface);
  color: var(--p-color-text);
  border-color: var(--p-color-border);
}
```

The main `style.css` import does not include font files; import `fonts.css` when you want the packaged AvantGarde and Merriweather faces.
Typed token references are also available from the constants entry:

```ts
import { P_TOKENS } from '@paolojulian.dev/design-system/constants';
```

## Theming

Light and dark themes ship as CSS custom-property sets in `theme.css`. Theming
is pure CSS driven by a `data-theme` attribute — the package has no JavaScript
theme provider by design.

### Applying a theme

Set `data-theme` on `<html>` to theme the whole page:

```html
<html data-theme="dark">
```

`data-theme` also scopes to any container, so you can theme a single region
without affecting the rest of the page:

```html
<aside data-theme="dark">
  <!-- dark surfaces, buttons, and inputs inside here only -->
</aside>
```

Supported values are `light` (default) and `dark`.

### Following the OS preference

The package stays CSS-only, so it does not read `prefers-color-scheme` for you —
doing so would fight an explicit `data-theme`. Wire it up on the consumer side:
resolve the stored choice and the OS preference, then write the attribute.

```ts
const stored = localStorage.getItem('theme'); // 'light' | 'dark' | null
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

document.documentElement.setAttribute('data-theme', stored ?? (prefersDark ? 'dark' : 'light'));

// Keep following the OS until the user makes an explicit choice.
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
  if (localStorage.getItem('theme')) return; // stored choice wins
  document.documentElement.setAttribute('data-theme', event.matches ? 'dark' : 'light');
});
```

### Custom branding

The supported override surface is the semantic action and focus tokens. Override
them at `:root` (or any container) and every component follows:

```css
:root {
  --p-color-action-primary: #2563eb;
  --p-color-action-primary-hover: #1d4ed8;
  --p-color-action-primary-subtle: #eff6ff;
  --p-color-focus: #2563eb;
}
```

Do not override base tokens (`--p-color-neutral-*`, `--p-color-brand-*`,
`--p-color-red-*`, and the other raw scales). They are internal inputs to the
semantic layer, not a stable API. For a single component, override that
component's tokens through a class (for example `--p-highlight-bg`) rather than
reaching for base values.


## Galleries

Four components cover photo and video sets. All of them take a `renderImage` prop
so the package stays framework-agnostic — the default is a plain lazy `<img>`:

```tsx
import { PPhotoMosaic } from '@paolojulian.dev/design-system';
import Image from 'next/image';

<PPhotoMosaic
  photos={photos}
  onPhotoClick={setOpenAt}
  renderImage={(props) => <Image {...props} fill />}
/>;
```

| Component | Use it for |
| --- | --- |
| `PPhotoMosaic` | Album preview — a wide lead tile over a row, rest summarised as "+N" |
| `PPhotoGrid` | A uniform grid of cropped tiles |
| `PVideoGallery` | A poster wall that mounts a player only for the clip that was played |
| `PPhotoLightbox` | Full-screen viewer (separate entry — see below) |

Photos carry two sources. Tiles paint `thumb`; only the lightbox reaches for `src`.

```ts
type PPhoto = { src: string; thumb?: string; alt: string };
```

`onPhotoClick` is optional throughout. Without it the tiles render as plain
elements — no buttons, nothing focusable — so a static preview stays static.
The `sizes` attribute is derived from the column configuration automatically.

### Lightbox

`PPhotoLightbox` ships from a separate entry because it is the one component with
a dependency: `yet-another-react-lightbox`, declared as an **optional** peer.
Importing the main entry pulls in none of it, and builds fine without the peer
installed.

```bash
npm install yet-another-react-lightbox
```

```tsx
import { PPhotoLightbox } from '@paolojulian.dev/design-system/gallery';

// `null` is closed. Hold the index above the mosaic so the viewer spans the
// whole set while the preview only knows about its own tiles.
const [openAt, setOpenAt] = useState<number | null>(null);

<>
  <PPhotoMosaic photos={photos} onPhotoClick={setOpenAt} />
  <PPhotoLightbox
    photos={photos}
    index={openAt}
    onClose={() => setOpenAt(null)}
    label="Jose Albin — Day 1"
    archiveUrl="https://media.example.com/sets/jose-albin-day-1.zip"
  />
</>;
```

`archiveUrl` adds a whole-set download beside the single-photo one. It is a plain
anchor to a pre-built archive, not a scripted download: a `.zip` is not something
a browser renders, so a cross-origin `<a href>` saves it with no CORS, no fetch,
no memory spike, and with resume support for free.

The viewer is a dark room in both themes — a photograph is the content, and light
chrome would tint it. Retheme it through `--p-photo-lightbox-backdrop`,
`--p-photo-lightbox-control`, and `--p-photo-lightbox-control-active`.

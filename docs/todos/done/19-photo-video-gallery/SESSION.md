# Session — Photo & video gallery (PPhotoMosaic, PPhotoGrid, PVideoGallery, PPhotoLightbox)

## Context
Ported from the `empire-events` Next.js app (`app/events/[slug]/thank-you/components/`),
where the set had been built and shipped against a real 1,084-photo / 109-clip event.
The port is a rewrite, not a copy: the source used Tailwind `dark:` variants and
`next/image`, neither of which exists here.

`empire-events` was deliberately **not** migrated onto these components — that needs a
publish first, and it is a separate call.

## Decisions
- **Optional peer dependency, own entry point.** `PPhotoLightbox` needs
  `yet-another-react-lightbox`; the design system otherwise has zero runtime UI deps.
  Shipped from a new `./gallery` entry so importing the main entry costs nothing and
  builds fine without the peer. Alternative considered: hand-rolling the viewer on the
  existing `OverlayDialog` (native `<dialog>`, focus trap, scroll lock already there).
  Rejected — CSS scroll-snap gets you swiping, but not momentum tuning or pinch-zoom,
  and iOS gesture code is where photo viewers usually fall apart.
- **`renderImage` render prop** rather than a framework dependency. Default is a plain
  lazy `<img>`; Next consumers pass `(props) => <Image {...props} fill />`. The prop
  shape is the intersection of both, and tiles are already `position: relative`.
- **`sizes` derived from the column config** instead of hand-written per call site.
  Getting it wrong is the most expensive mistake in a photo grid — with no `sizes`, a
  responsive source set defaults to `100vw` and every tile fetches a full-width image.
- **Mosaic replaces state, it does not add it.** In the source app this superseded an
  eight-square grid behind a "Show all N" toggle that could put ~500 wrappers in the DOM
  once expanded. Every tile — the "+N" one included — reports its own index, so the
  lightbox is the only way the set is browsed and there is no expanded/collapsed state.

## Dead ends / gotchas
- **The library's stylesheet is unlayered.** Unlayered author CSS beats *every* rule in
  `@layer components` regardless of specificity, so a layered override of `.yarl__*`
  silently loses. Theming therefore sets the `--yarl__*` variables **inline** (via
  `styles.root`, which the library types as `SlotCSSProperties`), each reading a
  `--p-photo-lightbox-*` token so values stay overridable from CSS. Same reason the
  archive link uses its own class instead of `.yarl__button`: that class sets
  `outline: none`, which would kill the focus ring without an `!important`.
- **Rollup `external` needs a regex, not the bare package name.** String externals match
  exactly, so `"yet-another-react-lightbox"` would leave
  `import '.../styles.css'` to be inlined into our own `dist/style.css`. `/^yet-another-react-lightbox(\/.*)?$/`
  keeps the CSS imports intact in the output for the consumer's bundler to resolve.
  Verified: `dist/style.css` contains no `yarl__` rules and `dist/index.es.js` no
  reference to the package.
- **`tsconfig.node.json` has an explicit `include` list.** A new top-level entry folder
  (`src/gallery`) that is not listed still *builds* — it just emits `export {}` as its
  `.d.ts`, silently. Caught only by reading the 12-byte `dist/gallery.d.ts`.
- **Playwright's `toBeEmpty` tests for text, not children.** The suite's shared
  `gotoStory` helper gates on `#storybook-root` not being empty, which never passes for
  an all-imagery story. `tests/ui/photo-gallery.spec.ts` uses its own helper keyed on
  Storybook's `body.sb-show-main` class — which also works for the lightbox stories,
  since those portal outside the root entirely.
- **Story IDs kebab-case the export name.** `ReportsTheTappedIndex` →
  `--reports-the-tapped-index`, not `--reportsthetappedindex`.
- **Fixture aspect ratios have to match.** The lightbox paints the preview behind the
  slide as a blur-up placeholder; it aligns only when `thumb` and `src` crop identically.
  Square 400×400 thumbs against a 3:2 `src` made the story look broken when the component
  was correct. Fixtures now emit 400×267.
- **Hover scale needs `@media (hover: hover)`.** On touch it sticks after a tap and reads
  as a jammed tile.

## Verification
- `tests/ui/photo-gallery.spec.ts`: **29/29 pass**, including axe on three of the four
  components (the lightbox portals outside the axe scope).
- `eslint .` and `tsc -p tsconfig.app.json --noEmit` clean.
- Screenshotted all four components in both themes at phone and desktop widths.
- Full suite: **196/196 pass**, stable at `--repeat-each=3` (588/588). `eslint` and
  `tsc` clean, and the build no longer prints TypeScript errors.

## Pre-existing failures, fixed in a follow-up pass

Seven failures existed on a clean tree before this work. All are now green — and none
were fixed by loosening an assertion; each had a real cause.

- **PBadge overflowed by 18px** and **PTextInput by 4px** (pushing `scrollWidth` to 410
  on a 390 viewport): the package ships **no box-sizing reset**, so `content-box` applies
  and `width: 100%` excludes padding and border. Fixed on those two; the systemic gap
  affects ~14 more files and is filed as `docs/tech-debts/missing-box-sizing-reset.md`
  rather than flipped blindly across every component.
- **PTypography axe, 1.11:1.** The story meta applied `className: 'text-white'` — a
  Tailwind utility this package does not ship — over a hardcoded black ground, so every
  specimen rendered near-black on black. Replaced with the `surface-inverse` /
  `text-inverse` token pair, which flips together and therefore stays legible in dark
  mode; a fixed black ground would have reproduced the bug there.
- **Both date-picker specs timed out** clicking hardcoded May 2026 cells. The
  `--standard` stories pin a `defaultValue`, but `--with-presets` / `--empty` open on the
  current month, so those cells stopped existing once the real clock passed May 2026.
  Pinned with `page.clock.setFixedTime`; the `today`/`yesterday` presets are
  clock-dependent by definition, so a fixed clock is the only durable fix. The Node-side
  label helper had to derive from the *same* constant — otherwise it compares August
  against May.
- **PSectionHeader** assertions expected `-` and `\`; the component renders `—` and `|`.
  Stale test, correct component.
- **PRadioGroup TS2322:** Storybook types `subcomponents` as `ComponentType<unknown>`,
  which nothing with required props satisfies (props are contravariant). Cast at the
  registration site; affects the autodocs table only.
- **~25 TS2812/TS2584 errors on every build:** `tsconfig.node.json` set
  `"lib": ["ES2023"]` with no DOM, while the declaration emit covers components touching
  `document` and `HTMLDialogElement`. Non-fatal, but enough noise to hide a real failure.

### Gotcha this pass introduced and then fixed
Adding stories shifted bundle timing enough to make `pswitch--dark-theme` fail axe
**deterministically** — the backgrounds addon *animates* its background-color, and
sampled mid-transition the body reads `rgba(17, 17, 17, 0.035)`, so axe composited
light-on-light against a color that is never painted. Pre-existing race, newly exposed.
The axe helpers now await `document.body.getAnimations()` before analysing — the same
remedy this repo already applied to the toast fade-in flake.

## Not done
- No mid-size image variant. Mosaic tiles paint the 400px `thumb`, which is right on a
  phone but stretches soft on a desktop lead tile. Serving `src` there would cost
  hundreds of KB per section for pixels that only help large screens; a third variant is
  the real fix if it ever matters.
- Chromatic baselines not accepted — the new stories will show as changes on first run.

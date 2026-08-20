# File Upload

Goal: `PFileUpload` — dropzone + file list for admin tools. Depends on 04 (errors), 09 (states), 11 (progress).

## Components

- `PFileUpload` — dropzone (click or drag) + hidden `input type=file`; props: `accept`, `multiple`, `maxSize`, `maxFiles`.
- `PFileUpload.Item` — file row: icon/thumbnail, name, size, per-file state (queued, uploading with PProgressBar, done, error with retry, remove).
- Upload transport is the consumer's: component emits `onFilesAdded`; consumer drives per-file `status`/`progress` props back in.

## Rules

- Dropzone: dashed `--p-color-border` frame, `--p-radius-sm`, muted icon + one instruction line; drag-over state uses `--p-color-action-primary` border + subtle surface. No illustration.
- Client-side validation (type/size/count) rejects with per-file error text using danger tokens; valid files still proceed.
- File rows share the divider/spacing rhythm of PTable rows.
- Error row keeps name + reason + retry; never silently drops a file.

## Responsive

- Mobile: dropzone becomes a full-width "Add files" button-style target (drag is meaningless on touch); tap opens the native picker.
- File rows: actions stay ≥44px; long file names middle-truncate with title attribute.
- Tablet: dropzone as desktop.

## Accessibility

- Real `input type=file` behind a labeled button; dropzone is keyboard-activatable.
- Per-file status announced via `aria-live` on state changes.
- Remove/retry buttons named with the file name.

## Stories

Empty dropzone, drag-over, multiple queued/uploading/done, size + type errors, retry, max files reached, mobile button mode, dark theme.

## Tests

Playwright: file input via setInputFiles, validation rejects with visible reason, progress rendering, mobile button mode at mobile width, axe pass.

import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { samplePhotos } from '../media/fixtures';
import { PPhotoMosaic } from '../PPhotoMosaic';
import { PPhotoLightbox, type PPhotoLightboxProps } from './PPhotoLightbox';

const photos = samplePhotos(24);

const meta = {
  title: 'Components/PPhotoLightbox',
  component: PPhotoLightbox,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: [
          'Full-screen photo viewer, shipped from the `@paolojulian.dev/design-system/gallery` entry point.',
          '',
          'It is the one component here with a dependency — `yet-another-react-lightbox`, declared as an *optional* peer. Importing the package’s main entry pulls in none of it, and builds fine without the peer installed. The library earns that seam: pinch-zoom, momentum swiping and pull-to-dismiss are genuinely hard to get right on iOS.',
          '',
          '```tsx',
          "import { PPhotoLightbox } from '@paolojulian.dev/design-system/gallery';",
          "import 'yet-another-react-lightbox/styles.css';",
          '```',
        ].join('\n'),
      },
    },
  },
  args: {
    photos,
    index: null,
    label: 'Jose Albin — Day 1',
    onClose: () => {},
  },
  argTypes: {
    index: {
      description: 'Index to open at. `null` keeps the lightbox closed.',
    },
    archiveUrl: {
      description:
        'Link to a pre-built archive of the whole set. Adds a "download all" action; omit it and the action is not rendered.',
    },
    labels: {
      description: 'Overrides every string the viewer announces.',
    },
  },
} satisfies Meta<typeof PPhotoLightbox>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Opens the viewer from a mosaic, which is how it is normally reached. */
function MosaicAndLightbox(args: PPhotoLightboxProps) {
  // `null` is closed. Held by the section rather than the mosaic so the viewer
  // spans the whole set while the preview only knows about its own tiles.
  const [openAt, setOpenAt] = useState<number | null>(null);

  return (
    <div style={{ maxWidth: '40rem' }}>
      <PPhotoMosaic photos={args.photos} onPhotoClick={setOpenAt} />
      <PPhotoLightbox
        {...args}
        index={openAt}
        onClose={() => setOpenAt(null)}
      />
    </div>
  );
}

/** Tap any tile — including "+N" — to open at that photo. */
export const Default: Story = {
  render: (args) => <MosaicAndLightbox {...args} />,
};

/**
 * With `archiveUrl`, a whole-set download sits next to the single-photo one. It
 * is a plain anchor to a pre-built ZIP: no CORS, no fetch, no memory spike, and
 * resume support for free.
 */
export const WithArchiveDownload: Story = {
  args: {
    archiveUrl: 'https://example.invalid/sets/jose-albin-day-1.zip',
  },
  render: (args) => <MosaicAndLightbox {...args} />,
};

/** Opened straight onto a photo, without a trigger. */
export const OpenAtIndex: Story = {
  args: {
    index: 3,
    archiveUrl: 'https://example.invalid/sets/jose-albin-day-1.zip',
  },
};

/** Without a `label`, filenames and announcements drop the set prefix. */
export const Unlabelled: Story = {
  args: {
    label: undefined,
    index: 0,
  },
};

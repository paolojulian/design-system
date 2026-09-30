import { type Meta, type StoryObj } from '@storybook/react';
import { samplePhotos } from '../media/fixtures';
import { PPhotoGrid } from './PPhotoGrid';

const meta = {
  title: 'Pipz/PPhotoGrid',
  component: PPhotoGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A uniform grid of photo tiles, cropped to a fixed aspect ratio so a set mixing portrait and landscape frames still reads as an even grid. Tiles paint the low-resolution `thumb`; the full-size file is left for whatever opens on click.',
      },
    },
  },
  args: {
    photos: samplePhotos(12),
    gap: 'sm',
    aspect: '1 / 1',
  },
  argTypes: {
    columns: {
      description:
        'Column count, or per-breakpoint counts. A bare number steps down through tablet so a phone never gets a contact sheet.',
    },
    onPhotoClick: {
      description:
        'When provided, every tile becomes a button reporting its index. Omit it and the tree is just list items and images.',
    },
    sizes: {
      description: 'Overrides the `sizes` attribute derived from `columns`.',
    },
    renderImage: {
      description:
        'Escape hatch for framework image components, e.g. `(props) => <Image {...props} fill />`.',
      control: false,
    },
  },
} satisfies Meta<typeof PPhotoGrid>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default 2 / 3 / 4 column progression, non-interactive. */
export const Default: Story = {};

/** With `onPhotoClick`, every tile is a labelled button. */
export const Interactive: Story = {
  args: {
    onPhotoClick: () => {},
  },
};

/** A denser grid for large sets. */
export const SixColumns: Story = {
  args: {
    photos: samplePhotos(24),
    columns: { mobile: 3, tablet: 4, desktop: 6 },
    onPhotoClick: () => {},
  },
};

/** Gapless tiles, for a mosaic-wall treatment. */
export const Seamless: Story = {
  args: {
    gap: 'none',
    columns: { mobile: 2, tablet: 4, desktop: 4 },
  },
};

/** A portrait crop, for sets shot vertically. */
export const PortraitTiles: Story = {
  args: {
    aspect: '3 / 4',
    columns: { mobile: 2, tablet: 3, desktop: 5 },
  },
};

/**
 * An empty set renders nothing at all. "No photos yet" and "no photos matched"
 * want different words, so the empty state stays the caller's to design.
 */
export const Empty: Story = {
  args: {
    photos: [],
  },
};

import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { samplePhotos } from '../media/fixtures';
import { PPhotoMosaic, type PPhotoMosaicProps } from './PPhotoMosaic';

const photos = samplePhotos(60);

const meta = {
  title: 'Pipz/PPhotoMosaic',
  component: PPhotoMosaic,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Album preview in the shape Instagram and Facebook use: a wide lead tile above a row of smaller ones, with the rest of the set summarised as "+N" on the last tile. Every tile reports its own index, so a viewer can open at the photo that was tapped.',
      },
    },
  },
  args: {
    photos,
    previewCount: 4,
    gap: 'sm',
    heroAspect: '3 / 2',
    tileAspect: '1 / 1',
  },
  argTypes: {
    previewCount: {
      description: 'Tiles shown before the set is summarised as "+N".',
      control: { type: 'number', min: 1, max: 6 },
    },
    onPhotoClick: {
      description:
        'When provided, every tile becomes a button reporting its index. Omit it for a static preview with nothing focusable.',
    },
    renderImage: {
      description:
        'Escape hatch for framework image components, e.g. `(props) => <Image {...props} fill />`.',
      control: false,
    },
    labels: {
      description: 'Overrides the visible "+N" text and the tiles’ accessible names.',
    },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: '40rem' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof PPhotoMosaic>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The default 1 + 3 layout over a set large enough to overflow. */
export const Default: Story = {
  args: {
    onPhotoClick: () => {},
  },
};

/**
 * Without `onPhotoClick` the tiles render as plain elements — no buttons, nothing
 * for a keyboard or screen reader to step through.
 */
export const Static: Story = {
  args: {
    onPhotoClick: undefined,
  },
};

/** Exactly `previewCount` photos: no overflow tile, because nothing is hidden. */
export const ExactFit: Story = {
  args: {
    photos: samplePhotos(4),
    onPhotoClick: () => {},
  },
};

/** A single photo collapses to the lead tile with no row beneath it. */
export const SinglePhoto: Story = {
  args: {
    photos: samplePhotos(1),
    onPhotoClick: () => {},
  },
};

/**
 * With one preview tile there is no row to hang the count on, so the lead tile
 * carries it instead.
 */
export const HeroOnlyWithOverflow: Story = {
  args: {
    previewCount: 1,
    onPhotoClick: () => {},
  },
};

/** A wider preview row. Columns follow `previewCount - 1` automatically. */
export const FiveTiles: Story = {
  args: {
    previewCount: 5,
    gap: 'md',
    onPhotoClick: () => {},
  },
};

/** A square lead tile, for layouts where the mosaic sits in a narrow column. */
export const SquareHero: Story = {
  args: {
    heroAspect: '1 / 1',
    onPhotoClick: () => {},
  },
};

/** Both the visible count and the accessible names are overridable. */
export const CustomLabels: Story = {
  args: {
    onPhotoClick: () => {},
    labels: {
      overflowCount: (remaining) => `${remaining} more`,
      overflowTile: (remaining) => `Voir ${remaining} photos de plus`,
      photoTile: (photo) => `Ouvrir ${photo.alt}`,
    },
  },
};

/** Reports which index each tile carries — the contract a lightbox is wired onto. */
function IndexReadout(args: PPhotoMosaicProps) {
  const [opened, setOpened] = useState<number | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <PPhotoMosaic {...args} onPhotoClick={(index) => setOpened(index)} />
      <p
        data-testid="opened-index"
        style={{
          margin: 0,
          color: 'var(--p-color-text-muted)',
          fontSize: 'var(--p-font-size-body-sm)',
        }}
      >
        {opened === null ? 'No tile opened yet' : `Opened index ${opened}`}
      </p>
    </div>
  );
}

/** Which index each tile reports — the contract a lightbox is wired onto. */
export const ReportsTheTappedIndex: Story = {
  args: {
    photos: samplePhotos(12),
  },
  render: (args) => <IndexReadout {...args} />,
};

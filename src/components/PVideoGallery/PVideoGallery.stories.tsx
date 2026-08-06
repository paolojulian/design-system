import { type Meta, type StoryObj } from '@storybook/react';
import { sampleVideos } from '../media/fixtures';
import { PVideoGallery } from './PVideoGallery';

const meta = {
  title: 'Components/PVideoGallery',
  component: PVideoGallery,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'A wall of video posters that mounts a player only for the clip that was played. Posters are tens of kilobytes; clips are megabytes, so nothing touches the network for video until someone asks for it. The sample clips below are unplayable placeholders — clicking one still proves the player mounts in place of the poster.',
      },
    },
  },
  args: {
    videos: sampleVideos(9),
    previewCount: 6,
    gap: 'md',
    aspect: '16 / 9',
  },
  argTypes: {
    previewCount: {
      description: 'Posters shown before the expand toggle is used.',
      control: { type: 'number', min: 1, max: 12 },
    },
    columns: {
      description: 'Column count, or per-breakpoint counts.',
    },
    renderImage: {
      description:
        'Escape hatch for framework image components, e.g. `(props) => <Image {...props} fill />`.',
      control: false,
    },
    labels: {
      description: 'Overrides the play button names and the toggle text.',
    },
  },
} satisfies Meta<typeof PVideoGallery>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Six posters and a toggle for the rest. */
export const Default: Story = {};

/** Under `previewCount`, there is nothing to expand and no toggle is rendered. */
export const WithoutToggle: Story = {
  args: {
    videos: sampleVideos(3),
  },
};

/** A long set — the toggle carries the full count so the depth is legible. */
export const LargeSet: Story = {
  args: {
    videos: sampleVideos(24),
    previewCount: 3,
  },
};

/** A single wide column, for clips that deserve the room. */
export const SingleColumn: Story = {
  args: {
    videos: sampleVideos(4),
    columns: { mobile: 1, tablet: 1, desktop: 1 },
    previewCount: 2,
  },
};

/** Vertical clips, cropped to a phone-shaped frame. */
export const VerticalClips: Story = {
  args: {
    videos: sampleVideos(6),
    aspect: '9 / 16',
    columns: { mobile: 2, tablet: 3, desktop: 4 },
    previewCount: 4,
  },
};

/** Every string is overridable. */
export const CustomLabels: Story = {
  args: {
    videos: sampleVideos(8),
    labels: {
      play: (video) => `Lire ${video.name}`,
      showAll: (total) => `Afficher les ${total} clips`,
      showFewer: () => 'Afficher moins',
    },
  },
};

/** An empty set renders nothing, like the photo grids. */
export const Empty: Story = {
  args: {
    videos: [],
  },
};

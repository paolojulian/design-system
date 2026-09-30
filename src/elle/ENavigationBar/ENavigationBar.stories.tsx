import { type Meta, type StoryObj } from '@storybook/react';
import { ENavigationBar } from '.';
import ChevronLeftIcon from '../../icons/chevron-left-icon';
import { EButton } from '../EButton';
import { EList, EListRow } from '../EList';
import { withElleCanvas } from '../ElleCanvas';

const meta: Meta<typeof ENavigationBar> = {
  title: 'Elle/ENavigationBar',
  component: ENavigationBar,
  tags: ['autodocs'],
  globals: { design: 'elle' },
  decorators: [withElleCanvas],
  parameters: {
    layout: 'fullscreen',
    elleCanvas: 'screen',
    docs: {
      description: {
        component:
          'A translucent top bar with a title and actions. It renders exactly one heading, in the bar or, with `largeTitle`, as a large block below it (a static block: it does not collapse on scroll). Sticky by default. Falls back to an opaque surface when the user prefers reduced transparency or more contrast. Import from `@paolojulian.dev/design-system/elle`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ENavigationBar>;

const back = (
  <EButton variant="plain" size="sm" leftIcon={<ChevronLeftIcon />} href="#back">
    Lists
  </EButton>
);

const content = (
  <div className="elle-story elle-story--screen-body">
    <EList header="Today">
      {['Buy oat milk', 'Call the landlord', 'Book dentist', 'Renew passport', 'Water the plants', 'Pay electricity'].map(
        (title) => (
          <EListRow key={title} title={title} href={`#${title}`} />
        ),
      )}
    </EList>
  </div>
);

export const Default: Story = {
  render: () => (
    <>
      <ENavigationBar title="Groceries" leading={back} trailing={<EButton variant="plain" size="sm">Edit</EButton>} />
      {content}
    </>
  ),
};

export const LargeTitle: Story = {
  render: () => (
    <>
      <ENavigationBar
        title="Settings"
        largeTitle
        trailing={
          <EButton variant="plain" size="sm">
            Done
          </EButton>
        }
      />
      {content}
    </>
  ),
};

export const LongTitle: Story = {
  render: () => (
    <ENavigationBar
      title="Quarterly planning notes for the design system team"
      leading={back}
      trailing={<EButton variant="plain" size="sm">Share</EButton>}
    />
  ),
};

export const SectionHeading: Story = {
  render: () => <ENavigationBar title="Inbox" titleAs="h2" sticky={false} />,
};

import { type Meta, type StoryObj } from '@storybook/react';
import { useState, type FormEvent } from 'react';
import { ESegmentedControl, type ESegmentedOption } from '.';
import { EButton } from '../EButton';
import { withElleCanvas } from '../ElleCanvas';

const RANGE: ESegmentedOption[] = [
  { value: 'day', label: 'Day' },
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

const meta: Meta<typeof ESegmentedControl> = {
  title: 'Elle/ESegmentedControl',
  component: ESegmentedControl,
  tags: ['autodocs'],
  globals: { design: 'elle' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'One choice among two to five options, with a sliding thumb. A radio group: Tab reaches the selected option, arrow keys move and select, Home/End jump. Import from `@paolojulian.dev/design-system/elle`.',
      },
    },
  },
  args: {
    options: RANGE,
    'aria-label': 'Calendar range',
  },
  decorators: [
    (Story) => (
      <div className="elle-story elle-story--surface">
        <Story />
      </div>
    ),
    withElleCanvas,
  ],
};

export default meta;
type Story = StoryObj<typeof ESegmentedControl>;

export const Default: Story = {};

export const WithDisabledOption: Story = {
  args: {
    'aria-label': 'Report period',
    options: [
      { value: 'day', label: 'Day' },
      { value: 'week', label: 'Week', disabled: true },
      { value: 'month', label: 'Month' },
      { value: 'year', label: 'Year' },
    ],
  },
};

function ControlledDemo() {
  const [view, setView] = useState<'list' | 'map'>('list');
  return (
    <div className="elle-story">
      <ESegmentedControl
        aria-label="View"
        options={[
          { value: 'list', label: 'List' },
          { value: 'map', label: 'Map' },
        ]}
        value={view}
        onValueChange={setView}
      />
      <p>
        Showing <output data-testid="readout">{view}</output>
      </p>
    </div>
  );
}

export const Controlled: Story = {
  render: () => <ControlledDemo />,
};

function InFormDemo() {
  const [submitted, setSubmitted] = useState('');
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitted([...new FormData(event.currentTarget).entries()].map(([key, value]) => `${key}=${value}`).join('&'));
  };
  return (
    <form className="elle-story" onSubmit={handleSubmit}>
      <ESegmentedControl aria-label="Calendar range" name="range" options={RANGE} />
      <EButton type="submit" size="sm">
        Apply
      </EButton>
      <output data-testid="submitted">{submitted}</output>
    </form>
  );
}

export const InForm: Story = {
  render: () => <InFormDemo />,
};

export const Sizes: Story = {
  render: () => (
    <div className="elle-story">
      <ESegmentedControl aria-label="Medium range" options={RANGE} />
      <ESegmentedControl aria-label="Small range" options={RANGE} size="sm" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const FullWidthOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => (
    <div className="elle-story elle-story--narrow">
      <ESegmentedControl
        aria-label="Inbox filter"
        fullWidth
        options={[
          { value: 'all', label: 'All' },
          { value: 'unread', label: 'Unread' },
          { value: 'flagged', label: 'Flagged' },
          { value: 'archived', label: 'Archived' },
        ]}
      />
    </div>
  ),
};

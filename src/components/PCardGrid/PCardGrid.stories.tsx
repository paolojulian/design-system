import { type Meta, type StoryObj } from '@storybook/react';
import { PCard } from '../PCard';
import { PCardGrid } from './PCardGrid';

const cards = [
  {
    prefix: '01',
    title: 'Portfolio health',
    description: 'Scan account quality and attention areas across the book.',
  },
  {
    prefix: '02',
    title: 'Renewal coverage',
    description: 'Track upcoming renewals, owner readiness, and risk exposure.',
  },
  {
    prefix: '03',
    title: 'Exception queue',
    description: 'Route unresolved approvals before the next operations review.',
  },
  {
    prefix: '04',
    title: 'Executive summary',
    description: 'Keep leadership reporting consistent across teams.',
  },
];

function renderCards(count = 4) {
  return cards.slice(0, count).map((card) => (
    <PCard
      key={card.prefix}
      fullWidth
      minHeight={180}
      prefix={card.prefix}
      title={card.title}
      description={card.description}
    />
  ));
}

const meta = {
  title: 'Components/PCardGrid',
  component: PCardGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    columns: 2,
    gap: 'none',
    children: renderCards(4),
  },
  argTypes: {
    columns: {
      description:
        'Column count or responsive column object. Numeric values keep mobile at one column and cap tablet at two.',
    },
    minCardWidth: {
      description: 'Enables auto-fit grid behavior using this minimum card width.',
    },
    gap: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Spacing between cards. Use none for flush card groups.',
    },
    align: {
      control: 'select',
      options: ['stretch', 'start'],
      description: 'Whether cards stretch to equal row height or align to content height.',
    },
  },
} satisfies Meta<typeof PCardGrid>;

type Story = StoryObj<typeof meta>;

export const TwoAcross: Story = {
  name: 'Two Across',
};

export const FourCards: Story = {
  name: 'Four Cards',
  args: {
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 2,
    },
    children: renderCards(4),
  },
};

export const ThreeAcross: Story = {
  name: 'Three Across',
  args: {
    columns: {
      mobile: 1,
      tablet: 2,
      desktop: 3,
    },
    gap: 'md',
    children: renderCards(4),
  },
};

export const AutoFit: Story = {
  name: 'Auto Fit',
  args: {
    minCardWidth: 260,
    gap: 'none',
    children: renderCards(4),
  },
};

export const AsList: Story = {
  name: 'As List',
  args: {
    as: 'ul',
    columns: 2,
    children: cards.slice(0, 4).map((card) => (
      <li key={card.prefix}>
        <PCard
          fullWidth
          minHeight={180}
          prefix={card.prefix}
          title={card.title}
          description={card.description}
        />
      </li>
    )),
  },
};

export default meta;

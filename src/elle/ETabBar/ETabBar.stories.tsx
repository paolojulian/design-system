import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { ETabBar, type ETabBarItem } from '.';
import { withElleCanvas } from '../ElleCanvas';
import { StoryIcon } from '../ElleStoryIcons';

const ITEMS: ETabBarItem[] = [
  { id: 'home', label: 'Home', icon: <StoryIcon name="home" /> },
  { id: 'search', label: 'Search', icon: <StoryIcon name="search" /> },
  { id: 'inbox', label: 'Inbox', icon: <StoryIcon name="inbox" />, badge: 3 },
  { id: 'settings', label: 'Settings', icon: <StoryIcon name="gear" /> },
];

const meta: Meta<typeof ETabBar> = {
  title: 'Elle/ETabBar',
  component: ETabBar,
  tags: ['autodocs'],
  globals: { design: 'elle' },
  decorators: [withElleCanvas],
  parameters: {
    layout: 'fullscreen',
    elleCanvas: 'screen',
    docs: {
      description: {
        component:
          'Bottom navigation for phones, 2–5 destinations. A `<nav>` of links (`href`) or buttons (`onSelect`), not an ARIA tablist, because it changes pages. The current item has `aria-current="page"`. Labels are always visible; every item is at least 44px; the bottom padding adds the device safe area. Import from `@paolojulian.dev/design-system/elle`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ETabBar>;

function ButtonsDemo() {
  const [activeId, setActiveId] = useState('home');
  return (
    <div className="elle-story elle-story--screen-body">
      <p className="elle-story__note">
        Current: <output data-testid="active">{activeId}</output>
      </p>
      <ETabBar items={ITEMS} activeId={activeId} onSelect={setActiveId} position="static" />
    </div>
  );
}

export const Default: Story = {
  render: () => <ButtonsDemo />,
};

export const Links: Story = {
  render: () => (
    <div className="elle-story elle-story--screen-body">
      <ETabBar
        position="static"
        activeId="search"
        items={ITEMS.map((item) => ({ ...item, href: `#${item.id}`, disabled: item.id === 'settings' }))}
      />
    </div>
  ),
};

export const FixedOnMobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <ETabBar items={ITEMS.slice(0, 3)} activeId="inbox" />,
};

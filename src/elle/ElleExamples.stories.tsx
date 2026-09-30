import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PSwitch } from '../components/PSwitch';
import { EButton } from './EButton';
import { withElleCanvas } from './ElleCanvas';
import { StoryIcon } from './ElleStoryIcons';
import { EList, EListRow } from './EList';
import { ENavigationBar } from './ENavigationBar';
import { ESegmentedControl } from './ESegmentedControl';
import { ETabBar } from './ETabBar';

const meta: Meta = {
  title: 'Elle/Examples',
  globals: { design: 'elle' },
  decorators: [withElleCanvas],
  parameters: {
    layout: 'fullscreen',
    elleCanvas: 'screen',
    docs: {
      description: {
        component: 'Whole screens composed only from Elle components (plus `PSwitch`, which takes the Elle look).',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

function SettingsScreen() {
  const [airplane, setAirplane] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [tab, setTab] = useState('settings');

  return (
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
      <main className="elle-story elle-story--screen-body elle-story--above-tabbar">
        <EList>
          <EListRow
            leading={<StoryIcon name="person" />}
            title="Paolo Julian"
            subtitle="Account, sync, and sign-in"
            href="#account"
          />
        </EList>
        <EList header="Connections">
          <EListRow
            leading={<StoryIcon name="plane" />}
            title="Airplane Mode"
            trailing={
              <PSwitch label="Airplane Mode" checked={airplane} onChange={(event) => setAirplane(event.target.checked)} />
            }
          />
          <EListRow leading={<StoryIcon name="wifi" />} title="Wi-Fi" value={airplane ? 'Off' : 'Home'} href="#wifi" />
          <EListRow
            leading={<StoryIcon name="bell" />}
            title="Notifications"
            trailing={
              <PSwitch
                label="Notifications"
                checked={notifications}
                onChange={(event) => setNotifications(event.target.checked)}
              />
            }
          />
        </EList>
        <EList header="Display" footer="Automatic follows the device setting.">
          <EListRow
            leading={<StoryIcon name="moon" />}
            title="Appearance"
            trailing={
              <ESegmentedControl
                aria-label="Appearance"
                size="sm"
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto' },
                ]}
                defaultValue="auto"
              />
            }
          />
        </EList>
        <EList>
          <EListRow title="Sign Out" tone="destructive" accessory="none" onClick={() => undefined} />
        </EList>
      </main>
      <ETabBar
        activeId={tab}
        onSelect={setTab}
        items={[
          { id: 'home', label: 'Home', icon: <StoryIcon name="home" /> },
          { id: 'search', label: 'Search', icon: <StoryIcon name="search" /> },
          { id: 'inbox', label: 'Inbox', icon: <StoryIcon name="inbox" />, badge: 2 },
          { id: 'settings', label: 'Settings', icon: <StoryIcon name="gear" /> },
        ]}
      />
    </>
  );
}

export const Settings: Story = {
  render: () => <SettingsScreen />,
};

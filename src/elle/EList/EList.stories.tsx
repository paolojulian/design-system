import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { EList, EListRow } from '.';
import { PSwitch } from '../../components/PSwitch';
import { withElleCanvas } from '../ElleCanvas';
import { StoryIcon } from '../ElleStoryIcons';

const meta: Meta<typeof EList> = {
  title: 'Elle/EList',
  component: EList,
  tags: ['autodocs'],
  globals: { design: 'elle' },
  decorators: [withElleCanvas],
  parameters: {
    layout: 'fullscreen',
    elleCanvas: 'page',
    docs: {
      description: {
        component:
          'The Settings-style grouped list. Rows are `EListRow`: a link (`href`), a button (`onClick`), or static. A row with a `trailing` control (e.g. `PSwitch`) is never itself interactive, so controls are never nested. Separators start at the title, not under the icon. Import from `@paolojulian.dev/design-system/elle`.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof EList>;

export const Default: Story = {
  render: () => (
    <EList header="Account" footer="Your name and photo are visible to people you share lists with.">
      <EListRow title="Name" value="Paolo Julian" href="#name" />
      <EListRow title="Email" value="paolo@example.com" href="#email" />
      <EListRow title="Password" href="#password" />
    </EList>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <EList header="Settings">
      <EListRow leading={<StoryIcon name="person" />} title="Profile" subtitle="Name, photo, email" href="#profile" />
      <EListRow leading={<StoryIcon name="bell" />} title="Notifications" value="On" href="#notifications" />
      <EListRow leading={<StoryIcon name="lock" />} title="Privacy" href="#privacy" />
    </EList>
  ),
};

function SwitchDemo() {
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(true);
  return (
    <EList header="Connections">
      <EListRow
        leading={<StoryIcon name="plane" />}
        title="Airplane Mode"
        trailing={<PSwitch label="Airplane Mode" checked={airplane} onChange={(event) => setAirplane(event.target.checked)} />}
      />
      <EListRow
        leading={<StoryIcon name="wifi" />}
        title="Wi-Fi"
        trailing={<PSwitch label="Wi-Fi" checked={wifi} onChange={(event) => setWifi(event.target.checked)} />}
      />
      <EListRow leading={<StoryIcon name="lock" />} title="VPN" value="Not connected" href="#vpn" />
    </EList>
  );
}

export const WithSwitch: Story = {
  render: () => <SwitchDemo />,
};

function RowKindsDemo() {
  const [clicks, setClicks] = useState(0);
  return (
    <>
      <EList header="Row kinds">
        <EListRow title="Privacy" href="#privacy" />
        <EListRow title="Version" value="4.6.6" />
        <EListRow title="Units" value="Metric" accessory="checkmark" />
        <EListRow title="Export data" onClick={() => undefined} disabled />
        <EListRow title="Sign out" tone="destructive" accessory="none" onClick={() => setClicks((count) => count + 1)} />
      </EList>
      <EList footer={<>Sign-out clicks: <output data-testid="clicks">{clicks}</output></>}>
        <EListRow title="Delete account" tone="destructive" onClick={() => undefined} />
      </EList>
    </>
  );
}

export const RowKinds: Story = {
  render: () => <RowKindsDemo />,
};

export const LongText: Story = {
  render: () => (
    <EList header="Shared with" footer="Long names and values wrap rather than clip, and the row grows to fit.">
      <EListRow
        leading={<StoryIcon name="person" />}
        title="Maria Guadalupe Fernández-Castellanos de la Cruz"
        subtitle="maria.guadalupe.fernandez-castellanos@long-company-domain.example.com"
        value="Can edit"
        href="#maria"
      />
      <EListRow title="Weekly summary delivered every Monday morning before work" value="Monday 07:00" href="#summary" />
    </EList>
  ),
};

export const EdgeToEdge: Story = {
  render: () => (
    <EList inset={false} header="Recent">
      <EListRow title="Groceries" subtitle="12 items" href="#groceries" />
      <EListRow title="Weekend trip" subtitle="4 items" href="#trip" />
    </EList>
  ),
};

export const Mobile: Story = {
  parameters: { viewport: { defaultViewport: 'mobile1' } },
  render: () => <SwitchDemo />,
};

/** Test fixture for the dev-time warning; hidden from the sidebar and docs. */
export const ConflictingProps: Story = {
  tags: ['!dev', '!autodocs'],
  render: () => (
    <EList header="Misuse">
      <EListRow title="Bluetooth" onClick={() => undefined} trailing={<PSwitch label="Bluetooth" />} />
    </EList>
  ),
};

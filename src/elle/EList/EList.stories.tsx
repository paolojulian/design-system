import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { EList, EListRow } from '.';
import { PSwitch } from '../../components/PSwitch';
import { withElleCanvas } from '../ElleCanvas';

function Glyph({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  person: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  bell: 'M6 16V11a6 6 0 1 1 12 0v5l1.5 2h-15L6 16Zm4 4h4',
  lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z',
  wifi: 'M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01',
  plane: 'M10 20l2-6-7-3 1-2 8 1 4-6h2l-2 7 4 2-1 2-5-1-3 6z',
};

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
      <EListRow leading={<Glyph d={ICONS.person} />} title="Profile" subtitle="Name, photo, email" href="#profile" />
      <EListRow leading={<Glyph d={ICONS.bell} />} title="Notifications" value="On" href="#notifications" />
      <EListRow leading={<Glyph d={ICONS.lock} />} title="Privacy" href="#privacy" />
    </EList>
  ),
};

function SwitchDemo() {
  const [airplane, setAirplane] = useState(false);
  const [wifi, setWifi] = useState(true);
  return (
    <EList header="Connections">
      <EListRow
        leading={<Glyph d={ICONS.plane} />}
        title="Airplane Mode"
        trailing={<PSwitch label="Airplane Mode" checked={airplane} onChange={(event) => setAirplane(event.target.checked)} />}
      />
      <EListRow
        leading={<Glyph d={ICONS.wifi} />}
        title="Wi-Fi"
        trailing={<PSwitch label="Wi-Fi" checked={wifi} onChange={(event) => setWifi(event.target.checked)} />}
      />
      <EListRow leading={<Glyph d={ICONS.lock} />} title="VPN" value="Not connected" href="#vpn" />
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
        leading={<Glyph d={ICONS.person} />}
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

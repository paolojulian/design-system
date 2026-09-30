import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import {
  PAlert,
  PBadge,
  PButton,
  PCard,
  PCheckbox,
  PFormField,
  PSheet,
  PSwitch,
  PTextInput,
} from '../components';
import { TokenValue } from '../storybook/TokenValue';
import '../storybook/design-language-doc.css';
import './InkTheme.css';

/**
 * Ink is a design language, not a component set: it re-values a few `--p-*`
 * tokens under `data-design="ink"`. These stories pin the `design` global so
 * they always render in Ink; light/dark still follows the toolbar.
 */
const meta: Meta = {
  title: 'Ink/Theme',
  globals: { design: 'ink' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Near-black ink on warm white, soft corners, almost no shadows. Opt in with `import "@paolojulian.dev/design-system/theme-ink.css"` after `theme.css`, then set `data-design="ink"` on `<html>`. No new tokens and no component changes: Ink re-values the action color, radii and shadows, and keeps Pipz’s neutrals, status colors and font.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const ACTION_TOKENS = [
  '--p-color-action-primary',
  '--p-color-action-primary-hover',
  '--p-color-action-primary-subtle',
  '--p-color-focus',
];
/* Shown to make the point that they did not change. */
const KEPT_TOKENS = ['--p-color-background', '--p-color-surface', '--p-color-text', '--p-color-border', '--p-color-danger'];
const RADII = ['xs', 'sm', 'md', 'lg', 'full'];
const SHADOWS = ['sm', 'md', 'lg'];

function Swatches({ tokens }: { tokens: string[] }) {
  return (
    <div className="dl-doc__grid">
      {tokens.map((token) => (
        <div key={token} className="dl-doc__swatch">
          <div className="dl-doc__chip" style={{ background: `var(${token})` }} />
          <span className="dl-doc__token">{token}</span>
          <TokenValue token={token} />
        </div>
      ))}
    </div>
  );
}

export const Tokens: Story = {
  render: () => (
    <div className="dl-doc">
      <section className="dl-doc__section">
        <h2 className="dl-doc__heading">Action</h2>
        <p className="dl-doc__note">
          Ink is the only action color: buttons, links, checkboxes, switches and focus rings. In dark it turns into an
          off-white accent with dark text on it.
        </p>
        <Swatches tokens={ACTION_TOKENS} />
      </section>

      <section className="dl-doc__section">
        <h2 className="dl-doc__heading">Kept from Pipz</h2>
        <p className="dl-doc__note">
          Neutrals, text, borders and status colors are Pipz’s warm stone, unchanged. Red, green and amber appear only
          for status.
        </p>
        <Swatches tokens={KEPT_TOKENS} />
      </section>

      <section className="dl-doc__section">
        <h2 className="dl-doc__heading">Radius</h2>
        <p className="dl-doc__note">8px for controls, buttons and cards; 16px for sheets and modals.</p>
        <div className="dl-doc__grid">
          {RADII.map((radius) => (
            <div key={radius} className="dl-doc__swatch">
              <div className="dl-doc__shape" style={{ borderRadius: `var(--p-radius-${radius})` }} />
              <span className="dl-doc__token">--p-radius-{radius}</span>
              <TokenValue token={`--p-radius-${radius}`} />
            </div>
          ))}
        </div>
      </section>

      <section className="dl-doc__section">
        <h2 className="dl-doc__heading">Shadow</h2>
        <p className="dl-doc__note">
          Nothing in the page casts a shadow (`sm` is empty). Only things floating over it do: menus and toasts (`md`),
          sheets and modals (`lg`).
        </p>
        <div className="dl-doc__grid">
          {SHADOWS.map((shadow) => (
            <div key={shadow} className="dl-doc__swatch ink-doc__shadow-swatch">
              <div
                className="dl-doc__shape ink-doc__floating"
                style={{ boxShadow: `var(--p-shadow-${shadow})` }}
              />
              <span className="dl-doc__token">--p-shadow-{shadow}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};

function SheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <PButton variant="secondary" onClick={() => setOpen(true)}>
        Open sheet
      </PButton>
      <PSheet
        open={open}
        onClose={() => setOpen(false)}
        title="Trip details"
        description="Sheets float over the page, so they keep Ink’s one large shadow and 16px corners."
        footer={<PButton onClick={() => setOpen(false)}>Done</PButton>}
      >
        <p>Lisbon, 12–16 October · 2 guests</p>
      </PSheet>
    </>
  );
}

/** The existing primitives, unchanged, rendered through Ink's tokens. */
export const Components: Story = {
  render: () => (
    <div className="dl-doc">
      <section className="dl-doc__section">
        <h2 className="dl-doc__heading">Existing components in Ink</h2>
        <p className="dl-doc__note">
          Nothing below is an Ink component. These are the Pipz primitives picking up Ink’s tokens, which is what a
          product gets by switching `data-design`.
        </p>
        <div className="dl-doc__panel">
          <div className="dl-doc__row">
            <PButton>Continue</PButton>
            <PButton variant="secondary">Not now</PButton>
            <PButton variant="tertiary">Learn more</PButton>
            <PButton variant="ghost">Skip</PButton>
            <PButton variant="danger">Delete</PButton>
          </div>
          <div className="dl-doc__row">
            <PBadge variant="primary">New</PBadge>
            <PBadge variant="success">Paid</PBadge>
            <PBadge variant="warning">Pending</PBadge>
            <PBadge variant="danger">Failed</PBadge>
            <PBadge variant="info">Beta</PBadge>
            <PBadge>Draft</PBadge>
          </div>
          <div className="dl-doc__fields">
            <PFormField label="Full name" hint="As it appears on your ID.">
              <PTextInput autoComplete="name" />
            </PFormField>
            <PFormField label="Email" error="Enter a valid email address.">
              <PTextInput type="email" autoComplete="email" />
            </PFormField>
          </div>
          <div className="dl-doc__fields">
            <PSwitch label="Trip reminders" description="A day before you leave." defaultChecked />
            <PCheckbox label="Remember this device" defaultChecked />
          </div>
          <div className="dl-doc__fields">
            <PCard eyebrow="Upcoming" title="Lisbon" description="12–16 October · 2 guests" />
            <PCard eyebrow="Past" title="Kyoto" description="3–9 April · 1 guest" />
          </div>
          <PAlert variant="info" title="Check-in opens tomorrow">
            You can add guests until then.
          </PAlert>
          <PAlert variant="success" title="Booking confirmed">
            A receipt is on its way.
          </PAlert>
          <PAlert variant="warning" title="Passport expires soon">
            Some countries need six months’ validity.
          </PAlert>
          <PAlert variant="danger" title="Payment failed">
            Update your card to keep the booking.
          </PAlert>
          <div className="dl-doc__row">
            <SheetDemo />
          </div>
        </div>
      </section>
    </div>
  ),
};

import { type Meta, type StoryObj } from '@storybook/react';
import { PAlert, PBadge, PButton, PCheckbox, PSelect, PSwitch, PTextInput } from '../components';
import { TokenValue } from '../storybook/TokenValue';
import '../storybook/design-language-doc.css';

/**
 * Elle is a design language, not a component set (yet): it re-values the
 * existing `--p-*` token contract under `data-design="elle"`. These stories pin
 * the `design` global so they always render in Elle; light/dark still follows
 * the toolbar.
 */
const meta: Meta = {
  title: 'Elle/Theme',
  globals: { design: 'elle' },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Apple-inspired theming for the design system. Opt in with `import "@paolojulian.dev/design-system/theme-elle.css"` after `theme.css`, then set `data-design="elle"` on `<html>`. No new tokens and no component changes: Elle only re-values the `--p-*` contract.',
      },
    },
  },
};

export default meta;
type Story = StoryObj;

const COLOR_GROUPS: { heading: string; note: string; tokens: string[] }[] = [
  {
    heading: 'Surfaces and text',
    note: 'Grouped backgrounds: a gray page with white cards in light, pure black with lifted grays in dark.',
    tokens: [
      '--p-color-background',
      '--p-color-surface',
      '--p-color-surface-raised',
      '--p-color-surface-subtle',
      '--p-color-border',
      '--p-color-border-strong',
      '--p-color-text',
      '--p-color-text-muted',
      '--p-color-text-subtle',
    ],
  },
  {
    heading: 'Action and status',
    note: 'Apple’s web palette and increased-contrast system colors. The default system colors are not used for text or fills; they measure 1.5–3.6:1 on white.',
    tokens: [
      '--p-color-action-primary',
      '--p-color-action-primary-hover',
      '--p-color-action-primary-subtle',
      '--p-color-focus',
      '--p-color-danger',
      '--p-color-warning',
      '--p-color-success',
      '--p-color-info',
    ],
  },
  {
    heading: 'System grays',
    note: 'The neutral scale is the Human Interface Guidelines gray ramp.',
    tokens: ['0', '50', '100', '200', '300', '400', '500', '600', '700', '800', '900', '950'].map(
      (step) => `--p-color-neutral-${step}`,
    ),
  },
];

const TYPE_STYLES: { label: string; token: string }[] = [
  { label: 'Large Title', token: 'heading-lg' },
  { label: 'Title 1', token: 'heading-md-desktop' },
  { label: 'Title 2', token: 'heading-md' },
  { label: 'Title 3', token: 'heading-sm' },
  { label: 'Body', token: 'body-md' },
  { label: 'Subhead', token: 'body-sm' },
  { label: 'Caption 1', token: 'caption' },
];

const RADII = ['xs', 'sm', 'md', 'lg', 'full'];
const SHADOWS = ['sm', 'md', 'lg'];

export const Tokens: Story = {
  render: () => (
    <div className="dl-doc">
      {COLOR_GROUPS.map((group) => (
        <section key={group.heading} className="dl-doc__section">
          <h2 className="dl-doc__heading">{group.heading}</h2>
          <p className="dl-doc__note">{group.note}</p>
          <div className="dl-doc__grid">
            {group.tokens.map((token) => (
              <div key={token} className="dl-doc__swatch">
                <div className="dl-doc__chip" style={{ background: `var(${token})` }} />
                <span className="dl-doc__token">{token}</span>
                <TokenValue token={token} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="dl-doc__section">
        <h2 className="dl-doc__heading">Type</h2>
        <p className="dl-doc__note">
          iOS text styles at the default Dynamic Type size, set in the system font. Apple does not allow San Francisco
          to be embedded, so other platforms fall back to their own system face.
        </p>
        <div>
          {TYPE_STYLES.map((style) => (
            <div key={style.token} className="dl-doc__type-row">
              <span className="dl-doc__token">
                {style.label} · <TokenValue token={`--p-font-size-${style.token}`} />
              </span>
              <p
                className="dl-doc__type-sample"
                style={{
                  fontSize: `var(--p-font-size-${style.token})`,
                  lineHeight: `var(--p-line-height-${style.token})`,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="dl-doc__section">
        <h2 className="dl-doc__heading">Shape and elevation</h2>
        <div className="dl-doc__grid">
          {RADII.map((radius) => (
            <div key={radius} className="dl-doc__swatch">
              <div className="dl-doc__shape" style={{ borderRadius: `var(--p-radius-${radius})` }} />
              <span className="dl-doc__token">--p-radius-{radius}</span>
              <TokenValue token={`--p-radius-${radius}`} />
            </div>
          ))}
          {SHADOWS.map((shadow) => (
            <div key={shadow} className="dl-doc__swatch">
              <div
                className="dl-doc__shape"
                style={{ borderRadius: 'var(--p-radius-md)', boxShadow: `var(--p-shadow-${shadow})` }}
              />
              <span className="dl-doc__token">--p-shadow-{shadow}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};

/** The existing primitives, unchanged, rendered through Elle's tokens. */
export const Components: Story = {
  render: () => (
    <div className="dl-doc">
      <section className="dl-doc__section">
        <h2 className="dl-doc__heading">Existing components in Elle</h2>
        <p className="dl-doc__note">
          Nothing below is an Elle component. These are the Pipz primitives picking up Elle’s tokens, which is what a
          product gets by switching `data-design` today.
        </p>
        <div className="dl-doc__panel">
          <div className="dl-doc__row">
            <PButton>Continue</PButton>
            <PButton variant="secondary">Not now</PButton>
            <PButton variant="tertiary">Learn more</PButton>
            <PButton variant="danger">Delete</PButton>
          </div>
          <div className="dl-doc__row">
            <PBadge variant="primary">New</PBadge>
            <PBadge variant="success">Active</PBadge>
            <PBadge variant="warning">Pending</PBadge>
            <PBadge variant="danger">Failed</PBadge>
            <PBadge variant="info">Beta</PBadge>
            <PBadge>Draft</PBadge>
          </div>
          <div className="dl-doc__fields">
            <PTextInput label="Full name" helperText="As it appears on your ID." />
            <PTextInput label="Email" isError errorMessage="Enter a valid email address." />
            <PSelect
              label="Region"
              options={[
                { label: 'Asia Pacific', value: 'apac' },
                { label: 'Europe', value: 'eu' },
              ]}
            />
          </div>
          <div className="dl-doc__fields">
            <PSwitch label="Notifications" description="Alerts for mentions and replies." defaultChecked />
            <PCheckbox label="Remember this device" defaultChecked />
          </div>
          <PAlert variant="info" title="Storage almost full">
            You have used 4.6 GB of 5 GB.
          </PAlert>
          <PAlert variant="danger" title="Payment failed">
            Update your card to keep your subscription active.
          </PAlert>
        </div>
      </section>
    </div>
  ),
};

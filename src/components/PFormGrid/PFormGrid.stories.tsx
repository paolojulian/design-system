import { type Meta, type StoryObj } from '@storybook/react';
import { PFormGrid, PFormGridItem } from '.';
import { PFormField } from '../PFormField';
import { PTextInput } from '../PTextInput';
import { PTextArea } from '../PTextArea';
import { PSelect } from '../PSelect';
import { PButton } from '../PButton';

const meta: Meta<typeof PFormGrid> = {
  title: 'Components/PFormGrid',
  component: PFormGrid,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
};

type Story = StoryObj<typeof PFormGrid>;

const countryOptions = [
  { value: 'us', label: 'United States' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'ph', label: 'Philippines' },
  { value: 'de', label: 'Germany' },
];

const planOptions = [
  { value: 'starter', label: 'Starter' },
  { value: 'growth', label: 'Growth' },
  { value: 'enterprise', label: 'Enterprise' },
];

function BillingForm() {
  return (
    <form style={{ maxWidth: 720 }} onSubmit={(event) => event.preventDefault()}>
      <PFormGrid>
        <PFormField label="First name" required>
          <PTextInput autoComplete="given-name" defaultValue="Dana" />
        </PFormField>
        <PFormField label="Last name" required>
          <PTextInput autoComplete="family-name" defaultValue="Whitfield" />
        </PFormField>

        <PFormGridItem span="full">
          <PFormField label="Company" hint="Shown on every invoice.">
            <PTextInput defaultValue="Acme Robotics, Inc." />
          </PFormField>
        </PFormGridItem>

        <PFormField label="Billing email" required error="Enter a valid email address.">
          <PTextInput type="email" defaultValue="billing@acme" />
        </PFormField>
        <PFormField label="Country" required>
          <PSelect options={countryOptions} defaultValue="us" />
        </PFormField>

        <PFormField label="Plan">
          <PSelect options={planOptions} defaultValue="growth" />
        </PFormField>
        <PFormField label="Seats" hint="Billed per active seat.">
          <PTextInput type="number" defaultValue="24" />
        </PFormField>

        <PFormGridItem span="full">
          <PFormField label="Notes for the finance team">
            <PTextArea defaultValue="Please send invoices on the 1st of each month." />
          </PFormField>
        </PFormGridItem>
      </PFormGrid>

      <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
        <PButton type="submit">Save billing details</PButton>
        <PButton type="button" variant="secondary">
          Cancel
        </PButton>
      </div>
    </form>
  );
}

export const EnterpriseForm: Story = {
  name: 'Enterprise Form',
  render: () => <BillingForm />,
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  parameters: {
    viewport: { defaultViewport: 'mobile1' },
  },
  render: () => <BillingForm />,
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: {
      default: 'Dark',
      values: [{ name: 'Dark', value: '#111111' }],
    },
  },
  // Render on the real theme background so contrast reflects the app surface.
  render: () => (
    <div style={{ background: 'var(--p-color-background)', padding: 24 }}>
      <BillingForm />
    </div>
  ),
};

export default meta;

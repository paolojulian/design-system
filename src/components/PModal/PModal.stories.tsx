import { type Meta, type StoryObj } from '@storybook/react';
import { useState } from 'react';
import { PButton } from '../PButton';
import { PTextInput } from '../PTextInput';
import { PModal, type PModalProps } from '.';

type HarnessProps = PModalProps & { defaultOpen?: boolean; triggerLabel?: string };

/**
 * Interactive harness — PModal is controlled, so stories own the open state and
 * render the real trigger button so focus-restore-to-trigger can be exercised.
 */
function ModalHarness({ defaultOpen = false, triggerLabel = 'Open modal', ...props }: HarnessProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <>
      <PButton onClick={() => setOpen(true)}>{triggerLabel}</PButton>
      <PModal {...props} open={open} onClose={() => setOpen(false)} />
    </>
  );
}

const meta: Meta<typeof ModalHarness> = {
  title: 'Pipz/PModal',
  component: PModal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    title: 'Rename workspace',
    description: 'Choose a name your team will recognize.',
    size: 'md',
    children: (
      <p>
        Workspace names are visible to every member. Changing it updates links and
        breadcrumbs immediately.
      </p>
    ),
  },
  render: (args) => <ModalHarness {...(args as HarnessProps)} />,
};

type Story = StoryObj<typeof ModalHarness>;

export const Default: Story = {};

export const LongContent: Story = {
  name: 'Long Scrolling Content',
  args: {
    defaultOpen: true,
    title: 'Terms of service',
    description: 'Review before continuing.',
    children: (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {Array.from({ length: 24 }, (_, index) => (
          <p key={index}>
            {index + 1}. Each member is responsible for the security of their credentials
            and for any activity performed under their account within the workspace.
          </p>
        ))}
      </div>
    ),
    footer: (
      <>
        <PButton variant="tertiary">Decline</PButton>
        <PButton>Accept</PButton>
      </>
    ),
  },
};

export const WithForm: Story = {
  name: 'With Form',
  args: {
    defaultOpen: true,
    title: 'Invite teammate',
    description: 'They will receive an email invitation.',
    children: (
      <form style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <PTextInput label="Full name" />
        <PTextInput label="Email" type="email" />
      </form>
    ),
    footer: (
      <>
        <PButton variant="tertiary">Cancel</PButton>
        <PButton>Send invite</PButton>
      </>
    ),
  },
};

export const DestructiveConfirm: Story = {
  name: 'Destructive Confirm',
  args: {
    defaultOpen: true,
    danger: true,
    size: 'sm',
    title: 'Delete project',
    description: 'This permanently removes the project and all of its data.',
    children: <p>This action cannot be undone. Type the project name to confirm in the next step.</p>,
    footer: (
      <>
        <PButton variant="tertiary">Cancel</PButton>
        <PButton variant="danger">Delete project</PButton>
      </>
    ),
  },
};

export const MobileViewport: Story = {
  name: 'Mobile Viewport',
  args: { defaultOpen: true },
  parameters: { viewport: { defaultViewport: 'mobile1' } },
};

export const DarkTheme: Story = {
  name: 'Dark Theme',
  args: {
    defaultOpen: true,
    footer: (
      <>
        <PButton variant="tertiary">Cancel</PButton>
        <PButton>Save</PButton>
      </>
    ),
  },
  globals: { theme: 'dark' },
  parameters: {
    backgrounds: { default: 'Dark', values: [{ name: 'Dark', value: '#111111' }] },
  },
};

export default meta;

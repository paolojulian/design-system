import { type Meta, type StoryObj } from "@storybook/react";
import { PBadge } from ".";

function DotIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <circle cx="8" cy="8" r="4" />
    </svg>
  );
}

const meta: Meta<typeof PBadge> = {
  title: "Components/PBadge",
  component: PBadge,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    children: "Active",
    variant: "neutral",
    size: "sm",
    appearance: "subtle",
  },
  argTypes: {
    as: {
      description: "Rendered element. Defaults to span for inline status text.",
    },
    variant: {
      control: "select",
      options: ["primary", "danger", "warning", "success", "info", "neutral"],
      description: "Semantic status color.",
    },
    size: {
      control: "select",
      options: ["sm", "md"],
      description: "Badge density.",
    },
    appearance: {
      control: "select",
      options: ["subtle", "solid", "outline"],
      description: "Visual treatment for the badge.",
    },
    isPinging: {
      description:
        "Adds a border ping animation for live or attention-seeking status.",
    },
    leftIcon: {
      description: "Decorative icon rendered before the label.",
    },
    rightIcon: {
      description: "Decorative icon rendered after the label.",
    },
  },
};

type Story = StoryObj<typeof PBadge>;

export const Default: Story = {
  name: "Default",
};

export const Variants: Story = {
  name: "Variants",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      <PBadge variant="primary">Primary</PBadge>
      <PBadge variant="success">Approved</PBadge>
      <PBadge variant="warning">Pending</PBadge>
      <PBadge variant="danger">Blocked</PBadge>
      <PBadge variant="info">Info</PBadge>
      <PBadge variant="neutral">Draft</PBadge>
    </div>
  ),
};

export const Appearances: Story = {
  name: "Appearances",
  render: () => (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
      <PBadge variant="success" appearance="subtle">
        Subtle
      </PBadge>
      <PBadge variant="success" appearance="solid">
        Solid
      </PBadge>
      <PBadge variant="success" appearance="outline">
        Outline
      </PBadge>
    </div>
  ),
};

export const Sizes: Story = {
  name: "Sizes",
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
      <PBadge size="sm">Small</PBadge>
      <PBadge size="md">Medium</PBadge>
    </div>
  ),
};

export const WithIcon: Story = {
  name: "With Icon",
  args: {
    variant: "success",
    leftIcon: <DotIcon />,
    children: "Online",
  },
};

export const Pinging: Story = {
  name: "Pinging",
  args: {
    variant: "success",
    leftIcon: <DotIcon />,
    isPinging: true,
    children: "Live",
  },
};

export const Truncated: Story = {
  name: "Truncated",
  decorators: [
    (Story) => (
      <div style={{ width: 120 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    variant: "info",
    children: "Long status label",
    style: { width: "100%" },
  },
};

export default meta;

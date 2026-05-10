import { type Meta, type StoryObj } from "@storybook/react";
import { NewTabArrowIcon } from "../../icons";
import { PButton } from "../PButton";
import { PCard } from ".";

function OperationsLinkMeta() {
  return (
    <>
      <span>Operations</span>
      <NewTabArrowIcon />
    </>
  );
}

const meta: Meta<typeof PCard> = {
  title: "Components/PCard",
  component: PCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: {
    prefix: "01",
    title: "Pipeline overview",
    description: "A compact summary card for scanning enterprise workflows.",
  },
  argTypes: {
    prefix: {
      description: "Short leading metadata, often a sequence number.",
    },
    eyebrow: {
      description: "Short trailing metadata, category, or status text.",
    },
    title: {
      description: "Main card heading.",
    },
    description: {
      description: "Optional supporting copy.",
    },
    media: {
      description: "Optional media/content rendered at the top of the card.",
    },
    actions: {
      description: "Optional action slot rendered at the bottom.",
    },
    density: {
      control: "select",
      options: ["compact", "default", "spacious"],
      description: "Controls the card padding and minimum height.",
    },
    fullWidth: {
      description: "Expands the card to fill its container.",
    },
    width: {
      description:
        "Overrides the card width. Useful for fixed-width slider cards.",
    },
    minWidth: {
      description:
        "Sets the minimum card width for fixed card rows and slider items.",
    },
    height: {
      description: "Overrides the card height for fixed-size card layouts.",
    },
    minHeight: {
      description:
        "Sets the minimum card height while still allowing taller content.",
    },
    href: {
      description:
        "When provided, the title becomes a link and the whole card gets an interactive state.",
    },
  },
};

type Story = StoryObj<typeof PCard>;

export const Default: Story = {
  name: "Default",
};

export const WithActions: Story = {
  name: "With Actions",
  args: {
    title: "Contract queue",
    description:
      "Review pending approvals and route exceptions before the next close cycle.",
    actions: (
      <>
        <PButton size="sm">Review</PButton>
        <PButton size="sm" variant="secondary">
          Export
        </PButton>
      </>
    ),
  },
};

export const WithMetadata: Story = {
  name: "With Metadata",
  args: {
    prefix: "01",
    eyebrow: "Operations",
    title: "Pipeline overview",
    description: "A compact summary card for scanning enterprise workflows.",
  },
};

export const WithoutDescription: Story = {
  name: "Without Description",
  args: {
    prefix: "02",
    eyebrow: "Queue",
    title: "Title-only card",
    description: null,
  },
};

export const WithMedia: Story = {
  name: "With Media",
  args: {
    title: "Account health",
    description:
      "A visual block can be supplied without changing card structure.",
    media: (
      <div
        style={{
          minHeight: 128,
          background:
            "linear-gradient(135deg, var(--p-color-surface-subtle), var(--p-color-action-primary-subtle))",
        }}
      />
    ),
  },
};

export const CustomWidth: Story = {
  name: "Custom Width",
  args: {
    width: 800,
    prefix: "03",
    title: "Wide title-only card",
    description: null,
  },
};

export const CustomHeight: Story = {
  name: "Custom Height",
  args: {
    width: 320,
    height: 240,
    prefix: "04",
    title: "Fixed height card",
    description: "Height can be controlled for consistent card rows.",
  },
};

export const MinSizing: Story = {
  name: "Min Sizing",
  args: {
    minWidth: 360,
    minHeight: 220,
    prefix: "05",
    title: "Minimum size card",
    description:
      "Minimum sizing keeps rows stable while still allowing content to grow.",
  },
};

export const Interactive: Story = {
  name: "Interactive",
  args: {
    href: "#",
    prefix: "06",
    eyebrow: <OperationsLinkMeta />,
    title: "Open account summary",
    description:
      "The title is the link target while the full card receives hover and focus treatment.",
  },
};

export const Densities: Story = {
  name: "Densities",
  render: () => (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
      <PCard
        density="compact"
        prefix="01"
        title="Compact"
        description="Tighter spacing."
      />
      <PCard prefix="02" title="Default" description="Balanced spacing." />
      <PCard
        density="spacious"
        prefix="03"
        title="Spacious"
        description="More breathing room."
      />
    </div>
  ),
};

export default meta;

import { type Meta, type StoryObj } from "@storybook/react";
import { PSectionHeader } from ".";
import { P_COLORS } from "../../constants";

const meta: Meta<typeof PSectionHeader> = {
  title: "Components/PSectionHeader",
  component: PSectionHeader,
  parameters: {
    backgrounds: {
      values: [{ name: "Dark", value: P_COLORS.black }],
    },
  },
};

type Story = StoryObj<typeof PSectionHeader>;

export const Default: Story = {
  name: "Default",
  args: {
    title: "SECTION HEADER",
  },
  parameters: {
    backgrounds: {
      default: "light",
    },
  },
};

export const Indexed: Story = {
  name: "Indexed",
  parameters: {
    backgrounds: {
      default: "light",
    },
  },
  args: {
    title: "Portfolio Health",
    index: "01",
    variant: "indexed",
  },
};

export default meta;

import { type Meta, type StoryObj } from "@storybook/react";
import { useState } from "react";
import { PBadge } from "../PBadge";
import { PButton } from "../PButton";
import {
  PTable,
  type PTableColumn,
  type PTableProps,
  type PTableSortDirection,
} from "./PTable";

type Account = {
  id: string;
  account: string;
  owner: string;
  region: string;
  health: "Healthy" | "Watch" | "Blocked";
  arr: string;
  renewal: string;
  risk: string;
};

const accounts: Account[] = [
  {
    id: "acme",
    account: "Acme Industrial",
    owner: "Nina Patel",
    region: "North America",
    health: "Healthy",
    arr: "$420K",
    renewal: "Jun 18, 2026",
    risk: "Low",
  },
  {
    id: "northstar",
    account: "Northstar Logistics",
    owner: "Samuel Lee",
    region: "APAC",
    health: "Watch",
    arr: "$310K",
    renewal: "Jul 2, 2026",
    risk: "Medium",
  },
  {
    id: "verdan",
    account: "Verdan Energy",
    owner: "Mara Chen",
    region: "EMEA",
    health: "Blocked",
    arr: "$680K",
    renewal: "May 29, 2026",
    risk: "High",
  },
  {
    id: "atlas",
    account: "Atlas Finance",
    owner: "Owen Brooks",
    region: "North America",
    health: "Healthy",
    arr: "$215K",
    renewal: "Aug 11, 2026",
    risk: "Low",
  },
];

function getHealthVariant(health: Account["health"]) {
  if (health === "Healthy") {
    return "success";
  }

  if (health === "Blocked") {
    return "danger";
  }

  return "warning";
}

const accountColumns: PTableColumn<Account>[] = [
  {
    id: "account",
    header: "Account",
    accessor: "account",
    priority: "primary",
    sortable: true,
    sortDirection: "ascending",
    width: "28%",
  },
  {
    id: "owner",
    header: "Owner",
    accessor: "owner",
    priority: "secondary",
    sortable: true,
  },
  {
    id: "health",
    header: "Health",
    priority: "secondary",
    cell: (row) => (
      <PBadge variant={getHealthVariant(row.health)} appearance="subtle">
        {row.health}
      </PBadge>
    ),
  },
  {
    id: "arr",
    header: "ARR",
    accessor: "arr",
    align: "end",
    priority: "secondary",
    sortable: true,
  },
  {
    id: "renewal",
    header: "Renewal",
    accessor: "renewal",
    priority: "tertiary",
  },
  {
    id: "region",
    header: "Region",
    accessor: "region",
    priority: "tertiary",
    hideOnMobile: true,
  },
  {
    id: "risk",
    header: "Risk",
    accessor: "risk",
    priority: "tertiary",
  },
];

function AccountTable(props: PTableProps<Account>) {
  return <PTable<Account> {...props} />;
}

function InteractiveRowsStory(args: PTableProps<Account>) {
  const [status, setStatus] = useState("No account selected");

  return (
    <div style={{ display: "grid", gap: "1rem" }}>
      <PTable<Account>
        {...args}
        caption="Selectable accounts"
        summary={status}
        onRowClick={(row) => setStatus(`Selected ${row.account}`)}
        renderRowActions={(row) => (
          <PButton
            size="sm"
            variant="secondary"
            onClick={() => setStatus(`Reviewing ${row.account}`)}
          >
            Review
          </PButton>
        )}
      />
    </div>
  );
}

const meta = {
  title: "Components/PTable",
  component: AccountTable,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
  args: {
    caption: "Enterprise accounts",
    summary:
      "Sorted by account priority. Mobile turns rows into scannable records.",
    columns: accountColumns,
    rows: accounts,
    getRowId: (row: Account) => row.id,
    getRowTone: (row: Account) => {
      if (row.health === "Blocked") {
        return "danger";
      }

      if (row.health === "Watch") {
        return "warning";
      }

      return "success";
    },
  },
  argTypes: {
    caption: {
      description:
        "Accessible table name and visible heading unless captionHidden is true.",
    },
    summary: {
      description: "Optional concise context shown above the table.",
    },
    density: {
      control: "select",
      options: ["compact", "standard", "spacious"],
      description: "Controls row height and information density.",
    },
    stickyHeader: {
      description:
        "Keeps column headers visible inside the horizontal scroll viewport.",
    },
    stickyFirstColumn: {
      description:
        "Pins the first column on wider screens for dense enterprise tables.",
    },
    isLoading: {
      description: "Shows the loading state while data is being fetched.",
    },
    renderRowActions: {
      control: false,
    },
    onSortChange: {
      control: false,
    },
    onRowClick: {
      control: false,
    },
  },
} satisfies Meta<typeof AccountTable>;

type Story = StoryObj<typeof meta>;

export const Standard: Story = {
  name: "Standard",
};

export const CompactFinancial: Story = {
  name: "Compact Financial",
  args: {
    density: "compact",
    caption: "Revenue exposure",
    summary:
      "Compact mode keeps finance review tables dense without losing the mobile record layout.",
  },
};

export const WithActions: Story = {
  name: "With Actions",
  args: {
    caption: "Account review queue",
    summary:
      "Action columns stay pinned to the end of the table on wide screens.",
    renderRowActions: (row: Account) => (
      <PButton size="sm" variant="secondary">
        Review {row.account}
      </PButton>
    ),
    onRowClick: () => undefined,
  },
};

export const InteractiveRows: Story = {
  name: "Interactive Rows",
  render: (args) => <InteractiveRowsStory {...args} />,
};

export const Loading: Story = {
  name: "Loading",
  args: {
    isLoading: true,
    rows: [],
    caption: "Loading accounts",
    summary:
      "Use this state while API calls or infinite loading batches are in flight.",
  },
};

export const Empty: Story = {
  name: "Empty",
  args: {
    rows: [],
    caption: "Filtered accounts",
    summary:
      "Empty states stay inside the same table frame on desktop and the same record shell on mobile.",
    emptyState: {
      title: "No matching accounts",
      description: "Clear filters or broaden the territory selection.",
      action: (
        <PButton size="sm" variant="secondary">
          Clear filters
        </PButton>
      ),
    },
  },
};

export const ErrorState: Story = {
  name: "Error State",
  args: {
    rows: [],
    caption: "Account sync",
    summary: "Error states are explicit and still preserve the table contract.",
    errorState: {
      title: "Unable to load accounts",
      description: "The account service did not respond. Retry the request.",
      tone: "danger",
      action: (
        <PButton size="sm" variant="secondary">
          Retry
        </PButton>
      ),
    },
  },
};

export const ControlledSorting: Story = {
  name: "Controlled Sorting",
  args: {
    caption: "Sorted account book",
    columns: accountColumns.map((column) =>
      column.id === "arr"
        ? { ...column, sortDirection: "descending" as PTableSortDirection }
        : { ...column, sortDirection: null },
    ),
    summary:
      "Header sort buttons expose aria-sort and return the requested direction.",
    onSortChange: () => undefined,
  },
};

export default meta;

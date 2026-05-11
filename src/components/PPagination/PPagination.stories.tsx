import { useState } from 'react';
import { type Meta, type StoryObj } from '@storybook/react';
import { PPagination } from './PPagination';

const meta = {
  title: 'Components/PPagination',
  component: PPagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
  args: {
    page: 6,
    pageCount: 24,
    totalItems: 476,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    itemLabel: 'records',
  },
  argTypes: {
    page: {
      description: 'The current one-based page index.',
    },
    pageCount: {
      description: 'Known total page count. Omit for cursor-based pagination.',
    },
    totalItems: {
      description: 'Known total item count used for the range summary.',
    },
    pageSize: {
      description: 'Current page size used for range calculations and page-size control.',
    },
    pageSizeOptions: {
      description: 'Available page sizes. Shown only when onPageSizeChange is provided.',
    },
    hasPreviousPage: {
      description: 'Overrides previous availability for cursor-based APIs.',
    },
    hasNextPage: {
      description: 'Overrides next availability for cursor-based APIs.',
    },
    density: {
      control: 'select',
      options: ['standard', 'compact'],
      description: 'Adjusts control height and type scale.',
    },
    onPageChange: {
      control: false,
    },
    onPageSizeChange: {
      control: false,
    },
  },
} satisfies Meta<typeof PPagination>;

type Story = StoryObj<typeof meta>;

function ControlledPagination() {
  const [page, setPage] = useState(6);
  const [pageSize, setPageSize] = useState(20);

  return (
    <PPagination
      page={page}
      pageCount={24}
      totalItems={476}
      pageSize={pageSize}
      pageSizeOptions={[10, 20, 50, 100]}
      itemLabel="records"
      onPageChange={setPage}
      onPageSizeChange={(nextPageSize) => {
        setPageSize(nextPageSize);
        setPage(1);
      }}
    />
  );
}

function CursorPagination() {
  const [page, setPage] = useState(3);

  return (
    <PPagination
      page={page}
      hasPreviousPage={page > 1}
      hasNextPage
      summary={`Loaded cursor page ${page}`}
      onPageChange={setPage}
    />
  );
}

export const Standard: Story = {
  name: 'Standard',
  render: () => <ControlledPagination />,
};

export const Compact: Story = {
  name: 'Compact',
  args: {
    density: 'compact',
    page: 2,
    pageCount: 5,
    totalItems: 94,
    pageSize: 20,
    pageSizeOptions: undefined,
  },
};

export const CursorBased: Story = {
  name: 'Cursor Based',
  render: () => <CursorPagination />,
};

export const Loading: Story = {
  name: 'Loading',
  args: {
    isLoading: true,
    page: 6,
    pageCount: 24,
    totalItems: 476,
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
  },
};

export const Boundary: Story = {
  name: 'Boundary',
  args: {
    page: 1,
    pageCount: 1,
    totalItems: 8,
    pageSize: 20,
  },
};

export default meta;

import { useEffect, useMemo, useState } from 'react';
import { type Meta, type StoryObj } from '@storybook/react';
import { PCombobox, type PComboboxOption } from '.';
import { PTextInput } from '../PTextInput';

const peopleOptions: PComboboxOption[] = [
  {
    value: 'ava-rodriguez',
    label: 'Ava Rodriguez',
    description: 'VP Operations',
    group: 'Leadership',
    meta: 'US',
    keywords: ['ops', 'executive'],
  },
  {
    value: 'marcus-chen',
    label: 'Marcus Chen',
    description: 'Enterprise Account Director',
    group: 'Sales',
    meta: 'APAC',
    keywords: ['accounts', 'revenue'],
  },
  {
    value: 'nina-patel',
    label: 'Nina Patel',
    description: 'Principal Solutions Architect',
    group: 'Technical',
    meta: 'EMEA',
    keywords: ['architecture', 'implementation'],
  },
  {
    value: 'samuel-lee',
    label: 'Samuel Lee',
    description: 'Security Review Lead',
    group: 'Technical',
    meta: 'SOC 2',
    keywords: ['security', 'compliance'],
  },
  {
    value: 'elena-wright',
    label: 'Elena Wright',
    description: 'Finance Partner',
    group: 'Finance',
    meta: 'FY26',
    keywords: ['budget', 'procurement'],
  },
  {
    value: 'blocked-vendor',
    label: 'Legacy Vendor Queue',
    description: 'Unavailable while procurement is locked',
    group: 'Finance',
    meta: 'Locked',
    disabled: true,
  },
];

const accountOptions: PComboboxOption[] = [
  { value: 'northstar-bank', label: 'Northstar Bank', description: 'Strategic account', meta: 'Tier 1' },
  { value: 'atlas-health', label: 'Atlas Health', description: 'Renewal in progress', meta: 'Q3' },
  { value: 'helio-grid', label: 'Helio Grid', description: 'Security review pending', meta: 'Risk' },
  { value: 'summit-retail', label: 'Summit Retail', description: 'Expansion opportunity', meta: 'Plus' },
  { value: 'cobalt-air', label: 'Cobalt Air', description: 'Implementation complete', meta: 'Live' },
];

const accountDirectoryOptions: PComboboxOption[] = Array.from({ length: 72 }, (_, index) => {
  const regions = ['North America', 'EMEA', 'APAC', 'LATAM'];
  const stages = ['Discovery', 'Security review', 'Implementation', 'Renewal', 'Expansion', 'Procurement'];
  const tiers = ['Tier 1', 'Tier 2', 'Strategic'];
  const number = index + 1;
  const region = regions[index % regions.length];
  const stage = stages[index % stages.length];

  return {
    value: `account-${number}`,
    label: `${['Northstar', 'Atlas', 'Helio', 'Summit', 'Cobalt', 'Vector'][index % 6]} ${number}`,
    description: `${stage} account in ${region}`,
    group: region,
    meta: tiers[index % tiers.length],
    keywords: [stage, region, tiers[index % tiers.length]],
  };
});

const asyncPageSize = 12;

function AsyncInfiniteComboboxExample() {
  const [query, setQuery] = useState('');
  const [options, setOptions] = useState<PComboboxOption[]>([]);
  const [selectedValue, setSelectedValue] = useState('');
  const [selectedOption, setSelectedOption] = useState<PComboboxOption | null>(null);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const matchingOptions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    if (!normalizedQuery) {
      return accountDirectoryOptions;
    }

    return accountDirectoryOptions.filter((option) =>
      [option.label, option.description, option.group, option.meta, ...(option.keywords ?? [])]
        .filter(Boolean)
        .join(' ')
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [query]);

  useEffect(() => {
    setIsLoading(true);
    setOptions([]);
    setPage(0);

    const timeoutId = setTimeout(() => {
      setOptions(matchingOptions.slice(0, asyncPageSize));
      setHasMore(matchingOptions.length > asyncPageSize);
      setIsLoading(false);
    }, 320);

    return () => clearTimeout(timeoutId);
  }, [matchingOptions]);

  const handleLoadMore = () => {
    if (isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    setTimeout(() => {
      const nextPage = page + 1;
      const nextOptions = matchingOptions.slice(0, (nextPage + 1) * asyncPageSize);

      setOptions(nextOptions);
      setPage(nextPage);
      setHasMore(nextOptions.length < matchingOptions.length);
      setIsLoadingMore(false);
    }, 360);
  };

  return (
    <PCombobox
      label="Account API"
      options={options}
      value={selectedValue}
      selectedOption={selectedOption}
      query={query}
      filterMode="none"
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={handleLoadMore}
      onQueryChange={(nextQuery, details) => {
        if (details.source === 'input' || details.source === 'open' || details.source === 'clear') {
          setQuery(nextQuery);
        }
      }}
      onValueChange={(nextValue, option) => {
        setSelectedValue(nextValue);
        setSelectedOption(option);
      }}
      placeholder="Search account directory"
      searchPlaceholder="Type an account, stage, or region"
      emptyText="No accounts match this search."
      loadingText="Loading accounts..."
      loadingMoreText="Loading more accounts..."
      loadMoreText="Load next page"
      helperText="Remote mode: parent owns API search, option pages, and selected records."
    />
  );
}

function SelectedOptionMismatchExample() {
  return (
    <PCombobox
      label="Mismatched owner"
      options={peopleOptions}
      value="nina-patel"
      selectedOption={peopleOptions[0]}
      helperText="The displayed label must follow the selected value, not a stale selectedOption object."
    />
  );
}

const meta: Meta<typeof PCombobox> = {
  title: 'Components/PCombobox',
  component: PCombobox,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <div style={{ width: 380 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    label: 'Owner',
    options: peopleOptions,
  },
  argTypes: {
    label: {
      description: 'Visible field label.',
    },
    options: {
      description: 'Searchable listbox options. Descriptions, groups, metadata, keywords, and disabled rows are supported.',
    },
    value: {
      description: 'Controlled selected option value.',
    },
    defaultValue: {
      description: 'Initial selected option value for uncontrolled usage.',
    },
    onValueChange: {
      description: 'Called with the option value and full option record. Clear emits an empty value and null option.',
    },
    query: {
      description: 'Controlled search query for remote/API-backed comboboxes.',
    },
    onQueryChange: {
      description: 'Called when the user searches, opens, clears, selects, or resets the combobox query.',
    },
    filterMode: {
      control: 'select',
      options: ['local', 'none'],
      description: 'Use local for built-in filtering or none when options already come filtered from an API.',
    },
    isLoading: {
      description: 'Shows an initial or refreshing loading state while remote options are being fetched.',
    },
    isLoadingMore: {
      description: 'Shows the paginated loading state at the bottom of the list.',
    },
    hasMore: {
      description: 'Signals that additional pages are available.',
    },
    onLoadMore: {
      description: 'Called when the scroll area reaches the end or the user activates the load-more action.',
    },
    placeholder: {
      description: 'Text shown before a value is selected.',
    },
    searchPlaceholder: {
      description: 'Text shown while the listbox is open.',
    },
    emptyText: {
      description: 'Shown when no options match the search query.',
    },
    helperText: {
      description: 'Shown below the combobox when there is no error.',
    },
    isError: {
      description: 'Puts the combobox into an error state.',
    },
    errorMessage: {
      description: 'Shown below the combobox when `isError` is true.',
    },
    clearable: {
      description: 'Shows a clear action when a value is selected.',
    },
  },
};

type Story = StoryObj<typeof PCombobox>;

export const Standard: Story = {
  name: 'Standard',
  args: {
    label: 'Account owner',
    placeholder: 'Select owner',
    helperText: 'Search by name, role, region, or responsibility.',
  },
};

export const Filled: Story = {
  name: 'Filled',
  args: {
    label: 'Account owner',
    defaultValue: 'nina-patel',
    helperText: 'Selected values submit through the hidden form input.',
  },
};

export const AccountPicker: Story = {
  name: 'Account Picker',
  args: {
    label: 'Account',
    options: accountOptions,
    placeholder: 'Select account',
    searchPlaceholder: 'Search accounts',
    helperText: 'Optimized for dense enterprise records with status metadata.',
  },
};

export const AsyncInfiniteLoading: Story = {
  name: 'Async Infinite Loading',
  render: () => <AsyncInfiniteComboboxExample />,
};

export const WithoutClear: Story = {
  name: 'Without Clear',
  args: {
    label: 'Required owner',
    defaultValue: 'ava-rodriguez',
    clearable: false,
    required: true,
  },
};

export const SelectedOptionMismatch: Story = {
  name: 'Selected Option Mismatch',
  render: () => <SelectedOptionMismatchExample />,
};

export const RequiredFormField: Story = {
  name: 'Required Form Field',
  render: () => (
    <form>
      <PCombobox
        label="Required approver"
        name="approvalOwner"
        options={peopleOptions}
        placeholder="Select approver"
        required
      />
      <button type="submit">Submit</button>
    </form>
  ),
};

export const EmptyResults: Story = {
  name: 'Empty Results',
  args: {
    label: 'Region',
    options: [],
    emptyText: 'No regions are available.',
  },
};

export const WithError: Story = {
  name: 'With Error',
  args: {
    label: 'Approval owner',
    isError: true,
    errorMessage: 'Select an approval owner before submitting.',
  },
};

export const ReadOnly: Story = {
  name: 'Read Only',
  args: {
    label: 'Locked owner',
    defaultValue: 'samuel-lee',
    readOnly: true,
    helperText: 'This assignment is managed by policy.',
  },
};

export const Disabled: Story = {
  name: 'Disabled',
  args: {
    label: 'Disabled owner',
    defaultValue: 'elena-wright',
    disabled: true,
  },
};

export const EnterpriseFormFlow: Story = {
  name: 'Enterprise Form Flow',
  render: () => (
    <div style={{ display: 'grid', gap: '1rem', width: 380 }}>
      <PTextInput label="Opportunity name" defaultValue="Global support renewal" />
      <PCombobox
        label="Account"
        options={accountOptions}
        defaultValue="northstar-bank"
        helperText="Desktop and tablet use an anchored listbox; mobile expands inline below the field."
      />
      <PCombobox label="Approval owner" options={peopleOptions} placeholder="Select approver" required />
      <PTextInput label="Reference" />
    </div>
  ),
  parameters: {
    layout: 'centered',
  },
  decorators: [(Story) => <Story />],
};

export default meta;

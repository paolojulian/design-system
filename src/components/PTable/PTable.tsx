import {
  forwardRef,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from 'react';
import cn from '../../utils/cn';
import './PTable.css';

export type PTableRef = HTMLDivElement;
export type PTableDensity = 'compact' | 'standard' | 'spacious';
export type PTableAlign = 'start' | 'center' | 'end';
export type PTableSortDirection = 'ascending' | 'descending';
export type PTableColumnPriority = 'primary' | 'secondary' | 'tertiary';
export type PTableStateTone = 'neutral' | 'danger';
export type PTableRowTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';
export type PTableRecord = Record<string, unknown>;

export type PTableColumn<RowData extends PTableRecord = PTableRecord> = {
  id: string;
  header: ReactNode;
  label?: string;
  accessor?: keyof RowData | ((row: RowData) => ReactNode);
  cell?: (row: RowData, rowIndex: number) => ReactNode;
  mobileLabel?: string;
  width?: string;
  align?: PTableAlign;
  priority?: PTableColumnPriority;
  hideOnTablet?: boolean;
  hideOnMobile?: boolean;
  sortable?: boolean;
  sortDirection?: PTableSortDirection | null;
};

export type PTableState = {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  tone?: PTableStateTone;
};

export type PTableProps<RowData extends PTableRecord = PTableRecord> = {
  columns: PTableColumn<RowData>[];
  rows: RowData[];
  caption: string;
  captionHidden?: boolean;
  summary?: ReactNode;
  density?: PTableDensity;
  stickyHeader?: boolean;
  stickyFirstColumn?: boolean;
  isLoading?: boolean;
  loadingLabel?: ReactNode;
  emptyState?: PTableState;
  errorState?: PTableState;
  getRowId?: (row: RowData, rowIndex: number) => string;
  getRowTone?: (row: RowData, rowIndex: number) => PTableRowTone | undefined;
  onRowClick?: (
    row: RowData,
    rowIndex: number,
    event: MouseEvent<HTMLTableRowElement | HTMLLIElement> | KeyboardEvent<HTMLTableRowElement | HTMLLIElement>,
  ) => void;
  renderRowActions?: (row: RowData, rowIndex: number) => ReactNode;
  onSortChange?: (columnId: string, direction: PTableSortDirection) => void;
  className?: string;
  tableClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'children' | 'className'>;

function getColumnLabel<RowData extends PTableRecord>(column: PTableColumn<RowData>) {
  if (column.label) {
    return column.label;
  }

  if (column.mobileLabel) {
    return column.mobileLabel;
  }

  return typeof column.header === 'string' ? column.header : column.id;
}

function getCellContent<RowData extends PTableRecord>(
  row: RowData,
  column: PTableColumn<RowData>,
  rowIndex: number,
) {
  if (column.cell) {
    return column.cell(row, rowIndex);
  }

  if (typeof column.accessor === 'function') {
    return column.accessor(row);
  }

  if (column.accessor) {
    return row[column.accessor] as ReactNode;
  }

  return null;
}

function getNextSortDirection(direction?: PTableSortDirection | null): PTableSortDirection {
  return direction === 'ascending' ? 'descending' : 'ascending';
}

type ClosestElementLike = {
  closest: (selector: string) => unknown;
};

type ContainsElementLike = {
  contains: (node: unknown) => boolean;
};

function hasClosest(target: EventTarget | null): target is EventTarget & ClosestElementLike {
  return Boolean(
    target &&
      typeof target === 'object' &&
      'closest' in target &&
      typeof (target as ClosestElementLike).closest === 'function',
  );
}

function hasContains(target: EventTarget | null): target is EventTarget & ContainsElementLike {
  return Boolean(
    target &&
      typeof target === 'object' &&
      'contains' in target &&
      typeof (target as ContainsElementLike).contains === 'function',
  );
}

function isInteractiveTarget(target: EventTarget | null, container: EventTarget | null) {
  if (!hasContains(container)) {
    return false;
  }

  if (!hasClosest(target)) {
    return false;
  }

  const interactiveElement = target.closest(
    [
      'a',
      'button',
      'input',
      'select',
      'textarea',
      'summary',
      '[contenteditable="true"]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[data-p-table-ignore-row-click]',
    ].join(','),
  );

  return Boolean(interactiveElement && interactiveElement !== container && container.contains(interactiveElement));
}

function PTableComponent<RowData extends PTableRecord>(
  {
    columns,
    rows,
    caption,
    captionHidden = false,
    summary,
    density = 'standard',
    stickyHeader = true,
    stickyFirstColumn = true,
    isLoading = false,
    loadingLabel = 'Loading table data...',
    emptyState = {
      title: 'No records found',
      description: 'Try adjusting the filters or checking back later.',
    },
    errorState,
    getRowId,
    getRowTone,
    onRowClick,
    renderRowActions,
    onSortChange,
    className,
    tableClassName,
    ...props
  }: PTableProps<RowData>,
  ref: ForwardedRef<PTableRef>,
) {
  const hasRows = rows.length > 0;
  const hasActions = Boolean(renderRowActions);
  const activeState = errorState ?? (!isLoading && !hasRows ? emptyState : null);
  const visibleMobileColumns = columns.filter((column) => !column.hideOnMobile);
  const columnCount = columns.length + (hasActions ? 1 : 0);
  const handleRowClick = (
    row: RowData,
    rowIndex: number,
    event: MouseEvent<HTMLTableRowElement | HTMLLIElement>,
  ) => {
    if (isInteractiveTarget(event.target, event.currentTarget)) {
      return;
    }

    onRowClick?.(row, rowIndex, event);
  };
  const handleRowKeyDown = (
    row: RowData,
    rowIndex: number,
    event: KeyboardEvent<HTMLTableRowElement | HTMLLIElement>,
  ) => {
    if (isInteractiveTarget(event.target, event.currentTarget)) {
      return;
    }

    if (event.key !== 'Enter' && event.key !== ' ') {
      return;
    }

    event.preventDefault();
    onRowClick?.(row, rowIndex, event);
  };

  return (
    <div
      {...props}
      ref={ref}
      className={cn(
        'p-table',
        `p-table--${density}`,
        stickyHeader && 'p-table--sticky-header',
        stickyFirstColumn && 'p-table--sticky-first-column',
        onRowClick && 'p-table--interactive',
        className,
      )}
    >
      <div className="p-table__header">
        <div className="p-table__header-copy">
          <h3 className={cn('p-table__caption', captionHidden && 'p-table__caption--hidden')}>
            {caption}
          </h3>
          {summary ? <div className="p-table__summary">{summary}</div> : null}
        </div>
      </div>

      <div className="p-table__viewport">
        <table className={cn('p-table__table', tableClassName)}>
          <caption className="p-table__native-caption">{caption}</caption>
          <colgroup>
            {columns.map((column) => (
              <col
                key={column.id}
                className={cn(
                  'p-table__col',
                  column.priority && `p-table__col--priority-${column.priority}`,
                  column.hideOnTablet && 'p-table__col--hide-tablet',
                  column.hideOnMobile && 'p-table__col--hide-mobile',
                )}
                style={column.width ? { width: column.width } : undefined}
              />
            ))}
            {hasActions ? <col className="p-table__actions-col" /> : null}
          </colgroup>
          <thead className="p-table__head">
            <tr>
              {columns.map((column) => {
                const nextSortDirection = getNextSortDirection(column.sortDirection);
                const ariaSort = column.sortDirection ?? (column.sortable ? 'none' : undefined);

                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={cn(
                      'p-table__cell p-table__head-cell',
                      column.align && `p-table__cell--${column.align}`,
                      column.priority && `p-table__cell--priority-${column.priority}`,
                      column.hideOnTablet && 'p-table__cell--hide-tablet',
                      column.hideOnMobile && 'p-table__cell--hide-mobile',
                    )}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="p-table__sort-button"
                        aria-label={`Sort by ${getColumnLabel(column)}`}
                        onClick={() => onSortChange?.(column.id, nextSortDirection)}
                      >
                        <span>{column.header}</span>
                        <span
                          className={cn(
                            'p-table__sort-mark',
                            column.sortDirection && `p-table__sort-mark--${column.sortDirection}`,
                          )}
                          aria-hidden="true"
                        />
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
              {hasActions ? (
                <th scope="col" className="p-table__cell p-table__head-cell p-table__actions-head">
                  <span className="p-table__sr-only">Actions</span>
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="p-table__body">
            {isLoading ? (
              <tr>
                <td className="p-table__state-cell" colSpan={columnCount}>
                  <span className="p-table__loading-mark" aria-hidden="true" />
                  <span>{loadingLabel}</span>
                </td>
              </tr>
            ) : activeState ? (
              <tr>
                <td className="p-table__state-cell" colSpan={columnCount}>
                  <div className={cn('p-table__state', activeState.tone && `p-table__state--${activeState.tone}`)}>
                    <strong>{activeState.title}</strong>
                    {activeState.description ? <span>{activeState.description}</span> : null}
                    {activeState.action ? <div className="p-table__state-action">{activeState.action}</div> : null}
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row, rowIndex) => {
                const rowId = getRowId?.(row, rowIndex) ?? String(rowIndex);
                const tone = getRowTone?.(row, rowIndex);
                const rowContent = columns.map((column) => (
                  <td
                    key={column.id}
                    className={cn(
                      'p-table__cell p-table__body-cell',
                      column.align && `p-table__cell--${column.align}`,
                      column.priority && `p-table__cell--priority-${column.priority}`,
                      column.hideOnTablet && 'p-table__cell--hide-tablet',
                      column.hideOnMobile && 'p-table__cell--hide-mobile',
                    )}
                  >
                    {getCellContent(row, column, rowIndex)}
                  </td>
                ));

                return (
                  <tr
                    key={rowId}
                    className={cn('p-table__row', tone && `p-table__row--${tone}`)}
                    tabIndex={onRowClick ? 0 : undefined}
                    onClick={onRowClick ? (event) => handleRowClick(row, rowIndex, event) : undefined}
                    onKeyDown={onRowClick ? (event) => handleRowKeyDown(row, rowIndex, event) : undefined}
                  >
                    {rowContent}
                    {hasActions ? (
                      <td className="p-table__cell p-table__body-cell p-table__actions-cell">
                        {renderRowActions?.(row, rowIndex)}
                      </td>
                    ) : null}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <ul className="p-table__mobile-list" aria-label={`${caption} rows`}>
        {isLoading ? (
          <li className="p-table__mobile-state">
            <span className="p-table__loading-mark" aria-hidden="true" />
            <span>{loadingLabel}</span>
          </li>
        ) : activeState ? (
          <li className="p-table__mobile-state">
            <div className={cn('p-table__state', activeState.tone && `p-table__state--${activeState.tone}`)}>
              <strong>{activeState.title}</strong>
              {activeState.description ? <span>{activeState.description}</span> : null}
              {activeState.action ? <div className="p-table__state-action">{activeState.action}</div> : null}
            </div>
          </li>
        ) : (
          rows.map((row, rowIndex) => {
            const rowId = getRowId?.(row, rowIndex) ?? String(rowIndex);
            const primaryColumn = visibleMobileColumns.find((column) => column.priority === 'primary') ?? visibleMobileColumns[0];
            const detailColumns = visibleMobileColumns.filter((column) => column.id !== primaryColumn?.id);
            const tone = getRowTone?.(row, rowIndex);

            return (
              <li
                key={rowId}
                className={cn('p-table__mobile-row', tone && `p-table__mobile-row--${tone}`)}
                role={onRowClick ? 'button' : undefined}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? (event) => handleRowClick(row, rowIndex, event) : undefined}
                onKeyDown={onRowClick ? (event) => handleRowKeyDown(row, rowIndex, event) : undefined}
              >
                {primaryColumn ? (
                  <div className="p-table__mobile-title">
                    {getCellContent(row, primaryColumn, rowIndex)}
                  </div>
                ) : null}
                <dl className="p-table__mobile-fields">
                  {detailColumns.map((column) => (
                    <div key={column.id} className="p-table__mobile-field">
                      <dt>{getColumnLabel(column)}</dt>
                      <dd>{getCellContent(row, column, rowIndex)}</dd>
                    </div>
                  ))}
                </dl>
                {hasActions ? (
                  <div className="p-table__mobile-actions">{renderRowActions?.(row, rowIndex)}</div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

type PTableComponentType = (<RowData extends PTableRecord = PTableRecord>(
  props: PTableProps<RowData> & { ref?: ForwardedRef<PTableRef> },
) => ReturnType<typeof PTableComponent>) & {
  displayName?: string;
};

export const PTable = forwardRef(PTableComponent) as PTableComponentType;

PTable.displayName = 'PTable';

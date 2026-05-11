import {
  forwardRef,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '../../icons';
import cn from '../../utils/cn';
import { PSelect } from '../PSelect';
import './PPagination.css';

export type PPaginationRef = HTMLElement;
export type PPaginationDensity = 'standard' | 'compact';
export type PPaginationItem = number | 'ellipsis';

export type PPaginationProps = {
  page: number;
  pageCount?: number;
  totalItems?: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  itemLabel?: string;
  density?: PPaginationDensity;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  isLoading?: boolean;
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  showRowsPerPage?: boolean;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  className?: string;
  summary?: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, 'children' | 'className' | 'onChange'>;

function clampPage(page: number, pageCount?: number) {
  if (!Number.isFinite(page)) {
    return 1;
  }

  if (!pageCount) {
    return Math.max(1, Math.trunc(page));
  }

  return Math.min(Math.max(1, Math.trunc(page)), Math.max(1, pageCount));
}

function getRange(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function getPaginationItems(
  page: number,
  pageCount: number,
  siblingCount: number,
  boundaryCount: number,
): PPaginationItem[] {
  const normalizedPageCount = Math.max(1, pageCount);
  const normalizedPage = clampPage(page, normalizedPageCount);
  const normalizedSiblingCount = Math.max(0, Math.trunc(siblingCount));
  const normalizedBoundaryCount = Math.max(1, Math.trunc(boundaryCount));
  const totalVisible = normalizedBoundaryCount * 2 + normalizedSiblingCount * 2 + 3;

  if (normalizedPageCount <= totalVisible) {
    return getRange(1, normalizedPageCount);
  }

  const edgeWindowCount = totalVisible - normalizedBoundaryCount - 1;
  const startPages = getRange(1, normalizedBoundaryCount);
  const endPages = getRange(normalizedPageCount - normalizedBoundaryCount + 1, normalizedPageCount);
  const startWindowEnd = edgeWindowCount;
  const endWindowStart = normalizedPageCount - edgeWindowCount + 1;

  if (normalizedPage <= startWindowEnd - normalizedSiblingCount) {
    return [...getRange(1, startWindowEnd), 'ellipsis' as const, ...endPages];
  }

  if (normalizedPage >= endWindowStart + normalizedSiblingCount) {
    return [...startPages, 'ellipsis' as const, ...getRange(endWindowStart, normalizedPageCount)];
  }

  const middleStart = normalizedPage - normalizedSiblingCount;
  const middleEnd = normalizedPage + normalizedSiblingCount;

  return [
    ...startPages,
    'ellipsis' as const,
    ...getRange(middleStart, middleEnd),
    'ellipsis' as const,
    ...endPages,
  ];
}

function getDefaultSummary(
  page: number,
  pageCount: number | undefined,
  totalItems: number | undefined,
  pageSize: number | undefined,
  itemLabel: string,
) {
  if (totalItems !== undefined && pageSize) {
    if (totalItems <= 0) {
      return `No ${itemLabel}`;
    }

    const start = (page - 1) * pageSize + 1;
    const end = Math.min(totalItems, page * pageSize);

    return `Showing ${start}-${end} of ${totalItems} ${itemLabel}`;
  }

  if (pageCount) {
    return `Page ${page} of ${pageCount}`;
  }

  return `Page ${page}`;
}

function PaginationButton({
  className,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} type="button" className={cn('p-pagination__button', className)}>
      {children}
    </button>
  );
}

export const PPagination = forwardRef<PPaginationRef, PPaginationProps>(
  (
    {
      page,
      pageCount,
      totalItems,
      pageSize,
      pageSizeOptions,
      itemLabel = 'items',
      density = 'standard',
      siblingCount = 1,
      boundaryCount = 1,
      disabled = false,
      isLoading = false,
      hasPreviousPage,
      hasNextPage,
      showRowsPerPage = true,
      onPageChange,
      onPageSizeChange,
      className,
      summary,
      ...props
    },
    ref,
  ) => {
    const normalizedPageCount = pageCount ? Math.max(1, Math.trunc(pageCount)) : undefined;
    const currentPage = clampPage(page, normalizedPageCount);
    const isUnavailable = disabled || isLoading;
    const canRequestPage = !isUnavailable && Boolean(onPageChange);
    const canGoPrevious = canRequestPage && (hasPreviousPage ?? currentPage > 1);
    const canGoNext = canRequestPage && (hasNextPage ?? (normalizedPageCount ? currentPage < normalizedPageCount : true));
    const pageItems = normalizedPageCount
      ? getPaginationItems(currentPage, normalizedPageCount, siblingCount, boundaryCount)
      : [];
    const shouldShowRowsPerPage = Boolean(
      showRowsPerPage && pageSize && pageSizeOptions?.length && onPageSizeChange,
    );
    const summaryText =
      summary ?? getDefaultSummary(currentPage, normalizedPageCount, totalItems, pageSize, itemLabel);

    const handlePageChange = (nextPage: number) => {
      if (isUnavailable) {
        return;
      }

      const clampedNextPage = clampPage(nextPage, normalizedPageCount);

      if (clampedNextPage === currentPage && normalizedPageCount) {
        return;
      }

      onPageChange?.(clampedNextPage);
    };

    return (
      <nav
        {...props}
        ref={ref}
        className={cn(
          'p-pagination',
          `p-pagination--${density}`,
          isLoading && 'p-pagination--loading',
          className,
        )}
        aria-label={props['aria-label'] ?? 'Pagination'}
        aria-busy={isLoading || undefined}
      >
        <div className="p-pagination__summary" aria-live="polite">
          {summaryText}
        </div>

        <div className="p-pagination__controls">
          <PaginationButton
            className="p-pagination__button--previous"
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
            onClick={() => handlePageChange(currentPage - 1)}
          >
            <ChevronLeftIcon />
            <span>Previous</span>
          </PaginationButton>

          {normalizedPageCount ? (
            <div className="p-pagination__pages" aria-label="Pages">
              {pageItems.map((item, index) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="p-pagination__ellipsis" aria-hidden="true">
                    ...
                  </span>
                ) : (
                  <PaginationButton
                    key={item}
                    className={cn('p-pagination__page', item === currentPage && 'p-pagination__page--current')}
                    aria-label={`Go to page ${item}`}
                    aria-current={item === currentPage ? 'page' : undefined}
                    disabled={!canRequestPage || item === currentPage}
                    onClick={() => handlePageChange(item)}
                  >
                    {item}
                  </PaginationButton>
                ),
              )}
            </div>
          ) : (
            <div className="p-pagination__cursor-page" aria-live="polite">
              Page {currentPage}
            </div>
          )}

          <PaginationButton
            className="p-pagination__button--next"
            disabled={!canGoNext}
            aria-label="Go to next page"
            onClick={() => handlePageChange(currentPage + 1)}
          >
            <span>Next</span>
            <ChevronRightIcon />
          </PaginationButton>
        </div>

        {shouldShowRowsPerPage ? (
          <PSelect
            className="p-pagination__page-size"
            label="Rows per page"
            placeholder=""
            density="compact"
            variant="inline"
            hideLabel
            value={pageSize}
            disabled={isUnavailable}
            options={pageSizeOptions?.map((option) => ({ value: option, label: `${option} / page` })) ?? []}
            onValueChange={(nextPageSize) => onPageSizeChange?.(Number(nextPageSize))}
          />
        ) : null}
      </nav>
    );
  },
);

PPagination.displayName = 'PPagination';

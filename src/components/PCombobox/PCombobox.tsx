import {
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type FocusEvent,
  type ForwardedRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type UIEvent,
} from 'react';
import cn from '../../utils/cn';
import './PCombobox.css';

export type PComboboxRef = HTMLDivElement;
export type PComboboxFilterMode = 'local' | 'none';
export type PComboboxQueryChangeSource = 'input' | 'open' | 'clear' | 'selection' | 'reset';

export type PComboboxOption = {
  value: string;
  label: string;
  description?: string;
  group?: string;
  meta?: ReactNode;
  keywords?: string[];
  disabled?: boolean;
};

export type PComboboxProps = {
  label: string;
  options: PComboboxOption[];
  value?: string;
  defaultValue?: string;
  selectedOption?: PComboboxOption | null;
  onValueChange?: (value: string, option: PComboboxOption | null) => void;
  query?: string;
  defaultQuery?: string;
  onQueryChange?: (query: string, details: { source: PComboboxQueryChangeSource }) => void;
  filterMode?: PComboboxFilterMode;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: (details: { query: string; optionCount: number }) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loadingText?: string;
  loadingMoreText?: string;
  loadMoreText?: string;
  helperText?: string;
  isError?: boolean;
  errorMessage?: string;
  name?: string;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  clearable?: boolean;
  className?: string;
  inputClassName?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, 'className' | 'defaultValue' | 'onChange'>;

type ContainsElement = {
  contains: (target: EventTarget | null) => boolean;
};

type FocusableElement = {
  focus: () => void;
};

type ScrollableElement = {
  scrollIntoView: (options?: { block?: 'nearest' }) => void;
};

type ScrollMetricsElement = {
  scrollTop: number;
  clientHeight: number;
  scrollHeight: number;
};

type ValidatableElement = {
  setCustomValidity: (error: string) => void;
};

type ViewportMatcher = {
  matchMedia?: (query: string) => {
    matches: boolean;
    addEventListener?: (type: 'change', listener: () => void) => void;
    removeEventListener?: (type: 'change', listener: () => void) => void;
  };
};

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="m5 8 5 5 5-5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="m4 10 4 4 8-8" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden="true">
      <path d="m5 5 10 10" />
      <path d="m15 5-10 10" />
    </svg>
  );
}

function normalizeText(value: string) {
  return value.trim().toLocaleLowerCase();
}

function filterOptions(options: PComboboxOption[], query: string) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) {
    return options;
  }

  return options.filter((option) => {
    const searchableText = [
      option.label,
      option.value,
      option.description,
      option.group,
      ...(option.keywords ?? []),
    ]
      .filter(Boolean)
      .join(' ');

    return normalizeText(searchableText).includes(normalizedQuery);
  });
}

function getFirstEnabledIndex(options: PComboboxOption[]) {
  return options.findIndex((option) => !option.disabled);
}

function getSelectedIndex(options: PComboboxOption[], selectedValue: string | undefined) {
  const selectedIndex = options.findIndex((option) => option.value === selectedValue && !option.disabled);

  return selectedIndex >= 0 ? selectedIndex : getFirstEnabledIndex(options);
}

function getNextEnabledIndex(options: PComboboxOption[], activeIndex: number, direction: 1 | -1) {
  if (!options.length) {
    return -1;
  }

  let nextIndex = activeIndex;

  for (let attempt = 0; attempt < options.length; attempt += 1) {
    nextIndex = (nextIndex + direction + options.length) % options.length;

    if (!options[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return -1;
}

function assignRef(ref: ForwardedRef<PComboboxRef>, node: PComboboxRef | null) {
  if (typeof ref === 'function') {
    ref(node);
    return;
  }

  if (ref) {
    ref.current = node;
  }
}

export const PCombobox = forwardRef<PComboboxRef, PComboboxProps>(
  (
    {
      label,
      options,
      value,
      defaultValue,
      selectedOption: selectedOptionProp,
      onValueChange,
      query: queryProp,
      defaultQuery,
      onQueryChange,
      filterMode = 'local',
      isLoading = false,
      isLoadingMore = false,
      hasMore = false,
      onLoadMore,
      placeholder = 'Select an option',
      searchPlaceholder = 'Search options',
      emptyText = 'No options found.',
      loadingText = 'Loading options...',
      loadingMoreText = 'Loading more options...',
      loadMoreText = 'Load more options',
      helperText,
      isError = false,
      errorMessage,
      name,
      disabled = false,
      readOnly = false,
      required = false,
      clearable = true,
      className,
      inputClassName,
      id,
      style,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId();
    const rootId = id ?? generatedId;
    const labelId = `${rootId}-label`;
    const inputId = `${rootId}-input`;
    const listboxId = `${rootId}-listbox`;
    const helperId = `${rootId}-helper`;
    const errorId = `${rootId}-error`;
    const rootRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<(HTMLInputElement & FocusableElement) | null>(null);
    const modalInputRef = useRef<(HTMLInputElement & FocusableElement) | null>(null);
    const hiddenInputRef = useRef<(HTMLInputElement & ValidatableElement) | null>(null);
    const activeOptionRef = useRef<ScrollableElement | null>(null);
    const panelRef = useRef<ScrollMetricsElement | null>(null);
    const isControlled = value !== undefined;
    const isQueryControlled = queryProp !== undefined;
    const [internalValue, setInternalValue] = useState(defaultValue ?? '');
    const selectedValue = isControlled ? value : internalValue;
    const selectedOption =
      selectedOptionProp?.value === selectedValue
        ? selectedOptionProp
        : options.find((option) => option.value === selectedValue) ?? null;
    const [internalQuery, setInternalQuery] = useState(defaultQuery ?? selectedOption?.label ?? '');
    const query = isQueryControlled ? queryProp : internalQuery;
    const [isOpen, setIsOpen] = useState(false);
    const [isModalViewport, setIsModalViewport] = useState(false);
    const filteredOptions = useMemo(
      () => (filterMode === 'local' ? filterOptions(options, query) : options),
      [filterMode, options, query],
    );
    const [activeIndex, setActiveIndex] = useState(() => getSelectedIndex(options, selectedValue));
    const activeOption = isOpen ? filteredOptions[activeIndex] : undefined;
    const activeOptionId = activeOption ? `${listboxId}-option-${activeIndex}` : undefined;
    const modalTitleId = `${rootId}-modal-title`;
    const messageId = isError && errorMessage ? errorId : helperText ? helperId : undefined;
    const hasSelection = Boolean(selectedOption);
    const canClear = clearable && hasSelection && !disabled && !readOnly;
    const inputValue = isOpen ? query : selectedOption?.label ?? query;
    const showInitialLoading = isLoading && filteredOptions.length === 0;
    const showFooterLoading = isLoadingMore || (isLoading && filteredOptions.length > 0);
    const showLoadMore = Boolean(hasMore && onLoadMore && !isLoading && !isLoadingMore);

    useEffect(() => {
      if (!isOpen && !isQueryControlled) {
        setInternalQuery(selectedOption?.label ?? '');
      }
    }, [isOpen, isQueryControlled, selectedOption]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      setActiveIndex((currentIndex) => {
        if (filteredOptions[currentIndex] && !filteredOptions[currentIndex].disabled) {
          return currentIndex;
        }

        return getSelectedIndex(filteredOptions, selectedValue);
      });
    }, [filteredOptions, isOpen, selectedValue]);

    useEffect(() => {
      if (!isOpen) {
        return;
      }

      activeOptionRef.current?.scrollIntoView({ block: 'nearest' });
    }, [activeIndex, isOpen]);

    useEffect(() => {
      const matcher = globalThis as unknown as ViewportMatcher;
      const mediaQuery = matcher.matchMedia?.('(max-width: 64rem)');

      if (!mediaQuery) {
        return;
      }

      const syncModalViewport = () => setIsModalViewport(mediaQuery.matches);
      syncModalViewport();
      mediaQuery.addEventListener?.('change', syncModalViewport);

      return () => mediaQuery.removeEventListener?.('change', syncModalViewport);
    }, []);

    useEffect(() => {
      if (!isOpen || !isModalViewport) {
        return;
      }

      modalInputRef.current?.focus();
    }, [isModalViewport, isOpen]);

    useEffect(() => {
      if (!hiddenInputRef.current) {
        return;
      }

      hiddenInputRef.current.setCustomValidity(required && !selectedValue ? 'Select an option.' : '');
    }, [required, selectedValue]);

    const setRootRef = (node: HTMLDivElement | null) => {
      rootRef.current = node;
      assignRef(ref, node);
    };

    const setSearchQuery = (nextQuery: string, source: PComboboxQueryChangeSource) => {
      if (!isQueryControlled) {
        setInternalQuery(nextQuery);
      }

      onQueryChange?.(nextQuery, { source });
    };

    const requestLoadMore = () => {
      if (!hasMore || !onLoadMore || isLoading || isLoadingMore) {
        return;
      }

      onLoadMore({ query, optionCount: filteredOptions.length });
    };

    useEffect(() => {
      if (!isOpen || !panelRef.current) {
        return;
      }

      const { scrollHeight, clientHeight } = panelRef.current;

      if (scrollHeight <= clientHeight + 48) {
        requestLoadMore();
      }
    });

    const commitValue = (nextOption: PComboboxOption | null) => {
      const nextValue = nextOption?.value ?? '';

      if (!isControlled) {
        setInternalValue(nextValue);
      }

      setSearchQuery(nextOption?.label ?? '', nextOption ? 'selection' : 'clear');
      onValueChange?.(nextValue, nextOption);
    };

    const openCombobox = (nextQuery = query) => {
      if (disabled || readOnly) {
        return;
      }

      const nextOptions = filterMode === 'local' ? filterOptions(options, nextQuery) : options;
      setSearchQuery(nextQuery, 'open');
      setActiveIndex(getSelectedIndex(nextOptions, selectedValue));
      setIsOpen(true);
    };

    const closeCombobox = () => {
      setIsOpen(false);
      setSearchQuery(selectedOption?.label ?? '', 'reset');
    };

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
      const nextQuery = (event.currentTarget as unknown as { value: string }).value;
      const nextOptions = filterMode === 'local' ? filterOptions(options, nextQuery) : options;

      setSearchQuery(nextQuery, 'input');
      setActiveIndex(getFirstEnabledIndex(nextOptions));
      setIsOpen(true);
    };

    const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault();

        if (!isOpen) {
          openCombobox('');
          return;
        }

        setActiveIndex((currentIndex) => getNextEnabledIndex(filteredOptions, currentIndex, 1));
        return;
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();

        if (!isOpen) {
          openCombobox('');
          return;
        }

        setActiveIndex((currentIndex) => getNextEnabledIndex(filteredOptions, currentIndex, -1));
        return;
      }

      if (event.key === 'Enter') {
        if (!isOpen) {
          openCombobox(query);
          return;
        }

        if (activeOption && !activeOption.disabled) {
          event.preventDefault();
          commitValue(activeOption);
          setIsOpen(false);
        }

        return;
      }

      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        closeCombobox();
        return;
      }

      if (event.key === 'Tab') {
        closeCombobox();
      }
    };

    const handleOptionPointerDown = (event: MouseEvent<HTMLDivElement>, option: PComboboxOption) => {
      event.preventDefault();

      if (option.disabled) {
        return;
      }

      commitValue(option);
      setIsOpen(false);
      inputRef.current?.focus();
    };

    const handleClear = (event: MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      event.stopPropagation();
      commitValue(null);
      setIsOpen(false);
      inputRef.current?.focus();
    };

    const handlePanelScroll = (event: UIEvent<HTMLDivElement>) => {
      const panel = event.currentTarget as unknown as ScrollMetricsElement;
      const distanceToBottom = panel.scrollHeight - panel.scrollTop - panel.clientHeight;

      if (distanceToBottom <= 48) {
        requestLoadMore();
      }
    };

    const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
      if (!isOpen) {
        return;
      }

      const currentTarget = event.currentTarget as unknown as ContainsElement;

      if (!currentTarget.contains(event.relatedTarget)) {
        closeCombobox();
      }
    };

    const groups = filteredOptions.reduce<Array<{ group: string | null; options: PComboboxOption[] }>>(
      (accumulator, option) => {
        const group = option.group ?? null;
        const existingGroup = accumulator.find((item) => item.group === group);

        if (existingGroup) {
          existingGroup.options.push(option);
          return accumulator;
        }

        accumulator.push({ group, options: [option] });
        return accumulator;
      },
      [],
    );

    return (
      <div
        {...props}
        ref={setRootRef}
        id={rootId}
        style={style}
        onBlur={handleBlur}
        className={cn(
          'p-combobox',
          isOpen && 'p-combobox--open',
          isError && 'p-combobox--error',
          disabled && 'p-combobox--disabled',
          readOnly && 'p-combobox--readonly',
          className,
        )}
      >
        <div className="p-combobox__field">
          <input
            ref={inputRef}
            id={inputId}
            role="combobox"
            type="text"
            value={inputValue}
            placeholder={isOpen ? searchPlaceholder : ' '}
            disabled={disabled}
            readOnly={readOnly}
            required={false}
            aria-autocomplete="list"
            aria-controls={listboxId}
            aria-describedby={messageId}
            aria-activedescendant={activeOptionId}
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-invalid={isError || undefined}
            aria-labelledby={labelId}
            autoComplete="off"
            className={cn('p-combobox__input', (canClear || hasSelection) && 'p-combobox__input--adorned', inputClassName)}
            onChange={handleInputChange}
            onClick={() => openCombobox('')}
            onKeyDown={handleInputKeyDown}
          />

          <label
            id={labelId}
            htmlFor={inputId}
            className={cn('p-combobox__label p-combobox__floating-label', isError && 'p-combobox__label--error')}
          >
            {label}
          </label>

          <span aria-hidden="true" className="p-combobox__label p-combobox__placeholder-label">
            {placeholder || label}
          </span>

          {canClear ? (
            <button
              type="button"
              className="p-combobox__clear"
              aria-label={`Clear ${label}`}
              onMouseDown={handleClear}
            >
              <XIcon />
            </button>
          ) : null}

          <span className="p-combobox__chevron" aria-hidden="true">
            <ChevronDownIcon />
          </span>

          {isOpen ? (
            <div
              className="p-combobox__panel"
              role={isModalViewport ? 'dialog' : undefined}
              aria-modal={isModalViewport || undefined}
              aria-labelledby={isModalViewport ? modalTitleId : undefined}
            >
              <div className="p-combobox__modal-header">
                <div id={modalTitleId} className="p-combobox__modal-title">{label}</div>
                <button type="button" className="p-combobox__modal-close" aria-label={`Close ${label}`} onClick={closeCombobox}>
                  <XIcon />
                </button>
              </div>
              <div className="p-combobox__modal-search">
                <input
                  ref={modalInputRef}
                  role="combobox"
                  type="search"
                  value={query}
                  placeholder={searchPlaceholder}
                  aria-activedescendant={activeOptionId}
                  aria-autocomplete="list"
                  aria-controls={listboxId}
                  aria-expanded={isOpen}
                  aria-haspopup="listbox"
                  aria-label={`Search ${label}`}
                  autoComplete="off"
                  className="p-combobox__modal-input"
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                />
              </div>

              <div
                id={listboxId}
                ref={(node) => {
                  panelRef.current = node as unknown as ScrollMetricsElement | null;
                }}
                role="listbox"
                aria-busy={isLoading || isLoadingMore || undefined}
                aria-labelledby={labelId}
                className="p-combobox__list"
                onScroll={handlePanelScroll}
              >
                {showInitialLoading ? (
                  <div className="p-combobox__status" role="option" aria-disabled="true" aria-selected="false">
                    <span className="p-combobox__spinner" aria-hidden="true" />
                    <span>{loadingText}</span>
                  </div>
                ) : null}

                {groups.length ? (
                  groups.map((group) => (
                    <div key={group.group ?? 'ungrouped'} className="p-combobox__group">
                      {group.group ? <div className="p-combobox__group-label">{group.group}</div> : null}
                      {group.options.map((option) => {
                        const optionIndex = filteredOptions.indexOf(option);
                        const isActive = optionIndex === activeIndex;
                        const isSelected = option.value === selectedValue;

                        return (
                          <div
                            key={option.value}
                            ref={
                              isActive
                                ? (node) => {
                                    activeOptionRef.current = node as unknown as ScrollableElement | null;
                                  }
                                : undefined
                            }
                            id={`${listboxId}-option-${optionIndex}`}
                            role="option"
                            aria-disabled={option.disabled || undefined}
                            aria-selected={isSelected}
                            className={cn(
                              'p-combobox__option',
                              isActive && 'p-combobox__option--active',
                              isSelected && 'p-combobox__option--selected',
                              option.disabled && 'p-combobox__option--disabled',
                            )}
                            onMouseDown={(event) => handleOptionPointerDown(event, option)}
                          >
                            <span className="p-combobox__option-check">
                              {isSelected ? <CheckIcon /> : null}
                            </span>
                            <span className="p-combobox__option-content">
                              <span className="p-combobox__option-label">{option.label}</span>
                              {option.description ? (
                                <span className="p-combobox__option-description">{option.description}</span>
                              ) : null}
                            </span>
                            {option.meta ? <span className="p-combobox__option-meta">{option.meta}</span> : null}
                          </div>
                        );
                      })}
                    </div>
                  ))
                ) : !showInitialLoading ? (
                  <div className="p-combobox__empty" role="option" aria-disabled="true" aria-selected="false">
                    {emptyText}
                  </div>
                ) : null}

                {showFooterLoading ? (
                  <div className="p-combobox__status p-combobox__status--footer" role="option" aria-disabled="true" aria-selected="false">
                    <span className="p-combobox__spinner" aria-hidden="true" />
                    <span>{loadingMoreText}</span>
                  </div>
                ) : null}
              </div>

              {showLoadMore ? (
                <div className="p-combobox__footer">
                  <button type="button" className="p-combobox__load-more" onMouseDown={(event) => event.preventDefault()} onClick={requestLoadMore}>
                    {loadMoreText}
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <input
          ref={hiddenInputRef}
          type="text"
          name={name}
          value={selectedValue ?? ''}
          required={required}
          tabIndex={-1}
          aria-hidden="true"
          className="p-combobox__hidden-input"
          onChange={() => undefined}
        />

        {isOpen ? (
          <div className="p-combobox__backdrop" aria-hidden="true" onMouseDown={closeCombobox} />
        ) : null}

        {isError && errorMessage ? (
          <p id={errorId} role="alert" className="p-combobox__message p-combobox__message--error">
            {errorMessage}
          </p>
        ) : null}

        {!isError && helperText ? (
          <p id={helperId} className="p-combobox__message">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  },
);

PCombobox.displayName = 'PCombobox';

/** Local-date helpers shared by PDatePicker and PDateRangePicker. Dates are local midnight. */

const dayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' });

export function toLocalDate(value: string | Date | null | undefined) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime())
      ? null
      : new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  const parts = value.split('-').map(Number);

  if (parts.length !== 3 || parts.some(Number.isNaN)) {
    return null;
  }

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);

  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }

  return date;
}

export function toIsoDate(date: Date | null) {
  if (!date) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

export function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

export function addMonthsClamped(date: Date, months: number) {
  const monthStart = addMonths(date, months);
  const lastDay = endOfMonth(monthStart).getDate();

  return new Date(monthStart.getFullYear(), monthStart.getMonth(), Math.min(date.getDate(), lastDay));
}

export function addDays(date: Date, days: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function getToday() {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
}

export function getCalendarDays(monthDate: Date, weekStartsOn: number) {
  const monthStart = startOfMonth(monthDate);
  const offset = (monthStart.getDay() - weekStartsOn + 7) % 7;
  const gridStart = addDays(monthStart, -offset);

  return Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));
}

export function getMonthLabel(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(date);
}

export function getMonthOptions(locale?: string) {
  return Array.from({ length: 12 }, (_, month) => ({
    label: new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, month, 1)),
    value: month,
  }));
}

export function getDateLabel(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getDayLabel(date: Date, locale?: string) {
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getWeekdayLabels(weekStartsOn: number, locale?: string) {
  const baseSunday = new Date(2024, 0, 7);

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(baseSunday, weekStartsOn + index);
    return dayFormatter.formatToParts(date).length
      ? new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(date)
      : '';
  });
}

export function isSameDay(a: Date | null, b: Date | null) {
  return Boolean(a && b && toIsoDate(a) === toIsoDate(b));
}

export function isBeforeDate(date: Date, minDate: Date | null) {
  return Boolean(minDate && date.getTime() < minDate.getTime());
}

export function isAfterDate(date: Date, maxDate: Date | null) {
  return Boolean(maxDate && date.getTime() > maxDate.getTime());
}

export function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isMonthDisabled(monthDate: Date, minDate: Date | null, maxDate: Date | null) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);

  return Boolean((minDate && monthEnd < minDate) || (maxDate && monthStart > maxDate));
}

export function clampVisibleMonth(monthDate: Date, minDate: Date | null, maxDate: Date | null) {
  if (minDate && endOfMonth(monthDate) < minDate) {
    return startOfMonth(minDate);
  }

  if (maxDate && startOfMonth(monthDate) > maxDate) {
    return startOfMonth(maxDate);
  }

  return startOfMonth(monthDate);
}

export function getFocusableDateInMonth(monthDate: Date, preferredDate: Date, minDate: Date | null, maxDate: Date | null) {
  const monthStart = startOfMonth(monthDate);
  const monthEnd = endOfMonth(monthDate);
  let nextDate = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth(),
    Math.min(preferredDate.getDate(), monthEnd.getDate()),
  );

  if (minDate && nextDate < minDate) {
    nextDate = isSameMonth(minDate, monthStart) ? minDate : monthStart;
  }

  if (maxDate && nextDate > maxDate) {
    nextDate = isSameMonth(maxDate, monthStart) ? maxDate : monthEnd;
  }

  return nextDate;
}

export function getYearOptions(visibleMonth: Date, minDate: Date | null, maxDate: Date | null, today: Date) {
  const visibleYear = visibleMonth.getFullYear();
  const defaultStartYear = Math.min(visibleYear, today.getFullYear() - 100);
  const defaultEndYear = Math.max(visibleYear, today.getFullYear() + 20);
  const startYear = minDate?.getFullYear() ?? defaultStartYear;
  const endYear = maxDate?.getFullYear() ?? defaultEndYear;
  const firstYear = Math.min(startYear, endYear, visibleYear);
  const lastYear = Math.max(startYear, endYear, visibleYear);

  return Array.from({ length: lastYear - firstYear + 1 }, (_, index) => firstYear + index);
}

/**
 * One predicate from the two ways to block days: a list of ISO dates
 * (`disabledDates`) and a rule (`isDateDisabled`). The list becomes a Set, so a
 * lookup per rendered day stays cheap. Returns `undefined` when nothing is
 * blocked, so calendars can skip the checks.
 */
export function toDateBlocker(
  disabledDates: string[] | undefined,
  isDateDisabled: ((date: Date) => boolean) | undefined,
): ((date: Date) => boolean) | undefined {
  const blocked = disabledDates?.length ? new Set(disabledDates) : null;

  if (!blocked && !isDateDisabled) {
    return undefined;
  }

  return (date: Date) => Boolean(blocked?.has(toIsoDate(date)) || isDateDisabled?.(date));
}

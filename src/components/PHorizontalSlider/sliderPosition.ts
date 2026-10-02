/**
 * Index maths for a horizontal snap slider. Items can have different widths, so positions are
 * described by each item's scroll target (the `scrollLeft` that puts it at the leading edge).
 */

type Position = { scrollLeft: number; maxScroll: number; targets: number[] };

/** The item at the slider's leading edge. Once the slider can't scroll further, that's the last item. */
export function visibleIndex({ scrollLeft, maxScroll, targets }: Position): number {
  if (targets.length === 0) return 0;
  if (maxScroll > 0 && scrollLeft >= maxScroll - 1) return targets.length - 1;
  return nearestIndex(scrollLeft, targets);
}

/**
 * The item an arrow press should scroll to. Steps from the pending target while a smooth scroll is
 * still running, so repeated presses add up instead of restarting from a mid-animation offset.
 */
export function nextIndex({
  pending,
  dir,
  ...position
}: Position & { pending: number | null; dir: 1 | -1 }): number {
  const count = position.targets.length;
  if (count === 0) return 0;
  const from = pending ?? visibleIndex(position);
  // Past the last reachable target the slider is pinned at maxScroll; step back from there.
  const reachable = lastReachableIndex(position);
  return clamp(Math.min(from, reachable) + dir, dir === 1 ? reachable : count - 1);
}

/** The scroll offset for an item, clamped to what the slider can actually reach. */
export function scrollTargetFor(index: number, { maxScroll, targets }: Omit<Position, 'scrollLeft'>) {
  return Math.max(0, Math.min(maxScroll, targets[index] ?? 0));
}

/** The highest index whose target is still short of `maxScroll`, plus the one that reaches it. */
function lastReachableIndex({ maxScroll, targets }: Position): number {
  const index = targets.findIndex((target) => target >= maxScroll - 1);
  return index === -1 ? targets.length - 1 : index;
}

function nearestIndex(scrollLeft: number, targets: number[]): number {
  let best = 0;
  targets.forEach((target, index) => {
    if (Math.abs(target - scrollLeft) < Math.abs(targets[best] - scrollLeft)) best = index;
  });
  return best;
}

function clamp(index: number, max: number) {
  return Math.max(0, Math.min(max, index));
}

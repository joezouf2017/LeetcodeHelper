// The mastery ladder, reused from AlgoLoop (the project this one is modelled
// on) rather than reinvented: five levels, intervals of 1, 3, 7 and 21 days.
//
// The two rules worth stating out loud, because neither is obvious:
//
//   - Needing a hint resets you to level 1 from wherever you were. Reviewing
//     with help is evidence you did not know it, not evidence of slower
//     progress, so the schedule starts over.
//   - An unaided solve never lands on level 1, because level 1 *means* "needed
//     a hint". Solving one cold from scratch starts at level 2.

import { addDays } from "./app-date";

export type MasteryLevel = 0 | 1 | 2 | 3 | 4 | 5;

/** How the user reported solving it — the two buttons in the notes panel. */
export type ReviewMode = "hint" | "independent";

/** At this level a problem stops being scheduled for review. */
export const MASTERED = 5;

/** Days until the next review, keyed by the level just reached. */
export const MASTERY_INTERVALS: Record<1 | 2 | 3 | 4, number> = {
  1: 1,
  2: 3,
  3: 7,
  4: 21,
};

export function advanceMastery(
  current: MasteryLevel,
  mode: ReviewMode,
): MasteryLevel {
  if (mode === "hint") return 1;
  return Math.min(MASTERED, Math.max(2, current + 1)) as MasteryLevel;
}

/** The date of the next review, or null when none is due to be scheduled. */
export function nextReviewDate(
  level: MasteryLevel,
  from: string,
): string | null {
  if (level === 0 || level === MASTERED) return null;
  return addDays(from, MASTERY_INTERVALS[level]);
}

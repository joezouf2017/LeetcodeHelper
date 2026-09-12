// What to work on today.
//
// Two halves with different rules. Reviews that have come due are surfaced
// wherever they sit in the list — a review is late regardless of which topic
// it belongs to. New problems are drawn from exactly one category: the first
// one in list order that still holds something untouched.
//
// The plan deliberately does not top up from the next category when the focus
// category runs short of the daily goal. Getting through a topic before
// starting the next one is the point; a short day is the signal that the topic
// is nearly done, not a gap to fill.

import { isDueOn } from "./app-date";
import type { Progress } from "./db";
import type { ProblemView } from "./list-view";
import type { ProblemList } from "./lists/problem-lists";

export const DEFAULT_DAILY_GOAL = 3;
export const MAX_DAILY_GOAL = 20;

export function clampDailyGoal(value: number): number {
  return Math.min(MAX_DAILY_GOAL, Math.max(0, Math.round(value)));
}

/**
 * Read the daily goal out of localStorage, which is user-writable and outlives
 * any version of this code. Anything unexpected falls back to the default
 * rather than reaching buildTodayPlan as NaN and silently emptying the plan.
 */
export function readDailyGoal(stored: string | null): number {
  if (stored === null || !/^\d+$/.test(stored)) return DEFAULT_DAILY_GOAL;
  const value = Number(stored);
  if (value > MAX_DAILY_GOAL) return DEFAULT_DAILY_GOAL;
  return value;
}

export interface TodayPlan {
  /** Due reviews, most overdue first. */
  due: ProblemView[];
  /** Untouched problems to start today, from `focusCategory` only. */
  fresh: ProblemView[];
  /** The category new problems are coming from, or null when the list is done. */
  focusCategory: string | null;
  /** How many untouched problems that category still holds, `fresh` included. */
  remainingInFocus: number;
}

/** A category is done when nothing in it is still todo — not when it is mastered. */
function isUntouched(view: ProblemView): boolean {
  return (view.progress?.status ?? "todo") === "todo";
}

export function buildTodayPlan(
  list: ProblemList,
  progressById: Record<string, Progress>,
  today: string,
  dailyGoal: number,
): TodayPlan {
  const views: ProblemView[] = list.problems.map((problem) => {
    const progress = progressById[problem.id] ?? null;
    return {
      problem,
      progress,
      isDue: isDueOn(progress?.nextReviewAt ?? null, today),
    };
  });

  const due = views
    .filter((view) => view.isDue)
    .sort((a, b) =>
      // isDue guarantees a review date; the fallback only satisfies the types.
      (a.progress?.nextReviewAt ?? "").localeCompare(
        b.progress?.nextReviewAt ?? "",
      ),
    );

  // Category order is the list's own, and within a category the problems keep
  // the list's order — so "next up" means what the list author intended.
  const categories: string[] = [];
  const byCategory = new Map<string, ProblemView[]>();
  for (const view of views) {
    const bucket = byCategory.get(view.problem.category);
    if (bucket) {
      bucket.push(view);
    } else {
      byCategory.set(view.problem.category, [view]);
      categories.push(view.problem.category);
    }
  }

  for (const category of categories) {
    const untouched = (byCategory.get(category) ?? []).filter(isUntouched);
    if (untouched.length === 0) continue;
    return {
      due,
      fresh: untouched.slice(0, Math.max(0, dailyGoal)),
      focusCategory: category,
      remainingInFocus: untouched.length,
    };
  }

  return { due, fresh: [], focusCategory: null, remainingInFocus: 0 };
}

// Turns "a list plus what the user has done" into the shape the tracker
// renders. Kept apart from the component so the arithmetic — completion
// counts, due counts, the difficulty filter — is testable without a DOM.
//
// Counts follow whatever is on screen: filtering to Easy makes a category read
// "1/1" rather than "1/9", so the bar never disagrees with the rows under it.

import { daysBetween, isDueOn } from "./app-date";
import type { Progress } from "./db";
import type { ListProblem } from "./lists/blind75";
import type { ProblemList } from "./lists/problem-lists";
import type { Difficulty } from "./lists/types";
import { MASTERED, type MasteryLevel } from "./spaced-repetition";

export interface ProblemView {
  problem: ListProblem;
  progress: Progress | null;
  isDue: boolean;
}

export interface CategoryView {
  name: string;
  problems: ProblemView[];
  total: number;
  solved: number;
  due: number;
  percent: number;
}

export interface ListView {
  categories: CategoryView[];
  total: number;
  solved: number;
  due: number;
  percent: number;
}

/** Where a problem sits on the ladder, in words rather than a bare number. */
export function masteryLabel(mastery: MasteryLevel): string {
  if (mastery === 0) return "Not started";
  if (mastery === MASTERED) return "Mastered";
  return `Level ${mastery} of ${MASTERED}`;
}

/** How a row announces its next review, or null when none is scheduled. */
export function reviewLabel(
  nextReviewAt: string | null,
  today: string,
): string | null {
  if (nextReviewAt === null) return null;
  const days = daysBetween(today, nextReviewAt);
  if (days === 0) return "Due today";
  if (days < 0) {
    const overdue = -days;
    return `Overdue by ${overdue} ${overdue === 1 ? "day" : "days"}`;
  }
  return `In ${days} ${days === 1 ? "day" : "days"}`;
}

function percentOf(solved: number, total: number): number {
  return total === 0 ? 0 : Math.round((solved / total) * 100);
}

export function buildListView(
  list: ProblemList,
  progressById: Record<string, Progress>,
  today: string,
  difficulties: readonly Difficulty[],
): ListView {
  const enabled = new Set(difficulties);
  const byCategory = new Map<string, ProblemView[]>();

  for (const problem of list.problems) {
    if (!enabled.has(problem.difficulty)) continue;
    const progress = progressById[problem.id] ?? null;
    const view: ProblemView = {
      problem,
      progress,
      isDue: isDueOn(progress?.nextReviewAt ?? null, today),
    };
    // Map preserves insertion order, which is the list's own category order.
    const bucket = byCategory.get(problem.category);
    if (bucket) bucket.push(view);
    else byCategory.set(problem.category, [view]);
  }

  const categories: CategoryView[] = [...byCategory].map(([name, problems]) => {
    const solved = problems.filter(
      (p) => p.progress?.status === "solved",
    ).length;
    return {
      name,
      problems,
      total: problems.length,
      solved,
      due: problems.filter((p) => p.isDue).length,
      percent: percentOf(solved, problems.length),
    };
  });

  const total = categories.reduce((n, c) => n + c.total, 0);
  const solved = categories.reduce((n, c) => n + c.solved, 0);
  return {
    categories,
    total,
    solved,
    due: categories.reduce((n, c) => n + c.due, 0),
    percent: percentOf(solved, total),
  };
}

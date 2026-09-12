"use client";

// One problem, as it appears in the category list and in the Today panel.
// Shared rather than written twice: the status circle, the due highlight and
// the mastery dots have to mean the same thing in both places.

import { Check, Circle, ExternalLink, Lock, RotateCcw, StickyNote } from "lucide-react";
import type { ProblemStatus } from "@/lib/db";
import { reviewLabel, type ProblemView } from "@/lib/list-view";
import type { ListProblem } from "@/lib/lists/blind75";
import type { Difficulty } from "@/lib/lists/types";
import { MASTERED } from "@/lib/spaced-repetition";
import { cn } from "@/lib/utils";

export const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};

/** Clicking the circle walks the three states in a loop, as in AlgoLoop. */
export const NEXT_STATUS: Record<ProblemStatus, ProblemStatus> = {
  todo: "reviewing",
  reviewing: "solved",
  solved: "todo",
};

export function problemUrl(problem: ListProblem): string {
  return problem.premium && problem.freeUrl
    ? problem.freeUrl
    : `https://leetcode.com/problems/${problem.slug}/`;
}

function StatusIcon({ status }: { status: ProblemStatus }) {
  if (status === "solved")
    return <Check className="size-4 text-emerald-600 dark:text-emerald-400" />;
  if (status === "reviewing")
    return <RotateCcw className="size-4 text-sky-600 dark:text-sky-400" />;
  return <Circle className="size-4 text-muted-foreground" />;
}

/** Five dots, filled to the current level — a glance at how settled a problem is. */
function MasteryDots({ mastery }: { mastery: number }) {
  return (
    <span
      className="flex gap-0.5"
      title={`Mastery ${mastery} of ${MASTERED}`}
      aria-label={`Mastery ${mastery} of ${MASTERED}`}
    >
      {[1, 2, 3, 4, 5].map((level) => (
        <span
          key={level}
          className={cn(
            "size-1.5 rounded-full",
            level <= mastery ? "bg-emerald-500" : "bg-muted-foreground/25",
          )}
        />
      ))}
    </span>
  );
}

export function ProblemRow({
  view,
  today,
  showCategory = false,
  onCycleStatus,
  onOpenNotes,
}: {
  view: ProblemView;
  today: string;
  /** The Today panel mixes categories, so it labels each row with its own. */
  showCategory?: boolean;
  onCycleStatus: () => void;
  onOpenNotes: () => void;
}) {
  const { problem, progress, isDue } = view;
  const status = progress?.status ?? "todo";
  const label = reviewLabel(progress?.nextReviewAt ?? null, today);
  const hasNotes =
    progress !== null &&
    (progress.pattern !== "" ||
      progress.notes !== "" ||
      progress.keyInsight !== "" ||
      progress.relatedProblems.length > 0);

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
        isDue
          ? "border-amber-500/30 bg-amber-500/10"
          : "border-transparent hover:bg-muted/50",
      )}
    >
      <button
        type="button"
        onClick={onCycleStatus}
        aria-label={`Status: ${status}. Click to change.`}
        className="shrink-0 cursor-pointer rounded-full p-0.5 hover:bg-muted"
      >
        <StatusIcon status={status} />
      </button>

      <button
        type="button"
        onClick={onOpenNotes}
        className={cn(
          "flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 text-left hover:underline",
          status === "solved" && "text-muted-foreground",
        )}
      >
        <span className="truncate">{problem.title}</span>
        {problem.premium && (
          <Lock
            className="size-3 shrink-0 text-amber-600 dark:text-amber-400"
            aria-label="LeetCode Premium — links to a free mirror"
          />
        )}
        {hasNotes && (
          <StickyNote
            className="size-3 shrink-0 text-muted-foreground"
            aria-label="Has notes"
          />
        )}
      </button>

      {showCategory && (
        <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
          {problem.category}
        </span>
      )}

      {label && (
        <span
          className={cn(
            "shrink-0 text-xs",
            isDue
              ? "text-amber-700 dark:text-amber-400"
              : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      )}

      {progress && progress.mastery > 0 && (
        <MasteryDots mastery={progress.mastery} />
      )}

      <span
        className={cn(
          "w-16 shrink-0 text-right text-xs font-medium",
          DIFFICULTY_STYLES[problem.difficulty],
        )}
      >
        {problem.difficulty}
      </span>

      <a
        href={problemUrl(problem)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${problem.title} on LeetCode`}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}

"use client";

// The tracker. Takes any list — built-in or custom — because nothing here
// knows about a particular catalog; grouping and counting come from
// buildListView, and progress is fetched once for every problem the user has
// ever touched, regardless of which list surfaced it.

import { useMemo, useState } from "react";
import {
  Check,
  ChevronRight,
  Circle,
  ExternalLink,
  Lock,
  RotateCcw,
  StickyNote,
} from "lucide-react";
import { ProblemSheet } from "@/components/ProblemSheet";
import { useProgress } from "@/hooks/useProgress";
import { buildListView, reviewLabel, type ProblemView } from "@/lib/list-view";
import type { ProblemStatus } from "@/lib/db";
import type { ProblemList } from "@/lib/lists/problem-lists";
import type { Difficulty } from "@/lib/lists/types";
import { MASTERED } from "@/lib/spaced-repetition";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress as ProgressBar } from "@/components/ui/progress";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

// Clicking the circle walks the three states in a loop, as in AlgoLoop.
const NEXT_STATUS: Record<ProblemStatus, ProblemStatus> = {
  todo: "reviewing",
  reviewing: "solved",
  solved: "todo",
};

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};

function problemUrl(problem: ProblemView["problem"]): string {
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

function ProblemRow({
  view,
  today,
  onCycleStatus,
  onOpenNotes,
}: {
  view: ProblemView;
  today: string;
  onCycleStatus: () => void;
  onOpenNotes: () => void;
}) {
  const { problem, progress, isDue } = view;
  const status = progress?.status ?? "todo";
  const label = reviewLabel(progress?.nextReviewAt ?? null, today);
  const hasNotes = (progress?.notes ?? "") !== "";

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

      {label && (
        <span
          className={cn(
            "shrink-0 text-xs",
            isDue ? "text-amber-700 dark:text-amber-400" : "text-muted-foreground",
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

export function ProblemListTracker({ list }: { list: ProblemList }) {
  const { progress, today, loading, error, setStatus, setNotes, recordReview } =
    useProgress();
  const [difficulties, setDifficulties] = useState<Difficulty[]>(DIFFICULTIES);
  const [open, setOpen] = useState<Set<string>>(new Set());
  // Only the id is held, so the panel always reads the live progress record
  // rather than a copy taken when it was opened.
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const view = useMemo(
    () => buildListView(list, progress, today, difficulties),
    [list, progress, today, difficulties],
  );

  const selected = selectedId
    ? list.problems.find((p) => p.id === selectedId)
    : undefined;

  function toggleDifficulty(difficulty: Difficulty) {
    setDifficulties((prev) =>
      prev.includes(difficulty)
        ? prev.filter((d) => d !== difficulty)
        : [...prev, difficulty],
    );
  }

  function toggleCategory(name: string) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (!next.delete(name)) next.add(name);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">{list.name}</h1>
          <span className="shrink-0 text-sm text-muted-foreground tabular-nums">
            {view.solved} / {view.total} solved
          </span>
        </div>
        <p className="text-sm text-muted-foreground">{list.description}</p>
        <ProgressBar value={view.percent} className="h-2" />
        {view.due > 0 && (
          <Badge className="border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400">
            {view.due} due for review
          </Badge>
        )}
      </header>

      <div className="flex flex-wrap items-center gap-4 border-y py-3">
        <span className="text-sm text-muted-foreground">Difficulty</span>
        {DIFFICULTIES.map((difficulty) => (
          <label
            key={difficulty}
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <Checkbox
              checked={difficulties.includes(difficulty)}
              onCheckedChange={() => toggleDifficulty(difficulty)}
            />
            <span className={DIFFICULTY_STYLES[difficulty]}>{difficulty}</span>
          </label>
        ))}
      </div>

      {error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading progress…</p>
      ) : view.categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No problems match the current filter.
        </p>
      ) : (
        <div className="space-y-2">
          {view.categories.map((category) => (
            <Collapsible
              key={category.name}
              open={open.has(category.name)}
              onOpenChange={() => toggleCategory(category.name)}
            >
              <CollapsibleTrigger className="group flex w-full cursor-pointer items-center gap-3 rounded-md px-2 py-2.5 text-left hover:bg-muted/50">
                <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-90" />
                <span className="flex-1 truncate font-medium">
                  {category.name}
                </span>
                {category.due > 0 && (
                  <Badge className="shrink-0 border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400">
                    {category.due} due
                  </Badge>
                )}
                <ProgressBar
                  value={category.percent}
                  className="hidden h-1.5 w-24 shrink-0 sm:block"
                />
                <span className="w-14 shrink-0 text-right text-sm text-muted-foreground tabular-nums">
                  {category.solved} / {category.total}
                </span>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-1 py-1 pl-6">
                {category.problems.map((problemView) => (
                  <ProblemRow
                    key={problemView.problem.id}
                    view={problemView}
                    today={today}
                    onCycleStatus={() =>
                      setStatus(
                        problemView.problem.id,
                        NEXT_STATUS[problemView.progress?.status ?? "todo"],
                      )
                    }
                    onOpenNotes={() => setSelectedId(problemView.problem.id)}
                  />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      )}

      {selected && (
        // Keyed by problem, so opening a different one remounts the panel and
        // an unsaved draft can never follow you to another problem.
        <ProblemSheet
          key={selected.id}
          problem={selected}
          category={selected.category}
          progress={progress[selected.id] ?? null}
          today={today}
          open
          onOpenChange={(next) => {
            if (!next) setSelectedId(null);
          }}
          onSaveNotes={(notes) => setNotes(selected.id, notes)}
          onReview={(mode) => recordReview(selected.id, mode)}
        />
      )}
    </div>
  );
}

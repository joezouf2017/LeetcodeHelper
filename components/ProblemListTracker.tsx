"use client";

// The tracker. Takes any list — built-in or custom — because nothing here
// knows about a particular catalog; grouping and counting come from
// buildListView, and progress is fetched once for every problem the user has
// ever touched, regardless of which list surfaced it.

import { useCallback, useMemo, useState } from "react";
import { ChevronRight } from "lucide-react";
import {
  DIFFICULTY_STYLES,
  NEXT_STATUS,
  ProblemRow,
} from "@/components/ProblemRow";
import { ProblemSheet } from "@/components/ProblemSheet";
import { TodayPanel } from "@/components/TodayPanel";
import { useDailyGoal } from "@/hooks/useDailyGoal";
import { useProgress } from "@/hooks/useProgress";
import { buildListView, type ProblemView } from "@/lib/list-view";
import type { ProblemList } from "@/lib/lists/problem-lists";
import type { Difficulty } from "@/lib/lists/types";
import { buildTodayPlan } from "@/lib/today-plan";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Progress as ProgressBar } from "@/components/ui/progress";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];

export function ProblemListTracker({ list }: { list: ProblemList }) {
  const { progress, today, loading, error, setStatus, setNotes, recordReview } =
    useProgress();
  const [difficulties, setDifficulties] = useState<Difficulty[]>(DIFFICULTIES);
  const [open, setOpen] = useState<Set<string>>(new Set());
  // Only the id is held, so the panel always reads the live progress record
  // rather than a copy taken when it was opened.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [dailyGoal, setDailyGoal] = useDailyGoal();

  const view = useMemo(
    () => buildListView(list, progress, today, difficulties),
    [list, progress, today, difficulties],
  );

  // The plan ignores the difficulty filter on purpose: the filter is for
  // browsing the list below, while the plan is a recommendation about what to
  // work on, and hiding Hard problems should not quietly reorder your study.
  const plan = useMemo(
    () => buildTodayPlan(list, progress, today, dailyGoal),
    [list, progress, today, dailyGoal],
  );

  const selected = selectedId
    ? list.problems.find((p) => p.id === selectedId)
    : undefined;

  const cycleStatus = useCallback(
    (problemView: ProblemView) =>
      setStatus(
        problemView.problem.id,
        NEXT_STATUS[problemView.progress?.status ?? "todo"],
      ),
    [setStatus],
  );

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
      </header>

      {error && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </p>
      )}

      {!loading && (
        <TodayPanel
          plan={plan}
          today={today}
          dailyGoal={dailyGoal}
          onChangeDailyGoal={setDailyGoal}
          onCycleStatus={cycleStatus}
          onOpenNotes={(problemView) => setSelectedId(problemView.problem.id)}
        />
      )}

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
        {view.due > 0 && (
          <Badge className="ml-auto border-amber-500/30 bg-amber-500/15 text-amber-700 dark:text-amber-400">
            {view.due} due for review
          </Badge>
        )}
      </div>

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
                    onCycleStatus={() => cycleStatus(problemView)}
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

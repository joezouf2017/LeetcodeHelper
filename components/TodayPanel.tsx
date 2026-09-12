"use client";

// "What should I do today?" — the question that gets harder as a list grows.
// Reviews that have come due, then a few new problems from one category.

import { CalendarCheck, Minus, Plus } from "lucide-react";
import { ProblemRow } from "@/components/ProblemRow";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ProblemView } from "@/lib/list-view";
import { MAX_DAILY_GOAL, type TodayPlan } from "@/lib/today-plan";

function Section({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  if (count === 0) return null;
  return (
    <section className="space-y-1">
      <h3 className="px-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function TodayPanel({
  plan,
  today,
  dailyGoal,
  onChangeDailyGoal,
  onCycleStatus,
  onOpenNotes,
}: {
  plan: TodayPlan;
  today: string;
  dailyGoal: number;
  onChangeDailyGoal: (goal: number) => void;
  onCycleStatus: (view: ProblemView) => void;
  onOpenNotes: (view: ProblemView) => void;
}) {
  const nothingToDo = plan.due.length === 0 && plan.fresh.length === 0;

  return (
    <div className="space-y-4 rounded-lg border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CalendarCheck className="size-4 text-muted-foreground" />
          <h2 className="font-medium">Today</h2>
          <span className="text-xs text-muted-foreground tabular-nums">
            {today}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground">New per day</span>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            aria-label="Fewer new problems per day"
            disabled={dailyGoal <= 0}
            onClick={() => onChangeDailyGoal(dailyGoal - 1)}
          >
            <Minus className="size-3" />
          </Button>
          <span className="w-5 text-center text-sm tabular-nums">
            {dailyGoal}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="size-7"
            aria-label="More new problems per day"
            disabled={dailyGoal >= MAX_DAILY_GOAL}
            onClick={() => onChangeDailyGoal(dailyGoal + 1)}
          >
            <Plus className="size-3" />
          </Button>
        </div>
      </div>

      {nothingToDo ? (
        <p className="px-1 text-sm text-muted-foreground">
          {plan.focusCategory === null
            ? "Every problem in this list has been started, and nothing is due for review."
            : "Nothing due for review. Raise the daily goal above zero to pick up something new."}
        </p>
      ) : (
        <div className="space-y-4">
          <Section title="Due for review" count={plan.due.length}>
            {plan.due.map((view) => (
              <ProblemRow
                key={view.problem.id}
                view={view}
                today={today}
                showCategory
                onCycleStatus={() => onCycleStatus(view)}
                onOpenNotes={() => onOpenNotes(view)}
              />
            ))}
          </Section>

          <Section title="New problems" count={plan.fresh.length}>
            <div className="flex flex-wrap items-baseline gap-2 px-1 pb-1">
              <Badge variant="secondary">{plan.focusCategory}</Badge>
              <span className="text-xs text-muted-foreground">
                {plan.remainingInFocus} left in this category — the next one
                opens up once none of them are untouched.
              </span>
            </div>
            {plan.fresh.map((view) => (
              <ProblemRow
                key={view.problem.id}
                view={view}
                today={today}
                onCycleStatus={() => onCycleStatus(view)}
                onOpenNotes={() => onOpenNotes(view)}
              />
            ))}
          </Section>
        </div>
      )}
    </div>
  );
}

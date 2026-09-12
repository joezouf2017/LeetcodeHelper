"use client";

// The notes panel. Opens from a problem title and holds the two things you do
// after solving something: write down how it worked, and say whether you
// needed a hint.
//
// The four note fields follow AlgoLoop's split rather than being one big box.
// The point is the second pass: on review you want the pattern and the key
// insight, which are one line each, not the full write-up.
//
// The draft lives here rather than in the tracker so that closing the panel
// without saving discards it. The parent keys this component by problem id, so
// switching problems remounts it and cannot carry one problem's draft to
// another.

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Lightbulb, Lock, Sparkles } from "lucide-react";
import { RelatedProblemsPicker } from "@/components/RelatedProblemsPicker";
import type { ProblemNotes, Progress } from "@/lib/db";
import { masteryLabel, reviewLabel } from "@/lib/list-view";
import type { ListProblem } from "@/lib/lists/blind75";
import { MASTERED, type ReviewMode } from "@/lib/spaced-repetition";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

export interface ProblemSheetProps {
  problem: ListProblem;
  category: string;
  progress: Progress | null;
  today: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveNotes: (notes: ProblemNotes) => Promise<void>;
  onReview: (mode: ReviewMode) => Promise<void>;
}

function problemUrl(problem: ListProblem): string {
  return problem.premium && problem.freeUrl
    ? problem.freeUrl
    : `https://leetcode.com/problems/${problem.slug}/`;
}

function notesOf(progress: Progress | null): ProblemNotes {
  return {
    pattern: progress?.pattern ?? "",
    notes: progress?.notes ?? "",
    keyInsight: progress?.keyInsight ?? "",
    relatedProblems: progress?.relatedProblems ?? [],
  };
}

export function ProblemSheet({
  problem,
  category,
  progress,
  today,
  open,
  onOpenChange,
  onSaveNotes,
  onReview,
}: ProblemSheetProps) {
  const saved = notesOf(progress);
  // Compared by value, not identity: notesOf builds a fresh object every render.
  const savedKey = JSON.stringify(saved);

  const [draft, setDraft] = useState<ProblemNotes>(saved);
  const [saving, setSaving] = useState(false);
  const lastSynced = useRef(savedKey);

  // Notes can arrive after this panel has opened, because the panel can be
  // opened before the initial GET lands. Adopt what arrives, but never
  // overwrite something the user has already typed.
  useEffect(() => {
    if (savedKey === lastSynced.current) return;
    const incoming = JSON.parse(savedKey) as ProblemNotes;
    setDraft((current) =>
      JSON.stringify(current) === lastSynced.current ? incoming : current,
    );
    lastSynced.current = savedKey;
  }, [savedKey]);

  const mastery = progress?.mastery ?? 0;
  const nextReview = reviewLabel(progress?.nextReviewAt ?? null, today);
  const dirty = JSON.stringify(draft) !== savedKey;

  function edit<K extends keyof ProblemNotes>(field: K, value: ProblemNotes[K]) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function save() {
    setSaving(true);
    try {
      await onSaveNotes(draft);
    } finally {
      setSaving(false);
    }
  }

  async function review(mode: ReviewMode) {
    setSaving(true);
    try {
      // Writing notes and then hitting a review button is the natural order;
      // the review must not discard what was just typed.
      if (dirty) await onSaveNotes(draft);
      await onReview(mode);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="pr-6 text-base leading-snug">
            {problem.title}
          </SheetTitle>
          <SheetDescription>
            {category} · {problem.difficulty}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-6">
          <div className="space-y-2">
            <a
              href={problemUrl(problem)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
            >
              {problem.premium && problem.freeUrl
                ? "Open the free mirror"
                : "Open on LeetCode"}
              <ExternalLink className="size-3.5" />
            </a>
            {problem.premium && (
              <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                <Lock className="mt-0.5 size-3 shrink-0 text-amber-600 dark:text-amber-400" />
                Locked behind LeetCode Premium. The link goes to a free mirror
                of the same problem.
              </p>
            )}
          </div>

          <Separator />

          <section className="space-y-3">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-sm font-medium">{masteryLabel(mastery)}</span>
              {nextReview && (
                <span className="text-xs text-muted-foreground">
                  {nextReview}
                </span>
              )}
            </div>

            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((level) => (
                <span
                  key={level}
                  className={cn(
                    "h-1.5 flex-1 rounded-full",
                    level <= mastery
                      ? "bg-emerald-500"
                      : "bg-muted-foreground/20",
                  )}
                />
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              {mastery === MASTERED
                ? "Mastered — it will not come back for review. Needing a hint sends it back to level 1."
                : "Record how you solved it. A hint restarts the ladder at level 1; an unaided solve moves it up and pushes the next review further out."}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                disabled={saving}
                onClick={() => review("hint")}
              >
                <Lightbulb className="size-4" />
                With Hint
              </Button>
              <Button
                className="flex-1"
                disabled={saving}
                onClick={() => review("independent")}
              >
                <Sparkles className="size-4" />
                Independent
              </Button>
            </div>
          </section>

          <Separator />

          <section className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="note-pattern">Pattern</Label>
              <Input
                id="note-pattern"
                value={draft.pattern}
                onChange={(e) => edit("pattern", e.target.value)}
                placeholder="Sliding window, monotonic stack, binary search on the answer…"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note-key-insight">Key insight</Label>
              <Textarea
                id="note-key-insight"
                value={draft.keyInsight}
                onChange={(e) => edit("keyInsight", e.target.value)}
                placeholder="The one line you would want to read before trying it again."
                className="min-h-16 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="note-notes">Notes</Label>
              <Textarea
                id="note-notes"
                value={draft.notes}
                onChange={(e) => edit("notes", e.target.value)}
                placeholder="The full working: edge cases, the case you got wrong, complexity…"
                className="min-h-32 resize-y font-mono text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Related problems</Label>
              <RelatedProblemsPicker
                problemId={problem.id}
                value={draft.relatedProblems}
                onChange={(next) => edit("relatedProblems", next)}
              />
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                {dirty ? "Unsaved changes" : "Saved"}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={!dirty || saving}
                onClick={save}
              >
                Save notes
              </Button>
            </div>
          </section>
        </div>
      </SheetContent>
    </Sheet>
  );
}

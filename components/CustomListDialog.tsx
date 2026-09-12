"use client";

// Build a list by picking from the merged pool of every problem across the
// three built-in lists. A custom list stores references, never copies — so the
// problems in it keep whatever title, difficulty and progress they already
// have, and two lists can hold the same problem without either owning it.

import { useMemo, useState } from "react";
import { Check, Loader2, Search } from "lucide-react";
import {
  MAX_CUSTOM_LIST_DESCRIPTION,
  MAX_CUSTOM_LIST_NAME,
  type CustomListDraft,
} from "@/lib/custom-lists";
import type { ListProblem } from "@/lib/lists/blind75";
import {
  BUILTIN_LISTS,
  getAllProblems,
  type ProblemList,
} from "@/lib/lists/problem-lists";
import type { Difficulty } from "@/lib/lists/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DIFFICULTIES: Difficulty[] = ["Easy", "Medium", "Hard"];
const POOL = getAllProblems();

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  Easy: "text-emerald-600 dark:text-emerald-400",
  Medium: "text-amber-600 dark:text-amber-400",
  Hard: "text-rose-600 dark:text-rose-400",
};

function PickerBody({
  onCancel,
  onCreate,
  saving,
  error,
}: {
  onCancel: () => void;
  onCreate: (draft: CustomListDraft) => void;
  saving: boolean;
  error: string | null;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [groupUnder, setGroupUnder] = useState("");
  const [search, setSearch] = useState("");
  const [sourceId, setSourceId] = useState<string>("all");
  const [difficulties, setDifficulties] = useState<Difficulty[]>(DIFFICULTIES);
  // A Set, not an array: order comes from the pool, and membership is what the
  // checkboxes ask about on every keystroke of the search box.
  const [picked, setPicked] = useState<Set<string>>(new Set());

  const source: ProblemList | undefined = BUILTIN_LISTS.find(
    (l) => l.id === sourceId,
  );

  const visible = useMemo(() => {
    const base: ListProblem[] = source ? source.problems : POOL;
    const needle = search.trim().toLowerCase();
    return base.filter(
      (p) =>
        difficulties.includes(p.difficulty) &&
        (needle === "" ||
          p.title.toLowerCase().includes(needle) ||
          p.category.toLowerCase().includes(needle)),
    );
  }, [source, search, difficulties]);

  function toggle(id: string) {
    setPicked((prev) => {
      const next = new Set(prev);
      if (!next.delete(id)) next.add(id);
      return next;
    });
  }

  function toggleAllVisible() {
    const allPicked = visible.every((p) => picked.has(p.id));
    setPicked((prev) => {
      const next = new Set(prev);
      for (const problem of visible) {
        if (allPicked) next.delete(problem.id);
        else next.add(problem.id);
      }
      return next;
    });
  }

  function submit() {
    // Pool order, not click order: a list read in the catalog's order is
    // easier to work through than one in the order you happened to tick.
    const problemIds = POOL.filter((p) => picked.has(p.id)).map((p) => p.id);
    onCreate({
      name,
      description,
      problemIds,
      categoryOverride: groupUnder.trim() || null,
    });
  }

  return (
    <>
      <div className="grid min-h-0 flex-1 gap-4 overflow-hidden md:grid-cols-[1fr_1.2fr]">
        <div className="space-y-3 overflow-y-auto pr-1">
          <div className="space-y-1.5">
            <Label htmlFor="list-name">Name</Label>
            <Input
              id="list-name"
              value={name}
              maxLength={MAX_CUSTOM_LIST_NAME}
              onChange={(e) => setName(e.target.value)}
              placeholder="Two weeks of graphs"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="list-description">Description</Label>
            <Input
              id="list-description"
              value={description}
              maxLength={MAX_CUSTOM_LIST_DESCRIPTION}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="list-group">Group everything under</Label>
            <Input
              id="list-group"
              value={groupUnder}
              onChange={(e) => setGroupUnder(e.target.value)}
              placeholder="Leave empty to keep each problem's own category"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Pick from</Label>
            <div className="flex flex-wrap gap-1.5">
              <Button
                size="sm"
                variant={sourceId === "all" ? "default" : "outline"}
                onClick={() => setSourceId("all")}
              >
                All {POOL.length}
              </Button>
              {BUILTIN_LISTS.map((list) => (
                <Button
                  key={list.id}
                  size="sm"
                  variant={sourceId === list.id ? "default" : "outline"}
                  onClick={() => setSourceId(list.id)}
                >
                  {list.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <div className="flex gap-4">
              {DIFFICULTIES.map((difficulty) => (
                <label
                  key={difficulty}
                  className="flex cursor-pointer items-center gap-2 text-sm"
                >
                  <Checkbox
                    checked={difficulties.includes(difficulty)}
                    onCheckedChange={() =>
                      setDifficulties((prev) =>
                        prev.includes(difficulty)
                          ? prev.filter((d) => d !== difficulty)
                          : [...prev, difficulty],
                      )
                    }
                  />
                  <span className={DIFFICULTY_STYLES[difficulty]}>
                    {difficulty}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1.5 text-sm text-rose-700 dark:text-rose-400">
              {error}
            </p>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or category"
                className="pl-8"
              />
            </div>
            <Button size="sm" variant="outline" onClick={toggleAllVisible}>
              {visible.every((p) => picked.has(p.id)) && visible.length > 0
                ? "None"
                : "All"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            {picked.size} picked · {visible.length} shown
          </p>

          <ul className="min-h-48 flex-1 space-y-0.5 overflow-y-auto rounded-md border p-1">
            {visible.length === 0 && (
              <li className="p-3 text-sm text-muted-foreground">
                Nothing matches those filters.
              </li>
            )}
            {visible.map((problem) => {
              const checked = picked.has(problem.id);
              return (
                <li key={problem.id}>
                  <button
                    type="button"
                    onClick={() => toggle(problem.id)}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted/60",
                      checked && "bg-muted",
                    )}
                  >
                    <Check
                      className={cn(
                        "size-3.5 shrink-0 text-emerald-600 dark:text-emerald-400",
                        !checked && "invisible",
                      )}
                    />
                    <span className="flex-1 truncate">{problem.title}</span>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:inline">
                      {problem.category}
                    </span>
                    <span
                      className={cn(
                        "w-14 shrink-0 text-right text-xs",
                        DIFFICULTY_STYLES[problem.difficulty],
                      )}
                    >
                      {problem.difficulty}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          onClick={submit}
          disabled={saving || picked.size === 0 || name.trim() === ""}
        >
          {saving && <Loader2 className="size-4 animate-spin" />}
          Create list ({picked.size})
        </Button>
      </DialogFooter>
    </>
  );
}

export function CustomListDialog({
  open,
  onOpenChange,
  onCreate,
  saving,
  error,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (draft: CustomListDraft) => void;
  saving: boolean;
  error: string | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[85vh] max-w-4xl flex-col gap-4 sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle className="text-base">New list</DialogTitle>
          <DialogDescription>
            Pick from all {POOL.length} problems across the three built-in
            lists. Progress carries over — anything you have already solved
            stays solved here.
          </DialogDescription>
        </DialogHeader>
        <PickerBody
          onCancel={() => onOpenChange(false)}
          onCreate={onCreate}
          saving={saving}
          error={error}
        />
      </DialogContent>
    </Dialog>
  );
}

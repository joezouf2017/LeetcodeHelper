"use client";

// Picks other problems to link a problem to. Searches the merged pool of 168
// rather than the current list, because a problem worth linking to might live
// in a list you are not looking at — and progress is shared across lists
// anyway, so the link stays meaningful after you switch.

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { getAllProblems } from "@/lib/lists/problem-lists";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const POOL = getAllProblems();
const TITLES = new Map(POOL.map((p) => [p.id, p.title]));

export function RelatedProblemsPicker({
  problemId,
  value,
  onChange,
}: {
  /** The problem being edited, excluded from its own suggestions. */
  problemId: string;
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const selectable = useMemo(
    () => POOL.filter((p) => p.id !== problemId && !value.includes(p.id)),
    [problemId, value],
  );

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {value.map((id) => (
            <li
              key={id}
              className="flex items-center gap-1 rounded-md border bg-muted/50 py-0.5 pr-0.5 pl-2 text-xs"
            >
              <span>{TITLES.get(id) ?? id}</span>
              <button
                type="button"
                aria-label={`Remove ${TITLES.get(id) ?? id}`}
                onClick={() => onChange(value.filter((other) => other !== id))}
                className="cursor-pointer rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full justify-start">
            <Plus className="size-3.5" />
            Link a problem
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command>
            <CommandInput placeholder="Search all 168 problems…" />
            <CommandList>
              <CommandEmpty>No problem matches.</CommandEmpty>
              <CommandGroup>
                {selectable.map((problem) => (
                  <CommandItem
                    key={problem.id}
                    value={problem.title}
                    onSelect={() => {
                      onChange([...value, problem.id]);
                      setOpen(false);
                    }}
                  >
                    <span className="truncate">{problem.title}</span>
                    <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                      {problem.difficulty}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

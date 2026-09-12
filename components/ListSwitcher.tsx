"use client";

// Switching lists changes what you are looking at and nothing else. Progress
// is keyed by problem, so a problem you mastered in one list is still mastered
// in the next — that is the whole point of the switcher existing.

import { Check, ChevronDown, Plus, Trash2 } from "lucide-react";
import type { ProblemList } from "@/lib/lists/problem-lists";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function Row({
  list,
  selected,
  onSelect,
  onDelete,
}: {
  list: ProblemList;
  selected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
}) {
  return (
    <DropdownMenuItem
      onSelect={onSelect}
      className="flex items-center gap-2 pr-1"
    >
      <Check className={cn("size-3.5", !selected && "invisible")} />
      <span className="flex-1 truncate">{list.name}</span>
      <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
        {list.problems.length}
      </span>
      {onDelete && (
        <button
          type="button"
          aria-label={`Delete ${list.name}`}
          className="shrink-0 cursor-pointer rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          onClick={(event) => {
            // Without this the menu treats the click as picking the list.
            event.preventDefault();
            event.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="size-3.5" />
        </button>
      )}
    </DropdownMenuItem>
  );
}

export function ListSwitcher({
  lists,
  customLists,
  selectedId,
  onSelect,
  onCreate,
  onDelete,
}: {
  lists: ProblemList[];
  customLists: ProblemList[];
  selectedId: string;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
}) {
  const current =
    [...lists, ...customLists].find((l) => l.id === selectedId) ?? lists[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          {current.name}
          <ChevronDown className="size-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Built-in
        </DropdownMenuLabel>
        {lists.map((list) => (
          <Row
            key={list.id}
            list={list}
            selected={list.id === selectedId}
            onSelect={() => onSelect(list.id)}
          />
        ))}

        {customLists.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Yours
            </DropdownMenuLabel>
            {customLists.map((list) => (
              <Row
                key={list.id}
                list={list}
                selected={list.id === selectedId}
                onSelect={() => onSelect(list.id)}
                onDelete={() => onDelete(list.id)}
              />
            ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onCreate} className="gap-2">
          <Plus className="size-3.5" />
          New list…
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

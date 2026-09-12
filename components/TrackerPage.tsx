"use client";

// Owns which list is on screen. The tracker itself takes a list and does not
// care where it came from, so this is the only place that knows the difference
// between a built-in list and one the user built.

import { useState } from "react";
import { useCustomLists } from "@/hooks/useCustomLists";
import { DEFAULT_LIST_ID, useSelectedListId } from "@/hooks/useSelectedList";
import { CustomListDialog } from "@/components/CustomListDialog";
import { ListSwitcher } from "@/components/ListSwitcher";
import { ProblemListTracker } from "@/components/ProblemListTracker";
import type { CustomListDraft } from "@/lib/custom-lists";
import { BUILTIN_LISTS, getListById } from "@/lib/lists/problem-lists";

export function TrackerPage() {
  const [selectedId, setSelectedId] = useSelectedListId();
  const { lists: customLists, error, create, remove } = useCustomLists();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // A custom list arrives asynchronously, so a stored selection may point at
  // something not loaded yet. Falling back to the default keeps the page
  // rendering; the real list takes over as soon as it lands.
  const selected =
    getListById(selectedId) ??
    customLists.find((l) => l.id === selectedId) ??
    getListById(DEFAULT_LIST_ID)!;

  async function handleCreate(draft: CustomListDraft) {
    setSaving(true);
    const created = await create(draft);
    setSaving(false);
    if (created) {
      setDialogOpen(false);
      setSelectedId(created.id);
    }
  }

  async function handleDelete(id: string) {
    const removed = await remove(id);
    // Deleting the list you are looking at leaves nothing selected, so fall
    // back. Progress is untouched either way — a list is only a view over it.
    if (removed && id === selectedId) setSelectedId(DEFAULT_LIST_ID);
  }

  return (
    <div className="space-y-4">
      <ListSwitcher
        lists={BUILTIN_LISTS}
        customLists={customLists}
        selectedId={selected.id}
        onSelect={setSelectedId}
        onCreate={() => setDialogOpen(true)}
        onDelete={handleDelete}
      />

      {error && !dialogOpen && (
        <p className="rounded-md border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-700 dark:text-rose-400">
          {error}
        </p>
      )}

      {/* Keyed by list, so switching resets the open categories and filters
          rather than carrying one list's view state into another. */}
      <ProblemListTracker key={selected.id} list={selected} />

      <CustomListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreate={handleCreate}
        saving={saving}
        error={dialogOpen ? error : null}
      />
    </div>
  );
}

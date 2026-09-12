"use client";

import { createStoredPreference } from "@/hooks/useStoredPreference";
import { BUILTIN_LISTS } from "@/lib/lists/problem-lists";
import { isCustomListId } from "@/lib/custom-lists";

export const DEFAULT_LIST_ID = BUILTIN_LISTS[0].id;

const BUILTIN_IDS = new Set(BUILTIN_LISTS.map((l) => l.id));

/**
 * Which list the tracker is showing. A stored id that no longer names anything
 * — a deleted custom list, a renamed built-in — falls back to the default
 * rather than leaving the page with nothing to render.
 */
export const { usePreference: useSelectedListId } = createStoredPreference(
  "leetcodehelper.selectedList",
  (raw) =>
    raw !== null && (BUILTIN_IDS.has(raw) || isCustomListId(raw))
      ? raw
      : DEFAULT_LIST_ID,
);

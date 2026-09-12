// Turns stored rows into a ProblemList the tracker can render, and checks a
// draft before it reaches the database.
//
// This lives apart from db.ts on purpose: storage holds problem ids and knows
// nothing about the catalog, and the join to the catalog happens here. A
// custom list stores references, never copies of problem data — so a title or
// difficulty corrected in the catalog is corrected everywhere at once.

import type { CustomListItemRow, CustomListRow } from "./db";
import type { ListProblem } from "./lists/blind75";
import { getAllProblems, type ProblemList } from "./lists/problem-lists";

export const CUSTOM_LIST_ID_PREFIX = "custom:";
export const MAX_CUSTOM_LIST_NAME = 60;
export const MAX_CUSTOM_LIST_DESCRIPTION = 200;

export interface CustomListDraft {
  name: string;
  description?: string;
  problemIds: string[];
  /** Groups every problem under one heading instead of its own category. */
  categoryOverride?: string | null;
}

const POOL = new Map(getAllProblems().map((p) => [p.id, p]));

export function newCustomListId(): string {
  return `${CUSTOM_LIST_ID_PREFIX}${crypto.randomUUID()}`;
}

export function isCustomListId(id: string): boolean {
  return id.startsWith(CUSTOM_LIST_ID_PREFIX);
}

/** Returns the first problem with the draft, or null when it is fine. */
export function validateDraft(draft: CustomListDraft): string | null {
  const name = draft.name.trim();
  if (name === "") return "A name is required.";
  if (name.length > MAX_CUSTOM_LIST_NAME) {
    return `The name must be ${MAX_CUSTOM_LIST_NAME} characters or fewer.`;
  }
  if ((draft.description ?? "").length > MAX_CUSTOM_LIST_DESCRIPTION) {
    return `The description must be ${MAX_CUSTOM_LIST_DESCRIPTION} characters or fewer.`;
  }
  if (draft.problemIds.length === 0) return "Pick at least one problem.";

  const seen = new Set<string>();
  for (const id of draft.problemIds) {
    if (!POOL.has(id)) return `No such problem: ${id}`;
    if (seen.has(id)) return `The same problem is listed twice: ${id}`;
    seen.add(id);
  }
  return null;
}

export function resolveCustomList(
  row: CustomListRow,
  items: CustomListItemRow[],
): ProblemList {
  const problems: ListProblem[] = [];
  for (const item of [...items].sort((a, b) => a.sort_order - b.sort_order)) {
    const problem = POOL.get(item.problem_id);
    // A stored id the catalog no longer has is skipped rather than fatal: the
    // rest of the user's list is still perfectly usable.
    if (!problem) continue;
    problems.push({
      ...problem,
      category: item.category_override ?? problem.category,
      order: problems.length + 1,
    });
  }

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    problems,
    isCustom: true,
  };
}

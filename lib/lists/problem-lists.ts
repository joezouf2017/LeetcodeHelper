// lib/lists/problem-lists.ts
//
// Registry of all built-in problem lists, plus the type for user-created
// custom lists. Progress is tracked once per problem `id` (the LeetCode
// slug) — never per list — so switching lists never resets progress on
// problems the lists share (e.g. "Two Sum" appears in all three built-ins).

import { NEETCODE150 } from "./neetcode150";
import { BLIND75 } from "./blind75";
import { GRIND75 } from "./grind75";
import type { ListProblem } from "./blind75";

export interface ProblemList {
  id: string;              // "neetcode150" | "blind75" | "grind75" | `custom:${uuid}`
  name: string;
  description: string;
  sourceUrl?: string;
  problems: ListProblem[];
  isCustom?: boolean;
}

export const BUILTIN_LISTS: ProblemList[] = [
  {
    id: "neetcode150",
    name: "NeetCode 150",
    description: "150 题 · 18 分类 · 覆盖面最全,适合有 2-3 个月准备时间的用户",
    sourceUrl: "https://neetcode.io/practice",
    problems: NEETCODE150.map((p, i) => ({ ...p, order: i + 1 })),
  },
  {
    id: "blind75",
    name: "Blind 75",
    description: "75 题 · 最早的经典题单,覆盖核心高频模式,适合时间紧张的用户",
    sourceUrl: "https://neetcode.io/practice/practice/blind75",
    problems: BLIND75,
  },
  {
    id: "grind75",
    name: "Grind 75",
    description: "75 题 · Blind 75 的作者按难度曲线重新排序 + 加了时间预估",
    sourceUrl: "https://www.techinterviewhandbook.org/grind75/",
    problems: GRIND75,
  },
];

// ---- Custom lists (user-created) ----
//
// A custom list does NOT duplicate problem data — it just stores an ordered
// array of problem ids that reference the shared pool below. Persist this
// shape in SQLite as: custom_lists(id, name, description, created_at) and
// custom_list_items(list_id, problem_id, category_override, order).
export interface CustomListDraft {
  name: string;
  description?: string;
  problemIds: string[]; // ids pulled from getAllProblems() below
}

// ---- Merged global problem pool ----
//
// De-duplicates across all built-in lists by `id` (slug). Use this to power
// the "pick problems for a custom list" checkbox UI, and to resolve a
// problem's canonical title/difficulty/premium status regardless of which
// list surfaced it.
export function getAllProblems(): ListProblem[] {
  const seen = new Map<string, ListProblem>();
  for (const list of BUILTIN_LISTS) {
    for (const p of list.problems) {
      if (!seen.has(p.id)) seen.set(p.id, p);
    }
  }
  return [...seen.values()];
}

export function getListById(id: string): ProblemList | undefined {
  return BUILTIN_LISTS.find((l) => l.id === id);
}

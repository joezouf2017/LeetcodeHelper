// Static sanity checks on the built-in problem lists.
//
// Every number asserted here is also quoted in the README. The point of the
// file is that those numbers get measured on every run instead of being
// trusted — if a catalog is ever edited, this fails before the docs go stale.

import { describe, expect, it } from "vitest";
import { NEETCODE150, NEETCODE150_CATEGORIES } from "@/lib/lists/neetcode150";
import { BLIND75 } from "@/lib/lists/blind75";
import { GRIND75 } from "@/lib/lists/grind75";
import {
  BUILTIN_LISTS,
  getAllProblems,
  getListById,
} from "@/lib/lists/problem-lists";

function duplicateIds(ids: string[]): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dupes.add(id);
    seen.add(id);
  }
  return [...dupes];
}

describe("NeetCode 150", () => {
  it("has 150 problems with unique ids", () => {
    expect(NEETCODE150).toHaveLength(150);
    expect(duplicateIds(NEETCODE150.map((p) => p.id))).toEqual([]);
  });

  it("splits 28 Easy / 101 Medium / 21 Hard", () => {
    const byDifficulty = {
      Easy: NEETCODE150.filter((p) => p.difficulty === "Easy").length,
      Medium: NEETCODE150.filter((p) => p.difficulty === "Medium").length,
      Hard: NEETCODE150.filter((p) => p.difficulty === "Hard").length,
    };
    expect(byDifficulty).toEqual({ Easy: 28, Medium: 101, Hard: 21 });
  });

  it("has 7 premium problems, each with a free mirror url", () => {
    const premium = NEETCODE150.filter((p) => p.premium);
    expect(premium).toHaveLength(7);
    expect(premium.filter((p) => !p.freeUrl)).toEqual([]);
  });

  it("uses only the 18 declared categories, and uses all of them", () => {
    const used = new Set(NEETCODE150.map((p) => p.category));
    expect([...used].sort()).toEqual([...NEETCODE150_CATEGORIES].sort());
  });

  it("keeps each category's problems contiguous, so array order is category order", () => {
    // The tracker groups by category in NEETCODE150_CATEGORIES order and
    // relies on array position as the within-category order.
    const firstSeen = new Map<string, number>();
    NEETCODE150.forEach((p, i) => {
      if (!firstSeen.has(p.category)) firstSeen.set(p.category, i);
    });
    expect([...firstSeen.keys()]).toEqual([...NEETCODE150_CATEGORIES]);
  });
});

describe("Blind 75", () => {
  it("has 75 problems with unique ids", () => {
    expect(BLIND75).toHaveLength(75);
    expect(duplicateIds(BLIND75.map((p) => p.id))).toEqual([]);
  });

  it("numbers order 1..75 with no gaps", () => {
    expect(BLIND75.map((p) => p.order)).toEqual(
      Array.from({ length: 75 }, (_, i) => i + 1),
    );
  });
});

describe("Grind 75", () => {
  it("has 75 problems with unique ids", () => {
    expect(GRIND75).toHaveLength(75);
    expect(duplicateIds(GRIND75.map((p) => p.id))).toEqual([]);
  });

  it("numbers order 1..75 with no gaps", () => {
    expect(GRIND75.map((p) => p.order)).toEqual(
      Array.from({ length: 75 }, (_, i) => i + 1),
    );
  });
});

describe("built-in list registry", () => {
  it("registers the three lists under their documented ids", () => {
    expect(BUILTIN_LISTS.map((l) => l.id)).toEqual([
      "neetcode150",
      "blind75",
      "grind75",
    ]);
  });

  it("gives every problem in every list a 1-based order", () => {
    for (const list of BUILTIN_LISTS) {
      expect(
        list.problems.map((p) => p.order),
        `order sequence for ${list.id}`,
      ).toEqual(Array.from({ length: list.problems.length }, (_, i) => i + 1));
    }
  });

  it("keeps the per-list category counts the README advertises", () => {
    const counts = Object.fromEntries(
      BUILTIN_LISTS.map((l) => [
        l.id,
        new Set(l.problems.map((p) => p.category)).size,
      ]),
    );
    expect(counts).toEqual({ neetcode150: 18, blind75: 13, grind75: 15 });
  });

  it("resolves lists by id, and returns undefined for unknown ids", () => {
    expect(getListById("blind75")?.name).toBe("Blind 75");
    expect(getListById("nope")).toBeUndefined();
  });
});

describe("merged global problem pool", () => {
  it("de-duplicates the three lists down to 168 distinct problems", () => {
    const all = getAllProblems();
    expect(all).toHaveLength(168);
    expect(duplicateIds(all.map((p) => p.id))).toEqual([]);
  });

  it("carries 7 premium problems, each with a free mirror", () => {
    const premium = getAllProblems().filter((p) => p.premium);
    expect(premium).toHaveLength(7);
    expect(premium.filter((p) => !p.freeUrl)).toEqual([]);
  });

  it("agrees on premium status wherever lists share a problem", () => {
    // getAllProblems() keeps the first record it sees, so a problem flagged
    // premium in one list and not in another would silently lose its free
    // mirror link depending on which list was registered first.
    const canonical = new Map<string, boolean>();
    const conflicts: string[] = [];
    for (const list of BUILTIN_LISTS) {
      for (const p of list.problems) {
        const known = canonical.get(p.id);
        if (known === undefined) canonical.set(p.id, Boolean(p.premium));
        else if (known !== Boolean(p.premium))
          conflicts.push(`${p.id} (${list.id})`);
      }
    }
    expect(conflicts).toEqual([]);
  });

  it("contains every id referenced by any built-in list", () => {
    const pool = new Set(getAllProblems().map((p) => p.id));
    const missing = BUILTIN_LISTS.flatMap((l) =>
      l.problems.filter((p) => !pool.has(p.id)).map((p) => `${l.id}:${p.id}`),
    );
    expect(missing).toEqual([]);
  });

  it("agrees on title and difficulty wherever lists share a problem", () => {
    // Progress is keyed by id across lists, so a shared id must not describe
    // two different problems.
    const canonical = new Map<string, string>();
    const conflicts: string[] = [];
    for (const list of BUILTIN_LISTS) {
      for (const p of list.problems) {
        const fingerprint = `${p.title}|${p.difficulty}`;
        const known = canonical.get(p.id);
        if (known === undefined) canonical.set(p.id, fingerprint);
        else if (known !== fingerprint)
          conflicts.push(`${p.id}: "${known}" vs "${fingerprint}" (${list.id})`);
      }
    }
    expect(conflicts).toEqual([]);
  });
});

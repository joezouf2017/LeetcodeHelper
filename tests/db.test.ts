// Storage layer. Uses a throwaway database file per run, so these tests never
// touch the developer's real data/leetcodehelper.db.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lch-db-"));
process.env.LEETCODEHELPER_DB_PATH = path.join(tempDir, "test.db");

const {
  closeDb,
  dueProblemIds,
  getDb,
  listProgress,
  readProgress,
  recordReview,
  setNotes,
  setStatus,
} = await import("@/lib/db");

function columnsOf(table: string): string[] {
  return getDb()
    .prepare(`PRAGMA table_info(${table})`)
    .all()
    .map((c) => (c as { name: string }).name);
}

beforeEach(() => {
  getDb().exec(
    "DELETE FROM progress; DELETE FROM custom_list_items; DELETE FROM custom_lists;",
  );
});

afterAll(() => {
  closeDb();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("schema", () => {
  it("creates the three tables", () => {
    const tables = getDb()
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table'")
      .all()
      .map((t) => (t as { name: string }).name);
    expect(tables).toEqual(
      expect.arrayContaining(["progress", "custom_lists", "custom_list_items"]),
    );
  });

  it("keys progress by problem alone — no list and no category", () => {
    // The whole point of the design: switching lists must not reset progress,
    // so a list id here would be a bug. Category belongs to a list, not to a
    // problem, so storing it here would give one fact two homes.
    const columns = columnsOf("progress");
    expect(columns).toEqual([
      "problem_id",
      "status",
      "mastery",
      "next_review_at",
      "notes",
      "updated_at",
      // Appended rather than slotted next to `notes`, so that a fresh database
      // and a migrated one end up with identical column order.
      "pattern",
      "related_problems",
      "key_insight",
    ]);
    const primaryKey = getDb()
      .prepare("PRAGMA table_info(progress)")
      .all()
      .filter((c) => (c as { pk: number }).pk > 0)
      .map((c) => (c as { name: string }).name);
    expect(primaryKey).toEqual(["problem_id"]);
  });

  it("gives custom lists their own membership table referencing problem ids", () => {
    expect(columnsOf("custom_lists")).toEqual([
      "id",
      "name",
      "description",
      "created_at",
    ]);
    expect(columnsOf("custom_list_items")).toEqual([
      "list_id",
      "problem_id",
      "category_override",
      "sort_order",
    ]);
  });

  it("refuses an out-of-range mastery or an unknown status", () => {
    const db = getDb();
    expect(() =>
      db
        .prepare("INSERT INTO progress (problem_id, mastery) VALUES ('x', 9)")
        .run(),
    ).toThrow();
    expect(() =>
      db
        .prepare("INSERT INTO progress (problem_id, status) VALUES ('x', 'nope')")
        .run(),
    ).toThrow();
  });
});

describe("reading progress", () => {
  it("returns undefined for a problem that has never been touched", () => {
    expect(readProgress("two-sum")).toBeUndefined();
    expect(listProgress()).toEqual([]);
  });
});

describe("setStatus", () => {
  it("creates a row on first write, with a zeroed mastery", () => {
    const row = setStatus("two-sum", "solved");
    expect(row).toMatchObject({
      problemId: "two-sum",
      status: "solved",
      mastery: 0,
      nextReviewAt: null,
      notes: "",
    });
    expect(row.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("updates an existing row without disturbing notes or mastery", () => {
    setNotes("two-sum", { notes: "hash map, one pass" });
    recordReview("two-sum", "independent", "2026-03-05");
    const row = setStatus("two-sum", "todo");
    expect(row.status).toBe("todo");
    expect(row.notes).toBe("hash map, one pass");
    expect(row.mastery).toBe(2);
  });
});

describe("setNotes", () => {
  it("creates a row on first write and leaves the status at todo", () => {
    const row = setNotes("3sum", { notes: "sort, then two pointers" });
    expect(row).toMatchObject({
      problemId: "3sum",
      notes: "sort, then two pointers",
      status: "todo",
      mastery: 0,
      pattern: "",
      keyInsight: "",
      relatedProblems: [],
    });
  });

  it("writes all four note fields", () => {
    const row = setNotes("3sum", {
      pattern: "Sort + two pointers",
      notes: "fix a[i], then close in from both ends",
      keyInsight: "skip duplicates on i as well as on the inner pointers",
      relatedProblems: ["two-sum", "container-with-most-water"],
    });
    expect(row).toMatchObject({
      pattern: "Sort + two pointers",
      notes: "fix a[i], then close in from both ends",
      keyInsight: "skip duplicates on i as well as on the inner pointers",
      relatedProblems: ["two-sum", "container-with-most-water"],
    });
  });

  it("leaves fields alone when they are not part of the patch", () => {
    setNotes("3sum", { pattern: "Sort + two pointers", notes: "first draft" });
    const row = setNotes("3sum", { notes: "second draft" });
    expect(row.pattern).toBe("Sort + two pointers");
    expect(row.notes).toBe("second draft");
  });

  it("keeps the order the user gave the related problems in", () => {
    const related = ["valid-anagram", "two-sum", "3sum-closest"];
    expect(setNotes("3sum", { relatedProblems: related }).relatedProblems).toEqual(
      related,
    );
  });

  it("can empty the related problems again", () => {
    setNotes("3sum", { relatedProblems: ["two-sum"] });
    expect(setNotes("3sum", { relatedProblems: [] }).relatedProblems).toEqual([]);
  });

  it("survives a related_problems column that is not valid JSON", () => {
    // Hand-edited database files happen. Reading should degrade to an empty
    // list rather than throwing and taking the whole page down.
    setNotes("3sum", { notes: "x" });
    getDb()
      .prepare("UPDATE progress SET related_problems = 'not json' WHERE problem_id = '3sum'")
      .run();
    expect(readProgress("3sum")?.relatedProblems).toEqual([]);
  });
});

describe("recordReview", () => {
  it("puts a hinted solve at level 1, due again tomorrow", () => {
    const row = recordReview("two-sum", "hint", "2026-03-05");
    expect(row.mastery).toBe(1);
    expect(row.nextReviewAt).toBe("2026-03-06");
  });

  it("puts a first unaided solve at level 2, due in three days", () => {
    const row = recordReview("two-sum", "independent", "2026-03-05");
    expect(row.mastery).toBe(2);
    expect(row.nextReviewAt).toBe("2026-03-08");
  });

  it("moves a problem out of todo, because a review means it was attempted", () => {
    expect(readProgress("two-sum")).toBeUndefined();
    expect(recordReview("two-sum", "hint", "2026-03-05").status).toBe(
      "reviewing",
    );
  });

  it("marks the problem solved once it reaches level 5, and stops scheduling", () => {
    let row = recordReview("two-sum", "independent", "2026-03-05"); // 2
    row = recordReview("two-sum", "independent", "2026-03-08"); // 3
    expect(row.nextReviewAt).toBe("2026-03-15");
    row = recordReview("two-sum", "independent", "2026-03-15"); // 4
    expect(row.nextReviewAt).toBe("2026-04-05");
    row = recordReview("two-sum", "independent", "2026-04-05"); // 5
    expect(row.mastery).toBe(5);
    expect(row.nextReviewAt).toBeNull();
    expect(row.status).toBe("solved");
  });

  it("sends a mastered problem back to level 1 when a hint is needed again", () => {
    for (const on of ["2026-03-05", "2026-03-08", "2026-03-15", "2026-04-05"])
      recordReview("two-sum", "independent", on);
    const row = recordReview("two-sum", "hint", "2026-05-01");
    expect(row.mastery).toBe(1);
    expect(row.nextReviewAt).toBe("2026-05-02");
    expect(row.status).toBe("reviewing");
  });
});

describe("dueProblemIds", () => {
  it("returns problems whose review date has arrived or passed", () => {
    recordReview("two-sum", "hint", "2026-03-01"); // due 2026-03-02
    recordReview("3sum", "independent", "2026-03-04"); // due 2026-03-07
    expect(dueProblemIds("2026-03-05")).toEqual(["two-sum"]);
    expect(dueProblemIds("2026-03-07").sort()).toEqual(["3sum", "two-sum"]);
  });

  it("never returns a problem that has no review scheduled", () => {
    setStatus("valid-anagram", "solved");
    for (const on of ["2026-03-05", "2026-03-08", "2026-03-15", "2026-04-05"])
      recordReview("two-sum", "independent", on);
    expect(dueProblemIds("2030-01-01")).toEqual([]);
  });
});

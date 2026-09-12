// User-created lists. Two layers, tested separately: the database holds rows
// of problem ids and knows nothing about the catalog, and resolveCustomList
// joins those rows to the merged problem pool.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  CUSTOM_LIST_ID_PREFIX,
  MAX_CUSTOM_LIST_NAME,
  resolveCustomList,
  validateDraft,
} from "@/lib/custom-lists";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lch-custom-"));
process.env.LEETCODEHELPER_DB_PATH = path.join(tempDir, "test.db");

const {
  closeDb,
  deleteCustomList,
  getDb,
  insertCustomList,
  selectCustomLists,
  setStatus,
} = await import("@/lib/db");

beforeEach(() => {
  getDb().exec("DELETE FROM custom_list_items; DELETE FROM custom_lists; DELETE FROM progress;");
});

afterAll(() => {
  closeDb();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("validateDraft", () => {
  it("accepts a name and at least one real problem", () => {
    expect(
      validateDraft({ name: "Warm-up", problemIds: ["two-sum"] }),
    ).toBeNull();
  });

  it("requires a name that is not just whitespace", () => {
    expect(validateDraft({ name: "", problemIds: ["two-sum"] })).toMatch(/name/i);
    expect(validateDraft({ name: "   ", problemIds: ["two-sum"] })).toMatch(
      /name/i,
    );
  });

  it("caps the name length", () => {
    const long = "x".repeat(MAX_CUSTOM_LIST_NAME + 1);
    expect(validateDraft({ name: long, problemIds: ["two-sum"] })).toMatch(
      /name/i,
    );
  });

  it("requires at least one problem", () => {
    expect(validateDraft({ name: "Empty", problemIds: [] })).toMatch(/problem/i);
  });

  it("rejects a problem that is not in the merged pool", () => {
    expect(
      validateDraft({ name: "Bad", problemIds: ["two-sum", "made-up"] }),
    ).toMatch(/made-up/);
  });

  it("rejects the same problem listed twice", () => {
    expect(
      validateDraft({ name: "Dupe", problemIds: ["two-sum", "two-sum"] }),
    ).toMatch(/twice|duplicate/i);
  });
});

describe("resolveCustomList", () => {
  const row = {
    id: "custom:abc",
    name: "Warm-up",
    description: "",
    created_at: "2026-03-05T00:00:00.000Z",
  };

  it("joins stored ids to the catalog, keeping the stored order", () => {
    const list = resolveCustomList(row, [
      { problem_id: "3sum", category_override: null, sort_order: 0 },
      { problem_id: "two-sum", category_override: null, sort_order: 1 },
    ]);
    expect(list.id).toBe("custom:abc");
    expect(list.isCustom).toBe(true);
    expect(list.problems.map((p) => p.id)).toEqual(["3sum", "two-sum"]);
    expect(list.problems.map((p) => p.order)).toEqual([1, 2]);
    expect(list.problems[1].title).toBe("Two Sum");
  });

  it("keeps each problem's own category when no override is stored", () => {
    const list = resolveCustomList(row, [
      { problem_id: "two-sum", category_override: null, sort_order: 0 },
    ]);
    expect(list.problems[0].category).toBe("Arrays & Hashing");
  });

  it("applies a category override so the user can group their own way", () => {
    const list = resolveCustomList(row, [
      { problem_id: "two-sum", category_override: "Week 1", sort_order: 0 },
      { problem_id: "3sum", category_override: "Week 1", sort_order: 1 },
    ]);
    expect(list.problems.map((p) => p.category)).toEqual(["Week 1", "Week 1"]);
  });

  it("drops an id the catalog no longer knows rather than crashing", () => {
    const list = resolveCustomList(row, [
      { problem_id: "two-sum", category_override: null, sort_order: 0 },
      { problem_id: "removed-from-the-catalog", category_override: null, sort_order: 1 },
    ]);
    expect(list.problems.map((p) => p.id)).toEqual(["two-sum"]);
    expect(list.problems[0].order).toBe(1);
  });
});

describe("storing custom lists", () => {
  it("round-trips a list with its problems in order", () => {
    const id = insertCustomList(
      { id: "custom:1", name: "Warm-up", description: "easy ones" },
      [
        { problemId: "3sum", categoryOverride: null },
        { problemId: "two-sum", categoryOverride: null },
      ],
    );
    expect(id).toBe("custom:1");

    const stored = selectCustomLists();
    expect(stored).toHaveLength(1);
    expect(stored[0].list.name).toBe("Warm-up");
    expect(stored[0].list.description).toBe("easy ones");
    expect(stored[0].items.map((i) => i.problem_id)).toEqual([
      "3sum",
      "two-sum",
    ]);
    expect(stored[0].items.map((i) => i.sort_order)).toEqual([0, 1]);
  });

  it("orders lists by creation time, newest last", () => {
    insertCustomList({ id: "custom:1", name: "First", description: "" }, [
      { problemId: "two-sum", categoryOverride: null },
    ]);
    insertCustomList({ id: "custom:2", name: "Second", description: "" }, [
      { problemId: "3sum", categoryOverride: null },
    ]);
    expect(selectCustomLists().map((s) => s.list.name)).toEqual([
      "First",
      "Second",
    ]);
  });

  it("deletes the items along with the list", () => {
    insertCustomList({ id: "custom:1", name: "Warm-up", description: "" }, [
      { problemId: "two-sum", categoryOverride: null },
    ]);
    expect(deleteCustomList("custom:1")).toBe(true);
    expect(selectCustomLists()).toEqual([]);
    const orphans = getDb()
      .prepare("SELECT COUNT(*) AS n FROM custom_list_items")
      .get() as { n: number };
    expect(orphans.n).toBe(0);
  });

  it("reports a delete of something that was not there", () => {
    expect(deleteCustomList("custom:nope")).toBe(false);
  });

  it("leaves progress untouched when a list is deleted", () => {
    // The whole design rests on this: a list is a view over shared progress,
    // so throwing the view away must not throw the work away.
    setStatus("two-sum", "solved");
    insertCustomList({ id: "custom:1", name: "Warm-up", description: "" }, [
      { problemId: "two-sum", categoryOverride: null },
    ]);
    deleteCustomList("custom:1");
    const progress = getDb()
      .prepare("SELECT status FROM progress WHERE problem_id = 'two-sum'")
      .get() as { status: string } | undefined;
    expect(progress?.status).toBe("solved");
  });

  it("stores a category override", () => {
    insertCustomList({ id: "custom:1", name: "Weeks", description: "" }, [
      { problemId: "two-sum", categoryOverride: "Week 1" },
    ]);
    expect(selectCustomLists()[0].items[0].category_override).toBe("Week 1");
  });
});

describe("the id prefix", () => {
  it("marks custom lists apart from the built-in ones", () => {
    expect(CUSTOM_LIST_ID_PREFIX).toBe("custom:");
  });
});

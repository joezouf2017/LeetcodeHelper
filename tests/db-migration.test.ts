// Opening a database written by an earlier version must not lose anything.
//
// This matters right now: the first shipped schema had a single `notes`
// column, and adding `pattern`, `related_problems` and `key_insight` cannot be
// done by CREATE TABLE IF NOT EXISTS — that statement is a no-op once the
// table exists, so an existing file would keep the old columns and every query
// naming a new one would fail.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import Database from "better-sqlite3";
import { afterAll, describe, expect, it } from "vitest";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lch-migrate-"));
const dbPath = path.join(tempDir, "old.db");

// Verbatim first-release schema, before the extra note fields existed.
const legacy = new Database(dbPath);
legacy.exec(`
  CREATE TABLE progress (
    problem_id     TEXT    PRIMARY KEY,
    status         TEXT    NOT NULL DEFAULT 'todo'
                           CHECK (status IN ('todo', 'reviewing', 'solved')),
    mastery        INTEGER NOT NULL DEFAULT 0
                           CHECK (mastery BETWEEN 0 AND 5),
    next_review_at TEXT,
    notes          TEXT    NOT NULL DEFAULT '',
    updated_at     TEXT    NOT NULL DEFAULT ''
  );
`);
legacy
  .prepare(
    `INSERT INTO progress (problem_id, status, mastery, next_review_at, notes, updated_at)
          VALUES ('two-sum', 'reviewing', 3, '2026-03-12', 'one-pass hash map', '2026-03-05T00:00:00.000Z')`,
  )
  .run();
legacy.close();

process.env.LEETCODEHELPER_DB_PATH = dbPath;
const { closeDb, getDb, readProgress } = await import("@/lib/db");

afterAll(() => {
  closeDb();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("opening a first-release database", () => {
  it("adds the note columns that did not exist yet", () => {
    const columns = getDb()
      .prepare("PRAGMA table_info(progress)")
      .all()
      .map((c) => (c as { name: string }).name);
    expect(columns).toEqual(
      expect.arrayContaining(["pattern", "related_problems", "key_insight"]),
    );
  });

  it("keeps every value the old row already held", () => {
    expect(readProgress("two-sum")).toMatchObject({
      problemId: "two-sum",
      status: "reviewing",
      mastery: 3,
      nextReviewAt: "2026-03-12",
      notes: "one-pass hash map",
      updatedAt: "2026-03-05T00:00:00.000Z",
    });
  });

  it("gives the migrated row empty values for the new fields", () => {
    expect(readProgress("two-sum")).toMatchObject({
      pattern: "",
      keyInsight: "",
      relatedProblems: [],
    });
  });

  it("is safe to run again on an already-migrated file", () => {
    closeDb();
    expect(() => getDb()).not.toThrow();
    expect(readProgress("two-sum")?.notes).toBe("one-pass hash map");
  });
});

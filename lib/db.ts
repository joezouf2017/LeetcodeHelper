// SQLite persistence. A local file, no server, no credentials.
//
// The one structural decision here: `progress` is keyed by `problem_id` alone.
// There is deliberately no `list_id` column — the same LeetCode problem shows
// up in several lists, and marking it mastered in one must mark it mastered in
// all of them. There is deliberately no `category` column either: a category
// belongs to a list's taxonomy, not to the problem, and the three built-in
// lists file the same problem under different categories.

import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { isDueOn, today } from "./app-date";
import {
  MASTERED,
  advanceMastery,
  nextReviewDate,
  type MasteryLevel,
  type ReviewMode,
} from "./spaced-repetition";

export type ProblemStatus = "todo" | "reviewing" | "solved";

export interface Progress {
  problemId: string;
  status: ProblemStatus;
  mastery: MasteryLevel;
  nextReviewAt: string | null;
  notes: string;
  updatedAt: string;
}

interface ProgressRow {
  problem_id: string;
  status: ProblemStatus;
  mastery: MasteryLevel;
  next_review_at: string | null;
  notes: string;
  updated_at: string;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS progress (
  problem_id     TEXT    PRIMARY KEY,
  status         TEXT    NOT NULL DEFAULT 'todo'
                         CHECK (status IN ('todo', 'reviewing', 'solved')),
  mastery        INTEGER NOT NULL DEFAULT 0
                         CHECK (mastery BETWEEN 0 AND 5),
  next_review_at TEXT,
  notes          TEXT    NOT NULL DEFAULT '',
  updated_at     TEXT    NOT NULL DEFAULT ''
);

CREATE INDEX IF NOT EXISTS progress_next_review_at
  ON progress (next_review_at) WHERE next_review_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS custom_lists (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS custom_list_items (
  list_id           TEXT    NOT NULL REFERENCES custom_lists (id) ON DELETE CASCADE,
  problem_id        TEXT    NOT NULL,
  category_override TEXT,
  sort_order        INTEGER NOT NULL,
  PRIMARY KEY (list_id, problem_id)
);
`;

const DEFAULT_DB_PATH = path.join(process.cwd(), "data", "leetcodehelper.db");

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;
  const file = process.env.LEETCODEHELPER_DB_PATH ?? DEFAULT_DB_PATH;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  db = new Database(file);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.exec(SCHEMA);
  return db;
}

export function closeDb(): void {
  db?.close();
  db = null;
}

function toProgress(row: ProgressRow): Progress {
  return {
    problemId: row.problem_id,
    status: row.status,
    mastery: row.mastery,
    nextReviewAt: row.next_review_at,
    notes: row.notes,
    updatedAt: row.updated_at,
  };
}

function now(): string {
  return new Date().toISOString();
}

function mustReadProgress(problemId: string): Progress {
  const row = readProgress(problemId);
  if (!row) throw new Error(`no progress row for ${problemId}`);
  return row;
}

export function readProgress(problemId: string): Progress | undefined {
  const row = getDb()
    .prepare("SELECT * FROM progress WHERE problem_id = ?")
    .get(problemId) as ProgressRow | undefined;
  return row && toProgress(row);
}

export function listProgress(): Progress[] {
  const rows = getDb()
    .prepare("SELECT * FROM progress ORDER BY problem_id")
    .all() as ProgressRow[];
  return rows.map(toProgress);
}

export function setStatus(
  problemId: string,
  status: ProblemStatus,
): Progress {
  getDb()
    .prepare(
      `INSERT INTO progress (problem_id, status, updated_at)
            VALUES (@problemId, @status, @updatedAt)
       ON CONFLICT (problem_id) DO UPDATE
            SET status = excluded.status, updated_at = excluded.updated_at`,
    )
    .run({ problemId, status, updatedAt: now() });
  return mustReadProgress(problemId);
}

export function setNotes(problemId: string, notes: string): Progress {
  getDb()
    .prepare(
      `INSERT INTO progress (problem_id, notes, updated_at)
            VALUES (@problemId, @notes, @updatedAt)
       ON CONFLICT (problem_id) DO UPDATE
            SET notes = excluded.notes, updated_at = excluded.updated_at`,
    )
    .run({ problemId, notes, updatedAt: now() });
  return mustReadProgress(problemId);
}

/**
 * Record that the user solved the problem today, with or without a hint, and
 * reschedule it. A review always moves the problem out of `todo` — it has
 * demonstrably been attempted — and retires it to `solved` at the top level.
 */
export function recordReview(
  problemId: string,
  mode: ReviewMode,
  on: string = today(),
): Progress {
  const write = getDb().transaction(() => {
    const current = readProgress(problemId)?.mastery ?? 0;
    const mastery = advanceMastery(current, mode);
    getDb()
      .prepare(
        `INSERT INTO progress (problem_id, status, mastery, next_review_at, updated_at)
              VALUES (@problemId, @status, @mastery, @nextReviewAt, @updatedAt)
         ON CONFLICT (problem_id) DO UPDATE
              SET status         = excluded.status,
                  mastery        = excluded.mastery,
                  next_review_at = excluded.next_review_at,
                  updated_at     = excluded.updated_at`,
      )
      .run({
        problemId,
        status: mastery === MASTERED ? "solved" : "reviewing",
        mastery,
        nextReviewAt: nextReviewDate(mastery, on),
        updatedAt: now(),
      });
  });
  write();
  return mustReadProgress(problemId);
}

export function dueProblemIds(on: string = today()): string[] {
  return listProgress()
    .filter((p) => isDueOn(p.nextReviewAt, on))
    .map((p) => p.problemId);
}

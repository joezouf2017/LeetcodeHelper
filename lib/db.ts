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

/**
 * The four things the notes panel records, following AlgoLoop's split. Keeping
 * the pattern and the key insight apart from the long notes is what makes a
 * review cheap: on the second pass you read two lines, not an essay.
 */
export interface ProblemNotes {
  pattern: string;
  notes: string;
  keyInsight: string;
  /** Ids of other problems, in the order the user added them. */
  relatedProblems: string[];
}

export interface Progress extends ProblemNotes {
  problemId: string;
  status: ProblemStatus;
  mastery: MasteryLevel;
  nextReviewAt: string | null;
  updatedAt: string;
}

interface ProgressRow {
  problem_id: string;
  status: ProblemStatus;
  mastery: MasteryLevel;
  next_review_at: string | null;
  notes: string;
  updated_at: string;
  pattern: string;
  // A JSON array rather than a join table: this list is only ever read and
  // written whole, and the ids are validated at the API boundary. Normalise it
  // if a "which problems point at this one?" query ever becomes useful.
  related_problems: string;
  key_insight: string;
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
  updated_at     TEXT    NOT NULL DEFAULT '',
  -- Appended rather than grouped next to the notes column, so that a fresh
  -- database has the same column order as one migrated by ADD_COLUMNS below.
  pattern          TEXT NOT NULL DEFAULT '',
  related_problems TEXT NOT NULL DEFAULT '[]',
  key_insight      TEXT NOT NULL DEFAULT ''
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

// Columns added after the first release. CREATE TABLE IF NOT EXISTS does
// nothing to a table that already exists, so an existing file needs these
// added explicitly or every query naming one of them fails.
const ADD_COLUMNS: Record<string, string> = {
  pattern: "ALTER TABLE progress ADD COLUMN pattern TEXT NOT NULL DEFAULT ''",
  related_problems:
    "ALTER TABLE progress ADD COLUMN related_problems TEXT NOT NULL DEFAULT '[]'",
  key_insight:
    "ALTER TABLE progress ADD COLUMN key_insight TEXT NOT NULL DEFAULT ''",
};

function migrate(database: Database.Database): void {
  const existing = new Set(
    database
      .prepare("PRAGMA table_info(progress)")
      .all()
      .map((c) => (c as { name: string }).name),
  );
  for (const [column, statement] of Object.entries(ADD_COLUMNS)) {
    if (!existing.has(column)) database.exec(statement);
  }
}

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
  migrate(db);
  return db;
}

export function closeDb(): void {
  db?.close();
  db = null;
}

function parseRelated(json: string): string[] {
  // A hand-edited file should not take the page down; an unreadable list reads
  // as an empty one.
  try {
    const parsed: unknown = JSON.parse(json);
    return Array.isArray(parsed)
      ? parsed.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function toProgress(row: ProgressRow): Progress {
  return {
    problemId: row.problem_id,
    status: row.status,
    mastery: row.mastery,
    nextReviewAt: row.next_review_at,
    notes: row.notes,
    updatedAt: row.updated_at,
    pattern: row.pattern,
    keyInsight: row.key_insight,
    relatedProblems: parseRelated(row.related_problems),
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

/** Column behind each note field. Fixed map, so the names below are never user input. */
const NOTE_COLUMNS: Record<keyof ProblemNotes, string> = {
  pattern: "pattern",
  notes: "notes",
  keyInsight: "key_insight",
  relatedProblems: "related_problems",
};

/**
 * Write any subset of the note fields. Fields left out of `patch` keep the
 * value they already had, so editing the notes box cannot wipe the pattern.
 */
export function setNotes(
  problemId: string,
  patch: Partial<ProblemNotes>,
): Progress {
  const fields = (Object.keys(NOTE_COLUMNS) as (keyof ProblemNotes)[]).filter(
    (field) => patch[field] !== undefined,
  );

  const values: Record<string, string> = {};
  for (const field of fields) {
    const value = patch[field];
    values[NOTE_COLUMNS[field]] = Array.isArray(value)
      ? JSON.stringify(value)
      : (value as string);
  }

  const columns = fields.map((field) => NOTE_COLUMNS[field]);
  const insertColumns = ["problem_id", "updated_at", ...columns];
  const insertValues = ["@problem_id", "@updated_at", ...columns.map((c) => `@${c}`)];
  const assignments = ["updated_at = excluded.updated_at", ...columns.map((c) => `${c} = excluded.${c}`)];

  getDb()
    .prepare(
      `INSERT INTO progress (${insertColumns.join(", ")})
            VALUES (${insertValues.join(", ")})
       ON CONFLICT (problem_id) DO UPDATE SET ${assignments.join(", ")}`,
    )
    .run({ problem_id: problemId, updated_at: now(), ...values });

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

// The progress route, exercised by calling the handlers directly. App Router
// route handlers are plain functions over Request, so this needs no server.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lch-api-"));
process.env.LEETCODEHELPER_DB_PATH = path.join(tempDir, "test.db");

const { closeDb, getDb, recordReview } = await import("@/lib/db");
const { GET, PATCH } = await import("@/app/api/progress/route");

function patch(body: unknown): Promise<Response> {
  return PATCH(
    new Request("http://localhost/api/progress", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  getDb().exec("DELETE FROM progress");
});

afterAll(() => {
  closeDb();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("GET", () => {
  it("returns an empty map and an empty due list on a fresh database", async () => {
    const body = await (await GET()).json();
    expect(body.progress).toEqual({});
    expect(body.due).toEqual([]);
    expect(body.today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("keys progress by problem id and lists what is due", async () => {
    recordReview("two-sum", "hint", "2020-01-01"); // long overdue
    recordReview("3sum", "independent", "2099-01-01"); // far in the future
    const body = await (await GET()).json();
    expect(Object.keys(body.progress).sort()).toEqual(["3sum", "two-sum"]);
    expect(body.progress["two-sum"]).toMatchObject({ mastery: 1 });
    expect(body.due).toEqual(["two-sum"]);
  });
});

describe("PATCH", () => {
  it("sets a status", async () => {
    const res = await patch({ problemId: "two-sum", status: "solved" });
    expect(res.status).toBe(200);
    expect((await res.json()).progress).toMatchObject({
      problemId: "two-sum",
      status: "solved",
    });
  });

  it("sets notes", async () => {
    const res = await patch({ problemId: "two-sum", notes: "one-pass hash" });
    expect((await res.json()).progress.notes).toBe("one-pass hash");
  });

  it("round-trips notes containing newlines, quotes and non-ASCII text", async () => {
    // The notes box is free text a user pastes code and prose into; it has to
    // survive JSON encoding and SQLite storage unchanged.
    const notes = `dp[i] = max(dp[i-1], 0) + a[i]\n"卡дан" — O(n) / O(1)\t<tab>\\n`;
    const saved = (await (await patch({ problemId: "two-sum", notes })).json())
      .progress.notes;
    expect(saved).toBe(notes);
    const reread = await (await GET()).json();
    expect(reread.progress["two-sum"].notes).toBe(notes);
  });

  it("lets notes be cleared back to empty", async () => {
    await patch({ problemId: "two-sum", notes: "something" });
    const res = await patch({ problemId: "two-sum", notes: "" });
    expect((await res.json()).progress.notes).toBe("");
  });

  it("keeps notes across a review, and keeps mastery across a notes edit", async () => {
    await patch({ problemId: "two-sum", notes: "sort then scan" });
    await patch({ problemId: "two-sum", review: "independent" });
    await patch({ problemId: "two-sum", notes: "sort then scan, two pointers" });
    const { progress } = await (await GET()).json();
    expect(progress["two-sum"]).toMatchObject({
      notes: "sort then scan, two pointers",
      mastery: 2,
      status: "reviewing",
    });
  });

  it("records a review and returns the new schedule", async () => {
    const res = await patch({ problemId: "two-sum", review: "independent" });
    const { progress } = await res.json();
    expect(progress.mastery).toBe(2);
    expect(progress.nextReviewAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("shares one progress record across every list the problem appears in", async () => {
    // two-sum is in all three built-in lists; there is only ever one row.
    await patch({ problemId: "two-sum", review: "independent" });
    const body = await (await GET()).json();
    expect(Object.keys(body.progress)).toEqual(["two-sum"]);
  });

  it("writes the pattern and key insight fields", async () => {
    const res = await patch({
      problemId: "3sum",
      pattern: "Sort + two pointers",
      keyInsight: "skip duplicates on i too, not just on the inner pointers",
    });
    expect((await res.json()).progress).toMatchObject({
      pattern: "Sort + two pointers",
      keyInsight: "skip duplicates on i too, not just on the inner pointers",
    });
  });

  it("accepts related problems that exist in the merged pool", async () => {
    const res = await patch({
      problemId: "3sum",
      relatedProblems: ["two-sum", "container-with-most-water"],
    });
    expect((await res.json()).progress.relatedProblems).toEqual([
      "two-sum",
      "container-with-most-water",
    ]);
  });

  it("rejects a related problem that is not a real problem", async () => {
    const res = await patch({
      problemId: "3sum",
      relatedProblems: ["two-sum", "invented-problem"],
    });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/invented-problem/);
  });

  it("rejects relating a problem to itself", async () => {
    const res = await patch({ problemId: "3sum", relatedProblems: ["3sum"] });
    expect(res.status).toBe(400);
  });

  it("rejects related problems that are not a list of strings", async () => {
    expect(
      (await patch({ problemId: "3sum", relatedProblems: "two-sum" })).status,
    ).toBe(400);
    expect(
      (await patch({ problemId: "3sum", relatedProblems: [7] })).status,
    ).toBe(400);
  });

  it("rejects a non-string pattern or key insight", async () => {
    expect((await patch({ problemId: "3sum", pattern: 1 })).status).toBe(400);
    expect((await patch({ problemId: "3sum", keyInsight: null })).status).toBe(
      400,
    );
  });

  it("rejects a problem id that is not in any catalog", async () => {
    const res = await patch({ problemId: "not-a-real-problem", status: "todo" });
    expect(res.status).toBe(404);
    expect((await res.json()).error).toMatch(/unknown problem/i);
  });

  it("rejects a malformed body", async () => {
    expect((await patch("not json")).status).toBe(400);
    expect((await patch({ status: "todo" })).status).toBe(400);
    expect((await patch({ problemId: "two-sum" })).status).toBe(400);
  });

  it("rejects values outside the allowed sets", async () => {
    expect(
      (await patch({ problemId: "two-sum", status: "finished" })).status,
    ).toBe(400);
    expect(
      (await patch({ problemId: "two-sum", review: "guessed" })).status,
    ).toBe(400);
    expect((await patch({ problemId: "two-sum", notes: 42 })).status).toBe(400);
  });

  it("leaves no row behind when a request is rejected", async () => {
    await patch({ problemId: "two-sum", status: "finished" });
    const body = await (await GET()).json();
    expect(body.progress).toEqual({});
  });
});

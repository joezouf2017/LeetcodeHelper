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

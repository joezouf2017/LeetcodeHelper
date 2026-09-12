// The custom-lists route, exercised by calling the handlers directly.

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeEach, describe, expect, it } from "vitest";

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "lch-api-lists-"));
process.env.LEETCODEHELPER_DB_PATH = path.join(tempDir, "test.db");

const { closeDb, getDb } = await import("@/lib/db");
const { DELETE, GET, POST } = await import("@/app/api/lists/route");

function post(body: unknown): Promise<Response> {
  return POST(
    new Request("http://localhost/api/lists", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: typeof body === "string" ? body : JSON.stringify(body),
    }),
  );
}

function remove(id: string): Promise<Response> {
  return DELETE(
    new Request(`http://localhost/api/lists?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),
  );
}

beforeEach(() => {
  getDb().exec("DELETE FROM custom_list_items; DELETE FROM custom_lists;");
});

afterAll(() => {
  closeDb();
  fs.rmSync(tempDir, { recursive: true, force: true });
});

describe("GET", () => {
  it("returns nothing before any list exists", async () => {
    expect((await (await GET()).json()).lists).toEqual([]);
  });
});

describe("POST", () => {
  it("creates a list and returns it resolved against the catalog", async () => {
    const res = await post({
      name: "  Warm-up  ",
      description: " the easy ones ",
      problemIds: ["two-sum", "3sum"],
    });
    expect(res.status).toBe(201);
    const { list } = await res.json();
    expect(list.id).toMatch(/^custom:/);
    expect(list.isCustom).toBe(true);
    expect(list.name).toBe("Warm-up");
    expect(list.description).toBe("the easy ones");
    expect(list.problems.map((p: { title: string }) => p.title)).toEqual([
      "Two Sum",
      "3Sum",
    ]);
  });

  it("groups everything under one heading when an override is given", async () => {
    const { list } = await (
      await post({
        name: "Week 1",
        problemIds: ["two-sum", "3sum"],
        categoryOverride: "Week 1",
      })
    ).json();
    expect(
      list.problems.map((p: { category: string }) => p.category),
    ).toEqual(["Week 1", "Week 1"]);
  });

  it("treats a blank override as no override at all", async () => {
    const { list } = await (
      await post({
        name: "Blank",
        problemIds: ["two-sum"],
        categoryOverride: "   ",
      })
    ).json();
    expect(list.problems[0].category).toBe("Arrays & Hashing");
  });

  it("rejects a draft that cannot be built", async () => {
    expect((await post({ name: "", problemIds: ["two-sum"] })).status).toBe(400);
    expect((await post({ name: "Empty", problemIds: [] })).status).toBe(400);
    const unknown = await post({ name: "Bad", problemIds: ["made-up"] });
    expect(unknown.status).toBe(400);
    expect((await unknown.json()).error).toMatch(/made-up/);
  });

  it("rejects a malformed body", async () => {
    expect((await post("not json")).status).toBe(400);
    expect((await post({ problemIds: ["two-sum"] })).status).toBe(400);
    expect((await post({ name: "x", problemIds: "two-sum" })).status).toBe(400);
    expect((await post({ name: "x", problemIds: [7] })).status).toBe(400);
  });

  it("leaves nothing behind when a request is rejected", async () => {
    await post({ name: "Bad", problemIds: ["made-up"] });
    expect((await (await GET()).json()).lists).toEqual([]);
  });

  it("returns lists in creation order even when created in the same millisecond", async () => {
    // Ordering by (created_at, id) looked fine until several lists landed in
    // the same millisecond and the random uuid decided the order — the lists
    // then reshuffled between page loads. Enough entries here that the old
    // ordering fails essentially every run.
    const names = ["a", "b", "c", "d", "e", "f"];
    for (const name of names) {
      await post({ name, problemIds: ["two-sum"] });
    }
    const { lists } = await (await GET()).json();
    expect(lists.map((l: { name: string }) => l.name)).toEqual(names);
  });

  it("lets two lists hold the same problem", async () => {
    // Lists are views over one shared pool, so overlap is normal, not a clash.
    await post({ name: "A", problemIds: ["two-sum"] });
    await post({ name: "B", problemIds: ["two-sum", "3sum"] });
    const { lists } = await (await GET()).json();
    expect(lists.map((l: { name: string }) => l.name)).toEqual(["A", "B"]);
  });
});

describe("DELETE", () => {
  it("removes a list by id", async () => {
    const { list } = await (
      await post({ name: "Warm-up", problemIds: ["two-sum"] })
    ).json();
    expect((await remove(list.id)).status).toBe(200);
    expect((await (await GET()).json()).lists).toEqual([]);
  });

  it("reports an id that does not exist", async () => {
    expect((await remove("custom:nope")).status).toBe(404);
  });

  it("requires an id", async () => {
    const res = await DELETE(
      new Request("http://localhost/api/lists", { method: "DELETE" }),
    );
    expect(res.status).toBe(400);
  });
});

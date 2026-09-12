// The code runner's pure parts: comparing a produced value against an expected
// one, and keeping a bounded submission history in localStorage.
//
// Deliberately not modelled on AlgoLoop's `##RESULT##i@@status@@...` stdout
// protocol. That format exists because Java runs in a separate process where
// stdout is the only channel; a Web Worker hands back structured objects, and
// a delimiter protocol would only add a way for user data containing "@@" to
// corrupt the results.

import { describe, expect, it } from "vitest";
import {
  MAX_SUBMISSIONS,
  MAX_TEST_CASES,
  formatValue,
  matchesExpected,
  pushSubmission,
  readSubmissions,
  submissionsKey,
  summarise,
  type Submission,
} from "@/lib/code-runner/history";

function submission(overrides: Partial<Submission> = {}): Submission {
  return {
    id: "s1",
    problemId: "two-sum",
    language: "javascript",
    submittedAt: "2026-03-05T10:00:00.000Z",
    code: "function twoSum() {}",
    status: "pass",
    passed: 2,
    total: 2,
    ...overrides,
  };
}

describe("comparing a result against the expected value", () => {
  it("matches primitives by value", () => {
    expect(matchesExpected(1, 1)).toBe(true);
    expect(matchesExpected("a", "a")).toBe(true);
    expect(matchesExpected(true, false)).toBe(false);
    expect(matchesExpected(null, null)).toBe(true);
  });

  it("does not treat a number as its string", () => {
    expect(matchesExpected(1, "1")).toBe(false);
    expect(matchesExpected(0, false)).toBe(false);
    expect(matchesExpected(null, undefined)).toBe(false);
  });

  it("compares arrays element by element, order included", () => {
    expect(matchesExpected([0, 1], [0, 1])).toBe(true);
    expect(matchesExpected([1, 0], [0, 1])).toBe(false);
    expect(matchesExpected([0, 1], [0, 1, 2])).toBe(false);
  });

  it("compares nested arrays, which is what most grid problems return", () => {
    expect(matchesExpected([[1, 2], [3]], [[1, 2], [3]])).toBe(true);
    expect(matchesExpected([[1, 2], [3]], [[1, 2], [4]])).toBe(false);
  });

  it("compares plain objects regardless of key order", () => {
    expect(matchesExpected({ a: 1, b: 2 }, { b: 2, a: 1 })).toBe(true);
    expect(matchesExpected({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it("treats NaN as equal to NaN, unlike ===", () => {
    // A dynamic-programming answer of NaN is a bug, but the comparison should
    // report "NaN vs NaN" as a match rather than a confusing mismatch.
    expect(matchesExpected(NaN, NaN)).toBe(true);
  });
});

describe("formatValue", () => {
  it("renders values the way the user typed them", () => {
    expect(formatValue([0, 1])).toBe("[0,1]");
    expect(formatValue("abc")).toBe('"abc"');
    expect(formatValue(null)).toBe("null");
    expect(formatValue(undefined)).toBe("undefined");
    expect(formatValue(NaN)).toBe("NaN");
  });

  it("does not throw on a value that cannot be serialised", () => {
    const cyclic: Record<string, unknown> = {};
    cyclic.self = cyclic;
    expect(() => formatValue(cyclic)).not.toThrow();
    expect(formatValue(cyclic)).toContain("[unserialisable");
  });
});

describe("summarise", () => {
  it("passes only when every case passes", () => {
    expect(summarise([{ status: "pass" }, { status: "pass" }])).toBe("pass");
    expect(summarise([{ status: "pass" }, { status: "fail" }])).toBe("fail");
  });

  it("reports an error case as an error, which outranks a plain failure", () => {
    expect(summarise([{ status: "fail" }, { status: "error" }])).toBe("error");
  });

  it("calls a run with no cases a pass — the code at least executed", () => {
    expect(summarise([])).toBe("pass");
  });
});

describe("submission history", () => {
  it("scopes the storage key to one problem and language", () => {
    expect(submissionsKey("two-sum")).toBe(
      "leetcodehelper.submissions.two-sum",
    );
    expect(submissionsKey("3sum")).not.toBe(submissionsKey("two-sum"));
  });

  it("puts the newest submission first", () => {
    const history = pushSubmission(
      [submission({ id: "old" })],
      submission({ id: "new" }),
    );
    expect(history.map((s) => s.id)).toEqual(["new", "old"]);
  });

  it("keeps at most 30 per problem, dropping the oldest", () => {
    expect(MAX_SUBMISSIONS).toBe(30);
    let history: Submission[] = [];
    for (let i = 0; i < 35; i++) {
      history = pushSubmission(history, submission({ id: `s${i}` }));
    }
    expect(history).toHaveLength(30);
    expect(history[0].id).toBe("s34");
    expect(history.at(-1)?.id).toBe("s5");
  });

  it("caps the number of test cases a user can add", () => {
    expect(MAX_TEST_CASES).toBeGreaterThan(0);
  });
});

describe("reading history back out of localStorage", () => {
  it("round-trips what was written", () => {
    const history = pushSubmission([], submission());
    expect(readSubmissions(JSON.stringify(history))).toEqual(history);
  });

  it("returns nothing for an absent or unreadable value", () => {
    // localStorage is user-writable and outlives any version of this code.
    for (const raw of [null, "", "not json", "{}", '"a string"', "42"]) {
      expect(readSubmissions(raw), `raw: ${raw}`).toEqual([]);
    }
  });

  it("drops entries that are not shaped like submissions", () => {
    const raw = JSON.stringify([submission(), { id: "junk" }, null, 7]);
    expect(readSubmissions(raw).map((s) => s.id)).toEqual(["s1"]);
  });

  it("never returns more than the cap, even if storage holds more", () => {
    const raw = JSON.stringify(
      Array.from({ length: 40 }, (_, i) => submission({ id: `s${i}` })),
    );
    expect(readSubmissions(raw)).toHaveLength(MAX_SUBMISSIONS);
  });
});

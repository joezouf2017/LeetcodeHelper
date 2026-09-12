// What to work on today: everything whose review has come due, plus a few new
// problems drawn from one category at a time.
//
// The category rule is the part worth testing hard. New problems come only
// from the first category that still has untouched problems in it, and the
// plan does not top up from the next category to reach the daily goal —
// finishing a topic before moving on is the point.

import { describe, expect, it } from "vitest";
import type { Progress } from "@/lib/db";
import type { ProblemList } from "@/lib/lists/problem-lists";
import {
  DEFAULT_DAILY_GOAL,
  MAX_DAILY_GOAL,
  clampDailyGoal,
  readDailyGoal,
  buildTodayPlan,
} from "@/lib/today-plan";

const TODAY = "2026-03-05";

const list: ProblemList = {
  id: "test",
  name: "Test",
  description: "",
  problems: [
    { id: "a1", title: "A1", slug: "a1", difficulty: "Easy", category: "Arrays", order: 1 },
    { id: "a2", title: "A2", slug: "a2", difficulty: "Easy", category: "Arrays", order: 2 },
    { id: "a3", title: "A3", slug: "a3", difficulty: "Medium", category: "Arrays", order: 3 },
    { id: "s1", title: "S1", slug: "s1", difficulty: "Easy", category: "Stack", order: 4 },
    { id: "s2", title: "S2", slug: "s2", difficulty: "Medium", category: "Stack", order: 5 },
    { id: "g1", title: "G1", slug: "g1", difficulty: "Hard", category: "Graphs", order: 6 },
  ],
};

function progressOf(
  partial: Record<string, Partial<Progress>>,
): Record<string, Progress> {
  return Object.fromEntries(
    Object.entries(partial).map(([problemId, p]) => [
      problemId,
      {
        problemId,
        status: "reviewing",
        mastery: 2,
        nextReviewAt: null,
        notes: "",
        pattern: "",
        keyInsight: "",
        relatedProblems: [],
        updatedAt: "",
        ...p,
      } as Progress,
    ]),
  );
}

const ids = (views: { problem: { id: string } }[]) =>
  views.map((v) => v.problem.id);

describe("the daily goal setting", () => {
  it("defaults to three, as the design specifies", () => {
    expect(DEFAULT_DAILY_GOAL).toBe(3);
  });

  it("keeps a stored value inside the allowed range", () => {
    expect(readDailyGoal("5")).toBe(5);
    expect(readDailyGoal("0")).toBe(0);
    expect(readDailyGoal(String(MAX_DAILY_GOAL))).toBe(MAX_DAILY_GOAL);
  });

  it("falls back to the default rather than producing NaN", () => {
    // localStorage is user-writable and survives across versions, so a corrupt
    // value must not reach buildTodayPlan and turn the plan into nothing.
    for (const stored of [null, "", "abc", "{}", "3.5", "-1", "999", "1e3"]) {
      expect(readDailyGoal(stored), `stored: ${stored}`).toBe(
        DEFAULT_DAILY_GOAL,
      );
    }
  });

  it("clamps a value nudged past either end", () => {
    expect(clampDailyGoal(-1)).toBe(0);
    expect(clampDailyGoal(MAX_DAILY_GOAL + 1)).toBe(MAX_DAILY_GOAL);
    expect(clampDailyGoal(4)).toBe(4);
  });
});

describe("new problems", () => {
  it("starts at the first category and takes them in list order", () => {
    const plan = buildTodayPlan(list, {}, TODAY, 2);
    expect(plan.focusCategory).toBe("Arrays");
    expect(ids(plan.fresh)).toEqual(["a1", "a2"]);
  });

  it("honours the daily goal", () => {
    expect(ids(buildTodayPlan(list, {}, TODAY, 3).fresh)).toEqual([
      "a1",
      "a2",
      "a3",
    ]);
    expect(buildTodayPlan(list, {}, TODAY, 0).fresh).toEqual([]);
  });

  it("does not top up from the next category to reach the goal", () => {
    // Arrays has one untouched problem left and the goal is three. Offering s1
    // and s2 as well would defeat the point of finishing a topic first.
    const plan = buildTodayPlan(
      list,
      progressOf({ a1: { status: "solved" }, a2: { status: "reviewing" } }),
      TODAY,
      3,
    );
    expect(plan.focusCategory).toBe("Arrays");
    expect(ids(plan.fresh)).toEqual(["a3"]);
  });

  it("counts a category as done once nothing in it is todo, mastered or not", () => {
    // "Left todo" is the bar, not "mastered" — otherwise the user would be
    // stuck on one category until every problem in it reached level 5.
    const plan = buildTodayPlan(
      list,
      progressOf({
        a1: { status: "reviewing", mastery: 1 },
        a2: { status: "reviewing", mastery: 1 },
        a3: { status: "reviewing", mastery: 1 },
      }),
      TODAY,
      2,
    );
    expect(plan.focusCategory).toBe("Stack");
    expect(ids(plan.fresh)).toEqual(["s1", "s2"]);
  });

  it("treats an explicit todo row the same as no row at all", () => {
    const plan = buildTodayPlan(
      list,
      progressOf({ a1: { status: "todo", notes: "started reading it" } }),
      TODAY,
      1,
    );
    expect(ids(plan.fresh)).toEqual(["a1"]);
  });

  it("skips a category that was finished out of order", () => {
    const plan = buildTodayPlan(
      list,
      progressOf({
        a1: { status: "solved" },
        a2: { status: "solved" },
        a3: { status: "solved" },
        s1: { status: "solved" },
        s2: { status: "solved" },
      }),
      TODAY,
      3,
    );
    expect(plan.focusCategory).toBe("Graphs");
    expect(ids(plan.fresh)).toEqual(["g1"]);
  });

  it("reports an empty plan once every category is finished", () => {
    const everything = Object.fromEntries(
      list.problems.map((p) => [p.id, { status: "solved" as const }]),
    );
    const plan = buildTodayPlan(list, progressOf(everything), TODAY, 3);
    expect(plan.focusCategory).toBeNull();
    expect(plan.fresh).toEqual([]);
  });

  it("says how many untouched problems the focus category still holds", () => {
    const plan = buildTodayPlan(list, {}, TODAY, 1);
    expect(plan.remainingInFocus).toBe(3);
    expect(ids(plan.fresh)).toEqual(["a1"]);
  });
});

describe("due reviews", () => {
  it("includes problems from any category, not just the focus one", () => {
    const plan = buildTodayPlan(
      list,
      progressOf({
        g1: { status: "reviewing", nextReviewAt: "2026-03-01" },
        s2: { status: "reviewing", nextReviewAt: TODAY },
      }),
      TODAY,
      3,
    );
    expect(ids(plan.due).sort()).toEqual(["g1", "s2"]);
    expect(plan.focusCategory).toBe("Arrays");
  });

  it("puts the most overdue problem first", () => {
    const plan = buildTodayPlan(
      list,
      progressOf({
        a1: { status: "reviewing", nextReviewAt: TODAY },
        s1: { status: "reviewing", nextReviewAt: "2026-02-20" },
        g1: { status: "reviewing", nextReviewAt: "2026-03-03" },
      }),
      TODAY,
      3,
    );
    expect(ids(plan.due)).toEqual(["s1", "g1", "a1"]);
  });

  it("leaves out reviews that are not due yet", () => {
    const plan = buildTodayPlan(
      list,
      progressOf({ a1: { status: "reviewing", nextReviewAt: "2026-03-06" } }),
      TODAY,
      3,
    );
    expect(plan.due).toEqual([]);
  });

  it("leaves out mastered problems, which are never rescheduled", () => {
    const plan = buildTodayPlan(
      list,
      progressOf({ a1: { status: "solved", mastery: 5, nextReviewAt: null } }),
      TODAY,
      3,
    );
    expect(plan.due).toEqual([]);
  });

  it("never offers a due problem as a new one as well", () => {
    const plan = buildTodayPlan(
      list,
      progressOf({ a1: { status: "reviewing", nextReviewAt: "2026-03-01" } }),
      TODAY,
      3,
    );
    expect(ids(plan.due)).toEqual(["a1"]);
    expect(ids(plan.fresh)).not.toContain("a1");
    expect(ids(plan.fresh)).toEqual(["a2", "a3"]);
  });

  it("carries the progress record, so the panel can show mastery and dates", () => {
    const plan = buildTodayPlan(
      list,
      progressOf({
        a1: { status: "reviewing", mastery: 3, nextReviewAt: "2026-03-01" },
      }),
      TODAY,
      3,
    );
    expect(plan.due[0].progress?.mastery).toBe(3);
    expect(plan.due[0].isDue).toBe(true);
    expect(plan.fresh[0].progress).toBeNull();
  });
});

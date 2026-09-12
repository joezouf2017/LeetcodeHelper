// The tracker's arithmetic, separated from its rendering: grouping a list into
// categories, counting completion, and applying the difficulty filter.

import { describe, expect, it } from "vitest";
import { buildListView, masteryLabel, reviewLabel } from "@/lib/list-view";
import type { Progress } from "@/lib/db";
import type { ProblemList } from "@/lib/lists/problem-lists";
import { getListById } from "@/lib/lists/problem-lists";

const ALL = ["Easy", "Medium", "Hard"] as const;
const TODAY = "2026-03-05";

const list: ProblemList = {
  id: "test",
  name: "Test",
  description: "",
  problems: [
    { id: "a", title: "A", slug: "a", difficulty: "Easy", category: "Arrays", order: 1 },
    { id: "b", title: "B", slug: "b", difficulty: "Medium", category: "Arrays", order: 2 },
    { id: "c", title: "C", slug: "c", difficulty: "Hard", category: "Arrays", order: 3 },
    { id: "d", title: "D", slug: "d", difficulty: "Easy", category: "Graphs", order: 4 },
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
        status: "todo",
        mastery: 0,
        nextReviewAt: null,
        notes: "",
        updatedAt: "",
        ...p,
      } as Progress,
    ]),
  );
}

describe("grouping", () => {
  it("keeps the list's own category order, not alphabetical order", () => {
    const view = buildListView(list, {}, TODAY, ALL);
    expect(view.categories.map((c) => c.name)).toEqual(["Arrays", "Graphs"]);
  });

  it("uses each built-in list's own taxonomy", () => {
    const neetcode = buildListView(getListById("neetcode150")!, {}, TODAY, ALL);
    const blind = buildListView(getListById("blind75")!, {}, TODAY, ALL);
    expect(neetcode.categories).toHaveLength(18);
    expect(blind.categories).toHaveLength(13);
    expect(neetcode.categories[0].name).toBe("Arrays & Hashing");
    expect(blind.categories[0].name).toBe("Arrays");
  });

  it("attaches progress to a problem by id, and null when untouched", () => {
    const view = buildListView(
      list,
      progressOf({ a: { status: "solved", mastery: 5 } }),
      TODAY,
      ALL,
    );
    const arrays = view.categories[0];
    expect(arrays.problems[0].progress?.mastery).toBe(5);
    expect(arrays.problems[1].progress).toBeNull();
  });
});

describe("counting", () => {
  it("counts a category as done when its status is solved", () => {
    const view = buildListView(
      list,
      progressOf({ a: { status: "solved" }, b: { status: "reviewing" } }),
      TODAY,
      ALL,
    );
    expect(view.categories[0]).toMatchObject({ total: 3, solved: 1 });
    expect(view.categories[0].percent).toBe(33);
    expect(view.total).toBe(4);
    expect(view.solved).toBe(1);
    expect(view.percent).toBe(25);
  });

  it("reports zero percent for an untouched list rather than NaN", () => {
    const view = buildListView(list, {}, TODAY, ALL);
    expect(view.percent).toBe(0);
    expect(view.categories.every((c) => c.percent === 0)).toBe(true);
  });

  it("counts problems whose review has come due", () => {
    const view = buildListView(
      list,
      progressOf({
        a: { status: "reviewing", mastery: 2, nextReviewAt: "2026-03-01" },
        b: { status: "reviewing", mastery: 2, nextReviewAt: TODAY },
        c: { status: "reviewing", mastery: 2, nextReviewAt: "2026-03-09" },
      }),
      TODAY,
      ALL,
    );
    expect(view.categories[0].due).toBe(2);
    expect(view.due).toBe(2);
    expect(view.categories[0].problems.map((p) => p.isDue)).toEqual([
      true,
      true,
      false,
    ]);
  });
});

describe("masteryLabel", () => {
  it("names the two ends of the ladder instead of numbering them", () => {
    expect(masteryLabel(0)).toBe("Not started");
    expect(masteryLabel(5)).toBe("Mastered");
  });

  it("numbers the levels in between", () => {
    expect(masteryLabel(1)).toBe("Level 1 of 5");
    expect(masteryLabel(4)).toBe("Level 4 of 5");
  });
});

describe("reviewLabel", () => {
  it("says nothing when no review is scheduled", () => {
    expect(reviewLabel(null, TODAY)).toBeNull();
  });

  it("calls out today separately from a future date", () => {
    expect(reviewLabel(TODAY, TODAY)).toBe("Due today");
    expect(reviewLabel("2026-03-06", TODAY)).toBe("In 1 day");
    expect(reviewLabel("2026-03-12", TODAY)).toBe("In 7 days");
  });

  it("counts overdue days, and gets the singular right", () => {
    expect(reviewLabel("2026-03-04", TODAY)).toBe("Overdue by 1 day");
    expect(reviewLabel("2026-02-28", TODAY)).toBe("Overdue by 5 days");
  });
});

describe("difficulty filter", () => {
  it("hides problems of unselected difficulties", () => {
    const view = buildListView(list, {}, TODAY, ["Easy"]);
    expect(view.categories.map((c) => c.name)).toEqual(["Arrays", "Graphs"]);
    expect(view.categories[0].problems.map((p) => p.problem.id)).toEqual(["a"]);
    expect(view.total).toBe(2);
  });

  it("counts only what is visible, so the bar matches the rows on screen", () => {
    const view = buildListView(
      list,
      progressOf({ a: { status: "solved" }, b: { status: "solved" } }),
      TODAY,
      ["Medium"],
    );
    expect(view.categories[0]).toMatchObject({ total: 1, solved: 1 });
    expect(view.categories[0].percent).toBe(100);
  });

  it("drops a category once the filter empties it", () => {
    const view = buildListView(list, {}, TODAY, ["Hard"]);
    expect(view.categories.map((c) => c.name)).toEqual(["Arrays"]);
  });

  it("shows nothing when every difficulty is unchecked", () => {
    const view = buildListView(list, {}, TODAY, []);
    expect(view.categories).toEqual([]);
    expect(view.total).toBe(0);
    expect(view.percent).toBe(0);
  });
});

// The scheduling rules, isolated from storage.
//
// The mastery ladder and its intervals are reused verbatim from AlgoLoop
// (github.com/Sparta-FrontEnder/algoloop), which this project is modelled on:
// a hinted solve resets to level 1, an unaided solve climbs but never starts
// below 2, and level 5 retires the problem from review.

import { describe, expect, it } from "vitest";
import { addDays, isDueOn, todayIn } from "@/lib/app-date";
import {
  MASTERED,
  MASTERY_INTERVALS,
  advanceMastery,
  nextReviewDate,
  type MasteryLevel,
} from "@/lib/spaced-repetition";

describe("app-date", () => {
  it("formats the local calendar date, not the UTC one", () => {
    // 23:30 on the 5th in UTC+8 is still the 5th locally but the 4th in UTC.
    // Scheduling "tomorrow" off the UTC date would surface reviews a day late.
    const late = new Date("2026-03-05T15:30:00.000Z");
    expect(todayIn(late, 480)).toBe("2026-03-05");
    expect(todayIn(late, 0)).toBe("2026-03-05");
    const earlier = new Date("2026-03-05T23:30:00.000Z");
    expect(earlier.getUTCDate()).toBe(5);
    expect(todayIn(earlier, 480)).toBe("2026-03-06");
  });

  it("adds days across a month boundary", () => {
    expect(addDays("2026-01-30", 3)).toBe("2026-02-02");
    expect(addDays("2026-02-27", 1)).toBe("2026-02-28");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("adds days across a leap day", () => {
    expect(addDays("2028-02-28", 1)).toBe("2028-02-29");
    expect(addDays("2026-02-28", 1)).toBe("2026-03-01");
  });

  it("treats a review as due when its date has arrived or passed", () => {
    expect(isDueOn("2026-03-05", "2026-03-05")).toBe(true);
    expect(isDueOn("2026-03-04", "2026-03-05")).toBe(true);
    expect(isDueOn("2026-03-06", "2026-03-05")).toBe(false);
    expect(isDueOn(null, "2026-03-05")).toBe(false);
  });
});

describe("advanceMastery", () => {
  it("resets to level 1 whenever a hint was needed", () => {
    const levels: MasteryLevel[] = [0, 1, 2, 3, 4, 5];
    for (const level of levels) {
      expect(advanceMastery(level, "hint"), `from level ${level}`).toBe(1);
    }
  });

  it("climbs one level on an unaided solve", () => {
    expect(advanceMastery(2, "independent")).toBe(3);
    expect(advanceMastery(3, "independent")).toBe(4);
    expect(advanceMastery(4, "independent")).toBe(5);
  });

  it("starts an unaided solve at level 2, skipping the hinted level", () => {
    // Level 1 means "needed a hint", so solving unaided from scratch should
    // not land there.
    expect(advanceMastery(0, "independent")).toBe(2);
    expect(advanceMastery(1, "independent")).toBe(2);
  });

  it("caps at level 5", () => {
    expect(advanceMastery(5, "independent")).toBe(5);
  });
});

describe("nextReviewDate", () => {
  it("uses the 1 / 3 / 7 / 21 day ladder", () => {
    expect(MASTERY_INTERVALS).toEqual({ 1: 1, 2: 3, 3: 7, 4: 21 });
    expect(nextReviewDate(1, "2026-03-05")).toBe("2026-03-06");
    expect(nextReviewDate(2, "2026-03-05")).toBe("2026-03-08");
    expect(nextReviewDate(3, "2026-03-05")).toBe("2026-03-12");
    expect(nextReviewDate(4, "2026-03-05")).toBe("2026-03-26");
  });

  it("retires a problem at level 5 — no further reviews", () => {
    expect(MASTERED).toBe(5);
    expect(nextReviewDate(5, "2026-03-05")).toBeNull();
  });

  it("schedules nothing for a problem that was never attempted", () => {
    expect(nextReviewDate(0, "2026-03-05")).toBeNull();
  });
});

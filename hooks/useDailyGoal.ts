"use client";

import { createStoredPreference } from "@/hooks/useStoredPreference";
import { readDailyGoal } from "@/lib/today-plan";

/** How many new problems to start each day. */
export const { usePreference: useDailyGoal } = createStoredPreference(
  "leetcodehelper.dailyGoal",
  readDailyGoal,
);

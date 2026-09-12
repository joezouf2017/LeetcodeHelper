"use client";

// How many new problems to start each day. This is a browsing preference
// rather than progress, so it lives in localStorage instead of the database.
//
// Read through useSyncExternalStore rather than "useState + read it in an
// effect": localStorage is external mutable state, and the effect version both
// trips react-hooks/set-state-in-effect and renders the default for a frame
// before correcting itself. This way React asks for the server snapshot while
// hydrating and the real value immediately after, and a change made in another
// tab shows up here too.

import { useCallback, useSyncExternalStore } from "react";
import {
  DEFAULT_DAILY_GOAL,
  clampDailyGoal,
  readDailyGoal,
} from "@/lib/today-plan";

const STORAGE_KEY = "leetcodehelper.dailyGoal";

// Writing to localStorage does not fire a storage event in the tab that wrote
// it, so same-tab updates are announced here.
const listeners = new Set<() => void>();

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): number {
  return readDailyGoal(window.localStorage.getItem(STORAGE_KEY));
}

function getServerSnapshot(): number {
  return DEFAULT_DAILY_GOAL;
}

export function useDailyGoal(): [number, (goal: number) => void] {
  const goal = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setGoal = useCallback((next: number) => {
    window.localStorage.setItem(STORAGE_KEY, String(clampDailyGoal(next)));
    for (const onChange of listeners) onChange();
  }, []);

  return [goal, setGoal];
}

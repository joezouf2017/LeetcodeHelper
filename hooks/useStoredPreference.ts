"use client";

// A browsing preference kept in localStorage — which list you are looking at,
// how many new problems you want a day. Not progress, so not the database.
//
// Read through useSyncExternalStore rather than "useState plus read it in an
// effect": localStorage is external mutable state, and the effect version both
// trips react-hooks/set-state-in-effect and renders the default for a frame
// before correcting itself. React asks for the server snapshot while
// hydrating and the real value immediately after, and a change made in another
// tab arrives here too.
//
// Values must be primitives. useSyncExternalStore re-renders whenever the
// snapshot is not identical to the last one, so a parse returning a fresh
// object each call would loop forever.

import { useCallback, useSyncExternalStore } from "react";

export interface StoredPreference<T extends string | number | boolean> {
  usePreference: () => [T, (value: T) => void];
}

export function createStoredPreference<T extends string | number | boolean>(
  key: string,
  parse: (raw: string | null) => T,
): StoredPreference<T> {
  // Writing to localStorage does not fire a storage event in the tab that
  // wrote it, so same-tab updates are announced here.
  const listeners = new Set<() => void>();

  function subscribe(onChange: () => void): () => void {
    listeners.add(onChange);
    window.addEventListener("storage", onChange);
    return () => {
      listeners.delete(onChange);
      window.removeEventListener("storage", onChange);
    };
  }

  const getSnapshot = () => parse(window.localStorage.getItem(key));
  const getServerSnapshot = () => parse(null);

  return {
    usePreference() {
      const value = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot,
      );

      const setValue = useCallback((next: T) => {
        window.localStorage.setItem(key, String(next));
        for (const onChange of listeners) onChange();
      }, []);

      return [value, setValue];
    },
  };
}

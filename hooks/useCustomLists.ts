"use client";

import { useCallback, useEffect, useState } from "react";
import type { CustomListDraft } from "@/lib/custom-lists";
import type { ProblemList } from "@/lib/lists/problem-lists";

export function useCustomLists() {
  const [lists, setLists] = useState<ProblemList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/lists");
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const body = await res.json();
        if (!cancelled) setLists(body.lists);
      } catch (cause) {
        if (!cancelled) setError(`Could not load your lists: ${cause}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Returns the created list, or null with `error` set. */
  const create = useCallback(
    async (draft: CustomListDraft): Promise<ProblemList | null> => {
      try {
        const res = await fetch("/api/lists", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(draft),
        });
        const body = await res.json();
        if (!res.ok) {
          setError(body.error ?? `Request failed (${res.status})`);
          return null;
        }
        setLists((prev) => [...prev, body.list]);
        setError(null);
        return body.list as ProblemList;
      } catch (cause) {
        setError(`Could not save the list: ${cause}`);
        return null;
      }
    },
    [],
  );

  const remove = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/lists?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      setLists((prev) => prev.filter((l) => l.id !== id));
      setError(null);
      return true;
    } catch (cause) {
      setError(`Could not delete the list: ${cause}`);
      return false;
    }
  }, []);

  return { lists, loading, error, create, remove };
}

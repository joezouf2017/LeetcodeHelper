"use client";

// Client-side view of /api/progress.
//
// Note what is deliberately *not* kept here: the list of due problems. The API
// returns one, but due-ness is derivable from a review date and today's date,
// so storing it separately would give one fact two homes that could disagree.
// The tracker derives it in buildListView instead.

import { useCallback, useEffect, useState } from "react";
import type { ProblemStatus, Progress } from "@/lib/db";
import type { ReviewMode } from "@/lib/spaced-repetition";

export type ProgressMap = Record<string, Progress>;

interface PatchBody {
  problemId: string;
  status?: ProblemStatus;
  notes?: string;
  review?: ReviewMode;
}

export function useProgress() {
  const [progress, setProgress] = useState<ProgressMap>({});
  const [today, setToday] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/progress");
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const body = await res.json();
        if (cancelled) return;
        setProgress(body.progress);
        setToday(body.today);
      } catch (cause) {
        if (!cancelled) setError(`Could not load progress: ${cause}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const patch = useCallback(async (body: PatchBody) => {
    try {
      const res = await fetch("/api/progress", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const { progress: row } = (await res.json()) as { progress: Progress };
      setProgress((prev) => ({ ...prev, [row.problemId]: row }));
      setError(null);
    } catch (cause) {
      setError(`Could not save: ${cause}`);
    }
  }, []);

  const setStatus = useCallback(
    (problemId: string, status: ProblemStatus) => patch({ problemId, status }),
    [patch],
  );
  const setNotes = useCallback(
    (problemId: string, notes: string) => patch({ problemId, notes }),
    [patch],
  );
  const recordReview = useCallback(
    (problemId: string, review: ReviewMode) => patch({ problemId, review }),
    [patch],
  );

  return { progress, today, loading, error, setStatus, setNotes, recordReview };
}

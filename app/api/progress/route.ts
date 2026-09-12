// Progress API. Deliberately not named after a list: a progress record belongs
// to a problem, not to the list you happened to be looking at when you made it.

import { today } from "@/lib/app-date";
import {
  dueProblemIds,
  listProgress,
  recordReview,
  setNotes,
  setStatus,
  type ProblemStatus,
} from "@/lib/db";
import { getAllProblems } from "@/lib/lists/problem-lists";
import type { ReviewMode } from "@/lib/spaced-repetition";

// Reads a local database on every request; nothing here is prerenderable.
export const dynamic = "force-dynamic";

const KNOWN_PROBLEM_IDS = new Set(getAllProblems().map((p) => p.id));
const STATUSES: ProblemStatus[] = ["todo", "reviewing", "solved"];
const REVIEW_MODES: ReviewMode[] = ["hint", "independent"];

function badRequest(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export async function GET(): Promise<Response> {
  const on = today();
  const progress = Object.fromEntries(
    listProgress().map((p) => [p.problemId, p]),
  );
  return Response.json({ today: on, progress, due: dueProblemIds(on) });
}

export async function PATCH(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Body must be JSON");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return badRequest("Body must be a JSON object");
  }

  const patch = body as Record<string, unknown>;
  const problemId = patch.problemId;
  if (typeof problemId !== "string" || problemId === "") {
    return badRequest("problemId is required");
  }
  if (!KNOWN_PROBLEM_IDS.has(problemId)) {
    return badRequest(`Unknown problem: ${problemId}`, 404);
  }

  if ("status" in patch) {
    const status = patch.status;
    if (!STATUSES.includes(status as ProblemStatus)) {
      return badRequest(`status must be one of ${STATUSES.join(", ")}`);
    }
    return Response.json({
      progress: setStatus(problemId, status as ProblemStatus),
    });
  }

  if ("notes" in patch) {
    const notes = patch.notes;
    if (typeof notes !== "string") return badRequest("notes must be a string");
    return Response.json({ progress: setNotes(problemId, notes) });
  }

  if ("review" in patch) {
    const review = patch.review;
    if (!REVIEW_MODES.includes(review as ReviewMode)) {
      return badRequest(`review must be one of ${REVIEW_MODES.join(", ")}`);
    }
    return Response.json({
      progress: recordReview(problemId, review as ReviewMode),
    });
  }

  return badRequest("Provide one of: status, notes, review");
}

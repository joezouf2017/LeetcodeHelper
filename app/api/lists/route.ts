// Custom lists. Only the user-created ones live here — the three built-in
// lists are static data the client already has, and round-tripping them
// through the database would give them a second home.

import {
  deleteCustomList,
  insertCustomList,
  selectCustomLists,
} from "@/lib/db";
import {
  newCustomListId,
  resolveCustomList,
  validateDraft,
  type CustomListDraft,
} from "@/lib/custom-lists";

export const dynamic = "force-dynamic";

function badRequest(message: string, status = 400): Response {
  return Response.json({ error: message }, { status });
}

export async function GET(): Promise<Response> {
  const lists = selectCustomLists().map(({ list, items }) =>
    resolveCustomList(list, items),
  );
  return Response.json({ lists });
}

export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return badRequest("Body must be JSON");
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return badRequest("Body must be a JSON object");
  }

  const input = body as Record<string, unknown>;
  if (typeof input.name !== "string") return badRequest("name must be a string");
  if (input.description !== undefined && typeof input.description !== "string") {
    return badRequest("description must be a string");
  }
  if (
    !Array.isArray(input.problemIds) ||
    input.problemIds.some((id) => typeof id !== "string")
  ) {
    return badRequest("problemIds must be an array of problem ids");
  }
  if (
    input.categoryOverride !== undefined &&
    input.categoryOverride !== null &&
    typeof input.categoryOverride !== "string"
  ) {
    return badRequest("categoryOverride must be a string");
  }

  const draft: CustomListDraft = {
    name: input.name,
    description: (input.description as string | undefined) ?? "",
    problemIds: input.problemIds as string[],
    categoryOverride: (input.categoryOverride as string | null) ?? null,
  };

  const problem = validateDraft(draft);
  if (problem) return badRequest(problem);

  const override = draft.categoryOverride?.trim() || null;
  const id = newCustomListId();
  insertCustomList(
    {
      id,
      name: draft.name.trim(),
      description: (draft.description ?? "").trim(),
    },
    draft.problemIds.map((problemId) => ({
      problemId,
      categoryOverride: override,
    })),
  );

  const stored = selectCustomLists().find((s) => s.list.id === id);
  if (!stored) return badRequest("The list could not be read back", 500);
  return Response.json(
    { list: resolveCustomList(stored.list, stored.items) },
    { status: 201 },
  );
}

// The id is passed as a query parameter rather than a path segment because it
// contains a colon (`custom:<uuid>`), which would have to be percent-encoded
// in a path and is easy to get wrong on either side.
export async function DELETE(request: Request): Promise<Response> {
  const id = new URL(request.url).searchParams.get("id");
  if (id === null || id === "") return badRequest("id is required");
  if (!deleteCustomList(id)) return badRequest(`No such list: ${id}`, 404);
  return Response.json({ deleted: id });
}

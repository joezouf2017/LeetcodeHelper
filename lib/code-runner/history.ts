// Value comparison, result summarising, and the bounded submission history.
// Everything here is pure, so it is shared unchanged between the worker that
// runs JavaScript and the UI that renders what came back.

export type Language = "javascript" | "python";
export type CaseStatus = "pass" | "fail" | "error";

/** Submissions are per problem; the language is recorded on each entry. */
export const MAX_SUBMISSIONS = 30;
/** Enough cases to cover the edge cases of one problem, not a test suite. */
export const MAX_TEST_CASES = 20;

export interface TestCase {
  id: string;
  /** An expression that calls the user's solution, e.g. `twoSum([2,7], 9)`. */
  call: string;
  /** An expression for the answer it should produce, e.g. `[0,1]`. */
  expected: string;
}

export interface CaseResult {
  caseId: string;
  status: CaseStatus;
  actual: string;
  expected: string;
  error?: string;
}

export interface RunResult {
  status: CaseStatus;
  cases: CaseResult[];
  logs: string[];
  /** Set when the code never got as far as running cases. */
  error?: string;
  durationMs: number;
}

export interface Submission {
  id: string;
  problemId: string;
  language: Language;
  submittedAt: string;
  code: string;
  status: CaseStatus;
  passed: number;
  total: number;
}

/**
 * Structural comparison. `JSON.stringify` would be shorter but would call
 * `[0,1]` equal to `["0","1"]` on some shapes and would order object keys by
 * insertion, so `{a:1,b:2}` and `{b:2,a:1}` would disagree.
 */
export function matchesExpected(actual: unknown, expected: unknown): boolean {
  if (Object.is(actual, expected)) return true;

  if (Array.isArray(actual) || Array.isArray(expected)) {
    if (!Array.isArray(actual) || !Array.isArray(expected)) return false;
    return (
      actual.length === expected.length &&
      actual.every((item, i) => matchesExpected(item, expected[i]))
    );
  }

  if (
    typeof actual === "object" &&
    typeof expected === "object" &&
    actual !== null &&
    expected !== null
  ) {
    const a = actual as Record<string, unknown>;
    const b = expected as Record<string, unknown>;
    const keys = Object.keys(a);
    return (
      keys.length === Object.keys(b).length &&
      keys.every(
        (key) =>
          Object.prototype.hasOwnProperty.call(b, key) &&
          matchesExpected(a[key], b[key]),
      )
    );
  }

  return false;
}

/** Renders a value for display. Never throws — a cyclic result is still a result. */
export function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (typeof value === "number" && Number.isNaN(value)) return "NaN";
  try {
    const json = JSON.stringify(value);
    return json === undefined ? String(value) : json;
  } catch (cause) {
    return `[unserialisable: ${cause instanceof Error ? cause.message : String(cause)}]`;
  }
}

/** An error outranks a failure: something went wrong beyond a wrong answer. */
export function summarise(cases: { status: CaseStatus }[]): CaseStatus {
  if (cases.some((c) => c.status === "error")) return "error";
  if (cases.some((c) => c.status === "fail")) return "fail";
  return "pass";
}

export function submissionsKey(problemId: string): string {
  return `leetcodehelper.submissions.${problemId}`;
}

// Draft code and test cases are per language as well as per problem: the same
// problem is `twoSum(...)` in JavaScript and `two_sum(...)` in Python, so one
// shared draft would be wrong in whichever language you were not using.
export function draftCodeKey(problemId: string, language: Language): string {
  return `leetcodehelper.code.${problemId}.${language}`;
}

export function draftCasesKey(problemId: string, language: Language): string {
  return `leetcodehelper.cases.${problemId}.${language}`;
}

export const STARTER_CODE: Record<Language, string> = {
  javascript: `// Write your solution, then call it from a test case below.\n// Example: twoSum([2, 7, 11, 15], 9)  ->  [0, 1]\n\nfunction twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n`,
  python: `# Write your solution, then call it from a test case below.\n# Example: two_sum([2, 7, 11, 15], 9)  ->  [0, 1]\n\ndef two_sum(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return []\n`,
};

export function pushSubmission(
  history: Submission[],
  entry: Submission,
): Submission[] {
  return [entry, ...history].slice(0, MAX_SUBMISSIONS);
}

function isSubmission(value: unknown): value is Submission {
  if (typeof value !== "object" || value === null) return false;
  const s = value as Record<string, unknown>;
  return (
    typeof s.id === "string" &&
    typeof s.problemId === "string" &&
    typeof s.code === "string" &&
    typeof s.submittedAt === "string" &&
    (s.language === "javascript" || s.language === "python") &&
    (s.status === "pass" || s.status === "fail" || s.status === "error") &&
    typeof s.passed === "number" &&
    typeof s.total === "number"
  );
}

/** Parses stored history defensively: localStorage outlives any version of this code. */
export function readSubmissions(raw: string | null): Submission[] {
  if (raw === null || raw === "") return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSubmission).slice(0, MAX_SUBMISSIONS);
  } catch {
    return [];
  }
}

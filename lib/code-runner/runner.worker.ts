/// <reference lib="webworker" />

// Runs the user's code off the main thread. A worker, not an iframe: an
// infinite loop here is survivable because the page can terminate the whole
// worker, which it cannot do to a script sharing its thread.
//
// Results come back as structured objects over postMessage. There is no stdout
// protocol to parse — see the note in ./history.ts.

import {
  formatValue,
  matchesExpected,
  type CaseResult,
  type TestCase,
} from "./history";

export interface RunRequest {
  language: "javascript" | "python";
  code: string;
  cases: TestCase[];
}

export type WorkerMessage =
  | { type: "status"; message: string }
  | { type: "done"; cases: CaseResult[]; logs: string[]; error?: string };

const scope = self as unknown as DedicatedWorkerGlobalScope;

function post(message: WorkerMessage): void {
  scope.postMessage(message);
}

function captureLogs(): { logs: string[]; restore: () => void } {
  const logs: string[] = [];
  const original = console.log;
  console.log = (...args: unknown[]) => {
    logs.push(args.map((a) => (typeof a === "string" ? a : formatValue(a))).join(" "));
  };
  return { logs, restore: () => void (console.log = original) };
}

function describe(cause: unknown): string {
  return cause instanceof Error ? `${cause.name}: ${cause.message}` : String(cause);
}

// ---- JavaScript ----

function runJavaScript(code: string, cases: TestCase[]): WorkerMessage {
  const { logs, restore } = captureLogs();
  try {
    // The user's code runs first, then each case expression is evaluated in
    // the same scope — a direct eval inside the generated function body sees
    // the functions the user just declared.
    const factory = new Function(
      `"use strict";\n${code}\n;return function (__expression) { return eval(__expression); };`,
    );
    const evaluate = factory() as (expression: string) => unknown;

    const results: CaseResult[] = cases.map((testCase) => {
      try {
        const actual = evaluate(testCase.call);
        const expected = evaluate(testCase.expected);
        return {
          caseId: testCase.id,
          status: matchesExpected(actual, expected) ? "pass" : "fail",
          actual: formatValue(actual),
          expected: formatValue(expected),
        };
      } catch (cause) {
        return {
          caseId: testCase.id,
          status: "error",
          actual: "—",
          expected: testCase.expected,
          error: describe(cause),
        };
      }
    });

    return { type: "done", cases: results, logs };
  } catch (cause) {
    // The code itself would not load: a syntax error, or a throw at top level.
    return { type: "done", cases: [], logs, error: describe(cause) };
  } finally {
    restore();
  }
}

// ---- Python, via Pyodide ----

const PYODIDE_VERSION = "0.28.3";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

interface Pyodide {
  runPython: (code: string) => unknown;
  setStdout: (options: { batched: (line: string) => void }) => void;
}

let pyodide: Pyodide | null = null;

async function loadPyodide(): Promise<Pyodide> {
  if (pyodide) return pyodide;
  post({ type: "status", message: "Downloading the Python runtime…" });
  scope.importScripts(`${PYODIDE_URL}pyodide.js`);
  const loader = (scope as unknown as {
    loadPyodide: (options: { indexURL: string }) => Promise<Pyodide>;
  }).loadPyodide;
  pyodide = await loader({ indexURL: PYODIDE_URL });
  return pyodide;
}

// Runs inside Pyodide. Comparison uses Python's own `==`, so a list compares
// like a list and a dict like a dict, rather than being flattened into JSON
// and compared by JavaScript rules.
const PYTHON_HARNESS = `
import json, traceback

def __run(code, cases):
    namespace = {}
    results = []
    try:
        exec(code, namespace)
    except Exception:
        return json.dumps({"error": traceback.format_exc(limit=1).strip()})
    for case in cases:
        try:
            actual = eval(case["call"], namespace)
            expected = eval(case["expected"], namespace)
            results.append({
                "caseId": case["id"],
                "status": "pass" if actual == expected else "fail",
                "actual": repr(actual),
                "expected": repr(expected),
            })
        except Exception:
            results.append({
                "caseId": case["id"],
                "status": "error",
                "actual": "\\u2014",
                "expected": case["expected"],
                "error": traceback.format_exc(limit=1).strip(),
            })
    return json.dumps({"cases": results})
`;

async function runPython(
  code: string,
  cases: TestCase[],
): Promise<WorkerMessage> {
  const logs: string[] = [];
  try {
    const runtime = await loadPyodide();
    runtime.setStdout({ batched: (line: string) => logs.push(line) });
    post({ type: "status", message: "Running…" });

    runtime.runPython(PYTHON_HARNESS);
    const payload = JSON.stringify({ code, cases });
    const raw = runtime.runPython(
      `__payload = json.loads(${JSON.stringify(payload)})\n` +
        `__run(__payload["code"], __payload["cases"])`,
    );
    const parsed = JSON.parse(String(raw)) as {
      cases?: CaseResult[];
      error?: string;
    };
    return {
      type: "done",
      cases: parsed.cases ?? [],
      logs,
      error: parsed.error,
    };
  } catch (cause) {
    return { type: "done", cases: [], logs, error: describe(cause) };
  }
}

scope.onmessage = async (event: MessageEvent<RunRequest>) => {
  const { language, code, cases } = event.data;
  post(
    language === "python"
      ? await runPython(code, cases)
      : runJavaScript(code, cases),
  );
};

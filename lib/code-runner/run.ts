"use client";

// Main-thread side of the runner. Owns the worker's lifetime, because the only
// defence against an infinite loop in user code is terminating the worker from
// outside it.

import {
  summarise,
  type Language,
  type RunResult,
  type TestCase,
} from "./history";
import type { RunRequest, WorkerMessage } from "./runner.worker";

/** Generous enough for an O(n^2) loop on a small input, short enough to notice. */
export const RUN_TIMEOUT_MS = 8_000;
/** Pyodide is several megabytes on first use, and the clock restarts once it lands. */
export const PYTHON_LOAD_TIMEOUT_MS = 90_000;

export interface RunOptions {
  language: Language;
  code: string;
  cases: TestCase[];
  onStatus?: (message: string) => void;
}

export function runCode({
  language,
  code,
  cases,
  onStatus,
}: RunOptions): Promise<RunResult> {
  const startedAt = Date.now();

  return new Promise<RunResult>((resolve) => {
    // A fresh worker per run, which costs Pyodide about a second of
    // re-initialisation on every Python run after the first. Keeping one alive
    // would avoid that, but then a run that has to be killed would leave the
    // pool holding a worker stuck mid-loop. Worth revisiting if the delay
    // starts to grate.
    const worker = new Worker(
      new URL("./runner.worker.ts", import.meta.url),
      { type: "module" },
    );

    let timer: ReturnType<typeof setTimeout>;
    let settled = false;

    const finish = (result: Omit<RunResult, "durationMs">) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker.terminate();
      resolve({ ...result, durationMs: Date.now() - startedAt });
    };

    const arm = (ms: number) => {
      clearTimeout(timer);
      timer = setTimeout(
        () =>
          finish({
            status: "error",
            cases: [],
            logs: [],
            error: `Stopped after ${Math.round(ms / 1000)}s — the code did not finish. An infinite loop?`,
          }),
        ms,
      );
    };

    worker.onmessage = (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      if (message.type === "status") {
        // Downloading Python is not the user's code running slowly, so the
        // timeout starts again once the runtime reports progress.
        onStatus?.(message.message);
        arm(language === "python" ? PYTHON_LOAD_TIMEOUT_MS : RUN_TIMEOUT_MS);
        return;
      }
      finish({
        status: message.error ? "error" : summarise(message.cases),
        cases: message.cases,
        logs: message.logs,
        error: message.error,
      });
    };

    worker.onerror = (event) => {
      finish({
        status: "error",
        cases: [],
        logs: [],
        error: event.message || "The worker failed to start.",
      });
    };

    arm(language === "python" ? PYTHON_LOAD_TIMEOUT_MS : RUN_TIMEOUT_MS);
    worker.postMessage({ language, code, cases } satisfies RunRequest);
  });
}

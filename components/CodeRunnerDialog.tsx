"use client";

// Write a solution, run it against your own test cases, keep the last 30
// attempts. Everything runs in the browser: JavaScript in a Web Worker, Python
// in the same worker through Pyodide. No server, nothing to install.

import { useCallback, useState } from "react";
import Editor from "@monaco-editor/react";
import { Check, Loader2, Play, Plus, RotateCcw, Trash2, X } from "lucide-react";
import {
  MAX_TEST_CASES,
  STARTER_CODE,
  draftCasesKey,
  draftCodeKey,
  pushSubmission,
  readSubmissions,
  submissionsKey,
  type CaseStatus,
  type Language,
  type RunResult,
  type Submission,
  type TestCase,
} from "@/lib/code-runner/history";
import { runCode } from "@/lib/code-runner/run";
import type { ListProblem } from "@/lib/lists/blind75";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const LANGUAGES: { id: Language; label: string; monaco: string }[] = [
  { id: "javascript", label: "JavaScript", monaco: "javascript" },
  { id: "python", label: "Python", monaco: "python" },
];

const STATUS_STYLES: Record<CaseStatus, string> = {
  pass: "text-emerald-600 dark:text-emerald-400",
  fail: "text-rose-600 dark:text-rose-400",
  error: "text-amber-600 dark:text-amber-400",
};

function newCase(): TestCase {
  return { id: crypto.randomUUID(), call: "", expected: "" };
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

function RunnerBody({ problem }: { problem: ListProblem }) {
  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState(() =>
    read(draftCodeKey(problem.id, "javascript"), STARTER_CODE.javascript),
  );
  const [cases, setCases] = useState<TestCase[]>(() =>
    read<TestCase[]>(draftCasesKey(problem.id, "javascript"), [newCase()]),
  );
  const [history, setHistory] = useState<Submission[]>(() =>
    readSubmissions(window.localStorage.getItem(submissionsKey(problem.id))),
  );
  const [result, setResult] = useState<RunResult | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  const persistCode = useCallback(
    (next: string, lang: Language) => {
      setCode(next);
      window.localStorage.setItem(draftCodeKey(problem.id, lang), next);
    },
    [problem.id],
  );

  const persistCases = useCallback(
    (next: TestCase[], lang: Language) => {
      setCases(next);
      window.localStorage.setItem(
        draftCasesKey(problem.id, lang),
        JSON.stringify(next),
      );
    },
    [problem.id],
  );

  function switchLanguage(next: Language) {
    if (next === language) return;
    setLanguage(next);
    setResult(null);
    // Each language keeps its own draft, so switching back finds your work.
    setCode(read(draftCodeKey(problem.id, next), STARTER_CODE[next]));
    setCases(read<TestCase[]>(draftCasesKey(problem.id, next), [newCase()]));
  }

  async function run() {
    setRunning(true);
    setStatus(null);
    setResult(null);
    const usable = cases.filter((c) => c.call.trim() !== "");
    const outcome = await runCode({
      language,
      code,
      cases: usable,
      onStatus: setStatus,
    });
    setResult(outcome);
    setStatus(null);
    setRunning(false);

    const entry: Submission = {
      id: crypto.randomUUID(),
      problemId: problem.id,
      language,
      submittedAt: new Date().toISOString(),
      code,
      status: outcome.status,
      passed: outcome.cases.filter((c) => c.status === "pass").length,
      total: outcome.cases.length,
    };
    const next = pushSubmission(history, entry);
    setHistory(next);
    window.localStorage.setItem(
      submissionsKey(problem.id),
      JSON.stringify(next),
    );
  }

  const monacoLanguage =
    LANGUAGES.find((l) => l.id === language)?.monaco ?? "javascript";

  return (
    <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto lg:grid-cols-[3fr_2fr]">
      <div className="flex min-h-0 flex-col gap-3">
        <div className="flex items-center gap-2">
          {LANGUAGES.map((option) => (
            <Button
              key={option.id}
              size="sm"
              variant={option.id === language ? "default" : "outline"}
              onClick={() => switchLanguage(option.id)}
            >
              {option.label}
            </Button>
          ))}
          <Button
            size="sm"
            variant="ghost"
            className="ml-auto"
            onClick={() => persistCode(STARTER_CODE[language], language)}
          >
            <RotateCcw className="size-3.5" />
            Reset
          </Button>
          <Button size="sm" disabled={running} onClick={run}>
            {running ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Play className="size-3.5" />
            )}
            Run
          </Button>
        </div>

        <div className="min-h-72 flex-1 overflow-hidden rounded-md border">
          <Editor
            height="100%"
            language={monacoLanguage}
            value={code}
            onChange={(next) => persistCode(next ?? "", language)}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              scrollBeyondLastLine: false,
              tabSize: language === "python" ? 4 : 2,
            }}
            loading={
              <span className="text-sm text-muted-foreground">
                Loading the editor…
              </span>
            }
          />
        </div>
      </div>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Test cases</Label>
            <Button
              size="sm"
              variant="outline"
              disabled={cases.length >= MAX_TEST_CASES}
              onClick={() => persistCases([...cases, newCase()], language)}
            >
              <Plus className="size-3.5" />
              Add
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            A call to your solution, and the value it should return. Both are
            expressions in {language === "python" ? "Python" : "JavaScript"}.
          </p>
          {cases.map((testCase, index) => (
            <div key={testCase.id} className="flex items-center gap-1.5">
              <Input
                value={testCase.call}
                placeholder={
                  language === "python"
                    ? "two_sum([2, 7, 11, 15], 9)"
                    : "twoSum([2, 7, 11, 15], 9)"
                }
                className="font-mono text-xs"
                onChange={(e) =>
                  persistCases(
                    cases.map((c, i) =>
                      i === index ? { ...c, call: e.target.value } : c,
                    ),
                    language,
                  )
                }
              />
              <span className="shrink-0 text-xs text-muted-foreground">→</span>
              <Input
                value={testCase.expected}
                placeholder="[0, 1]"
                className="font-mono text-xs"
                onChange={(e) =>
                  persistCases(
                    cases.map((c, i) =>
                      i === index ? { ...c, expected: e.target.value } : c,
                    ),
                    language,
                  )
                }
              />
              <Button
                size="icon"
                variant="ghost"
                className="size-8 shrink-0"
                aria-label={`Remove test case ${index + 1}`}
                onClick={() =>
                  persistCases(
                    cases.filter((_, i) => i !== index),
                    language,
                  )
                }
              >
                <Trash2 className="size-3.5" />
              </Button>
            </div>
          ))}
        </section>

        <section className="space-y-2">
          <Label>Result</Label>
          {status && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-3.5 animate-spin" />
              {status}
            </p>
          )}
          {!status && !result && (
            <p className="text-sm text-muted-foreground">
              Nothing run yet. Python downloads its runtime the first time, which
              takes a moment.
            </p>
          )}
          {result && (
            <div className="space-y-2 text-sm">
              <p className="text-muted-foreground">
                {result.cases.filter((c) => c.status === "pass").length} /{" "}
                {result.cases.length} passed in {result.durationMs} ms
              </p>

              {result.error && (
                <pre className="overflow-x-auto rounded-md border border-rose-500/30 bg-rose-500/10 p-2 font-mono text-xs whitespace-pre-wrap text-rose-700 dark:text-rose-400">
                  {result.error}
                </pre>
              )}

              {result.cases.map((caseResult, index) => (
                <div
                  key={caseResult.caseId}
                  className="rounded-md border px-2 py-1.5 font-mono text-xs"
                >
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      STATUS_STYLES[caseResult.status],
                    )}
                  >
                    {caseResult.status === "pass" ? (
                      <Check className="size-3.5" />
                    ) : (
                      <X className="size-3.5" />
                    )}
                    Case {index + 1} — {caseResult.status}
                  </div>
                  {caseResult.status !== "pass" && (
                    <div className="mt-1 space-y-0.5 text-muted-foreground">
                      <div>expected {caseResult.expected}</div>
                      <div>got {caseResult.actual}</div>
                      {caseResult.error && (
                        <pre className="whitespace-pre-wrap">
                          {caseResult.error}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {result.logs.length > 0 && (
                <pre className="max-h-32 overflow-auto rounded-md border bg-muted/50 p-2 font-mono text-xs whitespace-pre-wrap">
                  {result.logs.join("\n")}
                </pre>
              )}
            </div>
          )}
        </section>

        {history.length > 0 && (
          <section className="space-y-1">
            <Label>Recent runs</Label>
            <ul className="space-y-1">
              {history.slice(0, 8).map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center gap-2 rounded-md border px-2 py-1 text-xs"
                >
                  <span className={STATUS_STYLES[entry.status]}>
                    {entry.passed}/{entry.total}
                  </span>
                  <span className="text-muted-foreground">
                    {entry.language === "python" ? "Py" : "JS"}
                  </span>
                  <span className="truncate text-muted-foreground">
                    {new Date(entry.submittedAt).toLocaleString()}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="ml-auto h-6 shrink-0 px-2"
                    onClick={() => {
                      switchLanguage(entry.language);
                      persistCode(entry.code, entry.language);
                    }}
                  >
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-muted-foreground">
              {history.length} kept, newest first. The oldest drop off after 30.
            </p>
          </section>
        )}
      </div>
    </div>
  );
}

export function CodeRunnerDialog({
  problem,
  open,
  onOpenChange,
}: {
  problem: ListProblem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* The body reads localStorage as it mounts, which only happens once the
          dialog opens — so it never runs while the page is being rendered on
          the server. */}
      <DialogContent className="flex h-[85vh] max-w-5xl flex-col gap-4 sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle className="text-base">{problem.title}</DialogTitle>
          <DialogDescription>
            Runs entirely in your browser — a Web Worker for JavaScript, Pyodide
            for Python.
          </DialogDescription>
        </DialogHeader>
        <RunnerBody problem={problem} />
      </DialogContent>
    </Dialog>
  );
}

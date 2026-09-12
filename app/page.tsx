// Scaffold placeholder. Step 3 of DESIGN.md §6 replaces this with
// ProblemListTracker; for now it only proves the data files, Tailwind and
// shadcn/ui are wired together.

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BUILTIN_LISTS, getAllProblems } from "@/lib/lists/problem-lists";

export default function Home() {
  const pool = getAllProblems();

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">LeetcodeHelper</h1>
      <p className="mt-2 text-muted-foreground">
        {BUILTIN_LISTS.length} 个内置题单,去重后共 {pool.length} 道题。
      </p>

      <div className="mt-8 grid gap-4">
        {BUILTIN_LISTS.map((list) => {
          const categories = new Set(list.problems.map((p) => p.category));
          return (
            <Card key={list.id}>
              <CardHeader>
                <CardTitle>{list.name}</CardTitle>
                <CardDescription>{list.description}</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                {list.problems.length} 题 · {categories.size} 个分类
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}

// Scaffold placeholder — the category tracker replaces this. For now it only
// proves the catalogs, Tailwind and shadcn/ui are wired together.

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
        {BUILTIN_LISTS.length} built-in lists, {pool.length} distinct problems
        once de-duplicated.
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
                {list.problems.length} problems · {categories.size} categories
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}

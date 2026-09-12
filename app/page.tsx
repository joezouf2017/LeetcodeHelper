// Until the list switcher lands, the tracker is pinned to NeetCode 150. The
// component itself takes any list, so switching is a matter of changing what
// gets passed in.

import { ProblemListTracker } from "@/components/ProblemListTracker";
import { getListById } from "@/lib/lists/problem-lists";

export default function Home() {
  const list = getListById("neetcode150");
  if (!list) throw new Error("Built-in list neetcode150 is missing");

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <ProblemListTracker list={list} />
    </main>
  );
}

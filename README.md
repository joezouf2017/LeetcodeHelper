# LeetcodeHelper

Spaced-repetition tracking for NeetCode 150, Blind 75 and Grind 75 — review
what you have already solved, pick up something new, every day.

Working through a 150-problem list is easy to start and hard to sustain. Two
weeks in, the hard part is no longer finding a problem to solve; it is
remembering which ones you only *thought* you understood. LeetcodeHelper keeps
that bookkeeping for you: every problem you solve comes back on a widening
schedule until it sticks, and the day's queue is assembled for you instead of
being something you have to decide.

## Status

**Scaffolding.** The three problem catalogs are in place and covered by tests;
the application on top of them is not built yet. See the roadmap below for what
exists today. The home page currently renders list statistics and nothing else.

The full design — data model, spaced-repetition schedule, code runner options
and the multi-list architecture — lives in [DESIGN.md](./DESIGN.md).

## Quick Start

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

No API keys, no environment variables, no external services. Progress will be
stored in a local SQLite file under `data/`, which is git-ignored.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Production build, including a TypeScript pass |
| `npm run lint` | ESLint over the whole project |
| `npm test` | Validate the problem catalogs (see below) |

## Problem Lists

| List | Problems | Categories | Source |
| --- | --- | --- | --- |
| NeetCode 150 | 150 | 18 | [neetcode.io/practice](https://neetcode.io/practice) |
| Blind 75 | 75 | 13 | [neetcode.io](https://neetcode.io/practice/practice/blind75) |
| Grind 75 | 75 | 15 | [techinterviewhandbook.org](https://www.techinterviewhandbook.org/grind75/) |

De-duplicated across all three, that is **168 distinct problems**. Seven of them
are locked behind LeetCode Premium and carry a link to a free LintCode mirror.

`npm test` checks every one of those numbers on each run, so the catalogs cannot
drift from what this README claims. It is also how a real defect was found:
LeetCode 235 was recorded as Medium in one list and Easy in the other two.

### Progress follows the problem, not the list

Progress is keyed by the LeetCode slug and is never scoped to a list. Mark Two
Sum as mastered while working through Blind 75, switch to NeetCode 150, and it
is still mastered there — the same problem is the same problem. This is what
makes it reasonable to start on Blind 75 for coverage and later switch to
NeetCode 150 for depth without re-grinding the overlap.

## Mastery Levels & Spaced Repetition

Each problem carries a mastery level from 0 to 5. Solving it independently
promotes it; needing a hint does not. The next review is scheduled at widening
intervals — 1, 3, 7 and 21 days — so problems you keep getting right stop
competing for your attention and problems you keep missing do not.

## Roadmap

- [x] Problem catalogs for the three built-in lists, with validation tests
- [ ] SQLite persistence layer and the progress API
- [ ] Collapsible category list with per-category completion bars
- [ ] Notes panel and the review actions that drive the schedule
- [ ] "Today" panel — problems due for review plus a configurable number of new ones
- [ ] In-browser code runner (JavaScript via Web Worker, Python via Pyodide)
- [ ] Custom lists assembled from the merged 168-problem pool
- [ ] Optional Piston integration for compiled languages

## Project Structure

```
app/           Next.js App Router pages and API routes
components/    UI components, including shadcn/ui primitives
lib/lists/     The three problem catalogs and the list registry
tests/         Vitest suites
data/          Local SQLite database (git-ignored)
```

## Tech Stack

Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui on the
Radix base, and Vitest. Persistence is better-sqlite3 — a local file, not a
server.

## Data & Privacy

Everything stays on your machine. Your progress, notes and submissions live in a
SQLite file inside the project directory; nothing is uploaded, and there is no
account to create. Deleting `data/` deletes all of it.

## License

MIT. See [LICENSE](./LICENSE).

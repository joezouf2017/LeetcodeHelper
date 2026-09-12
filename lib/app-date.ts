// Review scheduling works in whole calendar days, so dates are plain
// `YYYY-MM-DD` strings rather than timestamps. That makes them directly
// comparable and sortable as strings, and it keeps "due today" meaning the
// user's today rather than an instant.

/** The calendar date at a given UTC offset, in minutes east of UTC. */
export function todayIn(now: Date, offsetMinutes: number): string {
  return new Date(now.getTime() + offsetMinutes * 60_000)
    .toISOString()
    .slice(0, 10);
}

/** The calendar date where this process is running. */
export function today(now: Date = new Date()): string {
  // getTimezoneOffset() counts minutes *west* of UTC, so negate it.
  return todayIn(now, -now.getTimezoneOffset());
}

export function addDays(date: string, days: number): string {
  const at = new Date(`${date}T00:00:00.000Z`);
  at.setUTCDate(at.getUTCDate() + days);
  return at.toISOString().slice(0, 10);
}

/** Whether a scheduled review has come around by `on`. */
export function isDueOn(nextReviewAt: string | null, on: string): boolean {
  return nextReviewAt !== null && nextReviewAt <= on;
}

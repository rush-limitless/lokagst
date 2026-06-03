const attempts = new Map<string, { count: number; reset: number }>();

/** Rate limiter in-memory. Retourne true si la requête est bloquée. */
export function isRateLimited(key: string, max: number = 5, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || now > entry.reset) {
    attempts.set(key, { count: 1, reset: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > max;
}

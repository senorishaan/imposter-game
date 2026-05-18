import { filterNicheHints } from "./hintQuality";
import { HINTS_BY_ANSWER } from "./wordHints";

export function pickHintForAnswer(answer: string): string | null {
  const hints = HINTS_BY_ANSWER[answer];
  if (!hints?.length) return null;

  const niche = filterNicheHints(answer, hints);
  const pool = niche.length > 0 ? niche : hints;

  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}

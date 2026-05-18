import { getCategoryHintPool } from "./categoryHints";
import { filterVagueHints } from "./hintQuality";

export function pickHintForAnswer(answer: string, categoryId: string): string | null {
  const pool = getCategoryHintPool(categoryId);
  if (!pool.length) return null;

  const vague = filterVagueHints(answer, pool);
  const choices = vague.length > 0 ? vague : pool;

  return choices[Math.floor(Math.random() * choices.length)] ?? null;
}

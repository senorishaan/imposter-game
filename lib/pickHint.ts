import { filterVagueHints } from "./hintQuality";
import { HINTS_BY_ANSWER } from "./wordHints";

export function pickHintForAnswer(answer: string): string | null {
  const hints = HINTS_BY_ANSWER[answer];
  if (!hints?.length) return null;

  const vague = filterVagueHints(answer, hints);
  const choices = vague.length > 0 ? vague : hints;

  return choices[Math.floor(Math.random() * choices.length)] ?? null;
}

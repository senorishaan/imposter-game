function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text).split(" ").filter((t) => t.length > 2);
}

/**
 * Reject hints that tie too tightly to the secret word.
 * Category-wide vague hints should usually pass; this catches slip-ups.
 */
export function isGiveawayHint(answer: string, hint: string): boolean {
  const a = normalize(answer);
  const h = normalize(hint);
  if (!a || !h) return true;
  if (a === h) return true;

  const answerTokens = tokens(answer);
  const hintTokens = tokens(hint);

  for (const answerToken of answerTokens) {
    for (const hintToken of hintTokens) {
      if (answerToken === hintToken) return true;
      if (answerToken.length >= 4 && hintToken.includes(answerToken)) return true;
      if (hintToken.length >= 4 && answerToken.includes(hintToken)) return true;
    }
  }

  if (h.length >= 4 && a.includes(h)) return true;
  if (a.length >= 4 && h.includes(a)) return true;

  return false;
}

export function filterVagueHints(
  answer: string,
  hints: readonly string[],
): string[] {
  return hints.filter((hint) => !isGiveawayHint(answer, hint));
}

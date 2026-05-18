/** Pairs where the hint almost always gives away the answer */
const BLOCKED_ASSOCIATIONS: ReadonlyArray<readonly [string, string]> = [
  ["banana", "monkey"],
  ["banana", "peel"],
  ["banana", "yellow"],
  ["apple", "orchard"],
  ["apple", "pie"],
  ["pizza", "slice"],
  ["pizza", "pepperoni"],
  ["hot dog", "mustard"],
  ["hot dog", "bun"],
  ["hot dog", "ballpark"],
  ["taco", "shell"],
  ["taco", "mexico"],
  ["sushi", "japan"],
  ["sushi", "rice"],
  ["dog", "bark"],
  ["dog", "fetch"],
  ["cat", "meow"],
  ["cat", "purr"],
  ["fish", "swim"],
  ["shark", "fin"],
  ["bee", "honey"],
  ["bee", "hive"],
  ["owl", "hoot"],
  ["lion", "roar"],
  ["lion", "mane"],
  ["penguin", "antarctica"],
  ["soccer", "goal"],
  ["football", "touchdown"],
  ["basketball", "hoop"],
  ["basketball", "dunk"],
  ["baseball", "bat"],
  ["hockey", "puck"],
  ["swimming", "pool"],
  ["doctor", "stethoscope"],
  ["doctor", "hospital"],
  ["teacher", "classroom"],
  ["firefighter", "hose"],
  ["police officer", "badge"],
  ["pilot", "plane"],
  ["pilot", "cockpit"],
  ["phone", "call"],
  ["phone", "text"],
  ["snow", "cold"],
  ["rain", "umbrella"],
  ["sun", "bright"],
  ["beach", "sand"],
  ["beach", "waves"],
  ["hospital", "sick"],
  ["zombie", "undead"],
  ["vampire", "fangs"],
  ["superhero", "cape"],
  ["christmas movie", "santa"],
  ["rock climbing", "rope"],
  ["rock climbing", "climb"],
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(text: string): string[] {
  return normalize(text).split(" ").filter(Boolean);
}

function isBlockedPair(answer: string, hint: string): boolean {
  const a = normalize(answer);
  const h = normalize(hint);
  return BLOCKED_ASSOCIATIONS.some(([ans, hin]) => a.includes(ans) && h.includes(hin));
}

/** True when a hint is too on-the-nose for imposter play */
export function isGiveawayHint(answer: string, hint: string): boolean {
  const a = normalize(answer);
  const h = normalize(hint);
  if (!a || !h) return true;
  if (a === h) return true;
  if (isBlockedPair(answer, hint)) return true;

  const answerTokens = tokens(answer);
  const hintTokens = tokens(hint);

  for (const answerToken of answerTokens) {
    for (const hintToken of hintTokens) {
      if (answerToken.length < 3 || hintToken.length < 3) continue;
      if (answerToken === hintToken) return true;
      if (answerToken.includes(hintToken) || hintToken.includes(answerToken)) {
        return true;
      }
    }
  }

  // Whole-phrase overlap (e.g. answer "Ice Cream", hint "cream")
  if (h.length >= 4 && a.includes(h)) return true;
  if (a.length >= 4 && h.includes(a)) return true;

  return false;
}

export function filterNicheHints(
  answer: string,
  hints: readonly string[],
): string[] {
  return hints.filter((hint) => !isGiveawayHint(answer, hint));
}

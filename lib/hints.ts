function normalize(word: string): string {
  return word.trim();
}

function lettersOnly(word: string): string {
  return word.replace(/[^a-zA-Z]/g, "");
}

function maskWord(word: string): string | null {
  const trimmed = normalize(word);
  const letters = lettersOnly(trimmed);
  if (letters.length < 3) return null;

  let letterIndex = 0;
  return [...trimmed]
    .map((char) => {
      if (!/[a-zA-Z]/.test(char)) return char;
      letterIndex++;
      if (letterIndex === 1 || letterIndex === letters.length) return char;
      return "_";
    })
    .join("");
}

type HintGenerator = (word: string) => string | null;

const HINT_GENERATORS: HintGenerator[] = [
  (word) => {
    const letters = lettersOnly(word);
    if (!letters) return null;
    return `Starts with "${letters[0].toUpperCase()}"`;
  },
  (word) => {
    const letters = lettersOnly(word);
    if (letters.length < 2) return null;
    return `Ends with "${letters[letters.length - 1].toUpperCase()}"`;
  },
  (word) => {
    const count = lettersOnly(word).length;
    if (count < 2) return null;
    return `${count} letters long`;
  },
  (word) => (word.includes(" ") ? "It's more than one word" : null),
  (word) => {
    const masked = maskWord(word);
    return masked ? `Looks like: ${masked}` : null;
  },
  (word) => {
    const letters = lettersOnly(word);
    if (letters.length < 4) return null;
    return `Second letter is "${letters[1].toUpperCase()}"`;
  },
  (word) => {
    const vowel = lettersOnly(word).match(/[aeiou]/i);
    if (!vowel) return null;
    return `Contains the letter "${vowel[0].toUpperCase()}"`;
  },
  (word) => {
    const letters = lettersOnly(word);
    if (letters.length < 5) return null;
    const mid = Math.floor(letters.length / 2);
    return `Middle letter is "${letters[mid].toUpperCase()}"`;
  },
];

export function generateHintForWord(word: string): string {
  const options = HINT_GENERATORS.map((gen) => gen(word)).filter(
    (hint): hint is string => hint !== null,
  );

  if (options.length === 0) {
    const letters = lettersOnly(word);
    return letters
      ? `Starts with "${letters[0].toUpperCase()}"`
      : "Listen closely to everyone's clues";
  }

  return options[Math.floor(Math.random() * options.length)];
}

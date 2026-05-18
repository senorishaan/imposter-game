import { pickHintForAnswer } from "./pickHint";
import { WORD_CATEGORIES, type WordCategory } from "./words";

export type GameSettings = {
  playerNames: string[];
  imposterCount: number;
  giveImposterHint: boolean;
  categoryIds: string[];
};

export type PlayerAssignment = {
  name: string;
  isImposter: boolean;
};

export type ActiveRound = {
  category: WordCategory;
  word: string;
  /** Clue about the secret word, shown to imposters when hints are on */
  hint: string | null;
  players: PlayerAssignment[];
  /** Who gives the first clue in discussion (player index) */
  startingPlayerIndex: number;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function getCategoriesByIds(ids: string[]): WordCategory[] {
  return WORD_CATEGORIES.filter((category) => ids.includes(category.id));
}

export function validateSettings(settings: GameSettings): string | null {
  const playerCount = settings.playerNames.filter((name) => name.trim()).length;

  if (playerCount < 3) {
    return "You need at least 3 players.";
  }

  if (settings.imposterCount < 1) {
    return "You need at least 1 imposter.";
  }

  if (settings.imposterCount >= playerCount) {
    return "Imposters must be fewer than total players.";
  }

  if (settings.categoryIds.length === 0) {
    return "Select at least one word category.";
  }

  const categories = getCategoriesByIds(settings.categoryIds);
  if (categories.length === 0) {
    return "None of the selected categories are valid. Pick at least one category.";
  }

  return null;
}

export function startRound(settings: GameSettings): ActiveRound {
  const error = validateSettings(settings);
  if (error) {
    throw new Error(error);
  }

  const activeNames = settings.playerNames
    .map((name) => name.trim())
    .filter(Boolean);

  const categories = getCategoriesByIds(settings.categoryIds);
  const category = pickRandom(categories);
  const word = pickRandom(category.words);

  const imposterIndices = new Set(
    shuffle(activeNames.map((_, index) => index)).slice(
      0,
      settings.imposterCount,
    ),
  );

  const players: PlayerAssignment[] = activeNames.map((name, index) => ({
    name,
    isImposter: imposterIndices.has(index),
  }));

  const hint = settings.giveImposterHint ? pickHintForAnswer(word) : null;
  const startingPlayerIndex = Math.floor(Math.random() * players.length);

  return { category, word, hint, players, startingPlayerIndex };
}

export function pickStartingPlayerIndex(playerCount: number): number {
  return Math.floor(Math.random() * playerCount);
}

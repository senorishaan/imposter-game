"use client";

import { useMemo, useState } from "react";
import {
  startRound,
  validateSettings,
  type ActiveRound,
  type GameSettings,
} from "@/lib/game";
import { WORD_CATEGORIES } from "@/lib/words";

type Phase = "setup" | "reveal" | "discussion" | "results";

const DEFAULT_PLAYERS = ["Player 1", "Player 2", "Player 3", "Player 4"];

export default function ImposterGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [settings, setSettings] = useState<GameSettings>({
    playerNames: DEFAULT_PLAYERS,
    imposterCount: 1,
    giveImposterHint: true,
    categoryIds: WORD_CATEGORIES.map((c) => c.id),
  });
  const [round, setRound] = useState<ActiveRound | null>(null);
  const [revealedIndex, setRevealedIndex] = useState<number | null>(null);
  const [viewedPlayers, setViewedPlayers] = useState<Set<number>>(new Set());
  const [setupError, setSetupError] = useState<string | null>(null);

  const activePlayerCount = useMemo(
    () => settings.playerNames.filter((name) => name.trim()).length,
    [settings.playerNames],
  );

  const allPlayersViewed =
    round !== null && viewedPlayers.size === round.players.length;

  function updatePlayerName(index: number, value: string) {
    setSettings((prev) => {
      const playerNames = [...prev.playerNames];
      playerNames[index] = value;
      return { ...prev, playerNames };
    });
  }

  function addPlayer() {
    setSettings((prev) => ({
      ...prev,
      playerNames: [
        ...prev.playerNames,
        `Player ${prev.playerNames.length + 1}`,
      ],
    }));
  }

  function removePlayer(index: number) {
    if (settings.playerNames.length <= 3) return;
    setSettings((prev) => ({
      ...prev,
      playerNames: prev.playerNames.filter((_, i) => i !== index),
      imposterCount: Math.min(
        prev.imposterCount,
        prev.playerNames.length - 2,
      ),
    }));
  }

  function toggleCategory(id: string) {
    setSettings((prev) => {
      const has = prev.categoryIds.includes(id);
      const categoryIds = has
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id];
      return { ...prev, categoryIds };
    });
  }

  function handleStartGame() {
    const error = validateSettings(settings);
    if (error) {
      setSetupError(error);
      return;
    }
    setSetupError(null);
    const nextRound = startRound(settings);
    setRound(nextRound);
    setRevealedIndex(null);
    setViewedPlayers(new Set());
    setPhase("reveal");
  }

  function handleReveal(index: number) {
    setRevealedIndex(index);
  }

  function handleHideCard() {
    if (revealedIndex === null) return;
    setViewedPlayers((prev) => new Set(prev).add(revealedIndex));
    setRevealedIndex(null);
  }

  function resetGame() {
    setPhase("setup");
    setRound(null);
    setRevealedIndex(null);
    setViewedPlayers(new Set());
    setSetupError(null);
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 py-8 sm:py-12">
      <header className="mb-8 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-rose-400/90">
          Party Game
        </p>
        <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
          Imposter
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-zinc-400">
          Find who doesn&apos;t know the secret word. Pass the phone — one player
          at a time.
        </p>
      </header>

      {round && phase !== "setup" && (
        <CategoryBanner name={round.category.name} />
      )}

      {phase === "setup" && (
        <SetupPhase
          settings={settings}
          activePlayerCount={activePlayerCount}
          setupError={setupError}
          onUpdatePlayerName={updatePlayerName}
          onAddPlayer={addPlayer}
          onRemovePlayer={removePlayer}
          onImposterCountChange={(count) =>
            setSettings((prev) => ({ ...prev, imposterCount: count }))
          }
          onToggleHint={(value) =>
            setSettings((prev) => ({ ...prev, giveImposterHint: value }))
          }
          onToggleCategory={toggleCategory}
          onStart={handleStartGame}
        />
      )}

      {phase === "reveal" && round && (
        <RevealPhase
          round={round}
          settings={settings}
          revealedIndex={revealedIndex}
          viewedPlayers={viewedPlayers}
          allPlayersViewed={allPlayersViewed}
          onReveal={handleReveal}
          onHide={handleHideCard}
          onContinue={() => setPhase("discussion")}
        />
      )}

      {phase === "discussion" && round && (
        <DiscussionPhase
          round={round}
          imposterCount={settings.imposterCount}
          onRevealResults={() => setPhase("results")}
        />
      )}

      {phase === "results" && round && (
        <ResultsPhase
          round={round}
          onPlayAgain={() => {
            const nextRound = startRound(settings);
            setRound(nextRound);
            setRevealedIndex(null);
            setViewedPlayers(new Set());
            setPhase("reveal");
          }}
          onNewGame={resetGame}
        />
      )}
    </div>
  );
}

function CategoryBanner({ name }: { name: string }) {
  return (
    <div className="mb-6 rounded-xl border border-zinc-700/80 bg-zinc-900/90 px-4 py-3 text-center">
      <p className="text-base text-zinc-300">
        Category:{" "}
        <span className="font-semibold text-white">{name}</span>
      </p>
    </div>
  );
}

function SetupPhase({
  settings,
  activePlayerCount,
  setupError,
  onUpdatePlayerName,
  onAddPlayer,
  onRemovePlayer,
  onImposterCountChange,
  onToggleHint,
  onToggleCategory,
  onStart,
}: {
  settings: GameSettings;
  activePlayerCount: number;
  setupError: string | null;
  onUpdatePlayerName: (index: number, value: string) => void;
  onAddPlayer: () => void;
  onRemovePlayer: (index: number) => void;
  onImposterCountChange: (count: number) => void;
  onToggleHint: (value: boolean) => void;
  onToggleCategory: (id: string) => void;
  onStart: () => void;
}) {
  const maxImposters = Math.max(1, activePlayerCount - 1);

  return (
    <div className="flex flex-col gap-6">
      <Card title="Players" subtitle={`${activePlayerCount} in this round`}>
        <ul className="flex flex-col gap-2">
          {settings.playerNames.map((name, index) => (
            <li key={index} className="flex gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => onUpdatePlayerName(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className="min-w-0 flex-1 rounded-xl border border-zinc-700/80 bg-zinc-900/80 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-rose-500/60 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              {settings.playerNames.length > 3 && (
                <button
                  type="button"
                  onClick={() => onRemovePlayer(index)}
                  className="shrink-0 rounded-xl border border-zinc-700/80 px-3 text-zinc-500 transition hover:border-rose-500/40 hover:text-rose-400"
                  aria-label={`Remove ${name || `player ${index + 1}`}`}
                >
                  ×
                </button>
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onAddPlayer}
          className="mt-3 w-full rounded-xl border border-dashed border-zinc-600 py-2.5 text-sm text-zinc-400 transition hover:border-zinc-500 hover:text-zinc-300"
        >
          + Add player
        </button>
      </Card>

      <Card title="Imposters">
        <p className="mb-3 text-sm text-zinc-400">
          How many players don&apos;t get the word?
        </p>
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: maxImposters }, (_, i) => i + 1).map(
            (count) => (
              <button
                key={count}
                type="button"
                onClick={() => onImposterCountChange(count)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  settings.imposterCount === count
                    ? "bg-rose-600 text-white shadow-lg shadow-rose-900/40"
                    : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {count}
              </button>
            ),
          )}
        </div>
      </Card>

      <Card title="Imposter hint">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={settings.giveImposterHint}
            onChange={(e) => onToggleHint(e.target.checked)}
            className="mt-1 size-4 rounded border-zinc-600 bg-zinc-900 text-rose-600 focus:ring-rose-500/30"
          />
          <span>
            <span className="block font-medium text-zinc-200">
              Give imposters a hint
            </span>
            <span className="mt-1 block text-sm text-zinc-500">
              Everyone always sees the category. When on, imposters get one
              vague word — fits the category, not the answer.
            </span>
          </span>
        </label>
      </Card>

      <Card title="Word categories">
        <p className="mb-3 text-sm text-zinc-400">
          Pick which categories the secret word can come from.
        </p>
        <div className="flex flex-wrap gap-2">
          {WORD_CATEGORIES.map((category) => {
            const selected = settings.categoryIds.includes(category.id);
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => onToggleCategory(category.id)}
                className={`rounded-full px-3 py-1.5 text-sm transition ${
                  selected
                    ? "bg-emerald-600/90 text-white"
                    : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                }`}
              >
                {category.name}
              </button>
            );
          })}
        </div>
      </Card>

      {setupError && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-sm text-rose-300">
          {setupError}
        </p>
      )}

      <button
        type="button"
        onClick={onStart}
        className="mt-2 w-full rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 py-4 text-lg font-semibold text-white shadow-xl shadow-rose-950/50 transition hover:from-rose-500 hover:to-rose-400 active:scale-[0.99]"
      >
        Start game
      </button>
    </div>
  );
}

function RevealPhase({
  round,
  settings,
  revealedIndex,
  viewedPlayers,
  allPlayersViewed,
  onReveal,
  onHide,
  onContinue,
}: {
  round: ActiveRound;
  settings: GameSettings;
  revealedIndex: number | null;
  viewedPlayers: Set<number>;
  allPlayersViewed: boolean;
  onReveal: (index: number) => void;
  onHide: () => void;
  onContinue: () => void;
}) {
  if (revealedIndex !== null) {
    const player = round.players[revealedIndex];
    return (
      <RoleCard
        player={player}
        word={round.word}
        hint={round.hint}
        onHide={onHide}
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card title="Secret roles" subtitle="Tap your name when it's your turn">
        <ul className="flex flex-col gap-2">
          {round.players.map((player, index) => {
            const viewed = viewedPlayers.has(index);
            return (
              <li key={index}>
                <button
                  type="button"
                  disabled={viewed}
                  onClick={() => onReveal(index)}
                  className={`flex w-full items-center justify-between rounded-xl px-4 py-3.5 text-left font-medium transition ${
                    viewed
                      ? "cursor-default bg-zinc-800/40 text-zinc-600"
                      : "bg-zinc-800 text-white hover:bg-zinc-700"
                  }`}
                >
                  <span>{player.name}</span>
                  <span className="text-sm text-zinc-500">
                    {viewed ? "✓ Seen" : "Tap to reveal"}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </Card>

      <p className="text-center text-sm text-zinc-500">
        {viewedPlayers.size} of {round.players.length} players have seen their
        role. Don&apos;t let anyone else peek!
      </p>

      {allPlayersViewed && (
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-2xl bg-emerald-600 py-4 text-lg font-semibold text-white shadow-lg shadow-emerald-950/40 transition hover:bg-emerald-500"
        >
          Everyone&apos;s ready — start discussion
        </button>
      )}
    </div>
  );
}

function RoleCard({
  player,
  word,
  hint,
  onHide,
}: {
  player: { name: string; isImposter: boolean };
  word: string;
  hint: string | null;
  onHide: () => void;
}) {
  return (
    <div className="flex flex-1 flex-col gap-6">
      <div
        className={`flex flex-1 flex-col items-center justify-center rounded-3xl border-2 p-8 text-center ${
          player.isImposter
            ? "border-rose-500/50 bg-gradient-to-b from-rose-950/80 to-zinc-900"
            : "border-emerald-500/40 bg-gradient-to-b from-emerald-950/60 to-zinc-900"
        }`}
      >
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          {player.name}
        </p>

        <p
          className={`mt-6 text-3xl font-bold ${player.isImposter ? "text-rose-400" : "text-emerald-400"}`}
        >
          {player.isImposter ? "IMPOSTER" : "CREW"}
        </p>
        <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
          {player.isImposter
            ? "You don't know the secret word. Blend in and avoid getting caught."
            : "You know the secret. Give clues without saying the word directly."}
        </p>

        <div className="mt-8 w-full space-y-3">
          {!player.isImposter && (
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-6 py-5">
              <p className="text-xs uppercase tracking-wider text-emerald-300/80">
                Secret word
              </p>
              <p className="mt-1 text-3xl font-bold text-white">{word}</p>
            </div>
          )}

          {player.isImposter && hint && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-950/30 px-6 py-5">
              <p className="text-xs uppercase tracking-wider text-rose-300/80">
                Hint
              </p>
              <p className="mt-1 text-xl font-semibold leading-snug text-white">
                {hint}
              </p>
              <p className="mt-2 text-xs text-zinc-500">
                One-word vibe — could be a few things in this category
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={onHide}
        className="w-full rounded-2xl bg-zinc-800 py-4 text-lg font-semibold text-white transition hover:bg-zinc-700"
      >
        Hide & pass phone
      </button>
    </div>
  );
}

function DiscussionPhase({
  round,
  imposterCount,
  onRevealResults,
}: {
  round: ActiveRound;
  imposterCount: number;
  onRevealResults: () => void;
}) {
  const starter = round.players[round.startingPlayerIndex];

  return (
    <div className="flex flex-1 flex-col gap-6">
      <div className="rounded-2xl border-2 border-amber-500/50 bg-gradient-to-b from-amber-950/60 to-zinc-900 px-6 py-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-amber-400/90">
          Who starts
        </p>
        <p className="mt-2 text-3xl font-bold text-white">{starter.name}</p>
        <p className="mt-2 text-sm text-zinc-400">
          goes first — give the opening clue, then pass around the group.
        </p>
      </div>

      <Card title="Discussion time">
        <ol className="list-decimal space-y-3 pl-5 text-sm leading-relaxed text-zinc-300">
          <li>
            Take turns describing the secret word without saying it outright.
          </li>
          <li>
            Ask questions and vote on who seems like the{" "}
            {imposterCount === 1 ? "imposter" : "imposters"}.
          </li>
          <li>
            Imposters: stay convincing. Crew: spot who doesn&apos;t fit.
          </li>
        </ol>
      </Card>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center">
        <p className="text-4xl font-bold text-white">{round.players.length}</p>
        <p className="mt-1 text-sm text-zinc-500">players debating</p>
        <p className="mt-4 text-rose-400">
          {imposterCount} imposter{imposterCount > 1 ? "s" : ""} among you
        </p>
      </div>

      <button
        type="button"
        onClick={onRevealResults}
        className="mt-auto w-full rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 py-4 text-lg font-semibold text-white shadow-xl shadow-rose-950/50 transition hover:from-rose-500 hover:to-rose-400"
      >
        Reveal imposters & word
      </button>
    </div>
  );
}

function ResultsPhase({
  round,
  onPlayAgain,
  onNewGame,
}: {
  round: ActiveRound;
  onPlayAgain: () => void;
  onNewGame: () => void;
}) {
  const imposters = round.players.filter((p) => p.isImposter);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-3xl border border-zinc-700 bg-zinc-900/80 p-6 text-center">
        <p className="text-xs uppercase tracking-widest text-zinc-500">
          The secret word was
        </p>
        <p className="mt-2 text-4xl font-bold text-white">{round.word}</p>
        <p className="mt-2 text-sm text-zinc-400">
          Category: <span className="text-zinc-200">{round.category.name}</span>
        </p>
      </div>

      <Card title="The imposters were…">
        <ul className="flex flex-col gap-2">
          {imposters.map((player, i) => (
            <li
              key={i}
              className="flex items-center gap-3 rounded-xl bg-rose-950/50 px-4 py-3 text-rose-200"
            >
              <span className="text-lg">🎭</span>
              <span className="font-semibold">{player.name}</span>
            </li>
          ))}
        </ul>
        {round.hint && (
          <p className="mt-3 text-xs text-zinc-500">
            Imposter hint:{" "}
            <span className="text-zinc-300">{round.hint}</span>
          </p>
        )}
      </Card>

      <Card title="Everyone's roles">
        <ul className="flex flex-col gap-1.5">
          {round.players.map((player, i) => (
            <li
              key={i}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm"
            >
              <span className="text-zinc-200">{player.name}</span>
              <span
                className={
                  player.isImposter ? "text-rose-400" : "text-emerald-400"
                }
              >
                {player.isImposter ? "Imposter" : "Crew"}
              </span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPlayAgain}
          className="flex-1 rounded-2xl bg-emerald-600 py-4 font-semibold text-white transition hover:bg-emerald-500"
        >
          Same players, new word
        </button>
        <button
          type="button"
          onClick={onNewGame}
          className="flex-1 rounded-2xl border border-zinc-600 py-4 font-semibold text-zinc-200 transition hover:bg-zinc-800"
        >
          Change settings
        </button>
      </div>
    </div>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="text-lg font-semibold text-white">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-zinc-500">{subtitle}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

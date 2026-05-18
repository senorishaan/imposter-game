/**
 * Filters giveaway hints and applies obscure replacements.
 * Run: node scripts/refine-hints-niche.mjs && node scripts/build-hint-map.mjs && node scripts/generate-word-hints.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Obscure, indirect hints — insider/tangential, not "monkey → banana"
const NICHE_PATCHES = {
  Pizza: ["margherita lore", "wood-fired", "Neapolitan", "red sauce canon"],
  Burger: ["smash technique", "drive-thru", "pickle debate", "griddle"],
  "Hot Dog": ["Coney Island", "Nathan's", "street cart", "snap when you bite"],
  Banana: ["Cavendish", "handedness joke", "split lengthwise", "Chiquita era"],
  Apple: ["Honeycrisp wars", "one a day myth", "cider pivot", "stem twist"],
  Dog: ["leash laws", "dog park politics", "breed discourse", "vet visit"],
  Cat: ["hairball", "3am zoomies", "cardboard box", "knock things off"],
  Soccer: ["offside trap", "stoppage time", "pitch dimensions", "nil-nil"],
  Football: ["fourth down math", "two-minute drill", "hail mary", "tailgate"],
  Basketball: ["pick and roll", "shot clock", "and-one", "garbage time"],
  Shark: ["Jaws era", "cartilage", "fin soup controversy", "reef patrol"],
  Bee: ["waggle dance", "colony collapse", "pollination drama", "smoker"],
  Sushi: ["omakase", "itamae", "wasabi debate", "counter seating"],
  "Rock Climbing": ["crag", "belay", "chalk bag", "beta"],
  Zombie: ["Romero rules", "slow shuffle", "headshot lore", "outbreak"],
  Vampire: ["Dracula canon", "garlic myth", "no reflection", "stake lore"],
  Superhero: ["origin story", "secret identity", "sidekick contract", "cape physics"],
  Hospital: ["triage", "rounds", "discharge papers", "beeping hallway"],
  Beach: ["rip current", "boardwalk", "sunscreen debate", "low tide"],
};

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const BLOCKED = [
  ["banana", "monkey"],
  ["banana", "peel"],
  ["banana", "yellow"],
  ["apple", "orchard"],
  ["apple", "pie"],
  ["pizza", "slice"],
  ["dog", "bark"],
  ["cat", "meow"],
  ["soccer", "goal"],
  ["football", "touchdown"],
  ["basketball", "hoop"],
  ["rock climbing", "rope"],
  ["rock climbing", "climb"],
];

function isGiveaway(answer, hint) {
  const a = normalize(answer);
  const h = normalize(hint);
  if (a === h) return true;
  if (BLOCKED.some(([x, y]) => a.includes(x) && h.includes(y))) return true;
  const at = a.split(" ");
  const ht = h.split(" ");
  for (const x of at) {
    for (const y of ht) {
      if (x.length >= 3 && y.length >= 3 && (x === y || x.includes(y) || y.includes(x))) {
        return true;
      }
    }
  }
  if (h.length >= 4 && a.includes(h)) return true;
  if (a.length >= 4 && h.includes(a)) return true;
  return false;
}

function refineHints(answer, hints) {
  let next = hints.filter((h) => !isGiveaway(answer, h));
  if (NICHE_PATCHES[answer]) {
    next = [...new Set([...NICHE_PATCHES[answer], ...next])];
  }
  next = next.filter((h) => !isGiveaway(answer, h));
  if (next.length < 2 && NICHE_PATCHES[answer]) {
    next = NICHE_PATCHES[answer];
  }
  return next.slice(0, 4);
}

const hintsDir = path.join(__dirname, "hints");
for (const file of fs.readdirSync(hintsDir).filter((f) => f.endsWith(".mjs"))) {
  const filePath = path.join(hintsDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const match = content.match(/export default (\{[\s\S]*\});/);
  if (!match) continue;
  const data = eval(`(${match[1]})`);
  for (const [answer, hints] of Object.entries(data)) {
    data[answer] = refineHints(answer, hints);
  }
  const lines = [
    `/** @type {Record<string, string[]>} */`,
    `export default ${JSON.stringify(data, null, 2)};`,
    "",
  ];
  fs.writeFileSync(filePath, lines.join("\n"));
  console.log("Refined", file);
}

console.log("Done. Run: node scripts/build-hint-map.mjs && node scripts/generate-word-hints.mjs");

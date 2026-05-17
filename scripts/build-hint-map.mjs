import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import food from "./hints/food.mjs";
import animals from "./hints/animals.mjs";
import places from "./hints/places.mjs";
import movies from "./hints/movies.mjs";
import sports from "./hints/sports.mjs";
import jobs from "./hints/jobs.mjs";
import objects from "./hints/objects.mjs";
import nature from "./hints/nature.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const map = {
  ...food,
  ...animals,
  ...places,
  ...movies,
  ...sports,
  ...jobs,
  ...objects,
  ...nature,
};

const words = JSON.parse(
  fs.readFileSync(path.join(__dirname, "words-by-category.json"), "utf8"),
);
const all = [...new Set(Object.values(words).flat())];
const missing = all.filter((w) => !map[w]?.length);

if (missing.length) {
  console.error("Missing:", missing.length, missing);
  process.exit(1);
}

fs.writeFileSync(
  path.join(__dirname, "hint-map.json"),
  JSON.stringify(map, null, 2),
);
console.log("hint-map.json:", Object.keys(map).length, "entries");

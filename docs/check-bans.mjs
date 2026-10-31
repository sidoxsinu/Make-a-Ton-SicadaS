// scripts/check-bans.mjs
// Fails when a banned visual or copy pattern appears in source. Run: node scripts/check-bans.mjs
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname } from "node:path";

const ROOTS = ["app", "components", "lib", "styles"];
const EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".mjs", ".md"]);
const SKIP = new Set(["node_modules", ".next", "dist"]);

const RULES = [
  [/gradient/i, "gradient"],
  [/box-shadow|\bshadow(-|\b)/i, "shadow"],
  [/\bblur\b|blur-|backdrop/i, "blur or backdrop"],
  [/rounded-(md|lg|xl|2xl|3xl|full)\b/, "radius above 2px"],
  [/border-radius:\s*(?!0\b|2px\b|var\(--radius\))[^;]+;/i, "radius above 2px"],
  [/\bInter\b|Geist|Space Grotesk/, "banned font"],
  [/\u2014/, "em dash"],
  [/#fff(fff)?\b/i, "pure white"],
  [/\b(bg|text|border)-white\b/, "pure white"],
  [/lucide|react-icons|heroicons|fontawesome/i, "icon set"],
  [/\p{Extended_Pictographic}/u, "emoji"],
  [/confetti|sparkle/i, "banned decoration"],
];

const hits = [];
function walk(dir) {
  let names;
  try { names = readdirSync(dir); } catch { return; }
  for (const name of names) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) walk(p);
    else if (EXT.has(extname(p))) {
      const lines = readFileSync(p, "utf8").split("\n");
      lines.forEach((line, i) => {
        if (line.includes("check-bans:ignore")) return;
        for (const [re, label] of RULES) if (re.test(line)) hits.push(`${p}:${i + 1}  ${label}  ${line.trim().slice(0, 80)}`);
      });
    }
  }
}
ROOTS.forEach(walk);
if (hits.length) { console.error(hits.join("\n")); console.error(`\n${hits.length} banned pattern(s) found.`); process.exit(1); }
console.log("check-bans: clean");

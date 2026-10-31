import fs from "node:fs";
import path from "node:path";

const nextDir = path.resolve(process.cwd(), ".next");
const prodDocument = path.join(nextDir, "server", "pages", "_document.js");

// When `next build` runs, .next contains production-compiled webpack runtime files
// and pages/_document.js. If `next dev` is then executed on that directory, Next.js
// attempts to require production chunks (e.g. './9276.js') that don't exist in dev,
// causing a fatal "Cannot find module" crash and 404s on dev assets.
// Cleaning .next when switching from build to dev permanently eliminates this.
if (fs.existsSync(prodDocument)) {
  try {
    fs.rmSync(nextDir, { recursive: true, force: true });
  } catch {
    // Ignore cleanup error if file locked
  }
}

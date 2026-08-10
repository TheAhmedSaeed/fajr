import { readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Makes the compiled `.test-build` output runnable by plain Node.
 *
 * The source uses extensionless relative imports because that is what Next's
 * bundler expects, but Node's ESM resolver requires a real filename. `adhan`
 * ships its "CommonJS" build as `.js` inside a `"type": "module"` package, so
 * `require()` cannot load it and ESM is the only option — hence this rewrite
 * rather than simply compiling to CJS.
 */
const OUT = ".test-build";

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(path);
    else if (entry.name.endsWith(".js")) yield path;
  }
}

for await (const file of walk(OUT)) {
  const src = await readFile(file, "utf8");
  // Only relative specifiers, and only those without an extension already.
  const fixed = src.replace(
    /(\bfrom\s+|\bimport\s*\(\s*)(["'])(\.\.?\/[^"']*?)(["'])/g,
    (match, prefix, open, spec, close) =>
      /\.[a-zA-Z0-9]+$/.test(spec) ? match : `${prefix}${open}${spec}.js${close}`,
  );
  // Node's ESM loader requires an explicit attribute for JSON; bundlers do not,
  // so TypeScript emits the import without one.
  const withJsonAttrs = fixed.replace(
    /(\bfrom\s+)(["'])([^"']+\.json)\2(?!\s*with)/g,
    (_m, prefix, quote, spec) => `${prefix}${quote}${spec}${quote} with { type: "json" }`,
  );

  if (withJsonAttrs !== src) await writeFile(file, withJsonAttrs);
}

await writeFile(join(OUT, "package.json"), JSON.stringify({ type: "module" }) + "\n");

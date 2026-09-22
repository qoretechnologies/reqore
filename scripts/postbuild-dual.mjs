#!/usr/bin/env node
/*
 * Dual-format packaging.
 *
 * tsc emits the library twice: ESM straight into `dist/` (as `.js`, next to
 * the `.d.ts` files) and CommonJS into `dist-cjs/`. This step turns that into
 * one publishable tree:
 *
 *   dist/**\/*.js     ESM   — what bundlers take via `module`, and what every
 *                            existing deep import (`dist/components/Panel`)
 *                            now resolves to, in dev and in build alike
 *   dist/**\/*.cjs    CJS   — what Node takes via `main`
 *   dist/**\/*.d.ts   types — shared by both
 *   dist/package.json       `{ "type": "module" }` so Node treats the `.js`
 *                            files as ESM without changing the repo root
 *
 * Both trees get explicit file extensions on their relative specifiers, so an
 * ESM file only ever imports ESM and a CJS file only ever requires CJS. That
 * is what keeps a consumer on one module tree — one ThemeContext, one
 * styled-components instance — however it reaches into the package.
 *
 * No `exports` map on purpose: an exports map matches subpaths literally,
 * without extension or index probing, and would break every extensionless
 * deep import in the IDE (621 of them at the time of writing).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(ROOT, 'dist');
const CJS_SRC = join(ROOT, 'dist-cjs');

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* walk(full);
    else yield full;
  }
}

// '.' and '..' on their own are relative too — tsc emits them for `from '..'`,
// and without an extension Node resolves them to a directory and lands on the
// wrong module tree.
const isRelative = (spec) => spec === '.' || spec === '..' || spec.startsWith('./') || spec.startsWith('../');
const hasExtension = (spec) => /\.(m?js|cjs|json|css)$/.test(spec);

/** Turn './x' into './x.<ext>' or './x/index.<ext>', whichever exists in `tree`. */
function explicit(fromFile, spec, tree, ext, emittedExt) {
  if (!isRelative(spec) || hasExtension(spec)) return spec;
  const base = resolve(dirname(fromFile), spec);
  const asFile = `${base}.${emittedExt}`;
  const asIndex = join(base, `index.${emittedExt}`);
  if (existsSync(asFile)) return `${spec}.${ext}`;
  if (existsSync(asIndex)) return `${spec.replace(/\/$/, '')}/index.${ext}`;
  throw new Error(`postbuild: cannot resolve '${spec}' from ${relative(tree, fromFile)}`);
}


/**
 * `export { default as X } from './p'` compiles to
 *   get: function () { return __importDefault(p_1).default; }
 * which Node's CommonJS lexer cannot read, so `import { X } from` the package
 * silently loses X under Node ESM (45 exports at the time of writing). For a
 * module we compiled ourselves `__importDefault(m)` returns `m` unchanged
 * (tsc sets `__esModule`), so `m.default` is the same value and the lexer
 * reads it. Only getters whose module came from a relative require are
 * touched; third-party defaults keep the interop wrapper.
 */
function readableReexportGetters(src) {
  const local = new Set();
  for (const m of src.matchAll(/var (\w+) = (?:__importDefault\()?require\("\.\.?\/[^"]+"\)\)?;/g)) local.add(m[1]);
  return src.replace(
    /get: function \(\) \{ return __importDefault\((\w+)\)\.default; \}/g,
    (m, id) => (local.has(id) ? `get: function () { return ${id}.default; }` : m)
  );
}
const ESM_SPEC = /(\b(?:import|export)\b[^'"]*?\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)(['"])([^'"]+)\2/g;
const CJS_SPEC = /(\brequire\s*\(\s*)(['"])([^'"]+)\2/g;

// ---- 1. ESM tree already in dist/: explicit extensions on relative imports ----
let esm = 0;
for (const file of walk(DIST)) {
  if (!file.endsWith('.js')) continue;
  const src = readFileSync(file, 'utf8');
  const out = src.replace(ESM_SPEC, (m, lead, q, spec) => `${lead}${q}${explicit(file, spec, DIST, 'js', 'js')}${q}`);
  if (out !== src) writeFileSync(file, out);
  esm++;
}

// ---- 2. CJS tree from dist-cjs/: rename to .cjs, explicit extensions, move into dist/ ----
if (!existsSync(CJS_SRC)) throw new Error('postbuild: dist-cjs/ missing — run the CommonJS emit first');
let cjs = 0;
for (const file of walk(CJS_SRC)) {
  const rel = relative(CJS_SRC, file);
  if (file.endsWith('.js')) {
    const src = readFileSync(file, 'utf8');
    let out = src.replace(CJS_SPEC, (m, lead, q, spec) => `${lead}${q}${explicit(file, spec, CJS_SRC, 'cjs', 'js')}${q}`);
    out = out.replace(/\/\/# sourceMappingURL=(.+)\.js\.map\s*$/m, '//# sourceMappingURL=$1.cjs.map');
    out = readableReexportGetters(out);
    const target = join(DIST, rel.replace(/\.js$/, '.cjs'));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, out);
    cjs++;
  } else if (file.endsWith('.js.map')) {
    const map = JSON.parse(readFileSync(file, 'utf8'));
    if (map.file) map.file = map.file.replace(/\.js$/, '.cjs');
    const target = join(DIST, rel.replace(/\.js\.map$/, '.cjs.map'));
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, JSON.stringify(map));
  }
  // .d.ts from the CJS emit are identical to the ESM emit's — dropped with the directory
}
rmSync(CJS_SRC, { recursive: true, force: true });

// ---- 3. Node reads dist/**/*.js as ESM ----
writeFileSync(join(DIST, 'package.json'), JSON.stringify({ type: 'module' }, null, 2) + '\n');

console.log(`postbuild: ${esm} ESM files, ${cjs} CJS files, dist/package.json written`);

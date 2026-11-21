// Test helper (not a test file): bundles TypeScript/TSX from src/ with the esbuild that ships with vite,
// then imports the result. No new dependencies. React and react-dom are bundled together so hooks work.
import { build } from 'esbuild';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

export async function loadModule(entryContents) {
  const result = await build({
    stdin: { contents: entryContents, resolveDir: root, loader: 'tsx' },
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    jsx: 'automatic',
    loader: { '.css': 'empty' },
    define: { 'import.meta.env': '{}' },
    banner: {
      js: `import { createRequire as __cr } from 'module'; const require = __cr(${JSON.stringify(pathToFileURL(path.join(root, 'package.json')).href)});`,
    },
    logLevel: 'silent',
  });
  const code = result.outputFiles[0].text;
  return import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'));
}

export function stubBrowserGlobals() {
  globalThis.sessionStorage = { getItem: () => null, setItem() {}, removeItem() {} };
}

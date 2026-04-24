import { copyFileSync } from 'node:fs';
import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  format: 'cjs',
  platform: 'neutral',
  external: ['k6', 'k6/*'],
  outfile: 'dist/index.js',
});

copyFileSync('dist/index.js', 'dist/index.mjs');

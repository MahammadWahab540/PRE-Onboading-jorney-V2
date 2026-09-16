import { build } from 'esbuild';

if (process.env.CF_PAGES === '1') {
  console.log('Cloudflare Pages detected: skipping Node/Express server bundle.');
  process.exit(0);
}

await build({
  entryPoints: ['server.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  sourcemap: true,
  outfile: 'dist/server.cjs',
});

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();
const distDir = join(root, 'dist');
const errors = [];

const requireFile = (file, description) => {
  if (!existsSync(file)) {
    errors.push(`${description} is missing: ${relative(root, file)}`);
  }
};

requireFile(join(distDir, 'index.html'), 'Vite entrypoint');
requireFile(join(root, 'wrangler.toml'), 'Cloudflare Pages configuration');
requireFile(join(root, 'functions', 'api', '[[path]].ts'), 'Pages API catch-all function');
requireFile(join(root, 'functions', 'api', 'health.ts'), 'Pages health function');

if (existsSync(join(root, 'wrangler.toml'))) {
  const wrangler = readFileSync(join(root, 'wrangler.toml'), 'utf8');
  const checks = [
    [/name\s*=\s*"pre-onboarding-journey"/, 'wrangler project name'],
    [/pages_build_output_dir\s*=\s*"\.\/dist"/, 'wrangler Pages output directory'],
    [/compatibility_date\s*=\s*"\d{4}-\d{2}-\d{2}"/, 'wrangler compatibility date'],
    [/nodejs_compat/, 'wrangler nodejs_compat flag'],
  ];

  for (const [pattern, label] of checks) {
    if (!pattern.test(wrangler)) errors.push(`${label} is not configured as expected`);
  }
}

let totalBytes = 0;
let fileCount = 0;
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const file = join(dir, entry);
    const stats = statSync(file);
    if (stats.isDirectory()) walk(file);
    else {
      fileCount += 1;
      totalBytes += stats.size;
    }
  }
};
walk(distDir);

if (fileCount === 0) errors.push('dist contains no deployable files');

if (errors.length > 0) {
  console.error('Cloudflare Pages verification failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Cloudflare Pages artifacts verified: ${fileCount} files, ${totalBytes} bytes.`);

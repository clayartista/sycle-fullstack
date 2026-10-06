import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(process.cwd());
const app = join(root, 'src', 'app');
const source = join(root, 'src');
const forbiddenRoutes = [join(app, 'ringkasan'), join(app, 'tindakan')];
const requiredRoutes = [join(app, 'untukmu'), join(app, 'personalisasi'), join(app, 'memproses')];

for (const route of forbiddenRoutes) {
  if (existsSync(route)) throw new Error(`Forbidden split route still exists: ${route}`);
}
for (const route of requiredRoutes) {
  if (!existsSync(route)) throw new Error(`Required route is missing: ${route}`);
}

function walk(dir) {
  const results = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    const stat = statSync(path);
    if (stat.isDirectory() && entry !== 'node_modules') results.push(...walk(path));
    else if (stat.isFile() && /\.(ts|tsx)$/.test(entry)) results.push(path);
  }
  return results;
}

const references = [];
for (const file of walk(source)) {
  const content = readFileSync(file, 'utf8');
  if (/['\"]\/ringkasan['\"]|['\"]\/tindakan['\"]/.test(content)) references.push(file);
}
if (references.length) {
  throw new Error(`Forbidden primary-flow references found:\n${references.join('\n')}`);
}

const consolidated = readFileSync(join(source, 'pages', 'UntukmuHariIni.tsx'), 'utf8');
for (const marker of ['Ringkasan Hari Ini', 'Yang Bisa Kamu Lakukan', 'Simpan ke Health Tracker']) {
  if (!consolidated.includes(marker)) throw new Error(`Consolidated page is missing marker: ${marker}`);
}

console.log('Primary flow validation: PASS');

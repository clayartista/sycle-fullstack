import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const exists = (file) => fs.existsSync(path.join(root, file));
const fail = (message) => { console.error(`FAIL: ${message}`); process.exitCode = 1; };
const pass = (message) => console.log(`PASS: ${message}`);

for (const forbidden of ['src/app/ringkasan', 'src/app/tindakan']) {
  if (exists(forbidden)) fail(`${forbidden} must not exist`); else pass(`${forbidden} is absent`);
}

const untukmu = read('src/pages/UntukmuHariIni.tsx');
const personalization = read('src/pages/Personalization.tsx');
const context = read('src/context/AppContext.tsx');
const nextConfig = read('next.config.ts');
const evidence = read('src/app/api/evidence/context/route.ts');
const envRoute = read('src/app/api/environment/route.ts');
const uat = read('src/app/api/uat/route.ts');

for (const marker of ['RINGKASAN + AKSI', 'Yang Bisa Kamu Lakukan', 'CATAT TUBUH', 'PAHAMI']) {
  if (!untukmu.includes(marker)) fail(`/untukmu missing ${marker}`); else pass(`/untukmu contains ${marker}`);
}

for (const marker of ['ContextRelevanceCard', 'LocationPermissionCard', 'Tahap 1 dari 2', 'Tahap 2 dari 2']) {
  if (!personalization.includes(marker)) fail(`Personalization missing ${marker}`); else pass(`Personalization has ${marker}`);
}

for (const marker of ['requestLocation', "navigator.geolocation.getCurrentPosition", "/api/environment", "Permissions API"]) {
  if (!context.includes(marker)) fail(`Location flow missing ${marker}`); else pass(`Location flow includes ${marker}`);
}

for (const marker of ['Permissions-Policy', 'geolocation=(self)']) {
  if (!nextConfig.includes(marker)) fail(`next.config missing ${marker}`); else pass(`next.config contains ${marker}`);
}

for (const marker of ['/api/evidence/context', 'Knowledge Base', 'retrieveEvidence']) {
  const source = marker === 'Knowledge Base' ? untukmu : evidence + context;
  if (!source.includes(marker)) fail(`Evidence integration missing ${marker}`); else pass(`Evidence integration includes ${marker}`);
}

for (const marker of ['api.open-meteo.com', 'air-quality-api.open-meteo.com', 'temperature_2m', 'pm2_5']) {
  if (!envRoute.includes(marker)) fail(`Live environment route missing ${marker}`); else pass(`Live environment route includes ${marker}`);
}

for (const marker of ['uat_sessions', 'completedTasks', 'findings']) {
  const source = marker === 'uat_sessions' ? read('supabase/migrations/0004_uat_sessions.sql') : uat;
  if (!source.includes(marker)) fail(`UAT implementation missing ${marker}`); else pass(`UAT implementation includes ${marker}`);
}

if (fs.existsSync(path.join(root, '.figma')) || fs.existsSync(path.join(root, 'src/imports'))) {
  fail('Figma artifacts detected');
} else pass('Figma artifacts absent');

if (!exists('src/app/api/uat/route.ts')) fail('/api/uat route is missing'); else pass('/api/uat route exists');

console.log(process.exitCode ? '\nSYCLE v5 validation: FAIL' : '\nSYCLE v5 validation: PASS');

const typesSource = read('src/types.ts');
if (typesSource.includes('SIM_TOPICS')) fail('Legacy SIM_TOPICS remains'); else pass('Legacy SIM_TOPICS removed');

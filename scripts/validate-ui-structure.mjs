import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const exists = (p) => fs.existsSync(path.join(root, p));
const mustExist = [
  'src/components/landing/LandingPage.tsx',
  'src/components/landing/LandingHero.tsx',
  'src/components/landing/LandingEnvironmentCard.tsx',
  'src/components/landing/LandingQuickLinks.tsx',
  'src/components/landing/LandingAccountPrompt.tsx',
  'src/components/ui/Button.tsx',
  'src/components/ui/Card.tsx',
  'src/components/ui/SectionHeading.tsx',
  'src/pages/UntukmuHariIni.tsx',
  'public/sycle-logo.png',
];

const missing = mustExist.filter((p) => !exists(p));
const hasFigmaDir = exists('src/imports');
if (missing.length || hasFigmaDir) {
  if (missing.length) console.error('Missing UI files:', missing.join(', '));
  if (hasFigmaDir) console.error('Source-only directory still exists: src/imports');
  process.exit(1);
}
console.log('UI structure validation: PASS');

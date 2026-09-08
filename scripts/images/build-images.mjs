// Builds every optimised webp under public/assets/img from the source files in /assets.
// Run:  cd scripts/images && npm install && node build-images.mjs
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, 'public/assets/img');
fs.mkdirSync(OUT, { recursive: true });

async function toWebp(src, name, width, quality, extra = {}) {
  const input = path.join(ROOT, src);
  if (!fs.existsSync(input)) { console.warn('missing', src); return; }
  let img = sharp(input).rotate();
  if (extra.cover) img = img.resize({ width: extra.cover[0], height: extra.cover[1], fit: 'cover', position: 'attention' });
  else img = img.resize({ width, withoutEnlargement: true });
  await img.webp({ quality }).toFile(path.join(OUT, `${name}.webp`));
  if (extra.small) {
    await sharp(input).rotate().resize({ width: extra.small, withoutEnlargement: true }).webp({ quality: quality - 4 }).toFile(path.join(OUT, `${name}-${extra.small}.webp`));
  }
  console.log('ok', name);
}

// Real clinic photos
const clinic = [
  ['unnamed (22).jpg', 'clinic-reception'], ['unnamed (23).jpg', 'clinic-waiting'], ['unnamed (5).jpg', 'clinic-reception-2'],
  ['unnamed (6).jpg', 'clinic-waiting-2'], ['unnamed (19).jpg', 'clinic-exterior-night'], ['unnamed (7).jpg', 'clinic-exterior-day'],
  ['unnamed (4).jpg', 'clinic-exterior-day-2'], ['unnamed (9).jpg', 'clinic-consult-room'], ['unnamed (20).jpg', 'clinic-reception-wide'],
  ['unnamed (10).jpg', 'clinic-hallway'], ['unnamed (14).jpg', 'clinic-corridor'],
];
for (const [f, name] of clinic) await toWebp(`assets/clinic photos/${f}`, name, 1600, 78, { small: 800 });

// AI-generated scenes (originals kept in assets/generated)
const generated = [
  ['hero-desktop', 2000, true], ['hero-mobile', 1100], ['why-listening', 1100], ['option-face', 1200], ['option-remote', 1200],
  ['option-home', 1200], ['family-reception', 1400, true], ['results-tablet', 900], ['continuity', 1200],
];
for (const [name, w, small] of generated) await toWebp(`assets/generated/${name}.jpg`, name, w, 80, small ? { small: 900 } : {});

// GP headshots, cropped to a consistent 4:5 portrait
for (const n of ['varsani', 'vagani', 'qureshi', 'dravid', 'sumar']) await toWebp(`assets/team/dr-${n}.jpg`, `gp-${n}`, 720, 82, { cover: [720, 900] });

// Logos and badges
const LOGOS = path.join(ROOT, 'public/assets/logos');
fs.mkdirSync(LOGOS, { recursive: true });
await sharp(path.join(ROOT, 'assets/brand/doctify-award-2026.png')).resize({ width: 600 }).webp({ quality: 85 }).toFile(path.join(LOGOS, 'doctify-award.webp'));
await sharp(path.join(ROOT, 'assets/brand/e2media-award-2026.png')).resize({ width: 700 }).webp({ quality: 85 }).toFile(path.join(LOGOS, 'e2media-award.webp'));
await sharp(path.join(ROOT, 'assets/brand/ico-white.png')).trim().resize({ width: 400 }).webp({ quality: 85 }).toFile(path.join(LOGOS, 'ico-white.webp'));
for (const [src, dst] of [['logo dark.webp', 'logo-dark.webp'], ['logo white.webp', 'logo-white.webp'], ['CQC badge.webp', 'cqc.webp'], ['doctify logo.svg', 'doctify.svg']]) {
  fs.copyFileSync(path.join(ROOT, 'assets/brand', src), path.join(LOGOS, dst));
}
fs.copyFileSync(path.join(ROOT, 'assets/brand/favicon_nivamedicalclinic_co_uk_64x64.png'), path.join(ROOT, 'public/favicon.png'));
// Association / regulator logos (white on transparent, for the navy trust strip)
const ASSOC = [
  ['Asset-18-1024x307-1.png', 'assoc-hcpc'], ['CQC-e1736967860427.png', 'assoc-cqc'], ['ICO_Logo_White-e1736967775173.png', 'assoc-ico'],
  ['MDU-380x95-1-e1736967904815.png', 'assoc-mdu'], ['maxresdefault__1_-removebg-preview-1-1.png', 'assoc-doctify'],
  ['output-onlinepngtools.png', 'assoc-bms'], ['royal-college-of-general-practitioners.png', 'assoc-rcgp'], ['unnamed-removebg-preview-1-1.png', 'assoc-bma'],
];
for (const [src, name] of ASSOC) {
  await sharp(path.join(ROOT, 'assets/associations', src)).trim().resize({ height: 160, withoutEnlargement: false }).webp({ quality: 90, alphaQuality: 90 }).toFile(path.join(LOGOS, `${name}.webp`));
}
console.log('logos ok');

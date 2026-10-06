// Downloads the Unsplash photos listed in src/data/photos.json into public/images/<group>/<key>.webp
// Usage: npm run fetch-images   (skips files that already exist; pass --force to re-download)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(import.meta.dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src/data/photos.json'), 'utf8'));
const force = process.argv.includes('--force');
const WIDTH = { hero: 2200 };

let ok = 0;
for (const [group, items] of Object.entries(manifest)) {
  if (group.startsWith('_')) continue;
  const dir = path.join(root, 'public/images', group);
  fs.mkdirSync(dir, { recursive: true });
  await Promise.all(Object.entries(items).map(async ([key, id]) => {
    const out = path.join(dir, `${key}.webp`);
    if (!force && fs.existsSync(out)) return ok++;
    const w = WIDTH[key] ?? 1400;
    const res = await fetch(`https://images.unsplash.com/photo-${id}?w=${w}&q=80&fm=jpg`);
    if (!res.ok) throw new Error(`${group}/${key}: HTTP ${res.status}`);
    const buf = Buffer.from(await res.arrayBuffer());
    await sharp(buf).resize({ width: w, withoutEnlargement: true }).webp({ quality: 72 }).toFile(out);
    ok++;
  }));
}
console.log(`images ready: ${ok}`);

// Captures thumbnails.
//   node scripts/screenshots.mjs work    -> screenshots of the real, live projects (public/shots/work)
//   node scripts/screenshots.mjs demos   -> screenshots of the concept demos from a running preview
//                                           (start `npm run preview` first; BASE_URL defaults to http://localhost:4173)
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { launch } from './browser.mjs';

const root = path.resolve(import.meta.dirname, '..');
const mode = process.argv[2] ?? 'demos';
const base = process.env.BASE_URL ?? 'http://localhost:4173';

const targets = {
  work: [
    // The Overhere landing page is short, so it is captured at a narrower 2x viewport to fill the frame.
    ['overhere', 'https://overhere.social/', { width: 1024, height: 640, deviceScaleFactor: 2 }],
    ['overhere-mobile', 'https://overhere.social/app.html', { width: 390, height: 844, isMobile: true, deviceScaleFactor: 2 }],
    ['dtours', 'https://dhruvkai.github.io/Dtours/', { width: 1440, height: 900 }],
    ['kidy', 'https://dhruvkai.github.io/Kidy/', { width: 1440, height: 900 }, (p) => clickText(p, 'Essential only')],
    ['kidy-admin', 'https://dhruvkai.github.io/Kidy/admin', { width: 1440, height: 900 }, async (p) => { await clickText(p, 'Essential only').catch(() => {}); await clickText(p, 'Log in'); }],
  ],
  demos: [
    ['clinic', '/demos/clinic'],
    ['clinic-admin', '/demos/clinic/admin', (p) => clickText(p, 'Sign in')],
    ['hotel', '/demos/hotel'],
    ['restaurant', '/demos/restaurant'],
    ['ecommerce', '/demos/ecommerce'],
    ['ecommerce-admin', '/demos/ecommerce/admin', (p) => clickText(p, 'Sign in')],
    ['business-dashboard', '/demos/business-dashboard'],
    ['dental', '/demos/dental'],
    ['linden', '/demos/linden'],
    ['koji', '/demos/koji'],
    ['sprout', '/demos/sprout'],
  ].map(([k, p, prep]) => [k, base + p, { width: 1440, height: 900 }, prep]),
};

async function clickText(page, text) {
  const done = await page.evaluate((t) => {
    const el = [...document.querySelectorAll('button, a')].find((e) => e.textContent.trim() === t && e.offsetParent);
    el?.click();
    return !!el;
  }, text);
  if (!done) throw new Error(`no button "${text}"`);
  await new Promise((r) => setTimeout(r, 1500));
}

const outDir = path.join(root, 'public/shots', mode);
fs.mkdirSync(outDir, { recursive: true });
const browser = await launch();
for (const [key, url, viewport, prep] of targets[mode]) {
  const page = await browser.newPage();
  await page.setViewport(viewport);
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
  } catch (e) {
    console.warn(`${key}: ${e.message} (capturing anyway)`);
  }
  if (prep) await prep(page).catch((e) => console.warn(`${key}: ${e.message}`));
  // Hide the demo bar in demo thumbnails so the product itself fills the frame.
  await page.addStyleTag({ content: '[data-demo-bar]{display:none!important}' }).catch(() => {});
  await new Promise((r) => setTimeout(r, 1800));
  const png = await page.screenshot({ type: 'png' });
  await sharp(png).resize({ width: viewport.isMobile ? 520 : 1200 }).webp({ quality: 78 }).toFile(path.join(outDir, `${key}.webp`));
  console.log('saved', mode, key);
  await page.close();
}
await browser.close();

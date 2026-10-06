// Shared puppeteer-core launcher using the locally installed Microsoft Edge (or Chrome).
import fs from 'node:fs';
import puppeteer from 'puppeteer-core';

const candidates = [
  process.env.BROWSER_PATH,
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean);

export async function launch() {
  const executablePath = candidates.find((p) => fs.existsSync(p));
  if (!executablePath) throw new Error('No Edge/Chrome found. Set BROWSER_PATH.');
  return puppeteer.launch({ executablePath, headless: true, args: ['--hide-scrollbars'] });
}

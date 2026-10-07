// End-to-end smoke test against a running preview (npm run build && npm run preview).
//   npm run smoke            BASE_URL defaults to http://localhost:4173
// Checks every route at 1440px and 390px for console errors, horizontal overflow and the
// demo/real labelling rules, then clicks through the main flow of each demo.
import { launch } from './browser.mjs';

const base = (process.env.BASE_URL ?? 'http://localhost:4173').replace(/\/$/, '');
const LABEL = 'Concept Demo — Fictional Business';

const PORTFOLIO = ['/', '/work/overhere', '/work/dtours', '/work/kidy', '/contact?ref=clinic', '/credits'];
const DEMOS = [
  '/demos/clinic', '/demos/clinic/admin', '/demos/hotel', '/demos/hotel/rooms/glass-suite', '/demos/restaurant',
  '/demos/ecommerce', '/demos/ecommerce/c/all', '/demos/ecommerce/c/wear', '/demos/ecommerce/p/cotton-tee', '/demos/ecommerce/cart',
  '/demos/ecommerce/account', '/demos/ecommerce/admin',
  '/demos/business-dashboard', '/demos/business-dashboard/customers', '/demos/business-dashboard/tasks', '/demos/business-dashboard/invoices',
  '/demos/business-dashboard/invoices/new', '/demos/business-dashboard/products', '/demos/business-dashboard/analytics',
  '/demos/business-dashboard/notifications', '/demos/business-dashboard/settings',
  '/demos/dental', '/demos/linden', '/demos/koji', '/demos/sprout',
];

const failures = [];
const fail = (msg) => { failures.push(msg); console.log('  FAIL', msg); };
const ok = (msg) => console.log('  ok  ', msg);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function newPage(browser, width = 1440) {
  const page = await browser.newPage();
  page.errors = [];
  page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && page.errors.push(m.text()));
  page.on('pageerror', (e) => page.errors.push(e.message));
  page.on('requestfailed', (r) => { if (r.url().startsWith(base) && !r.url().includes('/shots/')) page.errors.push('request failed: ' + r.url()); });
  page.on('response', (r) => { if (r.url().startsWith(base) && r.status() >= 400 && !r.url().includes('/shots/')) page.errors.push(`${r.status()} ${r.url()}`); });
  await page.setViewport({ width, height: 900, isMobile: width < 500, hasTouch: width < 500 });
  return page;
}

async function go(page, path) {
  await page.goto(base + path, { waitUntil: 'networkidle2', timeout: 45000 });
  await sleep(300);
}

// Click the first visible element matching `selector` whose text includes `text`.
async function click(page, selector, text, { exact = false } = {}) {
  const done = await page.evaluate((sel, t, ex) => {
    const el = [...document.querySelectorAll(sel)].find((e) => {
      const s = e.textContent.replace(/\s+/g, ' ').trim();
      const r = e.getBoundingClientRect();
      return (ex ? s === t : s.includes(t)) && r.width > 0 && r.height > 0 && !e.disabled;
    });
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, selector, text, exact);
  if (!done) throw new Error(`no clickable ${selector} with text "${text}"`);
  await sleep(350);
}

async function type(page, selector, value) {
  await page.waitForSelector(selector, { visible: true });
  await page.$eval(selector, (el) => { el.value = ''; });
  await page.type(selector, value);
}

async function select(page, selector, value) {
  await page.waitForSelector(selector);
  await page.select(selector, value);
  await sleep(200);
}

const hasText = (page, t) => page.evaluate((x) => document.body.innerText.includes(x), t);
async function waitText(page, t, timeout = 6000) {
  await page.waitForFunction((x) => document.body.innerText.includes(x), { timeout }, t);
}

async function checkRoutes(browser, width) {
  console.log(`\nRoutes at ${width}px`);
  const page = await newPage(browser, width);
  for (const path of [...PORTFOLIO, ...DEMOS]) {
    page.errors = [];
    await go(page, path);
    const info = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      bar: !!document.querySelector('[data-demo-bar]'),
      disclaimer: !!document.querySelector('[data-demo-disclaimer]'),
      text: document.body.innerText,
      raw: document.body.textContent,
    }));
    const isDemo = path.startsWith('/demos/');
    const problems = [];
    if (page.errors.length) problems.push('errors: ' + page.errors.join(' | '));
    if (info.overflow > 1) problems.push(`horizontal overflow ${info.overflow}px`);
    if (isDemo && (!info.bar || !info.disclaimer || !info.raw.includes(LABEL))) problems.push('missing demo bar or disclaimer');
    if (!isDemo && info.bar) problems.push('portfolio page shows the demo bar');
    if (isDemo && info.text.includes('Real project')) problems.push('demo shows the Real project badge');
    if (path.startsWith('/work/') && (!info.text.includes('Real project') || info.text.includes('Concept Demo'))) problems.push('real project badge rules broken');
    if (/wa\.me|tel:\+?\d/.test(await page.content())) problems.push('real WhatsApp / phone link found');
    problems.length ? fail(`${path}: ${problems.join('; ')}`) : ok(path);
  }
  await page.close();
}

async function flow(name, browser, fn) {
  const page = await newPage(browser);
  try {
    await fn(page);
    if (page.errors.length) fail(`${name}: console errors: ${page.errors.join(' | ')}`);
    else ok(name);
  } catch (e) {
    fail(`${name}: ${e.message.split('\n')[0]}`);
    await page.screenshot({ path: `smoke-fail-${name.replace(/\W+/g, '-')}.png` }).catch(() => {});
  }
  await page.close();
}

const browser = await launch();
await checkRoutes(browser, 1440);
await checkRoutes(browser, 390);

console.log('\nFlows');

await flow('clinic booking reaches the admin', browser, async (page) => {
  await go(page, '/demos/clinic');
  await click(page, 'header button', 'Book');
  await click(page, '[role=dialog] button', 'General Medicine');
  await click(page, '[role=dialog] button', 'Dr. Kabir Malhotra');
  await page.waitForFunction(() => [...document.querySelectorAll('[role=dialog] button[aria-pressed]')].length > 0);
  await page.evaluate(() => document.querySelector('[role=dialog] button[aria-pressed="false"]').click());
  await click(page, '[role=dialog] button', 'Continue');
  await type(page, '#bk-name', 'Smoke Test Patient');
  await type(page, '#bk-phone', '98765 43210');
  await click(page, '[role=dialog] button', 'Confirm booking');
  await waitText(page, "You're booked");
  const ref = await page.$eval('[role=dialog] .font-mono', (e) => e.textContent.trim());
  await go(page, '/demos/clinic/admin');
  await click(page, 'button', 'Sign in');
  if (!(await hasText(page, ref))) await click(page, '[role=tab]', 'Upcoming');
  await waitText(page, ref);
  const sel = await page.evaluate((r) => {
    const li = [...document.querySelectorAll('li')].find((x) => x.innerText.includes(r));
    return li?.querySelector('select')?.id;
  }, ref);
  await select(page, `#${sel}`, 'checked-in');
  const status = await page.$eval(`#${sel}`, (e) => e.value);
  if (status !== 'checked-in') throw new Error('status did not change');
});

await flow('hotel search, room and enquiry', browser, async (page) => {
  await go(page, '/demos/hotel');
  await click(page, 'button', 'Check availability');
  await waitText(page, 'rooms free for');
  await click(page, '#rooms a', 'Available for your dates');
  await page.waitForSelector('#rd-in');
  await click(page, 'button', 'Request to book');
  await type(page, '#hq-name', 'Smoke Guest');
  await type(page, '#hq-email', 'guest@example.com');
  await click(page, '[role=dialog] button', 'Send booking enquiry');
  await waitText(page, 'Enquiry received');
});

await flow('restaurant dish options, cart and order', browser, async (page) => {
  await go(page, '/demos/restaurant');
  await click(page, '#menu button', 'Ribeye, 300 g');
  await click(page, '[role=dialog] button', 'Add to order');
  await waitText(page, 'Choose an option');
  await click(page, '[role=dialog] label', 'Medium rare');
  await click(page, '[role=dialog] label', 'Truffle fries');
  await click(page, '[role=dialog] label', 'Peppercorn sauce');
  await click(page, '[role=dialog] button', 'Add to order');
  await click(page, 'header button', 'Order');
  await waitText(page, 'Truffle fries');
  await click(page, '[role=dialog] button', 'Checkout');
  await click(page, '[role=dialog] button', 'Continue');
  await click(page, '[role=dialog] button', 'Continue');
  await type(page, '#co-name', 'Smoke Diner');
  await type(page, '#co-phone', '98765 43210');
  await click(page, '[role=dialog] button', 'Continue');
  await click(page, '[role=dialog] button', 'Place order');
  await waitText(page, 'placed');
  await waitText(page, 'Preparing', 30000);
});

await flow('store variant, checkout, account, admin and stock', browser, async (page) => {
  const stockOf = () => page.evaluate(() => JSON.parse(localStorage.getItem('dk-demo-store') ?? 'null')?.state.stock['cotton-tee']['White|L']);
  await go(page, '/demos/ecommerce/p/cotton-tee');
  await click(page, 'button', 'Add to cart');
  await waitText(page, 'Choose a size');
  await click(page, 'fieldset button', 'L', { exact: true });
  await click(page, 'button', 'Add to cart');
  const before = await stockOf();
  await go(page, '/demos/ecommerce/cart');
  await click(page, 'a', 'Checkout');
  await type(page, '#co-name', 'Smoke Shopper');
  await type(page, '#co-email', 'shopper@example.com');
  await type(page, '#co-phone', '98765 43210');
  await type(page, '#co-pin', '160017');
  await type(page, '#co-line1', '12 Test Street');
  await type(page, '#co-city', 'Riverton');
  await click(page, 'button', 'Continue');
  await click(page, 'button', 'Continue');
  await click(page, 'button', 'Continue');
  await click(page, 'button', 'Place order');
  await click(page, '[role=dialog] button', 'Got it');
  await page.waitForFunction(() => location.pathname.includes('/order/'));
  await waitText(page, 'Thank you');
  const number = await page.$eval('.font-mono', (e) => e.textContent.trim());
  const after = await stockOf();
  if (!(after === before - 1)) throw new Error(`stock not reduced (${before} -> ${after})`);
  await go(page, '/demos/ecommerce/account');
  await waitText(page, number);
  await go(page, '/demos/ecommerce/admin');
  await click(page, 'button', 'Sign in');
  await waitText(page, 'Daily revenue');
  await go(page, '/demos/ecommerce/admin/orders');
  await waitText(page, number);
  await go(page, '/demos/ecommerce/admin/inventory');
  await waitText(page, 'Inventory');
});

await flow('Harbor Ops invoice shows on list and dashboard', browser, async (page) => {
  await go(page, '/demos/business-dashboard/invoices/new');
  await select(page, '#ni-cust', 'c3');
  await click(page, 'button', 'Add line');
  await click(page, 'button', 'Send invoice');
  await page.waitForFunction(() => /\/invoices\/[^/]+$/.test(location.pathname) && !location.pathname.endsWith('/new'));
  await waitText(page, 'Pinecrest Apartments');
  const number = await page.$eval('article .font-mono', (e) => e.textContent.trim());
  await go(page, '/demos/business-dashboard/invoices');
  await waitText(page, number);
  await go(page, '/demos/business-dashboard');
  const onDash = await page.$eval('[data-testid=recent-invoices]', (e, n) => e.innerText.includes(n), number);
  if (!onDash) throw new Error(`${number} not on the dashboard`);
});

// Clicks the first enabled button inside `scope` whose text matches `re`.
async function clickMatch(page, scope, re) {
  const done = await page.evaluate((sc, src) => {
    const rx = new RegExp(src);
    const el = [...document.querySelectorAll(`${sc} button`)].find((b) => !b.disabled && rx.test(b.textContent) && b.getBoundingClientRect().width > 0);
    if (!el) return false;
    el.scrollIntoView({ block: 'center' });
    el.click();
    return true;
  }, scope, re.source);
  if (!done) throw new Error(`no enabled button in ${scope} matching ${re}`);
  await sleep(350);
}

await flow('dental planner, estimate and booking', browser, async (page) => {
  await go(page, '/demos/dental');
  await click(page, 'header button', 'Plan your visit');
  await click(page, '[role=dialog] button', 'Whitening');
  await click(page, '[role=dialog] button', 'In-chair, one visit');
  await click(page, '[role=dialog] button', 'See my estimate');
  await waitText(page, '₹16,000');
  await click(page, '[role=dialog] button', 'Choose a time');
  await clickMatch(page, '[role=dialog] .grid', /^\d{1,2}:\d\d (am|pm)$/);
  await click(page, '[role=dialog] button', 'Continue');
  await type(page, '#dn-name', 'Smoke Patient');
  await type(page, '#dn-phone', '98765 43210');
  await click(page, '[role=dialog] button', 'Confirm visit');
  await waitText(page, 'See you soon');
});

await flow('linden calendar, room, extras and hold', browser, async (page) => {
  await go(page, '/demos/linden');
  await click(page, '#reserve button', 'Continue');
  await clickMatch(page, '#reserve', /\/ night/);
  await click(page, '#reserve button', 'Continue');
  await click(page, '#reserve button', 'Late check-out');
  await click(page, '#reserve button', 'Continue');
  await type(page, '#ln-name', 'Smoke Guest');
  await type(page, '#ln-email', 'guest@example.com');
  await click(page, '#reserve button', 'Hold my room');
  await waitText(page, 'We will keep the lights low');
});

await flow('koji bowl builder, ticket and live status', browser, async (page) => {
  await go(page, '/demos/koji');
  await click(page, '#bowls button', 'Add');
  await click(page, '#build button', 'Miso');
  await click(page, '#build button', 'Butter corn');
  await click(page, '#build button', 'Add to ticket');
  await click(page, 'header button', 'Ticket (2)');
  await clickMatch(page, '[role=dialog] fieldset', /^\d\d:\d\d$/);
  await type(page, '#kj-name', 'Smoke Eater');
  await type(page, '#kj-phone', '98765 43210');
  await click(page, '[role=dialog] button', 'Send to counter');
  await waitText(page, 'Ticket A-');
});

await flow('sprout quiz, cart and simulated payment', browser, async (page) => {
  await go(page, '/demos/sprout');
  await click(page, 'button', 'Find my plant');
  await click(page, '[role=dialog] button', 'Somewhere dim');
  await click(page, '[role=dialog] button', 'I forget for weeks');
  await click(page, '[role=dialog] button', 'Yes, a curious one');
  await click(page, '[role=dialog] button', 'Desk or shelf');
  await waitText(page, 'These will be happy with you.');
  await click(page, '[role=dialog] button', 'Add to cart');
  await page.keyboard.press('Escape');
  await sleep(400);
  await click(page, 'header button', 'Cart');
  await click(page, '[role=dialog] button', 'Checkout');
  await type(page, '#sp-name', 'Smoke Gardener');
  await type(page, '#sp-phone', '98765 43210');
  await type(page, '#sp-pin', '160017');
  await type(page, '#sp-addr', '12 Test Street, Riverton');
  await click(page, '[role=dialog] button', 'Pay ');
  await click(page, '[role=dialog] button', 'Confirm payment');
  await waitText(page, 'Your plants are on the way');
});

await flow('contact form builds the email', browser, async (page) => {
  await go(page, '/contact?ref=hotel');
  const type0 = await page.$eval('#cf-type', (e) => e.value);
  if (type0 !== 'hotel') throw new Error('business type not prefilled from ?ref');
  await page.evaluate(() => { window.__mailto = null; });
  await click(page, 'button', 'Open in email app');
  await waitText(page, 'Please add your name');
});

await browser.close();
console.log(failures.length ? `\n${failures.length} failure(s)` : '\nAll smoke checks passed');
process.exit(failures.length ? 1 : 0);

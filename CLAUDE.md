# Dhruv Kaith portfolio

Client-facing portfolio for Dhruv Kaith (github.com/DhruvKai). It separates **real projects** from **fictional concept demos** that show what he can build for businesses. Full approved plan: `C:\Users\Dhruv\.claude\plans\make-a-portiflio-website-squishy-wolf.md`.

## Stack and commands
Vite + React 19 + React Router 7 + Tailwind v4 (`@tailwindcss/vite`) + Zustand (persist) + `@phosphor-icons/react` + Recharts (lazy, admin screens only) + `motion`. Fonts are self-hosted with @fontsource: Manrope (portfolio pages), Geist/Geist Mono (demo bar and shared demo chrome), Manrope (clinic), Cormorant Garamond (hotel), Bricolage Grotesque (restaurant), Outfit (store), IBM Plex Sans (Harbor Ops), Instrument Serif + Plus Jakarta Sans (Lumen), Fraunces (The Linden), Space Grotesk + JetBrains Mono (Kōji), Archivo Black + Archivo (Sprout).

- `npm run dev` / `npm run build` (vite build + `scripts/postbuild.mjs`, which copies index.html to 404.html for GitHub Pages) / `npm run preview`
- `npm run fetch-images`: downloads the Unsplash photos in `src/data/photos.json` to `public/images/<group>/<key>.webp`
- `npm run screenshots -- work`: thumbnails of the live real projects → `public/shots/work`
- `npm run screenshots -- demos`: thumbnails of the demos from a running `npm run preview` → `public/shots/demos`
- `npm run smoke`: E2E click-through in headless Edge (`scripts/browser.mjs` finds Edge/Chrome)

## Hard rules
1. **Real projects contain only facts verified from the repos** (README, tech.txt, live site). No invented features, clients, users, stats or results. Describe them neutrally: Overhere is Dhruv's own product in beta, and Kidy is a store prototype built ahead of a Shopify build, with no client named or claimed.
2. **Every demo route renders `DemoBar`** ("Concept Demo — Fictional Business", link back to the portfolio, "Start a project like this") **and a footer disclaimer**. Real projects never carry the demo badge, and demos never carry the "Real project" badge.
3. **Demos use fictional brands only**: Northstar Clinic, Alpine House, Ember & Plate, North & Co., Harbor Ops, and the second set Lumen Dental Studio, The Linden, Kōji Ramen Counter, Sprout Supply. No real phone numbers, no `wa.me` links, no real payment gateways and no real addresses. WhatsApp, call and pay buttons open simulated sheets. Maps are stylised, not pins on real buildings. People, reviews and figures are labelled sample data.
4. Stock photos must be Unsplash-licensed, have no visible third-party brand logos, and be listed on `/credits` (generated from `photos.json`).
5. **Mobile apps:** the services copy says Dhruv builds **iOS and Android apps** as well as websites and web apps (cross-platform React Native / Expo is the natural fit with this stack). **Never mention Claude, AI assistants or AI-generated code anywhere on the site.**
6. Visual rules come from the design-taste skill: no em-dashes in copy, except the user-mandated "Concept Demo — Fictional Business" label; one accent colour per surface; one CTA label per intent; light/dark tokens.
7. The contact form builds a `mailto:` to `CONTACT_EMAIL` in `src/config.js` (kaithdhruv@gmail.com). `SITE.linkedin` in the same file drives every LinkedIn link; they stay hidden while it is empty.
8. **Portfolio look** (inspired by a monochrome Dribbble portfolio Dhruv chose): off-white / off-black tokens with no colour accent (the green `--live` dot is the only colour, and only on the availability pill), Manrope, giant outlined + solid name with Dhruv's cut-out photo overlapping it, `/SECTION` headings with a faded watermark word (`SectionHeading` in `portfolio/ui.jsx`), pill links (`SocialPills`), hover-to-open service rows, an inverted Process band with a cursor-following preview. One contact label everywhere on portfolio pages: "Let's talk". No invented experience, clients or job history (the reference's Experience timeline became Process).
9. **Photo of Dhruv:** `public/me/portrait-{500,800,1200}.webp` (transparent head-and-shoulders cut-out, blazer and glasses, 1200x1314, cut out with BiRefNet-portrait from a sharp 1086x1448 original and resized with Lanczos) shows in black and white, with colour only inside a soft circle that follows the pointer (`Portrait` in `Home.jsx`). `public/me/avatar.webp` (240x240, black and white, face centred) is cropped from his wedding photo and cleaned up with Real-ESRGAN x4plus; it is used in the header, footer, contact pill and Process preview. The image tools are scratch tools, not project dependencies.

## Real projects (verified)
- **Overhere**: https://overhere.social (GitHub Pages, CNAME). Mobile-first PWA for finding company for plans in Chandigarh. Vanilla JS SPA, Supabase (Postgres RLS, Auth, Realtime, Edge Functions in Deno/TS), Twilio Verify, AWS Rekognition Face Liveness, Cloudflare Turnstile, Leaflet/OSM, CSP, Puppeteer tests. Source: repo `tech.txt`.
- **Dtours**: https://dhruvkai.github.io/Dtours/. Trek-booking app for Himachal and Uttarakhand. Node/Express/MongoDB/Pug, JWT, Stripe, email reset, image resize, reviews, maps. The live site is the static front-end version (`docs/`, data in localStorage).
- **Kidy** (always "Kidy" on the site, never "KiDDY WiDDY"): https://dhruvkai.github.io/Kidy/. Kids clothing store prototype covering storefront and no-code admin. React 19, Vite, Tailwind v4, Zustand, Fuse.js, Recharts. Lighthouse accessibility and best practices 100.
- Software & tools group (GitHub links only): VULVoyager (CVE lookup with NVD, EPSS and KEV, Flask desktop), SandBoxEQ (hash/URL/IP threat-intel scanner), ZIPY (installer extraction, hashing and entropy, Excel reports), CAM (offline C# kiosk security-awareness games).

## Folder map
```
src/config.js  src/data/{work,demos}.js  src/data/photos.json
src/portfolio/            Home, WorkDetail (/work/:slug), Contact (/contact?ref=), Credits, ui (SectionHeading, SocialPills, Available)
src/data/services.js      services and process rows used by the home page and the nav counts
src/demos/_shared/        DemoShell (bar + disclaimer + toasts), DemoBar, DemoDisclaimer, StartProjectCTA, Modal, Simulated,
                          Lightbox, bits (Accordion, StylisedMap, Stepper, Qty, Empty), charts (Recharts), demoStore
src/lib/                  asset (base-path URLs), format (money, dates), theme (light/dark/system)
src/index.css             tokens: :root = portfolio, .t-clinic/.t-hotel/.t-restaurant/.t-store/.t-ops per demo, light + dark
src/demos/{clinic,hotel,restaurant,ecommerce,business-dashboard}/
src/demos/{dental,linden,koji,sprout}/   second design per category (site + one key flow, no admin)
scripts/                  browser, fetch-images, screenshots, smoke, postbuild
```
Each demo is a lazy route wrapped in `DemoShell`, with its own scoped CSS tokens (`.t-<name>`) and font. Demo data lives in a persisted Zustand store made with `demoStore()`; it reseeds when the saved data is from an earlier day. Admin screens load Recharts lazily (store admin is its own chunk). To add a demo, add an entry in `data/demos.js` (with `category` and `style`), a route in `App.jsx`, a thumbnail entry in `scripts/screenshots.mjs`, its photo group in `Credits.jsx` and a route + flow in `scripts/smoke.mjs`.

The home page shows demos in category rows (`CATEGORIES` in `data/demos.js`), two contrasting designs per category. Each category's two designs must look like different products, not recolours: the second set restyles `.btn`, `.card`, `.input` and `.chip` inside its own `.t-<name>` scope (Lumen: frosted glass and bento; The Linden: dark-first editorial, square, light mode only when chosen; Kōji: Swiss grid, square everywhere; Sprout: neo-brutalist thick borders and offset shadows).

## Deploy
GitHub Pages: build with `BASE_PATH=/<repo>/` (read in `vite.config.js` and passed to the router `basename`). `404.html` handles deep links. `.github/workflows/pages.yml` builds on push to `main` and publishes `dist/` to the `gh-pages` branch (Pages source: `gh-pages`, root). In Git Bash, prefix commands with `MSYS_NO_PATHCONV=1` or `BASE_PATH=/Portfolio/` gets rewritten into a Windows path. Nothing is pushed until Dhruv confirms the remote; he wants it pushed when finished.

## Status (2026-10-07)
Done: everything in the plan, plus a second design per category (Lumen Dental Studio, The Linden, Kōji Ramen Counter, Sprout Supply) with smoke flows for each. Portfolio pages, all five demos, real-project and demo screenshots, `npm run smoke` passing (all routes at 1440 and 390, labelling rules, and the clinic / hotel / restaurant / store / Harbor Ops / contact flows), also passing against a `BASE_PATH=/Portfolio/` build.

Open:
- Pushed to github.com/DhruvKai/Portfolio (main). In repo Settings > Pages, the source must be the `gh-pages` branch (root) for the site to go live at dhruvkai.github.io/Portfolio/
- After any UI change: `npm run build && npm run preview`, then `npm run screenshots -- demos` and `npm run smoke`.

Image keys by demo: `hotel/*`, `restaurant/*`, `clinic/*` (dr-1 to dr-5 are doctor portraits), `store/*`, `dental/*` (dr-1 to dr-3 portraits), `linden/*`, `koji/*`, `sprout/*`. See `photos.json`.

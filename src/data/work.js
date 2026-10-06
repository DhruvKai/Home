// Real projects. Facts only, taken from each repo's README / tech.txt and the live sites.
// Do not add features, clients, users or results that are not in those sources.

export const work = [
  {
    slug: 'overhere',
    name: 'Overhere',
    // Source: Overhere/tech.txt (part 1)
    kind: 'My own product, in beta',
    summary: 'A mobile-first web app for finding company for plans in Chandigarh. Post a plan, others ask to join, the host chooses, and the group chats.',
    live: 'https://overhere.social',
    liveLabel: 'overhere.social',
    github: 'https://github.com/DhruvKai/Overhere',
    shots: { main: 'overhere', mobile: 'overhere-mobile' },
    // Source: tech.txt part 2 (feeds, saved filters, chats inbox, PWA) and part 1
    features: [
      'Swipe feed for today and tomorrow, Discover feed for later plans, with date, category, time-of-day and distance filters',
      'Join requests where the host picks the group, then a realtime group chat and a chats inbox with unread markers',
      'Saved filter sets as one-tap chips, with alerts for new matching plans',
      'Installable PWA that opens offline, with light and dark mode',
      'Phone OTP, email and Google sign-in, plus a live face check and bot protection',
      'Venue maps on Leaflet and OpenStreetMap',
    ],
    stack: [
      ['Front end', ['Vanilla JavaScript SPA', 'HTML5 / CSS3', 'PWA (manifest + service worker)', 'Leaflet + OpenStreetMap']],
      ['Back end', ['Supabase (Postgres, Auth, Realtime)', 'Row-level security', 'Edge Functions (Deno + TypeScript)']],
      ['Verification', ['Twilio Verify OTP', 'AWS Rekognition Face Liveness', 'Cloudflare Turnstile']],
      ['Quality', ['Content Security Policy', 'Security audit and fixes', 'Puppeteer browser tests']],
    ],
    notes: [],
  },
  {
    slug: 'dtours',
    name: 'Dtours',
    // Source: Dtours/README.md
    kind: 'Full-stack booking app',
    summary: 'A tour-booking web app for treks across Himachal Pradesh and Uttarakhand, with accounts, bookings, reviews and maps.',
    live: 'https://dhruvkai.github.io/Dtours/',
    liveLabel: 'Live demo (front end)',
    github: 'https://github.com/DhruvKai/Dtours',
    shots: { main: 'dtours' },
    features: [
      'Tour pages with guides, reviews and maps',
      'JWT authentication with password reset by email',
      'Image uploads with resizing',
      'Stripe checkout for bookings',
    ],
    stack: [
      ['Server', ['Node.js', 'Express', 'MongoDB / Mongoose', 'Pug templates']],
      ['Features', ['JWT auth', 'Email password reset', 'Image resize', 'Stripe checkout', 'Mapbox maps']],
      ['Live demo', ['Static front end', 'localStorage data', 'Leaflet + OpenStreetMap']],
    ],
    notes: [
      'The live link is a static, backend-free version of the site: tours load from a data file, logins and bookings are simulated in the browser, and "Book tour" records the booking locally instead of going to Stripe.',
    ],
  },
  {
    slug: 'kiddy-widdy',
    name: 'KiDDY WiDDY',
    // Source: Kidy/README.md
    kind: 'Store prototype',
    summary: 'A clickable prototype of a kids clothing store for India, built ahead of a Shopify build. It covers the full shopping flow and a no-code admin.',
    live: 'https://dhruvkai.github.io/Kidy/',
    liveLabel: 'dhruvkai.github.io/Kidy',
    github: 'https://github.com/DhruvKai/Kidy',
    shots: { main: 'kiddy', admin: 'kiddy-admin' },
    features: [
      'Storefront: home, typo-tolerant search, filters, product page, bag, checkout, tracking, returns and GST invoice',
      'No-code admin: dashboard, add product with auto variants, bulk CSV upload, orders, inventory, discounts, returns and customers',
      'Storefront and admin share one live demo state, with a reset button',
      'Lighthouse accessibility and best practices scores of 100',
    ],
    stack: [
      ['Front end', ['React 19', 'Vite', 'Tailwind CSS v4', 'React Router']],
      ['State and data', ['Zustand (persisted)', 'Fuse.js search', 'Papa Parse CSV']],
      ['Admin', ['Recharts (lazy-loaded)']],
    ],
    notes: ['Front end only: data starts from seed files and is saved in the browser, so payments and OTP are simulated.'],
  },
];

// Secondary group: GitHub links only. Sources: each repo's README.
export const tools = [
  {
    name: 'VULVoyager',
    blurb: 'Desktop app that looks up CVEs for a product and version against NVD, adds EPSS scores and CISA KEV status, then charts and exports the results.',
    tech: ['Python', 'Flask', 'Desktop'],
    github: 'https://github.com/DhruvKai/VULVoyager',
  },
  {
    name: 'SandBoxEQ',
    blurb: 'Threat-intel scanner: paste a file hash, URL or IP and it checks it across several reputation and sandbox APIs at once.',
    tech: ['Threat intel', 'Multi-API'],
    github: 'https://github.com/DhruvKai/SandboxEQ',
  },
  {
    name: 'ZIPY',
    blurb: 'Extracts .exe and .msi installers without running them, hashes the contents (SHA-256), scores entropy and writes an Excel report.',
    tech: ['Python', 'CLI + GUI'],
    github: 'https://github.com/DhruvKai/zippy',
  },
  {
    name: 'CAM',
    blurb: 'Offline Windows kiosk app with two games for security-awareness events, a leaderboard and a PIN-protected admin.',
    tech: ['C#', 'Windows', 'Offline'],
    github: 'https://github.com/DhruvKai/CAM',
  },
];

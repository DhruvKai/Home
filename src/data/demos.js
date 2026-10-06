// Concept demos: fictional businesses built to show what can be made for real ones.
// `ref` pre-fills the business type on the contact form (/contact?ref=...).

export const demos = [
  {
    key: 'clinic',
    ref: 'clinic',
    name: 'Northstar Clinic',
    type: 'Clinic website + appointment admin',
    path: '/demos/clinic',
    shot: 'clinic',
    description: 'A multi-specialty clinic site where patients pick a doctor and a slot, and staff manage the day from an admin.',
    demonstrates: ['Multi-step appointment booking', 'Doctor profiles and schedules', 'Live "open now" hours', 'Admin that receives each booking'],
    tech: ['React', 'Zustand', 'Responsive'],
    ask: 'Need something like this for your clinic?',
  },
  {
    key: 'hotel',
    ref: 'hotel',
    name: 'Alpine House',
    type: 'Boutique hotel website',
    path: '/demos/hotel',
    shot: 'hotel',
    description: 'A mountain hotel site that sells the stay: availability search, room pages, experiences and an enquiry flow.',
    demonstrates: ['Date and guest availability search', 'Room detail pages with galleries', 'Photo gallery with lightbox', 'Booking enquiry with a summary'],
    tech: ['React', 'Router', 'Image-led'],
    ask: 'Need something like this for your hotel?',
  },
  {
    key: 'restaurant',
    ref: 'restaurant',
    name: 'Ember & Plate',
    type: 'Restaurant ordering + reservations',
    path: '/demos/restaurant',
    shot: 'restaurant',
    description: 'A grill restaurant site with an interactive menu, online ordering for pickup or delivery, and table bookings.',
    demonstrates: ['Menu with filters and search', 'Dish options and add-ons', 'Cart, time slots and order tracking', 'Table reservations'],
    tech: ['React', 'Zustand', 'Mobile-first'],
    ask: 'Need something like this for your restaurant?',
  },
  {
    key: 'ecommerce',
    ref: 'ecommerce',
    name: 'North & Co.',
    type: 'Online store + store admin',
    path: '/demos/ecommerce',
    shot: 'ecommerce',
    description: 'An everyday-goods store with variants, a multi-step checkout and an admin for orders, stock and sales.',
    demonstrates: ['Filters, sorting and variant stock', 'Cart and multi-step checkout', 'Order history in an account', 'Admin with sales charts and inventory'],
    tech: ['React', 'Zustand', 'Recharts'],
    ask: 'Need something like this for your store?',
  },
];

export const applications = {
  lead: {
    key: 'business-dashboard',
    ref: 'business-app',
    name: 'Harbor Ops',
    type: 'Business operations app',
    path: '/demos/business-dashboard',
    shot: 'business-dashboard',
    description: 'Internal software for a small services business: customers, appointments, tasks, invoices, products and reports in one place.',
    demonstrates: ['Dashboard with live KPIs', 'Customer records and search', 'Calendar and kanban task board', 'Invoices with line items and print view', 'Analytics with date ranges', 'Team and preference settings'],
    tech: ['React', 'Zustand', 'Recharts', 'Role-ready UI'],
    ask: 'Need software built around your workflow?',
  },
  more: [
    { key: 'clinic-admin', name: 'Clinic admin', path: '/demos/clinic/admin', shot: 'clinic-admin', description: 'Front-desk view of Northstar Clinic: today\'s appointments, statuses, enquiries and the doctor schedule.' },
    { key: 'ecommerce-admin', name: 'Store admin', path: '/demos/ecommerce/admin', shot: 'ecommerce-admin', description: 'Back office of North & Co.: sales overview, orders, products, inventory and customers.' },
  ],
};

export const BUSINESS_TYPES = [
  ['clinic', 'Clinic or healthcare'],
  ['hotel', 'Hotel or stay'],
  ['restaurant', 'Restaurant or cafe'],
  ['ecommerce', 'Online store'],
  ['business-app', 'Internal business software'],
  ['mobile-app', 'iOS / Android app'],
  ['other', 'Something else'],
];

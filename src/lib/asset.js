// Public-folder URLs that respect the Vite base path (needed on GitHub Pages project sites).
const base = import.meta.env.BASE_URL;

export const asset = (p) => base + p.replace(/^\//, '');
export const img = (group, key) => asset(`images/${group}/${key}.webp`);
export const shot = (group, key) => asset(`shots/${group}/${key}.webp`);

// GitHub Pages serves 404.html for unknown paths, so a copy of index.html makes deep links work.
import fs from 'node:fs';
import path from 'node:path';

const dist = path.resolve(import.meta.dirname, '../dist');
fs.copyFileSync(path.join(dist, 'index.html'), path.join(dist, '404.html'));
fs.writeFileSync(path.join(dist, '.nojekyll'), '');
console.log('postbuild: 404.html and .nojekyll written');

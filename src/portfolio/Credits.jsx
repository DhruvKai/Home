import { useEffect } from 'react';
import { ArrowUpRight } from '@phosphor-icons/react';
import photos from '../data/photos.json';
import { img } from '../lib/asset';

const GROUPS = { hotel: 'Alpine House (hotel demo)', restaurant: 'Ember & Plate (restaurant demo)', clinic: 'Northstar Clinic (clinic demo)', store: 'North & Co. (store demo)',
  dental: 'Lumen Dental Studio (clinic demo)', linden: 'The Linden (hotel demo)', koji: 'Kōji Ramen Counter (restaurant demo)', sprout: 'Sprout Supply (store demo)' };

export default function Credits() {
  useEffect(() => { document.title = 'Photo credits | Dhruv Kaith'; }, []);
  return (
    <section className="wrap py-10 md:py-16">
      <h1 className="text-4xl font-semibold tracking-tighter md:text-5xl">Photo credits</h1>
      <p className="mt-4 max-w-[62ch] text-lg leading-relaxed text-muted">
        The concept demos use stock photos from Unsplash under the{' '}
        <a href="https://unsplash.com/license" target="_blank" rel="noreferrer" className="text-fg underline underline-offset-2">Unsplash License</a>.
        Each thumbnail links to the original file on Unsplash. Screenshots of the example projects are taken from their live sites.
      </p>
      {Object.entries(GROUPS).map(([group, title]) => (
        <div key={group} className="mt-12">
          <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
          <ul className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Object.entries(photos[group]).map(([key, id]) => (
              <li key={key}>
                <a href={`https://images.unsplash.com/photo-${id}`} target="_blank" rel="noreferrer" className="group block">
                  <div className="aspect-[4/3] overflow-hidden rounded-xl border border-line bg-sunken">
                    <img src={img(group, key)} alt="" loading="lazy" className="size-full object-cover" />
                  </div>
                  <span className="mt-2 flex items-center gap-1 text-sm text-muted group-hover:text-fg">{key} <ArrowUpRight size={12} /></span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

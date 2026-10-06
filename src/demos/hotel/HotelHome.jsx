import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Bed, Boat, Car, Coffee, Envelope, Mountains, Phone, Snowflake, Sparkle, Users, WifiHigh, Wine, ForkKnife, PawPrint, Plug, AirplaneTilt,
} from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { cx, isoDay, money } from '../../lib/format';
import { StylisedMap } from '../_shared/bits';
import Lightbox from '../_shared/Lightbox';
import Simulated from '../_shared/Simulated';
import StartProjectCTA from '../_shared/StartProjectCTA';
import { EnquiryForm, EnquiryDone } from './Enquiry';
import { HotelHeader, HotelFooter } from './chrome';
import { REVIEWS, ROOMS, isAvailable, nightsBetween, useHotel } from './data';

const AMENITIES = [
  [WifiHigh, 'Fast Wi-Fi throughout'], [Sparkle, 'Timber spa and sauna'], [ForkKnife, 'Restaurant and terrace'], [Wine, 'Fireside bar'],
  [Car, 'Free parking'], [Plug, 'EV charging'], [Snowflake, 'Ski and boot room'], [AirplaneTilt, 'Airport transfers'], [PawPrint, 'Dogs welcome'], [Coffee, 'Breakfast included'],
];

const GALLERY = [
  ['hero', 'The house in winter'], ['lake', 'The boathouse on Lake Verran'], ['deck-bed', 'Outdoor day beds'], ['rooftop', 'Rooftop terrace'],
  ['peaks', 'Sunrise above the clouds'], ['bath', 'Bathroom in the Lakeside King'], ['terrace', 'Lunch on the terrace'], ['cabin', 'The forest cabin trail'],
  ['bar', 'The fireside bar'], ['valley', 'The valley walk'], ['lake-boat', 'Morning on the water'], ['room-glass', 'The Glass Suite'],
];

function SearchBar() {
  const search = useHotel((s) => s.search);
  const setSearch = useHotel((s) => s.setSearch);
  const [v, setV] = useState(search);
  const [err, setErr] = useState('');
  function submit(e) {
    e.preventDefault();
    if (nightsBetween(v.checkIn, v.checkOut) < 1) return setErr('Check-out must be after check-in.');
    setErr('');
    setSearch({ ...v, applied: true });
    document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' });
  }
  return (
    <form onSubmit={submit} className="grid gap-3 rounded-2xl border border-line bg-surface p-3 shadow-xl sm:grid-cols-[1fr_1fr_0.7fr_auto] sm:items-end sm:p-4">
      <div className="field"><label htmlFor="s-in" className="text-xs!">Check-in</label><input id="s-in" type="date" className="input" min={isoDay(0)} value={v.checkIn} onChange={(e) => setV({ ...v, checkIn: e.target.value })} /></div>
      <div className="field"><label htmlFor="s-out" className="text-xs!">Check-out</label><input id="s-out" type="date" className="input" min={v.checkIn} value={v.checkOut} onChange={(e) => setV({ ...v, checkOut: e.target.value })} /></div>
      <div className="field"><label htmlFor="s-g" className="text-xs!">Guests</label>
        <select id="s-g" className="input" value={v.guests} onChange={(e) => setV({ ...v, guests: Number(e.target.value) })}>{[1, 2, 3, 4].map((n) => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}</select>
      </div>
      <button className="btn btn-primary h-[46px]">Check availability</button>
      {err && <p className="error sm:col-span-4">{err}</p>}
    </form>
  );
}

function RoomCard({ r }) {
  const { search, booked } = useHotel();
  const free = isAvailable(r, search.checkIn, search.checkOut, search.guests, booked);
  const q = search.applied ? `?in=${search.checkIn}&out=${search.checkOut}&guests=${search.guests}` : '';
  return (
    <Link to={`/demos/hotel/rooms/${r.id}${q}`} className={cx('group flex flex-col', search.applied && !free && 'opacity-60')}>
      <div className="overflow-hidden rounded-2xl bg-sunken">
        <img src={img('hotel', r.photo)} alt={r.name} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl font-semibold leading-tight">{r.name}</h3>
          <p className="mt-1 text-sm text-muted">{r.size} m², {r.beds}, up to {r.guests}</p>
        </div>
        <p className="shrink-0 text-right text-sm"><span className="block text-lg font-semibold">{money(r.rate)}</span><span className="text-muted">per night</span></p>
      </div>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">{r.short}</p>
      {search.applied && (
        <p className={cx('mt-3 text-sm font-semibold', free ? 'text-accent-ink' : 'text-bad')}>
          {free ? 'Available for your dates' : r.guests < search.guests ? `Sleeps up to ${r.guests}` : 'Booked on your dates'}
        </p>
      )}
    </Link>
  );
}

export default function HotelHome() {
  const [lb, setLb] = useState(null);
  const [done, setDone] = useState(null);
  const [sim, setSim] = useState(null);
  const search = useHotel((s) => s.search);
  const booked = useHotel((s) => s.booked);
  const setSearch = useHotel((s) => s.setSearch);
  const sorted = search.applied
    ? [...ROOMS].sort((a, b) => isAvailable(b, search.checkIn, search.checkOut, search.guests, booked) - isAvailable(a, search.checkIn, search.checkOut, search.guests, booked))
    : ROOMS;
  const enquiryInitial = useMemo(() => (search.applied ? { checkIn: search.checkIn, checkOut: search.checkOut, guests: search.guests } : undefined), [search]);
  const freeCount = ROOMS.filter((r) => isAvailable(r, search.checkIn, search.checkOut, search.guests, booked)).length;

  return (
    <>
      <HotelHeader />
      <section className="relative">
        <div className="relative min-h-[82dvh] overflow-hidden">
          <img src={img('hotel', 'hero')} alt="Alpine House, a timber lodge by a frozen lake at dusk" className="absolute inset-0 size-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e1410]/85 via-[#0e1410]/25 to-transparent" />
          <div className="relative mx-auto flex min-h-[82dvh] max-w-7xl flex-col justify-end px-4 pb-28 pt-24 text-[#f4f7f2] sm:px-6 sm:pb-32">
            <h1 className="max-w-[18ch] font-display text-5xl font-semibold leading-[1.02] md:text-7xl">A lakeside lodge above the treeline.</h1>
            <p className="mt-5 max-w-[42ch] text-lg text-[#f4f7f2]/85">Twelve rooms, a timber spa and quiet mornings on the water. Open all year.</p>
          </div>
        </div>
        <div className="relative z-10 mx-auto -mt-16 max-w-5xl px-4 sm:px-6"><SearchBar /></div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-2 lg:items-center">
        <div>
          <h2 className="font-display text-4xl font-semibold leading-tight md:text-5xl">Built for slow days in the mountains.</h2>
          <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-muted">
            Alpine House sits on the north shore of Lake Verran, a short walk from the valley trails. The rooms are warm and simple, the kitchen cooks with what the valley grows, and the boat is yours whenever the lake is calm.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4 text-sm">
            {[[Bed, '12 rooms and suites'], [Mountains, '1,840 m above sea level'], [Boat, 'Private boathouse']].map(([I, t]) => (
              <span key={t} className="flex items-center gap-2"><I size={20} className="text-accent-ink" />{t}</span>
            ))}
          </div>
        </div>
        <img src={img('hotel', 'lake')} alt="The boathouse on the lake below the mountains" loading="lazy" className="aspect-[4/3] w-full rounded-[20px] object-cover" />
      </section>

      <section id="rooms" className="scroll-mt-28 bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-4xl font-semibold md:text-5xl">Rooms and suites</h2>
            {search.applied && (
              <p className="flex flex-wrap items-center gap-3 text-sm">
                <span><strong>{freeCount}</strong> of {ROOMS.length} rooms free for {nightsBetween(search.checkIn, search.checkOut)} nights, {search.guests} guest{search.guests > 1 ? 's' : ''}</span>
                <button className="btn btn-ghost btn-sm" onClick={() => setSearch({ applied: false })}>Clear dates</button>
              </p>
            )}
          </div>
          <div className="mt-10 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((r) => <RoomCard key={r.id} r={r} />)}
          </div>
        </div>
      </section>

      <section id="amenities" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 md:py-28">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">In the house</h2>
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
          {AMENITIES.map(([I, t]) => <li key={t} className="flex items-center gap-3 text-[15px]"><I size={24} className="shrink-0 text-accent-ink" />{t}</li>)}
        </ul>
      </section>

      <section id="experiences" className="scroll-mt-28 bg-accent py-20 text-on-accent md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-4xl font-semibold md:text-5xl">Things to do</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-3 md:grid-rows-2">
            {[
              ['lake-boat', 'Out on the lake', 'Rowing boats and paddle boards from the boathouse, free for guests.', 'md:col-span-2 md:row-span-2'],
              ['massage', 'The timber spa', 'Sauna, cold plunge and treatments by appointment.', ''],
              ['valley', 'Guided valley hikes', 'Half-day walks with a local guide, three mornings a week.', ''],
            ].map(([k, t, d, span]) => (
              <article key={k} className={cx('group relative min-h-64 overflow-hidden rounded-[20px]', span)}>
                <img src={img('hotel', k)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                  <h3 className="font-display text-2xl font-semibold md:text-3xl">{t}</h3>
                  <p className="mt-1 max-w-[40ch] text-sm text-white/85">{d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="gallery" className="mx-auto max-w-7xl scroll-mt-28 px-4 py-20 sm:px-6 md:py-28">
        <h2 className="font-display text-4xl font-semibold md:text-5xl">Gallery</h2>
        <div className="mt-10 columns-2 gap-4 md:columns-3 lg:columns-4">
          {GALLERY.map(([k, alt], i) => (
            <button key={k} onClick={() => setLb(i)} className="mb-4 block w-full overflow-hidden rounded-xl break-inside-avoid" aria-label={`Open photo: ${alt}`}>
              <img src={img('hotel', k)} alt={alt} loading="lazy" className={cx('w-full object-cover transition-transform duration-500 hover:scale-[1.03]', ['aspect-[3/4]', 'aspect-square', 'aspect-[4/3]'][i % 3])} />
            </button>
          ))}
        </div>
        <Lightbox images={GALLERY.map(([k, alt]) => ({ src: img('hotel', k), alt }))} index={lb} onChange={setLb} onClose={() => setLb(null)} />
      </section>

      <section className="bg-surface py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="font-display text-4xl font-semibold md:text-5xl">From our guests</h2>
          <div className="mt-10 grid gap-10 md:grid-cols-3">
            {REVIEWS.map(([q, who, stay]) => (
              <figure key={who}>
                <blockquote className="font-display text-2xl leading-snug">&ldquo;{q}&rdquo;</blockquote>
                <figcaption className="mt-4 text-sm"><span className="font-semibold">{who}</span><span className="text-muted">, {stay}</span></figcaption>
              </figure>
            ))}
          </div>
          <p className="mt-10 text-xs text-muted">Sample reviews for this concept demo.</p>
        </div>
      </section>

      <section id="location" className="mx-auto grid max-w-7xl scroll-mt-28 gap-10 px-4 py-20 sm:px-6 md:py-28 lg:grid-cols-[1fr_1.3fr]">
        <div>
          <h2 className="font-display text-4xl font-semibold md:text-5xl">Getting here</h2>
          <p className="mt-4 text-muted">North shore of Lake Verran, Riverton Valley <span className="text-xs">(a fictional place)</span></p>
          <ul className="mt-8 grid gap-5 text-[15px]">
            <li className="flex gap-3"><AirplaneTilt size={22} className="shrink-0 text-accent-ink" /><span><strong className="font-semibold">By air.</strong> Two hours from Northgate airport, with transfers on request.</span></li>
            <li className="flex gap-3"><Car size={22} className="shrink-0 text-accent-ink" /><span><strong className="font-semibold">By road.</strong> Free parking and two EV chargers. Snow chains are advised from December to March.</span></li>
            <li className="flex gap-3"><Users size={22} className="shrink-0 text-accent-ink" /><span><strong className="font-semibold">Check-in.</strong> From 2 pm. Check-out by 11 am, later on request.</span></li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-2">
            <button className="btn btn-ghost btn-sm" onClick={() => setSim('call')}><Phone size={16} /> Call reception</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setSim('email')}><Envelope size={16} /> Email us</button>
          </div>
        </div>
        <StylisedMap label="Alpine House" className="min-h-80" />
      </section>

      <section id="enquire" className="scroll-mt-28 border-t border-line bg-surface py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 className="font-display text-4xl font-semibold md:text-5xl">Plan your stay</h2>
            <p className="mt-4 max-w-[44ch] text-lg leading-relaxed text-muted">Send your dates and the reservations team will confirm availability and hold the room for you. No payment until you confirm.</p>
            <img src={img('hotel', 'spa')} alt="" loading="lazy" className="mt-10 hidden aspect-[4/3] w-full rounded-[20px] object-cover lg:block" />
          </div>
          <div className="rounded-[20px] border border-line bg-bg p-5 sm:p-8">
            {done ? <EnquiryDone enquiry={done} /> : (
              <EnquiryForm initial={enquiryInitial} onDone={setDone} />
            )}
            {done && <button className="btn btn-ghost mx-auto mt-2 flex" onClick={() => setDone(null)}>Send another enquiry <ArrowRight size={14} /></button>}
          </div>
        </div>
      </section>

      <StartProjectCTA projectRef="hotel" title="Need something like this for your hotel?"
        text="A site that shows off your rooms, checks availability and turns visitors into booking enquiries." />
      <HotelFooter />

      <Simulated open={sim === 'call'} onClose={() => setSim(null)} kind="call" title="Call reception">
        <p>In a real build this button dials the hotel's reception on mobile.</p>
        <p className="text-muted">This demo has no real phone number.</p>
      </Simulated>
      <Simulated open={sim === 'email'} onClose={() => setSim(null)} kind="info" title="Email the hotel">
        <p>In a real build this opens an email to the reservations team. For this demo, use the enquiry form above instead.</p>
      </Simulated>
    </>
  );
}

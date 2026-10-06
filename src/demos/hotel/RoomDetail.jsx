import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Bed, Check, Eye, Ruler, Users } from '@phosphor-icons/react';
import { img } from '../../lib/asset';
import { isoDay, money } from '../../lib/format';
import Lightbox from '../_shared/Lightbox';
import StartProjectCTA from '../_shared/StartProjectCTA';
import { HotelFooter, HotelHeader } from './chrome';
import EnquiryModal, { StaySummary } from './Enquiry';
import { ROOMS, isAvailable, nightsBetween, roomById, useHotel } from './data';

export default function RoomDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const room = roomById(id);
  const booked = useHotel((s) => s.booked);
  const [lb, setLb] = useState(null);
  const [open, setOpen] = useState(false);
  const [v, setV] = useState({
    checkIn: params.get('in') || isoDay(7),
    checkOut: params.get('out') || isoDay(9),
    guests: Math.min(Number(params.get('guests')) || 2, room?.guests ?? 2),
  });
  const initial = useMemo(() => ({ ...v, roomId: id }), [v, id]);

  if (!room) {
    return (
      <>
        <HotelHeader />
        <div className="mx-auto max-w-7xl px-4 py-24 text-center sm:px-6">
          <h1 className="font-display text-4xl font-semibold">Room not found</h1>
          <Link to="/demos/hotel#rooms" className="btn btn-ghost mt-6">See all rooms</Link>
        </div>
      </>
    );
  }

  const photos = room.gallery.map((k, i) => ({ src: img('hotel', k), alt: i === 0 ? room.name : `${room.name}, photo ${i + 1}` }));
  const nights = nightsBetween(v.checkIn, v.checkOut);
  const free = nights > 0 && isAvailable(room, v.checkIn, v.checkOut, v.guests, booked);
  const others = ROOMS.filter((r) => r.id !== room.id).slice(0, 3);

  return (
    <>
      <HotelHeader />
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
        <Link to="/demos/hotel#rooms" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg"><ArrowLeft size={14} /> All rooms</Link>
        <h1 className="mt-4 font-display text-5xl font-semibold md:text-6xl">{room.name}</h1>
        <p className="mt-2 text-muted">{room.view}</p>

        <div className="mt-8 grid gap-3 md:grid-cols-[2fr_1fr] md:grid-rows-2">
          {photos.slice(0, 3).map((p, i) => (
            <button key={p.src} onClick={() => setLb(i)} className={`overflow-hidden rounded-2xl ${i === 0 ? 'md:row-span-2' : ''}`} aria-label={`Open ${p.alt}`}>
              <img src={p.src} alt={p.alt} className={`size-full object-cover transition-transform duration-700 hover:scale-[1.02] ${i === 0 ? 'aspect-[4/3] md:aspect-auto' : 'aspect-[4/3]'}`} />
            </button>
          ))}
        </div>
        <Lightbox images={photos} index={lb} onChange={setLb} onClose={() => setLb(null)} />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.5fr_1fr]">
          <div>
            <dl className="grid grid-cols-2 gap-6 border-y border-line py-6 sm:grid-cols-4">
              {[[Ruler, 'Size', `${room.size} m²`], [Bed, 'Beds', room.beds], [Users, 'Sleeps', `Up to ${room.guests}`], [Eye, 'View', room.view]].map(([I, l, val]) => (
                <div key={l}><dt className="flex items-center gap-1.5 text-sm text-muted"><I size={16} />{l}</dt><dd className="mt-1 font-semibold">{val}</dd></div>
              ))}
            </dl>
            <p className="mt-8 max-w-[60ch] text-lg leading-relaxed">{room.description}</p>
            <h2 className="mt-10 font-display text-3xl font-semibold">In the room</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {room.amenities.map((a) => <li key={a} className="flex items-center gap-2.5"><Check size={18} className="text-accent-ink" />{a}</li>)}
            </ul>
          </div>

          <aside className="h-fit rounded-[20px] border border-line bg-surface p-5 sm:p-6 lg:sticky lg:top-[calc(var(--bar-h,0px)+5rem)]">
            <p><span className="text-2xl font-semibold">{money(room.rate)}</span> <span className="text-muted">per night</span></p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="field"><label htmlFor="rd-in">Check-in</label><input id="rd-in" type="date" className="input" min={isoDay(0)} value={v.checkIn} onChange={(e) => setV({ ...v, checkIn: e.target.value })} /></div>
              <div className="field"><label htmlFor="rd-out">Check-out</label><input id="rd-out" type="date" className="input" min={v.checkIn} value={v.checkOut} onChange={(e) => setV({ ...v, checkOut: e.target.value })} /></div>
              <div className="field col-span-2"><label htmlFor="rd-g">Guests</label>
                <select id="rd-g" className="input" value={v.guests} onChange={(e) => setV({ ...v, guests: Number(e.target.value) })}>
                  {Array.from({ length: room.guests }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-5"><StaySummary roomId={room.id} {...v} /></div>
            <p className={`mt-4 text-sm font-semibold ${free ? 'text-accent-ink' : 'text-bad'}`}>
              {nights < 1 ? 'Check-out must be after check-in.' : free ? 'Available for these dates' : 'Booked on some of these nights'}
            </p>
            <button className="btn btn-primary mt-4 w-full" disabled={!free} onClick={() => setOpen(true)}>Request to book</button>
            <p className="help mt-3 text-center">No payment now. Confirmed by email.</p>
          </aside>
        </div>

        <h2 className="mt-20 font-display text-3xl font-semibold">Other rooms</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {others.map((r) => (
            <Link key={r.id} to={`/demos/hotel/rooms/${r.id}`} className="group">
              <div className="overflow-hidden rounded-2xl"><img src={img('hotel', r.photo)} alt={r.name} loading="lazy" className="aspect-[4/3] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" /></div>
              <p className="mt-3 font-display text-xl font-semibold">{r.name}</p>
              <p className="text-sm text-muted">From {money(r.rate)} per night</p>
            </Link>
          ))}
        </div>
      </div>
      <EnquiryModal open={open} onClose={() => setOpen(false)} initial={initial} />
      <div className="mt-12" />
      <StartProjectCTA projectRef="hotel" title="Need something like this for your hotel?"
        text="Room pages, live availability and booking enquiries, designed around your property." />
      <HotelFooter />
    </>
  );
}

import { useEffect } from 'react';
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react';

// Full-screen image viewer. images: [{ src, alt }], index: number | null
export default function Lightbox({ images, index, onChange, onClose }) {
  const open = index !== null && index !== undefined;
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onChange((index + 1) % images.length);
      if (e.key === 'ArrowLeft') onChange((index - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    const o = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = o; };
  }, [open, index, images.length, onChange, onClose]);
  if (!open) return null;
  const img = images[index];
  const btn = 'grid size-11 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20';
  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-[#0b0c0b]/95" role="dialog" aria-modal="true" aria-label="Photo viewer">
      <div className="flex items-center justify-between p-3 text-sm text-white/80">
        <span className="px-2">{index + 1} of {images.length}</span>
        <button className={btn} onClick={onClose} aria-label="Close" autoFocus><X size={20} /></button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 pb-6 sm:px-16">
        <img src={img.src} alt={img.alt} className="max-h-full max-w-full rounded-lg object-contain" />
        <button className={`${btn} absolute left-3 top-1/2 -translate-y-1/2`} onClick={() => onChange((index - 1 + images.length) % images.length)} aria-label="Previous photo"><CaretLeft size={20} /></button>
        <button className={`${btn} absolute right-3 top-1/2 -translate-y-1/2`} onClick={() => onChange((index + 1) % images.length)} aria-label="Next photo"><CaretRight size={20} /></button>
      </div>
      {img.alt && <p className="pb-5 text-center text-sm text-white/70">{img.alt}</p>}
    </div>
  );
}

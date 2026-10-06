import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { isoDay } from '../../lib/format';

// Persisted demo store. `seed()` builds fresh sample data relative to today.
// Saved data from an earlier day is replaced with a fresh seed so dates in the demo always look current.
export function demoStore(name, seed, actions) {
  const fresh = () => ({ ...seed(), seededOn: isoDay(0) });
  return create(
    persist(
      (set, get) => ({
        ...fresh(),
        ...actions(set, get),
        reset: () => set(fresh()),
      }),
      {
        name: `dk-demo-${name}`,
        version: 1,
        merge: (saved, current) => (saved && saved.seededOn === isoDay(0) ? { ...current, ...saved } : current),
      },
    ),
  );
}

import { Baby, Bone, Drop, Heartbeat, Stethoscope } from '@phosphor-icons/react';
import { isoDay, uid } from '../../lib/format';
import { demoStore } from '../_shared/demoStore';

// All people, fees and figures below are fictional sample data.
export const CLINIC = {
  name: 'Northstar Clinic',
  address: ['2nd floor, Meridian Arcade', 'Harbour Road, Riverton'],
  hours: [
    // [weekday index (0 = Sunday), open, close]
    [1, '08:30', '20:00'], [2, '08:30', '20:00'], [3, '08:30', '20:00'], [4, '08:30', '20:00'],
    [5, '08:30', '20:00'], [6, '09:00', '17:00'], [0, '10:00', '14:00'],
  ],
  staff: { email: 'front.desk@northstar.demo', password: 'demo-1234' },
};

export const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DEPARTMENTS = [
  { id: 'gen', name: 'General Medicine', icon: Stethoscope, blurb: 'Fevers, infections, long-term conditions and annual check-ups.' },
  { id: 'peds', name: 'Paediatrics', icon: Baby, blurb: 'Newborn to teens: growth checks, vaccinations and sick visits.' },
  { id: 'derm', name: 'Dermatology', icon: Drop, blurb: 'Skin, hair and nail concerns, acne care and mole checks.' },
  { id: 'ortho', name: 'Orthopaedics', icon: Bone, blurb: 'Joint pain, sports injuries, fractures and back care.' },
  { id: 'cardio', name: 'Cardiology', icon: Heartbeat, blurb: 'ECG, blood pressure and heart health reviews.' },
];

const MORNING = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00'];
const EVENING = ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00'];

export const DOCTORS = [
  { id: 'malhotra', name: 'Dr. Kabir Malhotra', dept: 'gen', photo: 'dr-1', title: 'MBBS, MD (Internal Medicine)', years: 11, languages: ['English', 'Hindi', 'Punjabi'], fee: 700, days: [1, 2, 3, 4, 5, 6], slots: [...MORNING, ...EVENING], video: true },
  { id: 'varga', name: 'Dr. Elena Varga', dept: 'derm', photo: 'dr-2', title: 'MD (Dermatology)', years: 14, languages: ['English', 'Hungarian'], fee: 900, days: [1, 3, 5, 6], slots: MORNING, video: true },
  { id: 'haddad', name: 'Dr. Leila Haddad', dept: 'peds', photo: 'dr-3', title: 'MD (Paediatrics)', years: 8, languages: ['English', 'Arabic', 'French'], fee: 800, days: [1, 2, 3, 4, 5], slots: [...MORNING.slice(0, 5), ...EVENING.slice(0, 4)], video: false },
  { id: 'fontes', name: 'Dr. Andre Fontes', dept: 'ortho', photo: 'dr-4', title: 'MS (Orthopaedics)', years: 9, languages: ['English', 'Portuguese'], fee: 1000, days: [2, 4, 6], slots: EVENING, video: false },
  { id: 'seo', name: 'Dr. Daniel Seo', dept: 'cardio', photo: 'dr-5', title: 'DM (Cardiology)', years: 17, languages: ['English', 'Korean'], fee: 1200, days: [1, 2, 4, 5], slots: MORNING.slice(1), video: true },
];

export const doctorById = (id) => DOCTORS.find((d) => d.id === id);
export const deptById = (id) => DEPARTMENTS.find((d) => d.id === id);

export const STATUSES = ['confirmed', 'checked-in', 'completed', 'no-show', 'cancelled'];

const PATIENTS = [
  ['Ananya Rao', 'Recurring headaches'], ['Tomás Ibarra', 'Knee pain after running'], ['Priya Nair', 'Child fever, 2 days'],
  ['Hiro Tanaka', 'Follow-up on blood pressure'], ['Fatima Sheikh', 'Rash on forearm'], ['Marcus Bell', 'Annual check-up'],
  ['Ishaan Verma', 'Vaccination (18 months)'], ['Olivia Brandt', 'Acne treatment review'], ['Rohan Mehta', 'Lower back pain'],
  ['Sana Qureshi', 'Palpitations'], ['Daniel Okafor', 'Sore throat and cough'], ['Meera Pillai', 'Mole check'],
  ['Lucas Ferreira', 'Wrist sprain'], ['Kavya Iyer', 'Growth check'], ['Arjun Sethi', 'ECG review'],
];

const toMin = (t) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

export function availableSlots(doctor, date, appointments) {
  const day = new Date(date + 'T00:00').getDay();
  if (!doctor.days.includes(day)) return [];
  const taken = new Set(appointments.filter((a) => a.doctorId === doctor.id && a.date === date && a.status !== 'cancelled').map((a) => a.time));
  const now = new Date();
  const isToday = date === isoDay(0);
  return doctor.slots.filter((t) => !taken.has(t) && (!isToday || toMin(t) > now.getHours() * 60 + now.getMinutes() + 30));
}

function seed() {
  const appointments = [];
  let p = 0;
  for (let offset = -1; offset <= 6; offset++) {
    const date = isoDay(offset);
    const day = new Date(date + 'T00:00').getDay();
    DOCTORS.forEach((d, di) => {
      if (!d.days.includes(day)) return;
      const count = offset === 0 ? 3 : 2;
      for (let k = 0; k < count; k++) {
        const time = d.slots[(k * 3 + di + Math.abs(offset)) % d.slots.length];
        if (appointments.some((a) => a.doctorId === d.id && a.date === date && a.time === time)) continue;
        const [name, reason] = PATIENTS[p++ % PATIENTS.length];
        appointments.push({
          id: uid('A'), ref: 'NS-' + (4100 + appointments.length), doctorId: d.id, date, time,
          patient: { name, phone: 'Sample number', email: '', reason },
          mode: d.video && k === 1 ? 'video' : 'in-person',
          status: offset < 0 ? (k === 1 ? 'no-show' : 'completed') : offset === 0 && k === 0 ? 'checked-in' : 'confirmed',
          source: k === 2 ? 'Phone' : 'Website',
          createdAt: Date.now() - (8 - offset) * 86400000,
        });
      }
    });
  }
  return {
    appointments,
    enquiries: [
      { id: uid('E'), name: 'Nadia Karim', topic: 'Insurance', message: 'Do you accept cashless claims for a dermatology consult? I have a corporate policy.', at: Date.now() - 3600e3 * 2, read: false },
      { id: uid('E'), name: 'Vikram Joshi', topic: 'Reports', message: 'Can my lab report from last week be emailed to me instead of collected?', at: Date.now() - 3600e3 * 7, read: false },
      { id: uid('E'), name: 'Grace Liu', topic: 'Appointments', message: 'Is Dr. Haddad available on Saturdays for a vaccination visit?', at: Date.now() - 3600e3 * 26, read: true },
    ],
    staffSignedIn: false,
  };
}

export const useClinic = demoStore('clinic', seed, (set, get) => ({
  book: (a) => {
    const appt = { ...a, id: uid('A'), ref: 'NS-' + (4101 + get().appointments.length), status: 'confirmed', source: 'Website', createdAt: Date.now() };
    set((s) => ({ appointments: [...s.appointments, appt] }));
    return appt;
  },
  setStatus: (id, status) => set((s) => ({ appointments: s.appointments.map((a) => (a.id === id ? { ...a, status } : a)) })),
  addEnquiry: (e) => set((s) => ({ enquiries: [{ ...e, id: uid('E'), at: Date.now(), read: false }, ...s.enquiries] })),
  markRead: (id, read = true) => set((s) => ({ enquiries: s.enquiries.map((e) => (e.id === id ? { ...e, read } : e)) })),
  signIn: () => set({ staffSignedIn: true }),
  signOut: () => set({ staffSignedIn: false }),
}));

// Open-now status for the hours block.
export function openStatus(at = new Date()) {
  const day = at.getDay();
  const mins = at.getHours() * 60 + at.getMinutes();
  const today = CLINIC.hours.find(([d]) => d === day);
  if (today && mins >= toMin(today[1]) && mins < toMin(today[2])) return { open: true, until: today[2] };
  for (let i = 0; i < 8; i++) {
    const d = (day + i) % 7;
    const h = CLINIC.hours.find(([x]) => x === d);
    if (!h || (i === 0 && mins >= toMin(h[1]))) continue;
    return { open: false, nextDay: i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY_NAMES[d], at: h[1] };
  }
  return { open: false };
}

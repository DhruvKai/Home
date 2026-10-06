import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource-variable/geist';
import { Route, Routes } from 'react-router-dom';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import HotelHome from './HotelHome';
import RoomDetail from './RoomDetail';
import { useHotel } from './data';

export default function HotelApp() {
  const reset = useHotel((s) => s.reset);
  const shell = (title, el) => (
    <DemoShell theme="hotel" projectRef="hotel" name="Alpine House" title={title} onReset={() => { reset(); toast('Demo data reset'); }}>{el}</DemoShell>
  );
  return (
    <Routes>
      <Route index element={shell('Alpine House', <HotelHome />)} />
      <Route path="rooms/:id" element={shell('Alpine House rooms', <RoomDetail />)} />
    </Routes>
  );
}

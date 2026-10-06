import '@fontsource-variable/bricolage-grotesque';
import { Route, Routes } from 'react-router-dom';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import RestaurantSite from './RestaurantSite';
import { useRestaurant } from './data';

export default function RestaurantApp() {
  const reset = useRestaurant((s) => s.reset);
  return (
    <Routes>
      <Route index element={
        <DemoShell theme="restaurant" projectRef="restaurant" name="Ember & Plate" onReset={() => { reset(); toast('Demo data reset'); }}>
          <RestaurantSite />
        </DemoShell>
      } />
    </Routes>
  );
}

import '@fontsource/archivo-black';
import '@fontsource-variable/archivo';
import { Route, Routes } from 'react-router-dom';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import SproutSite from './SproutSite';
import { useSprout } from './data';

export default function SproutApp() {
  const reset = useSprout((s) => s.reset);
  return (
    <Routes>
      <Route index element={
        <DemoShell theme="sprout" projectRef="ecommerce" name="Sprout Supply" onReset={() => { reset(); toast('Demo data reset'); }}>
          <SproutSite />
        </DemoShell>
      } />
    </Routes>
  );
}

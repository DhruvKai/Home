import '@fontsource/instrument-serif/400.css';
import '@fontsource/instrument-serif/400-italic.css';
import '@fontsource-variable/plus-jakarta-sans';
import { Route, Routes } from 'react-router-dom';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import DentalSite from './DentalSite';
import { useDental } from './data';

export default function DentalApp() {
  const reset = useDental((s) => s.reset);
  return (
    <Routes>
      <Route index element={
        <DemoShell theme="dental" projectRef="clinic" name="Lumen Dental Studio" onReset={() => { reset(); toast('Demo data reset'); }}>
          <DentalSite />
        </DemoShell>
      } />
    </Routes>
  );
}

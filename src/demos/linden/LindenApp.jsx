import '@fontsource-variable/fraunces';
import '@fontsource-variable/fraunces/wght-italic.css';
import { Route, Routes } from 'react-router-dom';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import LindenSite from './LindenSite';
import { useLinden } from './data';

export default function LindenApp() {
  const reset = useLinden((s) => s.reset);
  return (
    <Routes>
      <Route index element={
        <DemoShell theme="linden" projectRef="hotel" name="The Linden" onReset={() => { reset(); toast('Demo data reset'); }}>
          <LindenSite />
        </DemoShell>
      } />
    </Routes>
  );
}

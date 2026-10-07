import '@fontsource-variable/space-grotesk';
import '@fontsource-variable/jetbrains-mono';
import { Route, Routes } from 'react-router-dom';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import KojiSite from './KojiSite';
import { useKoji } from './data';

export default function KojiApp() {
  const reset = useKoji((s) => s.reset);
  return (
    <Routes>
      <Route index element={
        <DemoShell theme="koji" projectRef="restaurant" name="Kōji Ramen Counter" onReset={() => { reset(); toast('Demo data reset'); }}>
          <KojiSite />
        </DemoShell>
      } />
    </Routes>
  );
}

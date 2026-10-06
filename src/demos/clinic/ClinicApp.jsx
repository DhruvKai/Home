import '@fontsource-variable/manrope';
import { Route, Routes } from 'react-router-dom';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import ClinicSite from './ClinicSite';
import ClinicAdmin from './ClinicAdmin';
import { useClinic } from './data';

export default function ClinicApp() {
  const reset = useClinic((s) => s.reset);
  return (
    <Routes>
      <Route index element={
        <DemoShell theme="clinic" projectRef="clinic" name="Northstar Clinic" onReset={() => { reset(); toast('Demo data reset'); }}>
          <ClinicSite />
        </DemoShell>
      } />
      <Route path="admin" element={
        <DemoShell theme="clinic" projectRef="clinic" name="Northstar Clinic" title="Northstar Clinic admin" onReset={() => { reset(); toast('Demo data reset'); }}>
          <ClinicAdmin />
        </DemoShell>
      } />
    </Routes>
  );
}

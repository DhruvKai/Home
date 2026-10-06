import '@fontsource-variable/outfit';
import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import DemoShell from '../_shared/DemoShell';
import { toast } from '../_shared/toast';
import { Account, Cart, Checkout, Listing, OrderConfirmation, ProductPage, StoreFooter, StoreHeader, StoreHome } from './Storefront';
import { useShop } from './data';

// The admin pulls in Recharts, so it is its own chunk.
const StoreAdmin = lazy(() => import('./Admin'));

export default function StoreApp() {
  const reset = useShop((s) => s.reset);
  const onReset = () => { reset(); toast('Demo data reset'); };
  const shop = (el) => (
    <DemoShell theme="store" projectRef="ecommerce" name="North & Co." onReset={onReset}>
      <StoreHeader />
      {el}
      <StoreFooter />
    </DemoShell>
  );
  return (
    <Routes>
      <Route index element={shop(<StoreHome />)} />
      <Route path="c/:cat" element={shop(<Listing />)} />
      <Route path="p/:id" element={shop(<ProductPage />)} />
      <Route path="cart" element={shop(<Cart />)} />
      <Route path="checkout" element={shop(<Checkout />)} />
      <Route path="order/:id" element={shop(<OrderConfirmation />)} />
      <Route path="account" element={shop(<Account />)} />
      <Route path="admin/*" element={
        <DemoShell theme="store" projectRef="ecommerce" name="North & Co." title="North & Co. admin" onReset={onReset}>
          <Suspense fallback={<div className="grid min-h-[60dvh] place-items-center text-sm text-muted">Loading admin</div>}>
            <StoreAdmin />
          </Suspense>
        </DemoShell>
      } />
    </Routes>
  );
}

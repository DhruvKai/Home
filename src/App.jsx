import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import PortfolioLayout from './portfolio/PortfolioLayout';
import Home from './portfolio/Home';
import WorkDetail from './portfolio/WorkDetail';
import Contact from './portfolio/Contact';
import Credits from './portfolio/Credits';
import NotFound from './portfolio/NotFound';

// Each demo is its own lazy chunk with its own fonts and tokens.
const Clinic = lazy(() => import('./demos/clinic/ClinicApp'));
const Hotel = lazy(() => import('./demos/hotel/HotelApp'));
const Restaurant = lazy(() => import('./demos/restaurant/RestaurantApp'));
const Store = lazy(() => import('./demos/ecommerce/StoreApp'));
const Ops = lazy(() => import('./demos/business-dashboard/OpsApp'));
const Dental = lazy(() => import('./demos/dental/DentalApp'));
const Linden = lazy(() => import('./demos/linden/LindenApp'));
const Koji = lazy(() => import('./demos/koji/KojiApp'));
const Sprout = lazy(() => import('./demos/sprout/SproutApp'));

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60);
      return () => clearTimeout(t);
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
}

function RouteFallback() {
  return (
    <div className="grid min-h-[100dvh] place-items-center" aria-busy="true">
      <div className="h-1 w-40 overflow-hidden rounded-full bg-sunken">
        <div className="h-full w-1/3 animate-pulse rounded-full bg-accent" />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <ScrollManager />
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route element={<PortfolioLayout />}>
            <Route index element={<Home />} />
            <Route path="work/:slug" element={<WorkDetail />} />
            <Route path="contact" element={<Contact />} />
            <Route path="credits" element={<Credits />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path="demos/clinic/*" element={<Clinic />} />
          <Route path="demos/hotel/*" element={<Hotel />} />
          <Route path="demos/restaurant/*" element={<Restaurant />} />
          <Route path="demos/ecommerce/*" element={<Store />} />
          <Route path="demos/business-dashboard/*" element={<Ops />} />
          <Route path="demos/dental/*" element={<Dental />} />
          <Route path="demos/linden/*" element={<Linden />} />
          <Route path="demos/koji/*" element={<Koji />} />
          <Route path="demos/sprout/*" element={<Sprout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

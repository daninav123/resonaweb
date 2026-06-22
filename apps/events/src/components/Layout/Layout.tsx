import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import WhatsAppFloat from '../WhatsAppFloat';
import { CookieConsent } from '../CookieConsent';
import ScrollToTop from '../ScrollToTop';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  useSmoothScroll();

  return (
    <div className="min-h-screen flex flex-col bg-cream text-ink overflow-x-hidden">
      <ScrollToTop />
      <Header />
      <main className="flex-grow w-full">
        {children ?? <Outlet />}
      </main>
      <Footer />
      <WhatsAppFloat />
      <CookieConsent />
    </div>
  );
};

export default Layout;

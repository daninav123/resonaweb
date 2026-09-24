import { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import TrustBar from './TrustBar';
import Footer from './Footer';

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden bg-ink text-cream">
      <Header />
      <TrustBar />
      <main className="flex-grow w-full">
        {children ?? <Outlet />}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;

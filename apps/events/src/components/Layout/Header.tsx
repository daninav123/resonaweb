import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';

const NAV = [
  { to: '/bodas', label: 'Bodas' },
  { to: '/eventos', label: 'Eventos' },
  { to: '/packs', label: 'Packs' },
  { to: '/portfolio', label: 'Portfolio' },
  { to: '/estudio', label: 'Estudio' },
];

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const isHome = pathname === '/';
  const onDark = isHome && !scrolled && !open;

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: onDark ? 'rgba(11,11,12,0)' : 'rgba(247,243,235,0.92)',
          borderBottomColor: onDark ? 'rgba(255,255,255,0)' : 'rgba(196,196,199,0.6)',
          color: onDark ? '#f7f3eb' : '#0b0b0c',
        }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 inset-x-0 z-50 border-b backdrop-blur-md"
        style={{ borderBottomWidth: 1 }}
      >
        <div className="container flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="relative flex items-center group" aria-label="ReSona Events">
            <img
              src="/logo-events.png"
              alt="ReSona Events"
              className={`h-11 md:h-14 w-auto transition-opacity duration-300 ${onDark ? 'opacity-0' : 'opacity-100'}`}
            />
            <img
              src="/logo-events-white.png"
              alt=""
              aria-hidden="true"
              className={`absolute inset-0 h-11 md:h-14 w-auto transition-opacity duration-300 ${onDark ? 'opacity-100' : 'opacity-0'}`}
            />
          </Link>

          <nav className="hidden md:flex items-center gap-9">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `text-sm tracking-wide transition-opacity ${isActive ? 'opacity-100' : 'opacity-70 hover:opacity-100'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center">
            <Link
              to="/brief"
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                onDark
                  ? 'bg-cream text-ink hover:bg-white'
                  : 'bg-ink text-cream hover:bg-ink-800'
              }`}
            >
              Cuéntanos tu evento
            </Link>
          </div>

          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            className="md:hidden p-2 -mr-2"
          >
            {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-ink text-cream md:hidden flex flex-col"
          >
            <div className="h-16 flex-shrink-0" />
            <nav className="flex-1 flex flex-col justify-center px-8 gap-6">
              {NAV.map((item, i) => (
                <motion.div
                  key={item.to}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 + i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={item.to}
                    className="font-display text-5xl tracking-tighter hover:text-accent-400 transition-colors"
                  >
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </nav>
            <div className="p-8 border-t border-ink-700 flex flex-col gap-3">
              <Link
                to="/brief"
                className="inline-flex items-center justify-center gap-2 px-5 py-4 rounded-full bg-cream text-ink text-sm font-medium"
              >
                Cuéntanos tu evento
              </Link>
              <a
                href="https://wa.me/34613881414?text=Hola,%20me%20gustaría%20organizar%20un%20evento"
                className="text-sm text-center text-cream/70 hover:text-cream"
              >
                WhatsApp · 613 88 14 14
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;

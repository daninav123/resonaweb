import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { ShoppingCart, Menu, X, User, LogOut, Package, Heart, Search, ChevronDown, LayoutGrid } from 'lucide-react';
import { useCartCount } from '../../hooks/useCartCount';
import CartSidebar from '../CartSidebar';
import NotificationBell from '../notifications/NotificationBell';
import { productService } from '../../services/product.service';
import { CategoryIcon } from '../CategoryIcon';
import { Logo } from '@resona/ui';

const esVisible = (cat: any) =>
  !cat.name?.toLowerCase().includes('eventos personalizados') &&
  !cat.name?.toLowerCase().includes('personal') &&
  !cat.isHidden;

const NAV = [
  { to: '/faqs', label: 'FAQs' },
  { to: '/sobre-nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRentalDropdownOpen, setIsRentalDropdownOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartCount();

  const { data: categories = [] } = useQuery<any>({
    queryKey: ['menu-categories'],
    queryFn: async () => (await productService.getCategories()) || [],
    staleTime: 30 * 60 * 1000,
  });

  const visibles = (categories as any[]).filter(esVisible);

  // El desplegable se abre con clic, asi que tiene que cerrarse al pulsar fuera
  // o se queda abierto tapando el catalogo.
  useEffect(() => {
    if (!isRentalDropdownOpen) return;
    const fuera = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsRentalDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [isRentalDropdownOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cerrarTodo = () => {
    setIsMenuOpen(false);
    setIsRentalDropdownOpen(false);
  };

  const iconBtn =
    'flex h-11 w-11 items-center justify-center rounded-sm text-cream/75 transition-colors hover:bg-white/10 hover:text-cream';

  return (
    <header className="sticky top-0 z-50 border-b border-cream/10 bg-ink">
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-6 px-5 py-4 md:px-10">
        <Link to="/" onClick={cerrarTodo} className="flex flex-col transition-opacity hover:opacity-80">
          <Logo width={140} color="#F7F3EB" accent="#3D5AFE" className="w-[118px] md:w-[140px]" title="ReSona Rent" />
          <span
            className="mt-1 text-[9px] font-semibold uppercase text-cream/45"
            style={{ letterSpacing: '1.4em', textIndent: '1.4em' }}
          >
            Rent
          </span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsRentalDropdownOpen((v) => !v)}
              aria-expanded={isRentalDropdownOpen}
              className="flex items-center gap-1.5 text-[14px] text-cream/75 transition-colors hover:text-cream"
            >
              Catálogo
              <ChevronDown className={`h-4 w-4 transition-transform ${isRentalDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isRentalDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-4 w-72 rounded-sm border border-cream/10 bg-ink-800 py-2 shadow-2xl">
                <Link
                  to="/productos"
                  onClick={cerrarTodo}
                  className="flex items-center gap-2.5 border-b border-cream/10 px-4 py-3 text-[14px] text-cream transition-colors hover:bg-white/5"
                >
                  <LayoutGrid size={16} strokeWidth={1.75} className="shrink-0" />
                  Ver todo el catálogo
                </Link>
                <p className="px-4 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-cream/40">
                  Por categoría ({visibles.length})
                </p>
                <ul className="max-h-[50vh] overflow-y-auto">
                  {visibles.map((cat: any) => (
                    <li key={cat.id}>
                      <Link
                        to={`/productos?category=${cat.slug}`}
                        onClick={cerrarTodo}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-[14px] text-cream/75 transition-colors hover:bg-white/5 hover:text-cream"
                      >
                        <CategoryIcon slug={cat.slug} size={16} strokeWidth={1.75} className="shrink-0" />
                        <span>{cat.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-[14px] transition-colors ${isActive ? 'text-cream' : 'text-cream/75 hover:text-cream'}`
              }
            >
              {item.label}
            </NavLink>
          ))}

          <a
            href="https://resonaevents.com"
            target="_blank"
            rel="noopener noreferrer"
            title="Si buscas que organicemos tu evento completo con montaje"
            className="text-[13px] italic text-cream/45 transition-colors hover:text-cream/80"
          >
            ¿Evento completo?
          </a>

          {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
            <Link to="/admin" className="text-[14px] font-medium text-resona-light hover:text-cream">
              Panel Admin
            </Link>
          )}
          {isAuthenticated && user?.role === 'COMMERCIAL' && (
            <Link to="/comercial" className="text-[14px] font-medium text-resona-light hover:text-cream">
              Panel Comercial
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <form onSubmit={handleSearch} className="hidden lg:block">
            <label htmlFor="buscador-cabecera" className="sr-only">
              Buscar equipos
            </label>
            <div className="relative">
              <input
                id="buscador-cabecera"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar equipos…"
                className="h-11 w-56 rounded-sm border border-cream/15 bg-transparent pl-4 pr-11 text-[14px] text-cream placeholder:text-cream/40 focus:border-resona-light focus:outline-none"
              />
              <button type="submit" aria-label="Buscar" className={`absolute right-0 top-0 ${iconBtn}`}>
                <Search className="h-[18px] w-[18px]" />
              </button>
            </div>
          </form>

          <button
            type="button"
            onClick={() => setIsSearchOpen((v) => !v)}
            aria-label={isSearchOpen ? 'Cerrar el buscador' : 'Buscar'}
            className={`${iconBtn} lg:hidden`}
          >
            <Search className="h-[18px] w-[18px]" />
          </button>

          {isAuthenticated && (
            <>
              <Link to="/favoritos" aria-label="Favoritos" className={`hidden sm:flex ${iconBtn}`}>
                <Heart className="h-[18px] w-[18px]" />
              </Link>
              <Link to="/mis-pedidos" aria-label="Mis pedidos" className={`hidden sm:flex ${iconBtn}`}>
                <Package className="h-[18px] w-[18px]" />
              </Link>
            </>
          )}

          {isAuthenticated && user?.role === 'ADMIN' && <NotificationBell />}

          {isAuthenticated ? (
            <div className="relative hidden items-center sm:flex">
              <Link to="/cuenta" aria-label={`Mi cuenta, ${user?.firstName ?? ''}`} className={iconBtn}>
                <User className="h-[18px] w-[18px]" />
              </Link>
              <button type="button" onClick={handleLogout} aria-label="Cerrar sesión" className={iconBtn}>
                <LogOut className="h-[18px] w-[18px]" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden h-11 items-center px-3 text-[14px] text-cream/75 transition-colors hover:text-cream sm:flex"
            >
              Entrar
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={`relative ${iconBtn}`}
            aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}`}
          >
            <ShoppingCart className="h-[18px] w-[18px]" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-resona px-1 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setIsMenuOpen((v) => !v)}
            aria-label={isMenuOpen ? 'Cerrar el menú' : 'Abrir el menú'}
            className={`${iconBtn} md:hidden`}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isSearchOpen && (
        <div className="border-t border-cream/10 px-5 py-3 lg:hidden">
          <form onSubmit={handleSearch}>
            <label htmlFor="buscador-movil" className="sr-only">
              Buscar equipos
            </label>
            <input
              id="buscador-movil"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar equipos…"
              autoFocus
              className="h-11 w-full rounded-sm border border-cream/15 bg-transparent px-4 text-[14px] text-cream placeholder:text-cream/40 focus:border-resona-light focus:outline-none"
            />
          </form>
        </div>
      )}

      {isMenuOpen && (
        <div className="border-t border-cream/10 md:hidden">
          <nav className="px-5 py-4">
            <Link
              to="/productos"
              onClick={cerrarTodo}
              className="flex items-center gap-2.5 py-3 text-[15px] text-cream"
            >
              <LayoutGrid size={16} strokeWidth={1.75} />
              Ver todo el catálogo
            </Link>
            <ul className="mb-2 border-b border-cream/10 pb-3">
              {visibles.map((cat: any) => (
                <li key={cat.id}>
                  <Link
                    to={`/productos?category=${cat.slug}`}
                    onClick={cerrarTodo}
                    className="flex items-center gap-2.5 py-2.5 text-[14px] text-cream/70"
                  >
                    <CategoryIcon slug={cat.slug} size={16} strokeWidth={1.75} className="shrink-0" />
                    <span>{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
            {NAV.map((item) => (
              <Link key={item.to} to={item.to} onClick={cerrarTodo} className="block py-3 text-[15px] text-cream">
                {item.label}
              </Link>
            ))}
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
              <Link to="/admin" onClick={cerrarTodo} className="block py-3 text-[15px] font-medium text-resona-light">
                Panel Admin
              </Link>
            )}
            {isAuthenticated && user?.role === 'COMMERCIAL' && (
              <Link to="/comercial" onClick={cerrarTodo} className="block py-3 text-[15px] font-medium text-resona-light">
                Panel Comercial
              </Link>
            )}
            <div className="mt-3 flex flex-col gap-3 border-t border-cream/10 pt-4 text-[14px]">
              {!isAuthenticated ? (
                <>
                  <Link to="/login" onClick={cerrarTodo} className="text-cream/75">
                    Iniciar sesión
                  </Link>
                  <Link to="/register" onClick={cerrarTodo} className="text-cream/75">
                    Registrarse
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/cuenta" onClick={cerrarTodo} className="text-cream/75">
                    Mi cuenta
                  </Link>
                  <button type="button" onClick={handleLogout} className="flex items-center gap-2 text-left text-cream/75">
                    <LogOut className="h-4 w-4" />
                    Salir
                  </button>
                </>
              )}
              <a href="tel:+34613881414" className="text-cream/50">
                613 88 14 14
              </a>
            </div>
          </nav>
        </div>
      )}

      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;

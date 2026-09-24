import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import { ShoppingCart, Menu, X, User, LogOut, Package, Heart, Search } from 'lucide-react';
import { useCartCount } from '../../hooks/useCartCount';
import CartSidebar from '../CartSidebar';
import NotificationBell from '../notifications/NotificationBell';
import { productService } from '../../services/product.service';
import { CategoryIcon } from '../CategoryIcon';
import { Logo } from '@resona/ui';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isRentalDropdownOpen, setIsRentalDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const cartCount = useCartCount();
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Fetch categories for menu dropdown
  const { data: categories = [], isLoading, error } = useQuery<any>({
    queryKey: ['menu-categories'],
    queryFn: async () => {
      console.log('🔍 Cargando categorías...');
      const result = await productService.getCategories();
      console.log('✅ Categorías recibidas:', result);
      return result || [];
    },
    staleTime: 0, // Sin caché para debug
    refetchOnMount: true, // Recargar siempre
  });
  
  // Debug log
  console.log('📊 Header - Categorías:', categories.length, categories);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/productos?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleRentalLinkClick = () => {
    setIsRentalDropdownOpen(false);
    setIsMenuOpen(false);
  };

  // Cerrar menú móvil al hacer clic en cualquier enlace
  const handleMenuLinkClick = () => {
    setIsMenuOpen(false);
    setIsRentalDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white py-2">
        <div className="container mx-auto px-4 flex justify-between items-center text-sm">
          <div className="flex items-center gap-4">
            <span className="font-medium">Tel: +34 613 881 414</span>
            <span className="hidden sm:inline font-medium">Email: info@resonarent.com</span>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="hover:text-resona transition font-medium">Iniciar Sesion</Link>
                <Link to="/register" className="hover:text-resona transition font-medium">Registrarse</Link>
              </>
            ) : (
              <div className="flex items-center gap-4">
                <span className="font-medium">Hola, {user?.firstName}</span>
                <Link to="/cuenta" className="hover:text-resona transition font-medium">Mi Cuenta</Link>
                <button onClick={handleLogout} className="hover:text-resona transition flex items-center gap-1 font-medium">
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link to="/" className="flex flex-col text-[#0A0A0A] hover:opacity-90 transition-opacity">
            <Logo width={150} className="w-[132px] md:w-[150px]" title="ReSona Rent" />
            <span
              className="mt-1 text-[10px] font-semibold uppercase text-[#4D4D4D]"
              style={{ letterSpacing: '1.4em', textIndent: '1.4em' }}
            >
              Rent
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar productos..."
                  className="w-full min-h-[44px] rounded border border-gray-300 px-4 py-2.5 pr-12 focus:border-transparent focus:ring-2 focus:ring-resona"
                />
                <button
                  type="submit"
                  aria-label="Buscar"
                  className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded transition-colors hover:bg-gray-100"
                >
                  <Search className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Search - Mobile */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              aria-label={isSearchOpen ? 'Cerrar el buscador' : 'Buscar'}
              className="flex h-11 w-11 items-center justify-center rounded transition-colors hover:bg-gray-100 md:hidden"
            >
              <Search className="w-6 h-6 text-gray-700" />
            </button>

            {/* Quick Actions */}
            {isAuthenticated && (
              <>
                <Link to="/favoritos" aria-label="Favoritos" className="relative flex h-11 w-11 items-center justify-center rounded transition-colors hover:bg-gray-100">
                  <Heart className="w-6 h-6 text-gray-700" />
                </Link>
                <Link to="/mis-pedidos" aria-label="Mis pedidos" className="relative flex h-11 w-11 items-center justify-center rounded transition-colors hover:bg-gray-100">
                  <Package className="w-6 h-6 text-gray-700" />
                </Link>
              </>
            )}

            {/* Notifications - Solo para admins */}
            {isAuthenticated && user?.role === 'ADMIN' && (
              <NotificationBell />
            )}

            {/* Cart */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative flex h-11 w-11 items-center justify-center rounded transition-colors hover:bg-gray-100"
              aria-label={`Carrito, ${cartCount} ${cartCount === 1 ? 'artículo' : 'artículos'}`}
            >
              <ShoppingCart className="w-6 h-6 text-gray-700" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-resona text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold shadow-lg">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Cerrar el menú' : 'Abrir el menú'}
              className="flex h-11 w-11 items-center justify-center rounded transition-colors hover:bg-gray-100 md:hidden"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div className="md:hidden pb-4">
            <form onSubmit={handleSearch}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="w-full min-h-[44px] rounded border border-gray-300 px-4 py-2.5 focus:ring-2 focus:ring-resona"
                autoFocus
              />
            </form>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={`bg-gray-50 border-t ${isMenuOpen ? 'block' : 'hidden md:block'}`}>
        <div className="container mx-auto px-4">
          <ul className="flex flex-col md:flex-row md:items-center md:gap-8 py-2">
            <li className="relative group">
              <button 
                onClick={() => setIsRentalDropdownOpen(!isRentalDropdownOpen)}
                className="flex items-center gap-1 py-2 md:py-3 text-gray-700 hover:text-resona font-medium transition-colors w-full md:w-auto"
              >
                Alquiler
                <svg 
                  className={`w-4 h-4 transition-transform ${isRentalDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <ul className={`${isRentalDropdownOpen ? 'block' : 'hidden'} md:${isRentalDropdownOpen ? 'block' : 'hidden'} md:absolute md:left-0 md:top-full md:bg-white md:shadow-lg md:rounded-lg md:w-56 md:group-hover:block md:z-50`}>
                <li>
                  <Link 
                    to="/productos" 
                    onClick={handleRentalLinkClick}
                    className="block px-4 py-3 hover:bg-resona/10 hover:text-resona transition-colors font-medium border-b border-gray-100"
                  >
                    📦 Ver Todos los Equipos
                  </Link>
                </li>
                <li className="pt-2">
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                    Por categoría ({categories.filter((cat: any) => 
                      !cat.name?.toLowerCase().includes('eventos personalizados') &&
                      !cat.name?.toLowerCase().includes('personal') &&
                      !cat.isHidden
                    ).length})
                  </div>
                </li>
                {categories
                  .filter((cat: any) => 
                    // Filtrar categorías que no queremos mostrar
                    !cat.name?.toLowerCase().includes('eventos personalizados') &&
                    !cat.name?.toLowerCase().includes('personal') &&
                    !cat.isHidden // No mostrar categorías ocultas
                  )
                  .map((cat: any) => (
                  <li key={cat.id}>
                    <Link 
                      to={`/productos?category=${cat.slug}`} 
                      onClick={handleRentalLinkClick}
                      className="block px-4 py-2 hover:bg-resona/10 hover:text-resona transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <CategoryIcon slug={cat.slug} size={16} strokeWidth={1.75} className="shrink-0" />
                        <span>{cat.name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
            <li>
              <Link
                to="/faqs"
                onClick={handleMenuLinkClick}
                className="block py-2 md:py-3 text-gray-700 hover:text-resona font-medium transition-colors"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                to="/sobre-nosotros"
                onClick={handleMenuLinkClick}
                className="block py-2 md:py-3 text-gray-700 hover:text-resona font-medium transition-colors"
              >
                Nosotros
              </Link>
            </li>
            <li>
              <Link
                to="/contacto"
                onClick={handleMenuLinkClick}
                className="block py-2 md:py-3 text-gray-700 hover:text-resona font-medium transition-colors"
              >
                Contacto
              </Link>
            </li>
            <li className="md:ml-auto">
              <a
                href="https://resonaevents.com"
                target="_blank"
                rel="noopener noreferrer"
                className="block py-2 md:py-3 text-xs text-gray-500 hover:text-resona transition-colors italic"
                title="Si buscas que organicemos tu evento completo con montaje"
              >
                ¿Evento completo? → ReSona Events
              </a>
            </li>
            {isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'SUPERADMIN') && (
              <li>
                <Link
                  to="/admin"
                  onClick={handleMenuLinkClick}
                  className="block py-2 md:py-3 text-resona hover:text-resona-dark font-bold transition-colors"
                >
                  Panel Admin
                </Link>
              </li>
            )}
            {isAuthenticated && user?.role === 'COMMERCIAL' && (
              <li>
                <Link
                  to="/comercial"
                  onClick={handleMenuLinkClick}
                  className="block py-2 md:py-3 text-resona hover:text-resona-dark font-bold transition-colors"
                >
                  Panel Comercial
                </Link>
              </li>
            )}
          </ul>
        </div>
      </nav>

      {/* Cart Sidebar */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
};

export default Header;






import { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  DollarSign,
  Calculator,
  Package,
  ShoppingCart,
  Menu,
  X,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const CommercialLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore((state) => ({ user: state.user, logout: state.logout }));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/comercial/dashboard' },
    { icon: FileText, label: 'Presupuestos', path: '/comercial/presupuestos' },
    { icon: Users, label: 'Leads', path: '/comercial/leads' },
    { icon: DollarSign, label: 'Mis Comisiones', path: '/comercial/comisiones' },
    { icon: Calculator, label: 'Calculadora', path: '/comercial/calculadora' },
    { icon: Package, label: 'Catálogo', path: '/comercial/catalogo' },
    { icon: ShoppingCart, label: 'Pedidos', path: '/comercial/pedidos' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-ink">
      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-ink-800 border-r border-cream/10 transition-all duration-300 flex flex-col`}
      >
        {/* Header */}
        <div className="p-4 border-b border-cream/10 flex items-center justify-between">
          {isSidebarOpen && (
            <Link to="/comercial/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">R</span>
              </div>
              <span className="font-bold text-lg text-cream">ReSona</span>
            </Link>
          )}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 text-cream/65"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-400 font-medium'
                    : 'text-cream/75 hover:bg-white/5'
                }`}
              >
                <Icon size={20} />
                {isSidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="p-4 border-t border-cream/10">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 text-cream/75"
            >
              <div className="w-8 h-8 bg-green-700 rounded-full flex items-center justify-center text-white font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              {isSidebarOpen && (
                <>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-cream/50">Comercial</p>
                  </div>
                  <ChevronDown size={16} />
                </>
              )}
            </button>

            {showUserMenu && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-ink-800 border border-cream/10 rounded-lg shadow-lg py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-400 hover:bg-red-50"
                >
                  <LogOut size={16} />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default CommercialLayout;

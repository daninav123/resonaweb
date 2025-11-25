import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Calendar, 
  Settings, 
  LogOut, 
  FileText, 
  Calculator, 
  Truck, 
  Building2, 
  AlertTriangle,
  Tag,
  Grid,
  ExternalLink,
  Home,
  Menu,
  X,
  Mail
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    { path: '/admin', icon: TrendingUp, label: 'Dashboard' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
    { path: '/admin/quote-requests', icon: Mail, label: 'Solicitudes de Presupuesto' },
    { path: '/admin/calendar', icon: Calendar, label: 'Calendario' },
    { path: '/admin/invoices', icon: FileText, label: 'Todas las Facturas' },
    { path: '/admin/invoices/manual', icon: FileText, label: 'Crear Factura Manual' },
    { path: '/admin/products', icon: Package, label: 'Productos' },
    { path: '/admin/categories', icon: Grid, label: 'Categorías' },
    { path: '/admin/calculator', icon: Calculator, label: 'Calculadora' },
    { path: '/admin/users', icon: Users, label: 'Usuarios' },
    { path: '/admin/coupons', icon: Tag, label: 'Cupones' },
    { path: '/admin/stock-alerts', icon: AlertTriangle, label: 'Alertas de Stock' },
    { path: '/admin/shipping-config', icon: Truck, label: 'Envío y Montaje' },
    { path: '/admin/blog', icon: FileText, label: 'Blog' },
    { path: '/admin/company-settings', icon: Building2, label: 'Datos de Facturación' },
    { path: '/admin/settings', icon: Settings, label: 'Configuración' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Header */}
      <div className="lg:hidden bg-gray-900 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <h2 className="text-xl font-bold">Panel Admin</h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-800 rounded"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 bottom-0 overflow-y-auto z-50 transition-transform duration-300
          lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="p-4">
            <Link to="/admin" className="block mb-4">
              <h2 className="text-2xl font-bold">Panel Admin</h2>
            </Link>
            
            {/* Botón Ver Sitio Web */}
            <Link 
              to="/" 
              className="flex items-center gap-3 p-3 mb-6 rounded-lg bg-resona hover:bg-resona-dark text-white transition-all transform hover:scale-105 shadow-lg"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-semibold">Ver Sitio Web</span>
            </Link>
            
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded transition-colors ${
                      active 
                        ? 'bg-resona text-white' 
                        : 'hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 lg:p-8 pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

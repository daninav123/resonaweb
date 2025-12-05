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
  Layers,
  ExternalLink,
  Home,
  Menu,
  X,
  Mail,
  Database,
  DollarSign,
  Box,
  BarChart3,
  ChevronDown,
  BarChart4,
  Zap,
  PieChart
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

interface MenuItem {
  path?: string;
  icon: any;
  label: string;
}

interface MenuSection {
  title: string;
  icon: any;
  items: MenuItem[];
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['analytics']);

  const isActive = (path?: string) => {
    return path && location.pathname === path;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const menuSections: MenuSection[] = [
    {
      title: 'Análisis y Reportes',
      icon: BarChart4,
      items: [
        { path: '/admin', icon: TrendingUp, label: 'Dashboard' },
        { path: '/admin/statistics', icon: BarChart3, label: 'Estadísticas' },
        { path: '/admin/contabilidad', icon: PieChart, label: 'Contabilidad' },
        { path: '/admin/purchase-lots', icon: Box, label: 'Lotes de Compra' },
      ]
    },
    {
      title: 'Gestión de Productos',
      icon: Package,
      items: [
        { path: '/admin/products', icon: Package, label: 'Productos' },
        { path: '/admin/packs', icon: Box, label: 'Packs' },
        { path: '/admin/personal', icon: Users, label: 'Personal' },
        { path: '/admin/montajes', icon: Truck, label: 'Montajes' },
        { path: '/admin/categories', icon: Grid, label: 'Categorías' },
        { path: '/admin/extra-categories', icon: Layers, label: 'Categorías de Extras' },
        { path: '/admin/calculator', icon: Calculator, label: 'Calculadora' },
      ]
    },
    {
      title: 'Ventas y Pedidos',
      icon: ShoppingCart,
      items: [
        { path: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
        { path: '/admin/quote-requests', icon: Mail, label: 'Solicitudes de Presupuesto' },
        { path: '/admin/coupons', icon: Tag, label: 'Cupones' },
        { path: '/admin/refunds', icon: DollarSign, label: 'Gestión de Reembolsos' },
      ]
    },
    {
      title: 'Operaciones',
      icon: Zap,
      items: [
        { path: '/admin/calendar', icon: Calendar, label: 'Calendario' },
        { path: '/admin/shipping-config', icon: Truck, label: 'Envío y Montaje' },
        { path: '/admin/stock-alerts', icon: AlertTriangle, label: 'Alertas de Stock' },
      ]
    },
    {
      title: 'Documentos y Facturación',
      icon: FileText,
      items: [
        { path: '/admin/invoices', icon: FileText, label: 'Todas las Facturas' },
        { path: '/admin/invoices/manual', icon: FileText, label: 'Crear Factura Manual' },
        { path: '/admin/company-settings', icon: Building2, label: 'Datos de Facturación' },
      ]
    },
    {
      title: 'Administración',
      icon: Settings,
      items: [
        { path: '/admin/users', icon: Users, label: 'Usuarios' },
        { path: '/admin/blog', icon: FileText, label: 'Blog' },
        { path: '/admin/backups', icon: Database, label: 'Backups' },
        { path: '/admin/settings', icon: Settings, label: 'Configuración' },
      ]
    },
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
            
            <nav className="space-y-1">
              {menuSections.map((section, index) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSections.includes(`section-${index}`);
                const hasActiveItem = section.items.some(item => isActive(item.path));
                
                return (
                  <div key={`section-${index}`}>
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(`section-${index}`)}
                      className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                        hasActiveItem
                          ? 'bg-resona text-white'
                          : 'hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      <SectionIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left font-medium text-sm">{section.title}</span>
                      <ChevronDown 
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {/* Section Items */}
                    {isExpanded && (
                      <div className="pl-2 space-y-1 mt-1 border-l border-gray-700">
                        {section.items.map((item) => {
                          const Icon = item.icon;
                          const active = isActive(item.path);
                          
                          return (
                            <Link
                              key={item.path}
                              to={item.path || '#'}
                              onClick={() => setIsSidebarOpen(false)}
                              className={`flex items-center gap-3 p-2 pl-3 rounded text-sm transition-colors ${
                                active 
                                  ? 'bg-resona text-white' 
                                  : 'text-gray-400 hover:text-white hover:bg-gray-800'
                              }`}
                            >
                              <Icon className="w-4 h-4 flex-shrink-0" />
                              <span>{item.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
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

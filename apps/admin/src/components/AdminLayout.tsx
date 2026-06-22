import { ReactNode, useState, useMemo, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  api,
  useAuthStore,
  filterMenuItems,
  getRoleLabel,
  getRoleColor,
  setDynamicRoleConfigs,
  type UserRole,
} from '@resona/api-client';
import {
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Calendar,
  Settings,
  FileText,
  Calculator,
  Truck,
  Building2,
  Tag,
  Grid,
  Layers,
  ExternalLink,
  ClipboardList,
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
  PieChart,
  Barcode,
  Briefcase,
  ArrowLeftRight,
  Bell,
  Receipt,
  FileSignature,
  PenTool,
  UserCog,
  Warehouse,
  ScrollText,
  Wrench,
  Smartphone,
  Shield,
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
  const { user } = useAuthStore();
  const userRole = (user?.role || 'CLIENT') as UserRole;
  const additionalRoles = user?.additionalRoles || [];
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['analytics']);

  useEffect(() => {
    const loadRoleDefinitions = async () => {
      try {
        const roles: any = await api.get('/role-definitions');
        if (Array.isArray(roles) && roles.length > 0) {
          const configs: Record<string, any> = {};
          roles.forEach((r: any) => {
            configs[r.name] = {
              label: r.label,
              description: r.description,
              color: r.color,
              allowedPaths: r.allowedPaths || [],
              defaultRedirect: r.defaultRedirect || '/admin',
            };
          });
          setDynamicRoleConfigs(configs);
        }
      } catch {
        // Fallback a config hardcoded si falla
      }
    };
    loadRoleDefinitions();
  }, []);

  const isActive = (path?: string) => {
    if (!path) return false;
    if (location.pathname === path) return true;
    if (path !== '/admin' && location.pathname.startsWith(path + '/')) return true;
    return false;
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) =>
      prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]
    );
  };

  const allMenuSections: MenuSection[] = [
    {
      title: 'Dashboard',
      icon: TrendingUp,
      items: [{ path: '/admin', icon: TrendingUp, label: 'Centro de Control' }],
    },
    {
      title: 'Análisis',
      icon: BarChart4,
      items: [
        { path: '/admin/statistics', icon: BarChart3, label: 'Estadísticas' },
        { path: '/admin/contabilidad', icon: PieChart, label: 'Contabilidad' },
      ],
    },
    {
      title: 'Catálogo',
      icon: Package,
      items: [
        { path: '/admin/products', icon: Package, label: 'Productos' },
        { path: '/admin/packs', icon: Box, label: 'Packs' },
        { path: '/admin/personal', icon: Users, label: 'Personal' },
        { path: '/admin/montajes', icon: Truck, label: 'Montajes' },
        { path: '/admin/categories', icon: Grid, label: 'Categorías' },
        { path: '/admin/extra-categories', icon: Layers, label: 'Cat. Extras' },
        { path: '/admin/calculator', icon: Calculator, label: 'Calculadora' },
      ],
    },
    {
      title: 'Ventas',
      icon: ShoppingCart,
      items: [
        { path: '/admin/pipeline', icon: Zap, label: 'Pipeline Eventos' },
        { path: '/admin/orders', icon: ShoppingCart, label: 'Pedidos' },
        { path: '/admin/crm', icon: Users, label: 'CRM Clientes' },
        { path: '/admin/client-portal', icon: Users, label: 'Portal Cliente' },
        { path: '/admin/quote-requests', icon: Mail, label: 'Presupuestos' },
        { path: '/admin/portfolio', icon: Grid, label: 'Portfolio' },
        { path: '/admin/commissions', icon: DollarSign, label: 'Comisiones' },
        { path: '/admin/coupons', icon: Tag, label: 'Cupones' },
        { path: '/admin/refunds', icon: DollarSign, label: 'Reembolsos' },
      ],
    },
    {
      title: 'Operaciones',
      icon: Zap,
      items: [
        { path: '/admin/events', icon: Briefcase, label: 'Eventos' },
        { path: '/admin/event-templates', icon: ClipboardList, label: 'Plantillas Evento' },
        { path: '/admin/calendar', icon: Calendar, label: 'Calendario' },
        { path: '/admin/staff-hr', icon: Users, label: 'Personal / RRHH' },
        { path: '/admin/subcontracts', icon: FileText, label: 'Subcontrataciones' },
        { path: '/admin/tech-view', icon: Smartphone, label: 'Vista Técnicos' },
      ],
    },
    {
      title: 'Logística',
      icon: Truck,
      items: [
        { path: '/admin/picking-list', icon: Package, label: 'Picking List' },
        { path: '/admin/loading-sheets', icon: ClipboardList, label: 'Hojas de Carga' },
        { path: '/admin/material-check', icon: ArrowLeftRight, label: 'Check-in/out Material' },
        { path: '/admin/shipping-config', icon: Wrench, label: 'Envío y Montaje' },
        { path: '/admin/vehicles', icon: Truck, label: 'Flota Vehículos' },
        { path: '/admin/vehicle-calendar', icon: Calendar, label: 'Calendario Vehículos' },
      ],
    },
    {
      title: 'Inventario',
      icon: Barcode,
      items: [
        { path: '/admin/equipment-availability', icon: Calendar, label: 'Disponibilidad Equipos' },
        { path: '/admin/stock', icon: Package, label: 'Stock y Alertas' },
        { path: '/admin/inventory', icon: Barcode, label: 'Unidades / Códigos' },
        { path: '/admin/warehouse-locations', icon: Warehouse, label: 'Almacén' },
        { path: '/admin/maintenance', icon: Wrench, label: 'Mantenimiento' },
        { path: '/admin/purchase-lots', icon: Box, label: 'Lotes de Compra' },
      ],
    },
    {
      title: 'Documentos',
      icon: FileText,
      items: [
        { path: '/admin/invoices', icon: Receipt, label: 'Facturas' },
        { path: '/admin/invoices/manual', icon: PenTool, label: 'Factura Manual' },
        { path: '/admin/contracts-mgmt', icon: FileSignature, label: 'Contratos' },
        { path: '/admin/suppliers', icon: Truck, label: 'Proveedores' },
        { path: '/admin/fiscal', icon: Calculator, label: 'Contabilidad Fiscal' },
        { path: '/admin/company-settings', icon: Building2, label: 'Datos Empresa' },
      ],
    },
    {
      title: 'Administración',
      icon: Settings,
      items: [
        { path: '/admin/role-dashboard', icon: PieChart, label: 'Dashboard por Rol' },
        { path: '/admin/reports', icon: BarChart3, label: 'Informes' },
        { path: '/admin/email-marketing', icon: Mail, label: 'Email Marketing' },
        { path: '/admin/notifications', icon: Bell, label: 'Notificaciones' },
        { path: '/admin/users', icon: UserCog, label: 'Usuarios' },
        { path: '/admin/roles', icon: Shield, label: 'Roles y Permisos' },
        { path: '/admin/blog', icon: ScrollText, label: 'Blog' },
        { path: '/admin/backups', icon: Database, label: 'Backups' },
        { path: '/admin/settings', icon: Settings, label: 'Configuración' },
      ],
    },
  ];

  const menuSections = useMemo(() => {
    if (userRole === 'SUPERADMIN' || userRole === 'ADMIN') {
      return allMenuSections;
    }
    return allMenuSections
      .map((section) => ({
        ...section,
        items: filterMenuItems(section.items, userRole, additionalRoles),
      }))
      .filter((section) => section.items.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userRole, additionalRoles.join(',')]);

  const roleLabel = getRoleLabel(userRole);
  const roleColor = getRoleColor(userRole);

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <div className="lg:hidden bg-gray-900 text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-50">
        <h2 className="text-xl font-bold">Panel Admin</h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 hover:bg-gray-800 rounded"
        >
          {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex">
        <aside
          className={`w-64 bg-gray-900 text-white min-h-screen fixed left-0 top-0 bottom-0 overflow-y-auto z-50 transition-transform duration-300 lg:translate-x-0 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="p-4">
            <Link to="/admin" className="block mb-4">
              <h2 className="text-2xl font-bold">Panel Admin</h2>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`inline-block px-2 py-0.5 rounded text-xs font-medium bg-${roleColor}-500/20 text-${roleColor}-300`}
                >
                  {roleLabel}
                </span>
                <span className="text-xs text-gray-400 truncate">{user?.firstName}</span>
              </div>
            </Link>

            <a
              href="https://resonaevents.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 mb-6 rounded-lg bg-resona hover:bg-resona-dark text-white transition-all transform hover:scale-105 shadow-lg"
            >
              <ExternalLink className="w-5 h-5" />
              <span className="font-semibold">Ver Sitio Web</span>
            </a>

            <nav className="space-y-1">
              {menuSections.map((section, index) => {
                const SectionIcon = section.icon;
                const isExpanded = expandedSections.includes(`section-${index}`);
                const hasActiveItem = section.items.some((item) => isActive(item.path));

                return (
                  <div key={`section-${index}`}>
                    <button
                      onClick={() => toggleSection(`section-${index}`)}
                      className={`w-full flex items-center gap-3 p-3 rounded transition-colors ${
                        hasActiveItem
                          ? 'bg-resona text-white'
                          : 'hover:bg-gray-800 text-gray-300'
                      }`}
                    >
                      <SectionIcon className="w-5 h-5 flex-shrink-0" />
                      <span className="flex-1 text-left font-medium text-sm">
                        {section.title}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 flex-shrink-0 transition-transform ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

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

        <main className="flex-1 lg:ml-64 p-2 sm:p-4 lg:p-8 pt-16 sm:pt-20 lg:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

import { lazy, Suspense, ReactNode } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import RequireInternalAuth from './components/RequireInternalAuth';
import AdminLayout from './components/AdminLayout';
import CommercialLayout from './components/CommercialLayout';

// Admin pages (lazy)
const AdminDashboard = lazy(() => import('./pages/admin/SmartDashboard'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'));
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'));
const OrderDetailPage = lazy(() => import('./pages/admin/OrderDetailPage'));
const RefundsPage = lazy(() => import('./pages/admin/RefundsPage'));
const ManualInvoicePage = lazy(() => import('./pages/admin/ManualInvoicePage'));
const InvoicesListPage = lazy(() => import('./pages/admin/InvoicesListPage'));
const ShippingConfigPage = lazy(() => import('./pages/admin/ShippingConfigPage'));
const UsersManager = lazy(() => import('./pages/admin/UsersManager'));
const RolePermissionsManager = lazy(() => import('./pages/admin/RolePermissionsManager'));
const CalendarPage = lazy(() => import('./pages/admin/CalendarPage'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const CategoriesManager = lazy(() => import('./pages/admin/CategoriesManager'));
const StockPage = lazy(() => import('./pages/admin/StockPage'));
const CalculatorManager = lazy(() => import('./pages/admin/CalculatorManager'));
const BackupManager = lazy(() => import('./pages/admin/BackupManager'));
const CouponsManager = lazy(() => import('./pages/admin/CouponsManager'));
const InventoryManager = lazy(() => import('./pages/admin/InventoryManager'));
const AdminQuoteRequestsPage = lazy(() => import('./pages/admin/QuoteRequestsManager'));
const CreateQuotePage = lazy(() => import('./pages/admin/CreateQuotePage'));
const CompanySettingsPage = lazy(() => import('./pages/admin/CompanySettingsPage'));
const PacksManager = lazy(() => import('./pages/admin/PacksManager'));
const PersonalManager = lazy(() => import('./pages/admin/PersonnelProductsManager'));
const MontajesManager = lazy(() => import('./pages/admin/MontajesManager'));
const ExtraCategoriesManager = lazy(() => import('./pages/admin/ExtraCategoriesManager'));
const StatisticsPage = lazy(() => import('./pages/admin/StatisticsPage'));
const PurchaseLotsManager = lazy(() => import('./pages/admin/PurchaseLotsManager'));
const ContabilidadManager = lazy(() => import('./pages/admin/ContabilidadTabs'));
const EventsManager = lazy(() => import('./pages/admin/EventsManager'));
const EventDetailPage = lazy(() => import('./pages/admin/EventDetailPage'));
const CRMPage = lazy(() => import('./pages/admin/CRMPage'));
const CRMDetailPage = lazy(() => import('./pages/admin/CRMDetailPage'));
const StaffHRManager = lazy(() => import('./pages/admin/StaffPage'));
const ContractsManager = lazy(() => import('./pages/admin/ContractsManager'));
const VehiclesManager = lazy(() => import('./pages/admin/VehiclesManager'));
const WarehouseManager = lazy(() => import('./pages/admin/WarehouseManager'));
const EquipmentAvailabilityPage = lazy(() => import('./pages/admin/EquipmentAvailabilityPage'));
const MaterialCheckPage = lazy(() => import('./pages/admin/MaterialCheckPage'));
const LoadingSheetPage = lazy(() => import('./pages/admin/LoadingSheetPage'));
const NotificationsManager = lazy(() => import('./pages/admin/NotificationsManager'));
const ReportsPage = lazy(() => import('./pages/admin/ReportsPage'));
const PickingListPage = lazy(() => import('./pages/admin/PickingListPage'));
const PipelinePage = lazy(() => import('./pages/admin/PipelinePage'));
const EventTemplatesManager = lazy(() => import('./pages/admin/EventTemplatesManager'));
const SuppliersManager = lazy(() => import('./pages/admin/SuppliersManager'));
const MaintenanceManager = lazy(() => import('./pages/admin/MaintenanceManager'));
const VehicleCalendarPage = lazy(() => import('./pages/admin/VehicleCalendarPage'));
const CommissionsManager = lazy(() => import('./pages/admin/CommissionsManager'));
const SubcontractsManager = lazy(() => import('./pages/admin/SubcontractsManager'));
const FiscalAccountingPage = lazy(() => import('./pages/admin/FiscalAccountingPage'));
const ClientPortalPage = lazy(() => import('./pages/admin/ClientPortalPage'));
const TechMobileView = lazy(() => import('./pages/admin/TechMobileView'));
const RoleDashboardPage = lazy(() => import('./pages/admin/RoleDashboardPage'));
const EmailMarketingPage = lazy(() => import('./pages/admin/EmailMarketingPage'));
const PortfolioManager = lazy(() => import('./pages/admin/PortfolioManager'));

// Commercial pages
const CommercialDashboard = lazy(() => import('./pages/commercial/CommercialDashboard'));
const CommercialQuoteRequestsManager = lazy(() => import('./pages/commercial/CommercialQuoteRequestsManager'));
const LeadsManager = lazy(() => import('./pages/commercial/LeadsManager'));
const CommissionsPage = lazy(() => import('./pages/commercial/CommissionsPage'));

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <RequireInternalAuth>
      <AdminLayout>{children}</AdminLayout>
    </RequireInternalAuth>
  );
}

function PageFallback() {
  return (
    <div className="flex h-64 items-center justify-center text-gray-400">
      Cargando…
    </div>
  );
}

function A({ children }: { children: ReactNode }) {
  return (
    <AdminShell>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </AdminShell>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Commercial panel */}
      <Route
        path="/comercial"
        element={
          <RequireInternalAuth>
            <CommercialLayout />
          </RequireInternalAuth>
        }
      >
        <Route index element={<Navigate to="/comercial/dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<PageFallback />}><CommercialDashboard /></Suspense>} />
        <Route path="presupuestos" element={<Suspense fallback={<PageFallback />}><CommercialQuoteRequestsManager apiBasePath="/commercial/quotes" /></Suspense>} />
        <Route path="leads" element={<Suspense fallback={<PageFallback />}><LeadsManager /></Suspense>} />
        <Route path="comisiones" element={<Suspense fallback={<PageFallback />}><CommissionsPage /></Suspense>} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<A><AdminDashboard /></A>} />
      <Route path="/admin/products" element={<A><ProductsManager /></A>} />
      <Route path="/admin/categories" element={<A><CategoriesManager /></A>} />
      <Route path="/admin/orders" element={<A><OrdersManager /></A>} />
      <Route path="/admin/orders/:id" element={<A><OrderDetailPage /></A>} />
      <Route path="/admin/refunds" element={<A><RefundsPage /></A>} />
      <Route path="/admin/invoices" element={<A><InvoicesListPage /></A>} />
      <Route path="/admin/invoices/manual" element={<A><ManualInvoicePage /></A>} />
      <Route path="/admin/users" element={<A><UsersManager /></A>} />
      <Route path="/admin/roles" element={<A><RolePermissionsManager /></A>} />
      <Route path="/admin/company-settings" element={<A><CompanySettingsPage /></A>} />
      <Route path="/admin/calendar" element={<A><CalendarPage /></A>} />
      <Route path="/admin/blog" element={<A><BlogManager /></A>} />
      <Route path="/admin/backups" element={<A><BackupManager /></A>} />
      <Route path="/admin/calculator" element={<A><CalculatorManager /></A>} />
      <Route path="/admin/extra-categories" element={<A><ExtraCategoriesManager /></A>} />
      <Route path="/admin/coupons" element={<A><CouponsManager /></A>} />
      <Route path="/admin/stock" element={<A><StockPage /></A>} />
      <Route path="/admin/inventory" element={<A><InventoryManager /></A>} />
      <Route path="/admin/quote-requests" element={<A><AdminQuoteRequestsPage /></A>} />
      <Route path="/admin/quote-requests/new" element={<A><CreateQuotePage /></A>} />
      <Route path="/admin/settings" element={<A><SettingsManager /></A>} />
      <Route path="/admin/shipping-config" element={<A><ShippingConfigPage /></A>} />
      <Route path="/admin/packs" element={<A><PacksManager /></A>} />
      <Route path="/admin/personal" element={<A><PersonalManager /></A>} />
      <Route path="/admin/montajes" element={<A><MontajesManager /></A>} />
      <Route path="/admin/statistics" element={<A><StatisticsPage /></A>} />
      <Route path="/admin/contabilidad" element={<A><ContabilidadManager /></A>} />
      <Route path="/admin/purchase-lots" element={<A><PurchaseLotsManager /></A>} />
      <Route path="/admin/events" element={<A><EventsManager /></A>} />
      <Route path="/admin/events/:id" element={<A><EventDetailPage /></A>} />
      <Route path="/admin/crm" element={<A><CRMPage /></A>} />
      <Route path="/admin/crm/:id" element={<A><CRMDetailPage /></A>} />
      <Route path="/admin/staff-hr" element={<A><StaffHRManager /></A>} />
      <Route path="/admin/contracts-mgmt" element={<A><ContractsManager /></A>} />
      <Route path="/admin/vehicles" element={<A><VehiclesManager /></A>} />
      <Route path="/admin/warehouse-locations" element={<A><WarehouseManager /></A>} />
      <Route path="/admin/equipment-availability" element={<A><EquipmentAvailabilityPage /></A>} />
      <Route path="/admin/material-check" element={<A><MaterialCheckPage /></A>} />
      <Route path="/admin/loading-sheets" element={<A><LoadingSheetPage /></A>} />
      <Route path="/admin/notifications" element={<A><NotificationsManager /></A>} />
      <Route path="/admin/reports" element={<A><ReportsPage /></A>} />
      <Route path="/admin/picking-list" element={<A><PickingListPage /></A>} />
      <Route path="/admin/pipeline" element={<A><PipelinePage /></A>} />
      <Route path="/admin/event-templates" element={<A><EventTemplatesManager /></A>} />
      <Route path="/admin/suppliers" element={<A><SuppliersManager /></A>} />
      <Route path="/admin/maintenance" element={<A><MaintenanceManager /></A>} />
      <Route path="/admin/vehicle-calendar" element={<A><VehicleCalendarPage /></A>} />
      <Route path="/admin/commissions" element={<A><CommissionsManager /></A>} />
      <Route path="/admin/subcontracts" element={<A><SubcontractsManager /></A>} />
      <Route path="/admin/fiscal" element={<A><FiscalAccountingPage /></A>} />
      <Route path="/admin/client-portal" element={<A><ClientPortalPage /></A>} />
      <Route path="/admin/tech-view" element={<A><TechMobileView /></A>} />
      <Route path="/admin/role-dashboard" element={<A><RoleDashboardPage /></A>} />
      <Route path="/admin/email-marketing" element={<A><EmailMarketingPage /></A>} />
      <Route path="/admin/portfolio" element={<A><PortfolioManager /></A>} />
      <Route path="/admin/*" element={<A><DashboardPage /></A>} />

      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}

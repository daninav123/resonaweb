import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout/Layout';
import AdminLayout from './components/AdminLayout';

// Lazy load ALL pages for optimal initial load performance
import { lazy, Suspense } from 'react';

// Critical pages - También lazy para reducir bundle inicial
const HomePage = lazy(() => import('./pages/HomePage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));

const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const PackDetailPage = lazy(() => import('./pages/PackDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const TestStockPage = lazy(() => import('./pages/TestStockPage'));
const TestStockE2EPage = lazy(() => import('./pages/TestStockE2EPage'));
const TestCheckoutE2EPage = lazy(() => import('./pages/TestCheckoutE2EPage'));
const TestFullOrderFlowPage = lazy(() => import('./pages/TestFullOrderFlowPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutPageStripe = lazy(() => import('./pages/CheckoutPageStripe'));
const CheckoutPageRedsys = lazy(() => import('./pages/CheckoutPageRedsys'));
const ManualPaymentInstructionsPage = lazy(() => import('./pages/ManualPaymentInstructionsPage'));
const PaymentSuccessPage = lazy(() => import('./pages/checkout/PaymentSuccessPage'));
const PaymentErrorPage = lazy(() => import('./pages/checkout/PaymentErrorPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailUserPage = lazy(() => import('./pages/OrderDetailUserPage'));
const ModificationPaymentPage = lazy(() => import('./pages/ModificationPaymentPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const EventCalculatorPage = lazy(() => import('./pages/EventCalculatorPage'));
const AdminDashboard = lazy(() => import('./pages/admin/DashboardEnhanced'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'));
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'));
const OrderDetailPage = lazy(() => import('./pages/admin/OrderDetailPage'));
const RefundsPage = lazy(() => import('./pages/admin/RefundsPage'));
const ManualInvoicePage = lazy(() => import('./pages/admin/ManualInvoicePage'));
const InvoicesListPage = lazy(() => import('./pages/admin/InvoicesListPage'));
const ShippingConfigPage = lazy(() => import('./pages/admin/ShippingConfigPage'));
const UsersManager = lazy(() => import('./pages/admin/UsersManager'));
const CalendarManager = lazy(() => import('./pages/admin/CalendarManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const CategoriesManager = lazy(() => import('./pages/admin/CategoriesManager'));
const StockAlerts = lazy(() => import('./pages/admin/StockAlerts'));
const CalculatorManager = lazy(() => import('./pages/admin/CalculatorManagerNew'));
const BackupManager = lazy(() => import('./pages/admin/BackupManager'));
const CouponsManager = lazy(() => import('./pages/admin/CouponsManager'));
const StockManager = lazy(() => import('./pages/admin/StockManager'));
const AdminQuoteRequestsPage = lazy(() => import('./pages/admin/QuoteRequestsManager'));
const BlogListPage = lazy(() => import('./pages/public/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage'));
const CompanySettingsPage = lazy(() => import('./pages/admin/CompanySettingsPage'));
const POSPage = lazy(() => import('./pages/admin/POSPage'));
const PacksManager = lazy(() => import('./pages/admin/PacksManager'));
const PersonalManager = lazy(() => import('./pages/admin/PersonalManager'));
const MontajesManager = lazy(() => import('./pages/admin/MontajesManager'));
const ExtraCategoriesManager = lazy(() => import('./pages/admin/ExtraCategoriesManager'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const StatisticsPage = lazy(() => import('./pages/admin/StatisticsPage'));
const PurchaseLotsManager = lazy(() => import('./pages/admin/PurchaseLotsManager'));
const ContabilidadManager = lazy(() => import('./pages/admin/ContabilidadTabs'));
const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiesPolicy = lazy(() => import('./pages/legal/CookiesPolicy'));
const LegalNotice = lazy(() => import('./pages/legal/LegalNotice'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));

// Service Pages (20 páginas)
const AlquilerSonidoValencia = lazy(() => import('./pages/services/AlquilerSonidoValencia'));
const AlquilerAltavocesProfesionales = lazy(() => import('./pages/services/AlquilerAltavocesProfesionales'));
const AlquilerMicrofonosInalambricos = lazy(() => import('./pages/services/AlquilerMicrofonosInalambricos'));
const SonidoBodasValencia = lazy(() => import('./pages/services/SonidoBodasValencia'));
const SonidoEventosCorporativos = lazy(() => import('./pages/services/SonidoEventosCorporativos'));
const AlquilerMesaMezclaDJ = lazy(() => import('./pages/services/AlquilerMesaMezclaDJ'));
const AlquilerSubwoofers = lazy(() => import('./pages/services/AlquilerSubwoofers'));
const AlquilerIluminacionBodas = lazy(() => import('./pages/services/AlquilerIluminacionBodas'));
const IluminacionLEDProfesional = lazy(() => import('./pages/services/IluminacionLEDProfesional'));
const IluminacionEscenarios = lazy(() => import('./pages/services/IluminacionEscenarios'));
const AlquilerMovingHeads = lazy(() => import('./pages/services/AlquilerMovingHeads'));
const IluminacionArquitectonica = lazy(() => import('./pages/services/IluminacionArquitectonica'));
const AlquilerLaser = lazy(() => import('./pages/services/AlquilerLaser'));
const AlquilerPantallasLED = lazy(() => import('./pages/services/AlquilerPantallasLED'));
const AlquilerProyectores = lazy(() => import('./pages/services/AlquilerProyectores'));
const VideoescenariosStreaming = lazy(() => import('./pages/services/VideoescenariosStreaming'));
const AlquilerDJValencia = lazy(() => import('./pages/services/AlquilerDJValencia'));
const ProduccionTecnicaEventos = lazy(() => import('./pages/services/ProduccionTecnicaEventos'));
const AlquilerEstructurasTruss = lazy(() => import('./pages/services/AlquilerEstructurasTruss'));
const AlquilerMaquinasFX = lazy(() => import('./pages/services/AlquilerMaquinasFX'));

// Cookie Banner
import CookieBanner from './components/CookieBanner';

// Scroll to top on route change
import ScrollToTop from './components/ScrollToTop';

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes (pero categorías usan 0)
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Limpiar cache de categorías al iniciar (fix para categorías cacheadas)
if (typeof window !== 'undefined') {
  queryClient.removeQueries({ queryKey: ['categories'] });
}

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Solo ejecutar al montar

  // Sistema de renovación automática de tokens
  useEffect(() => {
    if (isAuthenticated) {
      import('./utils/tokenRefresh').then(({ startTokenRefresh }) => {
        startTokenRefresh();
      });
      
      return () => {
        import('./utils/tokenRefresh').then(({ stopTokenRefresh }) => {
          stopTokenRefresh();
        });
      };
    }
  }, [isAuthenticated]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/productos" element={<Layout><ProductsPage /></Layout>} />
            <Route path="/productos/:slug" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/packs/:slug" element={<Layout><PackDetailPage /></Layout>} />
            <Route path="/carrito" element={<Layout><CartPage /></Layout>} />
            <Route path="/test-stock" element={<Layout><TestStockPage /></Layout>} />
            <Route path="/test-stock-e2e" element={<Layout><TestStockE2EPage /></Layout>} />
            <Route path="/test-checkout-e2e" element={<Layout><TestCheckoutE2EPage /></Layout>} />
            <Route path="/test-full-order" element={<Layout><TestFullOrderFlowPage /></Layout>} />
            <Route path="/calculadora-evento" element={<Layout><EventCalculatorPage /></Layout>} />
            <Route path="/calculadora" element={<Layout><EventCalculatorPage /></Layout>} />
            <Route path="/servicios" element={<Layout><ServicesPage /></Layout>} />
            
            {/* Service Pages - 20 páginas optimizadas SEO */}
            <Route path="/servicios/alquiler-sonido-valencia" element={<Layout><AlquilerSonidoValencia /></Layout>} />
            <Route path="/servicios/alquiler-altavoces-profesionales" element={<Layout><AlquilerAltavocesProfesionales /></Layout>} />
            <Route path="/servicios/alquiler-microfonos-inalambricos" element={<Layout><AlquilerMicrofonosInalambricos /></Layout>} />
            <Route path="/servicios/sonido-bodas-valencia" element={<Layout><SonidoBodasValencia /></Layout>} />
            <Route path="/servicios/sonido-eventos-corporativos-valencia" element={<Layout><SonidoEventosCorporativos /></Layout>} />
            <Route path="/servicios/alquiler-mesa-mezclas-dj" element={<Layout><AlquilerMesaMezclaDJ /></Layout>} />
            <Route path="/servicios/alquiler-subwoofers-graves" element={<Layout><AlquilerSubwoofers /></Layout>} />
            <Route path="/servicios/alquiler-iluminacion-bodas-valencia" element={<Layout><AlquilerIluminacionBodas /></Layout>} />
            <Route path="/servicios/iluminacion-led-profesional" element={<Layout><IluminacionLEDProfesional /></Layout>} />
            <Route path="/servicios/iluminacion-escenarios-eventos" element={<Layout><IluminacionEscenarios /></Layout>} />
            <Route path="/servicios/alquiler-moving-heads" element={<Layout><AlquilerMovingHeads /></Layout>} />
            <Route path="/servicios/iluminacion-arquitectonica-eventos" element={<Layout><IluminacionArquitectonica /></Layout>} />
            <Route path="/servicios/alquiler-laser-eventos" element={<Layout><AlquilerLaser /></Layout>} />
            <Route path="/servicios/alquiler-pantallas-led-eventos" element={<Layout><AlquilerPantallasLED /></Layout>} />
            <Route path="/servicios/alquiler-proyectores-profesionales" element={<Layout><AlquilerProyectores /></Layout>} />
            <Route path="/servicios/videoescenarios-streaming-eventos" element={<Layout><VideoescenariosStreaming /></Layout>} />
            <Route path="/servicios/alquiler-dj-valencia" element={<Layout><AlquilerDJValencia /></Layout>} />
            <Route path="/servicios/produccion-tecnica-eventos-valencia" element={<Layout><ProduccionTecnicaEventos /></Layout>} />
            <Route path="/servicios/alquiler-estructuras-truss" element={<Layout><AlquilerEstructurasTruss /></Layout>} />
            <Route path="/servicios/alquiler-maquinas-fx-humo-confeti" element={<Layout><AlquilerMaquinasFX /></Layout>} />
            
            <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />
            <Route path="/sobre-nosotros" element={<Layout><AboutPage /></Layout>} />
            
            {/* Blog Routes */}
            <Route path="/blog" element={<Layout><BlogListPage /></Layout>} />
            <Route path="/blog/:slug" element={<Layout><BlogPostPage /></Layout>} />
            
            {/* Legal Pages */}
            <Route path="/terminos-condiciones" element={<Layout><TermsAndConditions /></Layout>} />
            <Route path="/politica-privacidad" element={<Layout><PrivacyPolicy /></Layout>} />
            <Route path="/politica-cookies" element={<Layout><CookiesPolicy /></Layout>} />
            <Route path="/aviso-legal" element={<Layout><LegalNotice /></Layout>} />
            {/* Rutas legacy */}
            <Route path="/legal/terminos" element={<Layout><TermsAndConditions /></Layout>} />
            <Route path="/legal/privacidad" element={<Layout><PrivacyPolicy /></Layout>} />
            <Route path="/legal/cookies" element={<Layout><CookiesPolicy /></Layout>} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
              <Route path="/checkout/stripe" element={<Layout><CheckoutPageStripe /></Layout>} />
              <Route path="/checkout/redsys" element={<Layout><CheckoutPageRedsys /></Layout>} />
              <Route path="/checkout/manual-payment" element={<Layout><ManualPaymentInstructionsPage /></Layout>} />
              <Route path="/checkout/success" element={<Layout><PaymentSuccessPage /></Layout>} />
              <Route path="/checkout/error" element={<Layout><PaymentErrorPage /></Layout>} />
              <Route path="/cuenta" element={<Layout><AccountPage /></Layout>} />
              <Route path="/mis-pedidos" element={<Layout><OrdersPage /></Layout>} />
              <Route path="/mis-pedidos/:id" element={<Layout><OrderDetailUserPage /></Layout>} />
              {/* Ruta legacy para compatibilidad con emails */}
              <Route path="/orders/:id" element={<Layout><OrderDetailUserPage /></Layout>} />
              <Route path="/modification-payment/:orderId" element={<Layout><ModificationPaymentPage /></Layout>} />
              <Route path="/favoritos" element={<Layout><FavoritesPage /></Layout>} />
            </Route>
            
            {/* POS Route (sin AdminLayout para fullscreen en móvil) */}
            <Route element={<PrivateRoute requireAdmin />}>
              <Route path="/pos/:orderId" element={<POSPage />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<PrivateRoute requireAdmin />}>
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/products" element={<AdminLayout><ProductsManager /></AdminLayout>} />
              <Route path="/admin/categories" element={<AdminLayout><CategoriesManager /></AdminLayout>} />
              <Route path="/admin/stock-alerts" element={<AdminLayout><StockAlerts /></AdminLayout>} />
              <Route path="/admin/orders" element={<AdminLayout><OrdersManager /></AdminLayout>} />
              <Route path="/admin/orders/:id" element={<AdminLayout><OrderDetailPage /></AdminLayout>} />
              <Route path="/admin/refunds" element={<AdminLayout><RefundsPage /></AdminLayout>} />
              <Route path="/admin/invoices" element={<AdminLayout><InvoicesListPage /></AdminLayout>} />
              <Route path="/admin/invoices/manual" element={<AdminLayout><ManualInvoicePage /></AdminLayout>} />
              <Route path="/admin/users" element={<AdminLayout><UsersManager /></AdminLayout>} />
              <Route path="/admin/company-settings" element={<AdminLayout><CompanySettingsPage /></AdminLayout>} />
              <Route path="/admin/calendar" element={<AdminLayout><CalendarManager /></AdminLayout>} />
              <Route path="/admin/blog" element={<AdminLayout><BlogManager /></AdminLayout>} />
              <Route path="/admin/backups" element={<AdminLayout><BackupManager /></AdminLayout>} />
              <Route path="/admin/calculator" element={<AdminLayout><CalculatorManager /></AdminLayout>} />
              <Route path="/admin/extra-categories" element={<AdminLayout><ExtraCategoriesManager /></AdminLayout>} />
              <Route path="/admin/coupons" element={<AdminLayout><CouponsManager /></AdminLayout>} />
              <Route path="/admin/stock" element={<AdminLayout><StockManager /></AdminLayout>} />
              <Route path="/admin/quote-requests" element={<AdminLayout><AdminQuoteRequestsPage /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><SettingsManager /></AdminLayout>} />
              <Route path="/admin/shipping-config" element={<AdminLayout><ShippingConfigPage /></AdminLayout>} />
              <Route path="/admin/packs" element={<AdminLayout><PacksManager /></AdminLayout>} />
              <Route path="/admin/personal" element={<AdminLayout><PersonalManager /></AdminLayout>} />
              <Route path="/admin/montajes" element={<AdminLayout><MontajesManager /></AdminLayout>} />
              <Route path="/admin/analytics" element={<AdminLayout><AnalyticsPage /></AdminLayout>} />
              <Route path="/admin/statistics" element={<AdminLayout><StatisticsPage /></AdminLayout>} />
              <Route path="/admin/contabilidad" element={<AdminLayout><ContabilidadManager /></AdminLayout>} />
              <Route path="/admin/purchase-lots" element={<AdminLayout><PurchaseLotsManager /></AdminLayout>} />
              <Route path="/admin/*" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
            </Route>
            
            {/* 404 - Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        
        {/* Cookie Consent Banner */}
        <CookieBanner />
        
        <Toaster
          position="bottom-right"
          containerStyle={{
            bottom: 40,
            right: 40,
          }}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 2000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
        
        {import.meta.env?.DEV && (
          <ReactQueryDevtools initialIsOpen={false} />
        )}
      </Router>
    </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;

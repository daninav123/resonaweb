import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore } from './stores/authStore';
import Layout from './components/Layout/Layout';

// Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import LoginPage from './pages/auth/LoginPage';

// Lazy load other pages to improve initial load
import { lazy, Suspense } from 'react';

const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const TestStockPage = lazy(() => import('./pages/TestStockPage'));
const TestStockE2EPage = lazy(() => import('./pages/TestStockE2EPage'));
const TestCheckoutE2EPage = lazy(() => import('./pages/TestCheckoutE2EPage'));
const TestFullOrderFlowPage = lazy(() => import('./pages/TestFullOrderFlowPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const CheckoutPageStripe = lazy(() => import('./pages/CheckoutPageStripe'));
const PaymentSuccessPage = lazy(() => import('./pages/checkout/PaymentSuccessPage'));
const PaymentErrorPage = lazy(() => import('./pages/checkout/PaymentErrorPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const AboutPage = lazy(() => import('./pages/AboutPage'));
const ServicesPage = lazy(() => import('./pages/ServicesPage'));
const EventCalculatorPage = lazy(() => import('./pages/EventCalculatorPage'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const BlogManager = lazy(() => import('./pages/admin/BlogManager'));
const ProductsManager = lazy(() => import('./pages/admin/ProductsManager'));
const OrdersManager = lazy(() => import('./pages/admin/OrdersManager'));
const OrderDetailPage = lazy(() => import('./pages/admin/OrderDetailPage'));
const ShippingConfigPage = lazy(() => import('./pages/admin/ShippingConfigPage'));
const UsersManager = lazy(() => import('./pages/admin/UsersManager'));
const CalendarManager = lazy(() => import('./pages/admin/CalendarManager'));
const SettingsManager = lazy(() => import('./pages/admin/SettingsManager'));
const CategoriesManager = lazy(() => import('./pages/admin/CategoriesManager'));
const OnDemandDashboard = lazy(() => import('./pages/admin/OnDemandDashboard'));
const CalculatorManager = lazy(() => import('./pages/admin/CalculatorManagerNew'));
const CouponsManager = lazy(() => import('./pages/admin/CouponsManager'));
const StockManager = lazy(() => import('./pages/admin/StockManager'));
const BlogListPage = lazy(() => import('./pages/public/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage'));
const CompanySettingsPage = lazy(() => import('./pages/admin/CompanySettingsPage'));
const TermsPage = lazy(() => import('./pages/legal/TermsPage'));
const PrivacyPage = lazy(() => import('./pages/legal/PrivacyPage'));
const CookiesPage = lazy(() => import('./pages/legal/CookiesPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const PrivateRoute = lazy(() => import('./components/PrivateRoute'));

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
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/productos" element={<Layout><ProductsPage /></Layout>} />
            <Route path="/productos/:slug" element={<Layout><ProductDetailPage /></Layout>} />
            <Route path="/carrito" element={<Layout><CartPage /></Layout>} />
            <Route path="/test-stock" element={<Layout><TestStockPage /></Layout>} />
            <Route path="/test-stock-e2e" element={<Layout><TestStockE2EPage /></Layout>} />
            <Route path="/test-checkout-e2e" element={<Layout><TestCheckoutE2EPage /></Layout>} />
            <Route path="/test-full-order" element={<Layout><TestFullOrderFlowPage /></Layout>} />
            <Route path="/calculadora-evento" element={<Layout><EventCalculatorPage /></Layout>} />
            <Route path="/servicios" element={<Layout><ServicesPage /></Layout>} />
            <Route path="/contacto" element={<Layout><ContactPage /></Layout>} />
            <Route path="/sobre-nosotros" element={<Layout><AboutPage /></Layout>} />
            
            {/* Blog Routes */}
            <Route path="/blog" element={<Layout><BlogListPage /></Layout>} />
            <Route path="/blog/:slug" element={<Layout><BlogPostPage /></Layout>} />
            
            {/* Legal Pages */}
            <Route path="/legal/terminos" element={<Layout><TermsPage /></Layout>} />
            <Route path="/legal/privacidad" element={<Layout><PrivacyPage /></Layout>} />
            <Route path="/legal/cookies" element={<Layout><CookiesPage /></Layout>} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Protected Routes */}
            <Route element={<PrivateRoute />}>
              <Route path="/checkout" element={<Layout><CheckoutPage /></Layout>} />
              <Route path="/checkout/stripe" element={<Layout><CheckoutPageStripe /></Layout>} />
              <Route path="/checkout/success" element={<Layout><PaymentSuccessPage /></Layout>} />
              <Route path="/checkout/error" element={<Layout><PaymentErrorPage /></Layout>} />
              <Route path="/cuenta" element={<Layout><AccountPage /></Layout>} />
              <Route path="/mis-pedidos" element={<Layout><OrdersPage /></Layout>} />
              <Route path="/favoritos" element={<Layout><FavoritesPage /></Layout>} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<PrivateRoute requireAdmin />}>
              <Route path="/admin" element={<Layout><AdminDashboard /></Layout>} />
              <Route path="/admin/products" element={<Layout><ProductsManager /></Layout>} />
              <Route path="/admin/categories" element={<Layout><CategoriesManager /></Layout>} />
              <Route path="/admin/on-demand" element={<Layout><OnDemandDashboard /></Layout>} />
              <Route path="/admin/orders" element={<Layout><OrdersManager /></Layout>} />
              <Route path="/admin/orders/:id" element={<Layout><OrderDetailPage /></Layout>} />
              <Route path="/admin/users" element={<Layout><UsersManager /></Layout>} />
              <Route path="/admin/company-settings" element={<Layout><CompanySettingsPage /></Layout>} />
              <Route path="/admin/calendar" element={<Layout><CalendarManager /></Layout>} />
              <Route path="/admin/blog" element={<Layout><BlogManager /></Layout>} />
              <Route path="/admin/calculator" element={<Layout><CalculatorManager /></Layout>} />
              <Route path="/admin/coupons" element={<Layout><CouponsManager /></Layout>} />
              <Route path="/admin/stock" element={<Layout><StockManager /></Layout>} />
              <Route path="/admin/settings" element={<Layout><SettingsManager /></Layout>} />
              <Route path="/admin/shipping-config" element={<Layout><ShippingConfigPage /></Layout>} />
              <Route path="/admin/*" element={<Layout><AdminDashboard /></Layout>} />
            </Route>
            
            {/* 404 - Not Found */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#333',
              color: '#fff',
            },
            success: {
              duration: 3000,
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

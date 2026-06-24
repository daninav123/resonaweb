import { Suspense, useEffect } from 'react';
import { lazyWithRetry } from './utils/lazyWithRetry';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore, startTokenRefresh } from '@resona/api-client';
import { WhatsAppFloat } from '@resona/ui';
import Layout from './components/Layout/Layout';

// Páginas públicas de alquiler
const HomePage = lazyWithRetry(() => import('./pages/HomePage'));
const ProductsPage = lazyWithRetry(() => import('./pages/ProductsPage'));
const ProductDetailPage = lazyWithRetry(() => import('./pages/ProductDetailPage'));
const CartPage = lazyWithRetry(() => import('./pages/CartPage'));
const CheckoutPage = lazyWithRetry(() => import('./pages/CheckoutPage'));
const CheckoutPageStripe = lazyWithRetry(() => import('./pages/CheckoutPageStripe'));
const CheckoutPageRedsys = lazyWithRetry(() => import('./pages/CheckoutPageRedsys'));
const ManualPaymentInstructionsPage = lazyWithRetry(() => import('./pages/ManualPaymentInstructionsPage'));
const ModificationPaymentPage = lazyWithRetry(() => import('./pages/ModificationPaymentPage'));
const PaymentTokenPage = lazyWithRetry(() => import('./pages/PaymentTokenPage'));
const PaymentSuccessPage = lazyWithRetry(() => import('./pages/checkout/PaymentSuccessPage'));
const PaymentErrorPage = lazyWithRetry(() => import('./pages/checkout/PaymentErrorPage'));

// Auth
const LoginPage = lazyWithRetry(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazyWithRetry(() => import('./pages/auth/RegisterPage'));

// Cuenta
const AccountPage = lazyWithRetry(() => import('./pages/AccountPage'));
const OrdersPage = lazyWithRetry(() => import('./pages/OrdersPage'));
const OrderDetailUserPage = lazyWithRetry(() => import('./pages/OrderDetailUserPage'));
const FavoritesPage = lazyWithRetry(() => import('./pages/FavoritesPage'));
const MyDataPage = lazyWithRetry(() => import('./pages/MyDataPage'));

// Compartidas
const ContactPage = lazyWithRetry(() => import('./pages/ContactPage'));
const AboutPage = lazyWithRetry(() => import('./pages/AboutPage'));
const FAQsPage = lazyWithRetry(() => import('./pages/FAQsPage'));

// Legal
const TermsAndConditions = lazyWithRetry(() => import('./pages/legal/TermsAndConditions'));
const PrivacyPolicy = lazyWithRetry(() => import('./pages/legal/PrivacyPolicy'));
const CookiesPolicy = lazyWithRetry(() => import('./pages/legal/CookiesPolicy'));
const LegalNotice = lazyWithRetry(() => import('./pages/legal/LegalNotice'));

// SEO landings técnicas
const AlquilerSonidoValenciaPage = lazyWithRetry(() => import('./pages/AlquilerSonidoValenciaPage'));
const AlquilerAltavocesValenciaPage = lazyWithRetry(() => import('./pages/AlquilerAltavocesValenciaPage'));
const AlquilerIluminacionValenciaPage = lazyWithRetry(() => import('./pages/AlquilerIluminacionValenciaPage'));
const AlquilerSonidoTorrentPage = lazyWithRetry(() => import('./pages/AlquilerSonidoTorrentPage'));

// Services SEO (alquileres específicos)
const AlquilerSonidoValencia = lazyWithRetry(() => import('./pages/services/AlquilerSonidoValencia'));
const AlquilerAltavocesProfesionales = lazyWithRetry(() => import('./pages/services/AlquilerAltavocesProfesionales'));
const AlquilerMicrofonosInalambricos = lazyWithRetry(() => import('./pages/services/AlquilerMicrofonosInalambricos'));
const AlquilerMesaMezclaDJ = lazyWithRetry(() => import('./pages/services/AlquilerMesaMezclaDJ'));
const AlquilerSubwoofers = lazyWithRetry(() => import('./pages/services/AlquilerSubwoofers'));
const AlquilerDJValencia = lazyWithRetry(() => import('./pages/services/AlquilerDJValencia'));
const IluminacionLEDProfesional = lazyWithRetry(() => import('./pages/services/IluminacionLEDProfesional'));
const AlquilerIluminacionBodas = lazyWithRetry(() => import('./pages/services/AlquilerIluminacionBodas'));
const AlquilerMovingHeads = lazyWithRetry(() => import('./pages/services/AlquilerMovingHeads'));
const AlquilerLaser = lazyWithRetry(() => import('./pages/services/AlquilerLaser'));
const AlquilerPantallasLED = lazyWithRetry(() => import('./pages/services/AlquilerPantallasLED'));
const AlquilerProyectores = lazyWithRetry(() => import('./pages/services/AlquilerProyectores'));
const AlquilerEstructurasTruss = lazyWithRetry(() => import('./pages/services/AlquilerEstructurasTruss'));
const AlquilerMaquinasFX = lazyWithRetry(() => import('./pages/services/AlquilerMaquinasFX'));

const NotFoundPage = lazyWithRetry(() => import('./pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      retry: 1,
    },
  },
});

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center text-gray-400">
      Cargando…
    </div>
  );
}

export default function App() {
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) startTokenRefresh();
  }, [isAuthenticated]);

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route element={<Layout />}>
                <Route index element={<HomePage />} />

                {/* Catálogo */}
                <Route path="/productos" element={<ProductsPage />} />
                <Route path="/productos/:slug" element={<ProductDetailPage />} />

                {/* Carrito y checkout */}
                <Route path="/carrito" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/stripe" element={<CheckoutPageStripe />} />
                <Route path="/checkout/redsys" element={<CheckoutPageRedsys />} />
                <Route path="/checkout/manual" element={<ManualPaymentInstructionsPage />} />
                <Route path="/checkout/exito" element={<PaymentSuccessPage />} />
                <Route path="/checkout/error" element={<PaymentErrorPage />} />
                <Route path="/pago/token/:token" element={<PaymentTokenPage />} />
                <Route path="/pago/modificacion/:id" element={<ModificationPaymentPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />

                {/* Cuenta */}
                <Route path="/cuenta" element={<AccountPage />} />
                <Route path="/cuenta/pedidos" element={<OrdersPage />} />
                <Route path="/cuenta/pedidos/:id" element={<OrderDetailUserPage />} />
                <Route path="/cuenta/favoritos" element={<FavoritesPage />} />
                <Route path="/cuenta/datos" element={<MyDataPage />} />

                {/* Compartidas */}
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/sobre-nosotros" element={<AboutPage />} />
                <Route path="/faqs" element={<FAQsPage />} />

                {/* Legal */}
                <Route path="/terminos-condiciones" element={<TermsAndConditions />} />
                <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
                <Route path="/politica-cookies" element={<CookiesPolicy />} />
                <Route path="/aviso-legal" element={<LegalNotice />} />

                {/* SEO landings técnicas */}
                <Route path="/alquiler-sonido-valencia" element={<AlquilerSonidoValenciaPage />} />
                <Route path="/alquiler-altavoces-valencia" element={<AlquilerAltavocesValenciaPage />} />
                <Route path="/alquiler-iluminacion-valencia" element={<AlquilerIluminacionValenciaPage />} />
                <Route path="/alquiler-sonido-torrent" element={<AlquilerSonidoTorrentPage />} />

                {/* Services/Alquiler */}
                <Route path="/servicios/alquiler-sonido-valencia" element={<AlquilerSonidoValencia />} />
                <Route path="/servicios/alquiler-altavoces-profesionales" element={<AlquilerAltavocesProfesionales />} />
                <Route path="/servicios/alquiler-microfonos-inalambricos" element={<AlquilerMicrofonosInalambricos />} />
                <Route path="/servicios/alquiler-mesa-mezcla-dj" element={<AlquilerMesaMezclaDJ />} />
                <Route path="/servicios/alquiler-subwoofers" element={<AlquilerSubwoofers />} />
                <Route path="/servicios/alquiler-dj-valencia" element={<AlquilerDJValencia />} />
                <Route path="/servicios/iluminacion-led-profesional" element={<IluminacionLEDProfesional />} />
                <Route path="/servicios/alquiler-iluminacion-bodas" element={<AlquilerIluminacionBodas />} />
                <Route path="/servicios/alquiler-moving-heads" element={<AlquilerMovingHeads />} />
                <Route path="/servicios/alquiler-laser" element={<AlquilerLaser />} />
                <Route path="/servicios/alquiler-pantallas-led" element={<AlquilerPantallasLED />} />
                <Route path="/servicios/alquiler-proyectores" element={<AlquilerProyectores />} />
                <Route path="/servicios/alquiler-estructuras-truss" element={<AlquilerEstructurasTruss />} />
                <Route path="/servicios/alquiler-maquinas-fx" element={<AlquilerMaquinasFX />} />

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster position="top-right" />
          <WhatsAppFloat
            phone="34613881414"
            message="Hola, quería información sobre el alquiler de equipos para un evento."
            tooltip="¿Dudas? Escríbenos"
          />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

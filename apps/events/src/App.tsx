import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { useAuthStore, startTokenRefresh } from '@resona/api-client';
import Layout from './components/Layout/Layout';

const HomePage = lazy(() => import('./pages/HomePage'));
const BodasPage = lazy(() => import('./pages/BodasPage'));
const EventosPage = lazy(() => import('./pages/EventosPage'));
const PortfolioPage = lazy(() => import('./pages/PortfolioPage'));
const PortfolioCasePage = lazy(() => import('./pages/PortfolioCasePage'));
const ServiciosPage = lazy(() => import('./pages/ServiciosPage'));
const EstudioPage = lazy(() => import('./pages/EstudioPage'));
const BriefPage = lazy(() => import('./pages/BriefPage'));
const PacksPage = lazy(() => import('./pages/PacksPage'));
const PackDetailPage = lazy(() => import('./pages/PackDetailPage'));
const ReservaConfirmadaPage = lazy(() => import('./pages/ReservaConfirmadaPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const FAQsPage = lazy(() => import('./pages/FAQsPage'));

const BlogListPage = lazy(() => import('./pages/public/BlogListPage'));
const BlogPostPage = lazy(() => import('./pages/public/BlogPostPage'));

const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));

const TermsAndConditions = lazy(() => import('./pages/legal/TermsAndConditions'));
const PrivacyPolicy = lazy(() => import('./pages/legal/PrivacyPolicy'));
const CookiesPolicy = lazy(() => import('./pages/legal/CookiesPolicy'));
const LegalNotice = lazy(() => import('./pages/legal/LegalNotice'));

const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 60_000, retry: 1 },
  },
});

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-cream text-ink/40">
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

                {/* Landings editoriales */}
                <Route path="/bodas" element={<BodasPage />} />
                <Route path="/eventos" element={<EventosPage />} />
                <Route path="/portfolio" element={<PortfolioPage />} />
                <Route path="/portfolio/:slug" element={<PortfolioCasePage />} />
                <Route path="/servicios" element={<ServiciosPage />} />
                <Route path="/estudio" element={<EstudioPage />} />
                <Route path="/brief" element={<BriefPage />} />
                <Route path="/packs" element={<PacksPage />} />
                <Route path="/packs/:slug" element={<PackDetailPage />} />
                <Route path="/reserva-confirmada" element={<ReservaConfirmadaPage />} />
                <Route path="/contacto" element={<ContactPage />} />
                <Route path="/faqs" element={<FAQsPage />} />

                {/* Redirects desde URLs legacy del monolito */}
                <Route path="/sobre-nosotros" element={<Navigate to="/estudio" replace />} />
                <Route path="/calculadora-evento" element={<Navigate to="/brief" replace />} />
                <Route path="/sonido-bodas-valencia" element={<Navigate to="/bodas" replace />} />
                <Route path="/servicios/bodas-valencia" element={<Navigate to="/bodas" replace />} />
                <Route path="/servicios/sonido-bodas-valencia" element={<Navigate to="/bodas" replace />} />
                <Route path="/servicios/sonido-iluminacion-bodas-valencia" element={<Navigate to="/bodas" replace />} />
                <Route path="/servicios/sonido-eventos-corporativos" element={<Navigate to="/eventos" replace />} />
                <Route path="/servicios/iluminacion-arquitectonica" element={<Navigate to="/servicios#iluminacion" replace />} />
                <Route path="/servicios/iluminacion-escenarios" element={<Navigate to="/servicios#iluminacion" replace />} />
                <Route path="/servicios/produccion-eventos-valencia" element={<Navigate to="/servicios#produccion-integral" replace />} />
                <Route path="/servicios/produccion-tecnica-eventos" element={<Navigate to="/servicios#produccion-integral" replace />} />
                <Route path="/servicios/videoescenarios-streaming" element={<Navigate to="/servicios#video-streaming" replace />} />

                {/* Blog */}
                <Route path="/blog" element={<BlogListPage />} />
                <Route path="/blog/:slug" element={<BlogPostPage />} />

                {/* Auth */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/registro" element={<RegisterPage />} />

                {/* Legal */}
                <Route path="/terminos-condiciones" element={<TermsAndConditions />} />
                <Route path="/politica-privacidad" element={<PrivacyPolicy />} />
                <Route path="/politica-cookies" element={<CookiesPolicy />} />
                <Route path="/aviso-legal" element={<LegalNotice />} />

                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </Suspense>
          <Toaster position="top-right" />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

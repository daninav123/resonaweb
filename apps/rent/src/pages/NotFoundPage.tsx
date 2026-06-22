import { Link } from 'react-router-dom';
import { Home, Search, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const NotFoundPage = () => {
  return (
    <>
      <Helmet>
        <title>404 - Página no encontrada - ReSona Events</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-lg w-full text-center">
          {/* 404 Number */}
          <div className="mb-8">
            <h1 className="text-9xl font-black text-resona mb-4">404</h1>
            <div className="h-2 w-32 bg-resona rounded-full mx-auto"></div>
          </div>

          {/* Message */}
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Página no encontrada
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Lo sentimos, la página que buscas no existe o ha sido movida.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 bg-resona text-white px-6 py-3 rounded-lg hover:bg-resona-dark transition-colors"
            >
              <Home className="w-5 h-5" />
              Ir al Inicio
            </Link>
            <Link
              to="/productos"
              className="inline-flex items-center justify-center gap-2 border-2 border-resona text-resona px-6 py-3 rounded-lg hover:bg-resona hover:text-white transition-colors"
            >
              <Search className="w-5 h-5" />
              Ver Productos
            </Link>
          </div>

          {/* Go Back */}
          <button
            onClick={() => window.history.back()}
            className="mt-8 inline-flex items-center gap-2 text-gray-600 hover:text-resona transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver atrás
          </button>

          {/* Illustration */}
          <div className="mt-12">
            <svg
              className="w-64 h-64 mx-auto opacity-20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFoundPage;

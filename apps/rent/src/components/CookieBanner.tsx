import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre true, no se puede desactivar
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Verificar si el usuario ya ha dado su consentimiento
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Mostrar banner después de 1 segundo
      setTimeout(() => setShowBanner(true), 1000);
    } else {
      // Cargar preferencias guardadas
      try {
        const savedPreferences = JSON.parse(consent);
        setPreferences(savedPreferences);
        applyPreferences(savedPreferences);
      } catch (e) {
        console.error('Error al cargar preferencias de cookies:', e);
      }
    }
  }, []);

  const applyPreferences = (prefs: typeof preferences) => {
    // Aplicar preferencias de cookies
    if (prefs.analytics) {
      // Activar Google Analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'granted'
      });
    } else {
      // Desactivar Google Analytics
      window.gtag?.('consent', 'update', {
        analytics_storage: 'denied'
      });
    }

    // Marketing/advertising (si se usa en el futuro)
    if (prefs.marketing) {
      window.gtag?.('consent', 'update', {
        ad_storage: 'granted'
      });
    } else {
      window.gtag?.('consent', 'update', {
        ad_storage: 'denied'
      });
    }
  };

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    localStorage.setItem('cookie_consent', JSON.stringify(allAccepted));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    applyPreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectOptional = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    localStorage.setItem('cookie_consent', JSON.stringify(onlyNecessary));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    applyPreferences(onlyNecessary);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cookie_consent', JSON.stringify(preferences));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    applyPreferences(preferences);
    setShowBanner(false);
    setShowPreferences(false);
  };

  const handleTogglePreference = (key: 'analytics' | 'marketing') => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="max-w-6xl w-full pointer-events-auto">
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200">
          {!showPreferences ? (
            // Banner principal
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="text-4xl">🍪</div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Este sitio utiliza cookies
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Utilizamos cookies propias y de terceros para mejorar tu experiencia, 
                    analizar el tráfico y mostrarte contenido relevante. Al hacer clic en 
                    "Aceptar todo", aceptas el uso de todas las cookies. Para más información, 
                    consulta nuestra{' '}
                    <Link 
                      to="/politica-cookies" 
                      className="text-blue-600 hover:underline font-medium"
                    >
                      Política de Cookies
                    </Link>.
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleAcceptAll}
                      className="bg-resona text-white px-6 py-2.5 rounded-lg font-medium hover:bg-resona-dark transition-colors"
                    >
                      ✓ Aceptar todo
                    </button>
                    
                    <button
                      onClick={handleRejectOptional}
                      className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                    >
                      ✗ Rechazar opcionales
                    </button>
                    
                    <button
                      onClick={() => setShowPreferences(true)}
                      className="text-gray-700 px-6 py-2.5 rounded-lg font-medium hover:bg-gray-50 border border-gray-300 transition-colors"
                    >
                      ⚙️ Configurar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Panel de preferencias
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Configuración de Cookies
                </h3>
                <button
                  onClick={() => setShowPreferences(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Cookies necesarias */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">Cookies Necesarias</h4>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Obligatorias
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Estas cookies son esenciales para el funcionamiento del sitio web. 
                      No se pueden desactivar.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ejemplo: Sesión de usuario, carrito de compra
                    </p>
                  </div>
                  <div className="flex items-center ml-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Activadas
                    </div>
                  </div>
                </div>

                {/* Cookies analíticas */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">Cookies Analíticas</h4>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Opcionales
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Nos ayudan a entender cómo interactúas con el sitio web, recopilando 
                      información de forma anónima.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Proveedor: Google Analytics
                    </p>
                  </div>
                  <div className="flex items-center ml-4">
                    <button
                      onClick={() => handleTogglePreference('analytics')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.analytics ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.analytics ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                {/* Cookies de marketing */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">Cookies de Marketing</h4>
                      <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Opcionales
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Se utilizan para mostrarte anuncios relevantes y medir la efectividad 
                      de nuestras campañas.
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Actualmente no utilizamos cookies de marketing
                    </p>
                  </div>
                  <div className="flex items-center ml-4">
                    <button
                      onClick={() => handleTogglePreference('marketing')}
                      disabled
                      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 opacity-50 cursor-not-allowed"
                    >
                      <span className="inline-block h-4 w-4 transform rounded-full bg-white translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => setShowPreferences(false)}
                  className="px-6 py-2.5 text-gray-700 font-medium hover:bg-gray-50 rounded-lg border border-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSavePreferences}
                  className="bg-resona text-white px-6 py-2.5 rounded-lg font-medium hover:bg-resona-dark transition-colors"
                >
                  Guardar Preferencias
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4 text-center">
                Puedes cambiar tus preferencias en cualquier momento desde nuestra{' '}
                <Link to="/politica-cookies" className="text-blue-600 hover:underline">
                  Política de Cookies
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Declaraciones de tipos para gtag (Google Analytics)
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

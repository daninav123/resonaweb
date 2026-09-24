import { useState, useEffect } from 'react';
import { X, Cookie, Settings } from 'lucide-react';
import { initMetaPixel } from '@resona/utils';

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Siempre true (obligatorias)
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Verificar si ya hay consentimiento guardado
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Esperar 1 segundo antes de mostrar el banner (mejor UX)
      setTimeout(() => {
        setShowBanner(true);
      }, 1000);
    } else {
      // Aplicar las preferencias guardadas
      try {
        const savedPrefs = JSON.parse(consent);
        setPreferences(savedPrefs);
        applyConsent(savedPrefs);
      } catch (error) {
        console.error('Error parseando preferencias de cookies:', error);
      }
    }
  }, []);

  const applyConsent = (prefs: typeof preferences) => {
    // Consent Mode v2: ad_user_data y ad_personalization son obligatorios para Google Ads.
    window.gtag?.('consent', 'update', {
      analytics_storage: prefs.analytics ? 'granted' : 'denied',
      ad_storage: prefs.marketing ? 'granted' : 'denied',
      ad_user_data: prefs.marketing ? 'granted' : 'denied',
      ad_personalization: prefs.marketing ? 'granted' : 'denied',
    });
    // Meta Pixel: se carga al conceder marketing (lee el consentimiento de localStorage,
    // que saveConsent guarda antes de llamar a applyConsent).
    if (prefs.marketing) initMetaPixel();
  };

  const saveConsent = (prefs: typeof preferences) => {
    localStorage.setItem('cookie_consent', JSON.stringify(prefs));
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    applyConsent(prefs);
    setShowBanner(false);
    setShowSettings(false);
  };

  const acceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
    };
    setPreferences(allAccepted);
    saveConsent(allAccepted);
  };

  const acceptNecessary = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(onlyNecessary);
    saveConsent(onlyNecessary);
  };

  const saveCustom = () => {
    saveConsent(preferences);
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Overlay */}
      {showSettings && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setShowSettings(false)}
        />
      )}

      {/* Banner Principal o Panel de Configuración */}
      <div className={`fixed ${showSettings ? 'inset-0 flex items-center justify-center z-50' : 'bottom-0 left-0 right-0 z-50'}`}>
        {!showSettings ? (
          // Banner Simple
          <div className="border-t border-cream/10 bg-ink text-cream">
            <div className="container mx-auto px-4 py-6 md:py-4">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                {/* Contenido */}
                <div className="flex-1 flex items-start gap-3">
                  <Cookie className="mt-0.5 h-4 w-4 flex-shrink-0 text-cream/40" strokeWidth={1.75} />
                  <div>
                    <h3 className="mb-1 text-[15px] font-medium">Usamos cookies</h3>
                    <p className="text-[14px] leading-relaxed text-cream/60">
                      Usamos cookies propias y de terceros para mejorar tu experiencia, analizar el uso del sitio y personalizar contenidos.{' '}
                      <a href="/politica-cookies" className="underline underline-offset-4 hover:text-cream" target="_blank">
                        Más información
                      </a>
                    </p>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="flex items-center justify-center gap-2 rounded-full border border-cream/20 px-5 py-2.5 text-[14px] text-cream/80 transition-colors hover:bg-white/5 hover:text-cream"
                  >
                    <Settings className="w-4 h-4" />
                    Configurar
                  </button>
                  <button
                    onClick={acceptNecessary}
                    className="rounded-full border border-cream/20 px-5 py-2.5 text-[14px] text-cream/80 transition-colors hover:bg-white/5 hover:text-cream"
                  >
                    Solo necesarias
                  </button>
                  <button
                    onClick={acceptAll}
                    className="rounded-full bg-cream-100 px-6 py-2.5 text-[14px] font-medium text-ink transition-colors hover:bg-white"
                  >
                    Aceptar todas
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Panel de Configuración Detallado
          <div className="mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-sm bg-paper-50">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between border-b border-paper-300 bg-paper-50 px-6 py-4">
              <div className="flex items-center gap-2">
                <Cookie className="w-6 h-6 text-accent-600" />
                <h2 className="text-xl font-bold text-ink">Configuración de cookies</h2>
              </div>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-paper-300 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="p-6 space-y-6">
              <p className="text-ink-700">
                Utilizamos diferentes tipos de cookies para optimizar tu experiencia en nuestro sitio web. 
                Puedes elegir qué cookies aceptar:
              </p>

              {/* Cookies Necesarias */}
              <div className="border rounded-lg p-4 bg-paper">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-ink mb-1">Cookies Necesarias</h3>
                    <p className="text-sm text-ink-600">
                      Esenciales para el funcionamiento del sitio web. No se pueden desactivar.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="relative inline-block w-12 h-6 bg-accent-500 rounded-full cursor-not-allowed opacity-50">
                      <div className="absolute right-1 top-1 bg-paper-50 w-4 h-4 rounded-full transition-transform"></div>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-ink-500 space-y-1">
                  <p>• <code className="bg-paper-300 px-1 rounded">auth_token</code> - Sesión de usuario</p>
                  <p>• <code className="bg-paper-300 px-1 rounded">cart_session</code> - Carrito de compra</p>
                </div>
              </div>

              {/* Cookies Analíticas */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-ink mb-1">Cookies Analíticas</h3>
                    <p className="text-sm text-ink-600">
                      Nos ayudan a entender cómo los visitantes interactúan con nuestro sitio mediante la recopilación anónima de información.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, analytics: !prev.analytics }))}
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                        preferences.analytics ? 'bg-accent-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 bg-paper-50 w-4 h-4 rounded-full transition-transform ${
                        preferences.analytics ? 'right-1' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
                <div className="text-xs text-ink-500 space-y-1">
                  <p>• Google Analytics (páginas visitadas, tiempo de navegación)</p>
                </div>
              </div>

              {/* Cookies de Marketing */}
              <div className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-ink mb-1">Cookies de Marketing</h3>
                    <p className="text-sm text-ink-600">
                      Se utilizan para mostrar anuncios relevantes y medir la efectividad de nuestras campañas publicitarias.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences(prev => ({ ...prev, marketing: !prev.marketing }))}
                      className={`relative inline-block w-12 h-6 rounded-full transition-colors ${
                        preferences.marketing ? 'bg-accent-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`absolute top-1 bg-paper-50 w-4 h-4 rounded-full transition-transform ${
                        preferences.marketing ? 'right-1' : 'left-1'
                      }`}></div>
                    </button>
                  </div>
                </div>
                <div className="text-xs text-ink-500 space-y-1">
                  <p>• Facebook Pixel (remarketing, audiencias)</p>
                  <p>• Google Ads (conversiones, anuncios)</p>
                </div>
              </div>

              {/* Info */}
              <div className="bg-accent-50 border-l-4 border-accent-600 p-4">
                <p className="text-sm text-ink-700">
                  ℹPuedes cambiar tus preferencias en cualquier momento desde el enlace "Configuración de cookies" en el pie de página.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-paper-50 border-t px-6 py-4 flex flex-col sm:flex-row gap-2">
              <button
                onClick={acceptNecessary}
                className="flex-1 px-4 py-2 bg-paper-300 hover:bg-gray-300 rounded-lg transition-colors text-sm font-medium"
              >
                Solo necesarias
              </button>
              <button
                onClick={saveCustom}
                className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Guardar preferencias
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-4 py-2 bg-accent hover:bg-accent-600/90 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Aceptar todas
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

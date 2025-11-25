import { Helmet } from 'react-helmet-async';
import { Cookie } from 'lucide-react';

const CookiesPage = () => {
  return (
    <>
      <Helmet>
        <title>Política de Cookies - ReSona Events</title>
        <meta name="description" content="Información sobre el uso de cookies en ReSona Events" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Cookie className="w-8 h-8 text-resona" />
              <h1 className="text-3xl font-bold text-gray-900">Política de Cookies</h1>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              Última actualización: 18 de noviembre de 2025
            </p>

            <div className="prose prose-blue max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">¿Qué son las Cookies?</h2>
                <p className="text-gray-700 mb-4">
                  Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita
                  un sitio web. Permiten que el sitio recuerde sus acciones y preferencias durante un período
                  de tiempo, mejorando su experiencia de navegación.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies que Utilizamos</h2>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Cookies Técnicas (Necesarias)</h3>
                <p className="text-gray-700 mb-4">
                  Estas cookies son esenciales para el funcionamiento del sitio web y no pueden desactivarse.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Cookie</th>
                        <th className="text-left py-2">Propósito</th>
                        <th className="text-left py-2">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2"><code className="text-xs">session_id</code></td>
                        <td className="py-2">Mantener la sesión del usuario</td>
                        <td className="py-2">Sesión</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2"><code className="text-xs">auth_token</code></td>
                        <td className="py-2">Autenticación del usuario</td>
                        <td className="py-2">7 días</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2"><code className="text-xs">cart</code></td>
                        <td className="py-2">Guardar contenido del carrito</td>
                        <td className="py-2">30 días</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code className="text-xs">cookie_consent</code></td>
                        <td className="py-2">Recordar preferencias de cookies</td>
                        <td className="py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Cookies Analíticas</h3>
                <p className="text-gray-700 mb-4">
                  Nos ayudan a entender cómo los visitantes interactúan con el sitio web. Toda la información
                  recopilada es anónima.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Cookie</th>
                        <th className="text-left py-2">Proveedor</th>
                        <th className="text-left py-2">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2"><code className="text-xs">_ga</code></td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">2 años</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2"><code className="text-xs">_gid</code></td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">24 horas</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code className="text-xs">_gat</code></td>
                        <td className="py-2">Google Analytics</td>
                        <td className="py-2">1 minuto</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Cookies de Marketing (Opcionales)</h3>
                <p className="text-gray-700 mb-4">
                  Se utilizan para mostrar anuncios relevantes. Requieren su consentimiento explícito.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Cookie</th>
                        <th className="text-left py-2">Proveedor</th>
                        <th className="text-left py-2">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2"><code className="text-xs">_fbp</code></td>
                        <td className="py-2">Facebook Pixel</td>
                        <td className="py-2">3 meses</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code className="text-xs">ads/ga-audiences</code></td>
                        <td className="py-2">Google Ads</td>
                        <td className="py-2">Sesión</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Cookies de Preferencias</h3>
                <p className="text-gray-700 mb-4">
                  Permiten recordar sus preferencias de uso del sitio web.
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Cookie</th>
                        <th className="text-left py-2">Propósito</th>
                        <th className="text-left py-2">Duración</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2"><code className="text-xs">theme</code></td>
                        <td className="py-2">Preferencia de tema (claro/oscuro)</td>
                        <td className="py-2">1 año</td>
                      </tr>
                      <tr>
                        <td className="py-2"><code className="text-xs">language</code></td>
                        <td className="py-2">Idioma preferido</td>
                        <td className="py-2">1 año</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies de Terceros</h2>
                <p className="text-gray-700 mb-4">
                  Utilizamos servicios de terceros que pueden establecer sus propias cookies:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Stripe:</strong> Procesamiento de pagos</li>
                  <li><strong>Google Analytics:</strong> Análisis de tráfico web</li>
                  <li><strong>Cloudinary:</strong> Optimización de imágenes</li>
                  <li><strong>SendGrid:</strong> Envío de emails</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Estos servicios tienen sus propias políticas de cookies:
                </p>
                <ul className="list-none text-gray-700 space-y-2">
                  <li>• Stripe: <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer" className="text-resona hover:underline">stripe.com/cookies-policy</a></li>
                  <li>• Google: <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-resona hover:underline">policies.google.com/technologies/cookies</a></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Cookies</h2>
                <p className="text-gray-700 mb-4">
                  Puede gestionar sus preferencias de cookies en cualquier momento:
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">Desde Nuestro Sitio Web</h3>
                <p className="text-gray-700 mb-4">
                  Use el panel de configuración de cookies que aparece en su primera visita, o acceda a él
                  haciendo clic en el enlace "Configuración de Cookies" en el pie de página.
                </p>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">Desde su Navegador</h3>
                <p className="text-gray-700 mb-4">
                  La mayoría de los navegadores permiten gestionar cookies en su configuración:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Chrome:</strong> Configuración → Privacidad y seguridad → Cookies</li>
                  <li><strong>Firefox:</strong> Opciones → Privacidad y seguridad → Cookies y datos del sitio</li>
                  <li><strong>Safari:</strong> Preferencias → Privacidad → Cookies y datos de sitios web</li>
                  <li><strong>Edge:</strong> Configuración → Cookies y permisos de sitio → Cookies</li>
                </ul>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>⚠️ Importante:</strong> Desactivar cookies puede afectar la funcionalidad del sitio
                    web. Algunas funciones pueden no estar disponibles sin cookies técnicas.
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Consentimiento</h2>
                <p className="text-gray-700 mb-4">
                  Al continuar navegando en nuestro sitio web después de ver el aviso de cookies, usted
                  acepta el uso de cookies necesarias. Para cookies analíticas y de marketing, necesitamos
                  su consentimiento explícito.
                </p>
                <p className="text-gray-700 mb-4">
                  Puede retirar su consentimiento en cualquier momento modificando sus preferencias de cookies.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Actualizaciones de esta Política</h2>
                <p className="text-gray-700 mb-4">
                  Podemos actualizar esta política ocasionalmente para reflejar cambios en nuestras prácticas
                  o en la legislación. La fecha de la última actualización se muestra al inicio de esta política.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Más Información</h2>
                <p className="text-gray-700 mb-4">
                  Para más información sobre cookies y su privacidad:
                </p>
                <ul className="list-none text-gray-700 space-y-2">
                  <li>• Agencia Española de Protección de Datos: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-resona hover:underline">www.aepd.es</a></li>
                  <li>• Your Online Choices: <a href="http://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer" className="text-resona hover:underline">www.youronlinechoices.com</a></li>
                  <li>• All About Cookies: <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" className="text-resona hover:underline">www.allaboutcookies.org</a></li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Contacto</h2>
                <p className="text-gray-700 mb-4">
                  Si tiene preguntas sobre nuestra política de cookies:
                </p>
                <ul className="list-none text-gray-700 space-y-2">
                  <li><strong>Email:</strong> privacidad@resonaevents.com</li>
                  <li><strong>Teléfono:</strong> +34 613 881 414</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CookiesPage;

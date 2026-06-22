import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEO/SEOHead';

export default function CookiesPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEOHead
        title="Política de Cookies | ReSona Events"
        description="Política de cookies de ReSona Events: qué cookies usamos, para qué sirven y cómo configurarlas o desactivarlas."
        canonicalUrl="https://resonaevents.com/politica-cookies"
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Cookies</h1>
          
          <p className="text-sm text-gray-600 mb-8">
            Última actualización: 25 de noviembre de 2025
          </p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. ¿Qué son las cookies?</h2>
              
              <p className="text-gray-700 mb-4">
                Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo 
                (ordenador, tablet o móvil) cuando visitas un sitio web. Permiten que el sitio 
                recuerde tus acciones y preferencias durante un período de tiempo.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                <p className="text-sm text-gray-700">
                  Las cookies NO pueden:
                </p>
                <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mt-2">
                  <li>Instalar virus o malware</li>
                  <li>Acceder a tu disco duro</li>
                  <li>Obtener datos personales sin tu conocimiento</li>
                </ul>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. ¿Para qué usamos cookies?</h2>
              
              <p className="text-gray-700 mb-4">
                En ReSona Events utilizamos cookies para:
              </p>
              
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Mantener tu sesión de usuario activa</li>
                <li>Recordar tus preferencias (idioma, configuración)</li>
                <li>Guardar tu carrito de compra</li>
                <li>Analizar cómo utilizas nuestro sitio web</li>
                <li>Mejorar la experiencia de navegación</li>
                <li>Mostrar contenido relevante</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Tipos de Cookies que Utilizamos</h2>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded mr-3">
                      ESENCIALES
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Cookies Técnicas (Necesarias)</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Finalidad:</strong> Funcionamiento básico del sitio
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Duración:</strong> Sesión o hasta 1 año
                      </p>
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Base legal:</strong> Interés legítimo (no requieren consentimiento)
                      </p>
                      
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2 border">Cookie</th>
                            <th className="text-left p-2 border">Finalidad</th>
                            <th className="text-left p-2 border">Duración</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border font-mono text-xs">auth_token</td>
                            <td className="p-2 border">Mantener sesión de usuario</td>
                            <td className="p-2 border">7 días</td>
                          </tr>
                          <tr>
                            <td className="p-2 border font-mono text-xs">cart_data</td>
                            <td className="p-2 border">Guardar carrito de compra</td>
                            <td className="p-2 border">30 días</td>
                          </tr>
                          <tr>
                            <td className="p-2 border font-mono text-xs">cookie_consent</td>
                            <td className="p-2 border">Recordar preferencias cookies</td>
                            <td className="p-2 border">1 año</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded mr-3">
                      ANALÍTICAS
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Cookies de Análisis</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Finalidad:</strong> Analizar uso del sitio web
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Duración:</strong> Hasta 2 años
                      </p>
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Base legal:</strong> Consentimiento
                      </p>
                      
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2 border">Cookie</th>
                            <th className="text-left p-2 border">Proveedor</th>
                            <th className="text-left p-2 border">Finalidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border font-mono text-xs">_ga</td>
                            <td className="p-2 border">Google Analytics</td>
                            <td className="p-2 border">Distinguir usuarios</td>
                          </tr>
                          <tr>
                            <td className="p-2 border font-mono text-xs">_gid</td>
                            <td className="p-2 border">Google Analytics</td>
                            <td className="p-2 border">Distinguir usuarios</td>
                          </tr>
                          <tr>
                            <td className="p-2 border font-mono text-xs">_gat</td>
                            <td className="p-2 border">Google Analytics</td>
                            <td className="p-2 border">Limitar velocidad peticiones</td>
                          </tr>
                        </tbody>
                      </table>

                      <div className="mt-3 p-3 bg-gray-50 rounded text-xs text-gray-600">
                        <p className="mb-1"><strong>Google Analytics:</strong></p>
                        <p>Información recopilada: Páginas visitadas, tiempo de permanencia, 
                        dispositivo, ubicación aproximada (ciudad), navegador.</p>
                        <p className="mt-2">
                          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                            Ver política de privacidad de Google
                          </a>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-start">
                    <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2 py-1 rounded mr-3">
                      PREFERENCIAS
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Cookies de Personalización</h4>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Finalidad:</strong> Recordar preferencias del usuario
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Duración:</strong> Hasta 1 año
                      </p>
                      <p className="text-sm text-gray-700 mb-3">
                        <strong>Base legal:</strong> Consentimiento
                      </p>
                      
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2 border">Cookie</th>
                            <th className="text-left p-2 border">Finalidad</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td className="p-2 border font-mono text-xs">user_preferences</td>
                            <td className="p-2 border">Idioma, configuración de vista</td>
                          </tr>
                          <tr>
                            <td className="p-2 border font-mono text-xs">filter_settings</td>
                            <td className="p-2 border">Filtros de búsqueda aplicados</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Cookies de Terceros</h2>
              
              <p className="text-gray-700 mb-4">
                Algunos servicios externos que utilizamos pueden instalar sus propias cookies:
              </p>

              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">🔒 Stripe (Procesamiento de Pagos)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Finalidad:</strong> Procesar pagos de forma segura
                  </p>
                  <p className="text-sm text-gray-700">
                    <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Política de privacidad de Stripe
                    </a>
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">📊 Google Analytics</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Finalidad:</strong> Estadísticas de uso del sitio
                  </p>
                  <p className="text-sm text-gray-700">
                    <a href="https://policies.google.com/technologies/cookies" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      Información sobre cookies de Google
                    </a>
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. ¿Cómo Gestionar las Cookies?</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Panel de Configuración</h3>
              <p className="text-gray-700 mb-4">
                Puedes gestionar tus preferencias de cookies desde nuestro panel de configuración 
                en cualquier momento:
              </p>
              
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition mb-6">
                ⚙️ Configurar Cookies
              </button>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Desde tu Navegador</h3>
              <p className="text-gray-700 mb-4">
                También puedes configurar cookies desde tu navegador:
              </p>

              <div className="space-y-2 mb-4">
                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm font-semibold text-gray-900">Chrome:</p>
                  <p className="text-sm text-gray-700">
                    Configuración → Privacidad y seguridad → Cookies y otros datos de sitios
                  </p>
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm font-semibold text-gray-900">Firefox:</p>
                  <p className="text-sm text-gray-700">
                    Opciones → Privacidad y seguridad → Cookies y datos del sitio
                  </p>
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm font-semibold text-gray-900">Safari:</p>
                  <p className="text-sm text-gray-700">
                    Preferencias → Privacidad → Gestionar datos de sitios web
                  </p>
                </div>

                <div className="bg-gray-50 rounded p-3">
                  <p className="text-sm font-semibold text-gray-900">Edge:</p>
                  <p className="text-sm text-gray-700">
                    Configuración → Privacidad, búsqueda y servicios → Cookies y permisos
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                <p className="text-sm text-gray-700">
                  <strong>Importante:</strong> Bloquear todas las cookies puede afectar al 
                  funcionamiento del sitio web y algunas funcionalidades podrían no estar disponibles.
                </p>
              </div>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Desactivar Google Analytics</h3>
              <p className="text-gray-700 mb-2">
                Puedes desactivar el seguimiento de Google Analytics instalando este complemento:
              </p>
              <p className="text-sm text-gray-700">
                <a 
                  href="https://tools.google.com/dlpage/gaoptout" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  Complemento de inhabilitación de Google Analytics
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Consentimiento</h2>
              
              <p className="text-gray-700 mb-4">
                Al acceder a nuestro sitio web por primera vez, verás un banner informativo 
                sobre el uso de cookies. Puedes:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Aceptar todas:</strong> Permite el uso de todas las cookies</li>
                <li><strong>Rechazar opcionales:</strong> Solo cookies técnicas necesarias</li>
                <li><strong>Configurar:</strong> Elegir qué tipos de cookies aceptas</li>
              </ul>

              <p className="text-gray-700 mb-4">
                Tu elección se guarda durante 1 año, después te volveremos a pedir tu consentimiento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Actualizaciones</h2>
              
              <p className="text-gray-700 mb-4">
                Esta Política de Cookies puede ser modificada en función de cambios legales o 
                en los servicios que utilizamos. Te recomendamos revisarla periódicamente.
              </p>
              
              <p className="text-gray-700 mb-4">
                La fecha de la última actualización aparece al inicio de este documento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Más Información</h2>
              
              <p className="text-gray-700 mb-4">
                Para más información sobre cómo tratamos tus datos personales, consulta nuestra:
              </p>
              
              <ul className="text-sm text-gray-700 space-y-2">
                <li>• <Link to="/politica-privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link></li>
                <li>• <Link to="/terminos-condiciones" className="text-blue-600 hover:underline">Términos y Condiciones</Link></li>
                <li>• <Link to="/aviso-legal" className="text-blue-600 hover:underline">Aviso Legal</Link></li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contacto</h2>
              
              <p className="text-gray-700 mb-4">
                Si tienes dudas sobre esta política de cookies:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>ReSona Events</strong><br />
                  <strong>Email:</strong> info@resonaevents.com<br />
                  <strong>Teléfono:</strong> 613 88 14 14
                </p>
              </div>
            </section>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              ← Volver a la página principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

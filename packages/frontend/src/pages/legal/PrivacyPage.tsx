import { Helmet } from 'react-helmet-async';
import { Shield } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <>
      <Helmet>
        <title>Política de Privacidad - ReSona Events</title>
        <meta name="description" content="Política de privacidad y protección de datos de ReSona Events" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-8 h-8 text-resona" />
              <h1 className="text-3xl font-bold text-gray-900">Política de Privacidad</h1>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              Última actualización: 18 de noviembre de 2025
            </p>

            <div className="prose prose-blue max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Información General</h2>
                <p className="text-gray-700 mb-4">
                  ReSona Events S.L. (en adelante, "ReSona Events", "nosotros" o "nuestro") es el responsable
                  del tratamiento de sus datos personales. Nos comprometemos a proteger su privacidad y cumplir
                  con el Reglamento General de Protección de Datos (RGPD) y la normativa española aplicable.
                </p>
                <div className="bg-blue-50 border-l-4 border-resona p-4 mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>Responsable:</strong> ReSona Events S.L.<br />
                    <strong>CIF:</strong> B-12345678<br />
                    <strong>Dirección:</strong> Calle Ejemplo 123, 28001 Madrid<br />
                    <strong>Email:</strong> privacidad@resonaevents.com<br />
                    <strong>Teléfono:</strong> +34 900 123 456
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Datos que Recopilamos</h2>
                <p className="text-gray-700 mb-4">
                  Recopilamos y tratamos los siguientes tipos de datos personales:
                </p>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Datos de Identificación</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Nombre y apellidos</li>
                  <li>DNI/NIE</li>
                  <li>Fecha de nacimiento</li>
                  <li>Email</li>
                  <li>Teléfono</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Datos de Facturación y Pago</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Dirección postal</li>
                  <li>NIF/CIF (para empresas)</li>
                  <li>Datos de pago (procesados por Stripe)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.3 Datos de Navegación</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Dirección IP</li>
                  <li>Tipo de navegador</li>
                  <li>Páginas visitadas</li>
                  <li>Cookies (ver <a href="/legal/cookies" className="text-resona hover:underline">Política de Cookies</a>)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.4 Datos del Evento</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Tipo de evento</li>
                  <li>Fecha y ubicación</li>
                  <li>Número de asistentes</li>
                  <li>Preferencias de equipos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Finalidad del Tratamiento</h2>
                <p className="text-gray-700 mb-4">
                  Utilizamos sus datos para:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Gestión de reservas:</strong> Procesar y gestionar sus pedidos de alquiler</li>
                  <li><strong>Facturación:</strong> Emitir facturas y gestionar pagos</li>
                  <li><strong>Comunicaciones:</strong> Enviar confirmaciones, recordatorios y actualizaciones</li>
                  <li><strong>Marketing:</strong> Enviar ofertas y promociones (con su consentimiento)</li>
                  <li><strong>Mejora del servicio:</strong> Analizar el uso del sitio web y mejorar la experiencia</li>
                  <li><strong>Cumplimiento legal:</strong> Cumplir con obligaciones legales y fiscales</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Base Legal del Tratamiento</h2>
                <p className="text-gray-700 mb-4">
                  Tratamos sus datos basándonos en:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Ejecución del contrato:</strong> Para procesar su reserva y prestar el servicio</li>
                  <li><strong>Consentimiento:</strong> Para enviar comunicaciones comerciales</li>
                  <li><strong>Obligación legal:</strong> Para cumplir con requisitos fiscales y contables</li>
                  <li><strong>Interés legítimo:</strong> Para mejorar nuestros servicios y prevenir fraudes</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Destinatarios de los Datos</h2>
                <p className="text-gray-700 mb-4">
                  Sus datos pueden ser compartidos con:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Stripe:</strong> Procesamiento de pagos (PCI DSS compliant)</li>
                  <li><strong>SendGrid:</strong> Envío de emails transaccionales</li>
                  <li><strong>Cloudinary:</strong> Almacenamiento de imágenes</li>
                  <li><strong>Google Analytics:</strong> Análisis del sitio web (datos anonimizados)</li>
                  <li><strong>Autoridades fiscales:</strong> Cuando sea legalmente requerido</li>
                  <li><strong>Proveedores de transporte:</strong> Solo nombre y dirección para entregas</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Todos nuestros proveedores están ubicados en la UE o cumplen con mecanismos de transferencia
                  internacional adecuados.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Conservación de los Datos</h2>
                <p className="text-gray-700 mb-4">
                  Conservamos sus datos durante:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Datos de facturación:</strong> 10 años (obligación legal)</li>
                  <li><strong>Datos de reservas:</strong> Mientras mantenga su cuenta activa</li>
                  <li><strong>Comunicaciones marketing:</strong> Hasta que retire su consentimiento</li>
                  <li><strong>Datos de navegación:</strong> Máximo 2 años</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Transcurridos estos plazos, los datos serán eliminados o anonimizados.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Sus Derechos</h2>
                <p className="text-gray-700 mb-4">
                  Tiene derecho a:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li><strong>Acceso:</strong> Obtener información sobre qué datos tenemos</li>
                  <li><strong>Rectificación:</strong> Corregir datos inexactos o incompletos</li>
                  <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos ("derecho al olvido")</li>
                  <li><strong>Oposición:</strong> Oponerse al tratamiento de sus datos</li>
                  <li><strong>Limitación:</strong> Restringir el tratamiento en ciertos casos</li>
                  <li><strong>Portabilidad:</strong> Recibir sus datos en formato estructurado</li>
                  <li><strong>Retirar consentimiento:</strong> En cualquier momento, sin afectar tratamientos previos</li>
                </ul>
                <p className="text-gray-700 mb-4">
                  Para ejercer estos derechos, contacte con: <a href="mailto:privacidad@resonaevents.com" className="text-resona hover:underline">privacidad@resonaevents.com</a>
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Seguridad de los Datos</h2>
                <p className="text-gray-700 mb-4">
                  Implementamos medidas técnicas y organizativas para proteger sus datos:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Cifrado SSL/TLS en todas las comunicaciones</li>
                  <li>Contraseñas hasheadas con bcrypt</li>
                  <li>Acceso restringido a datos personales</li>
                  <li>Copias de seguridad regulares</li>
                  <li>Auditorías de seguridad periódicas</li>
                  <li>Formación del personal en protección de datos</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Menores de Edad</h2>
                <p className="text-gray-700 mb-4">
                  Nuestros servicios están dirigidos a mayores de 18 años. No recopilamos intencionadamente
                  datos de menores. Si detecta que un menor ha proporcionado datos, contacte con nosotros
                  inmediatamente.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Cookies</h2>
                <p className="text-gray-700 mb-4">
                  Utilizamos cookies para mejorar su experiencia. Consulte nuestra{' '}
                  <a href="/legal/cookies" className="text-resona hover:underline">
                    Política de Cookies
                  </a>{' '}
                  para más información.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cambios en la Política</h2>
                <p className="text-gray-700 mb-4">
                  Podemos actualizar esta política ocasionalmente. Los cambios significativos se notificarán
                  por email o mediante un aviso destacado en el sitio web.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Reclamaciones</h2>
                <p className="text-gray-700 mb-4">
                  Si considera que no tratamos sus datos correctamente, puede presentar una reclamación ante
                  la Agencia Española de Protección de Datos (AEPD):
                </p>
                <div className="bg-gray-50 p-4 rounded-lg mb-4">
                  <p className="text-sm text-gray-700">
                    <strong>AEPD</strong><br />
                    C/ Jorge Juan, 6<br />
                    28001 Madrid<br />
                    Tel: 901 100 099 / 912 663 517<br />
                    Web: <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-resona hover:underline">www.aepd.es</a>
                  </p>
                </div>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contacto</h2>
                <p className="text-gray-700 mb-4">
                  Para cualquier consulta sobre esta política o el tratamiento de sus datos:
                </p>
                <ul className="list-none text-gray-700 space-y-2">
                  <li><strong>Email:</strong> privacidad@resonaevents.com</li>
                  <li><strong>Teléfono:</strong> +34 900 123 456</li>
                  <li><strong>Dirección:</strong> Calle Ejemplo 123, 28001 Madrid</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPage;

import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Política de Privacidad</h1>
          
          <p className="text-sm text-gray-600 mb-8">
            Última actualización: 25 de noviembre de 2025
          </p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Responsable del Tratamiento</h2>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                <p className="text-sm text-gray-700">
                  <strong>Identidad:</strong> ReSona Events<br />
                  <strong>NIF:</strong> [Pendiente]<br />
                  <strong>Dirección:</strong> Valencia, España<br />
                  <strong>Email:</strong> info@resonaevents.com<br />
                  <strong>Teléfono:</strong> 613 88 14 14<br />
                  <strong>Sitio web:</strong> resonaevents.com
                </p>
              </div>

              <p className="text-gray-700 mb-4">
                ReSona Events (en adelante, "el Responsable") es el responsable del tratamiento de 
                los datos personales que nos facilites a través de este sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Principios del Tratamiento</h2>
              
              <p className="text-gray-700 mb-4">
                El tratamiento de tus datos personales se rige por los siguientes principios:
              </p>
              
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Licitud, lealtad y transparencia:</strong> Tratamos tus datos de forma lícita y transparente</li>
                <li><strong>Limitación de la finalidad:</strong> Solo para los fines específicos informados</li>
                <li><strong>Minimización de datos:</strong> Solicitamos únicamente los datos necesarios</li>
                <li><strong>Exactitud:</strong> Mantenemos tus datos actualizados</li>
                <li><strong>Limitación del plazo de conservación:</strong> Durante el tiempo necesario</li>
                <li><strong>Integridad y confidencialidad:</strong> Con medidas de seguridad adecuadas</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Datos que Recopilamos</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Datos de Identificación</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Nombre y apellidos</li>
                <li>DNI/NIF</li>
                <li>Dirección postal</li>
                <li>Email</li>
                <li>Teléfono</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Datos de Navegación</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Dirección IP</li>
                <li>Navegador y dispositivo</li>
                <li>Páginas visitadas</li>
                <li>Fecha y hora de acceso</li>
                <li>Cookies (ver <Link to="/politica-cookies" className="text-blue-600 hover:underline">Política de Cookies</Link>)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Datos de Transacciones</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Datos de pago (procesados por Stripe, no almacenamos tarjetas)</li>
                <li>Historial de pedidos</li>
                <li>Preferencias de alquiler</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Finalidad del Tratamiento</h2>
              
              <p className="text-gray-700 mb-4">
                Tratamos tus datos para las siguientes finalidades:
              </p>

              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Gestión de Reservas y Pedidos</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Base legal:</strong> Ejecución del contrato de alquiler
                  </p>
                  <p className="text-sm text-gray-700">
                    Procesamiento de reservas, envío de confirmaciones, gestión de pagos, 
                    entrega y recogida de equipos.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Comunicaciones Comerciales</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Base legal:</strong> Consentimiento explícito
                  </p>
                  <p className="text-sm text-gray-700">
                    Envío de newsletters, ofertas y promociones (solo si has dado tu consentimiento).
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Atención al Cliente</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Base legal:</strong> Interés legítimo
                  </p>
                  <p className="text-sm text-gray-700">
                    Respuesta a consultas, soporte técnico, gestión de incidencias.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Obligaciones Legales</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Base legal:</strong> Cumplimiento legal
                  </p>
                  <p className="text-sm text-gray-700">
                    Facturación, declaraciones fiscales, atención a requerimientos judiciales.
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Análisis y Mejora</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Base legal:</strong> Interés legítimo
                  </p>
                  <p className="text-sm text-gray-700">
                    Análisis de uso del sitio web, mejora de servicios, estadísticas.
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Conservación de Datos</h2>
              
              <p className="text-gray-700 mb-4">
                Conservaremos tus datos durante los siguientes plazos:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Datos de clientes activos:</strong> Mientras exista relación comercial</li>
                <li><strong>Datos fiscales:</strong> 7 años (obligación legal)</li>
                <li><strong>Datos de marketing:</strong> Hasta que retires el consentimiento</li>
                <li><strong>Datos de navegación:</strong> Máximo 2 años</li>
              </ul>

              <p className="text-gray-700 mb-4">
                Transcurridos estos plazos, procederemos a la eliminación o anonimización de tus datos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Destinatarios de los Datos</h2>
              
              <p className="text-gray-700 mb-4">
                Tus datos pueden ser comunicados a:
              </p>

              <div className="space-y-3">
                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Proveedores de Servicios</h4>
                  <ul className="list-disc pl-6 text-sm text-gray-700 space-y-1 mt-2">
                    <li><strong>Stripe:</strong> Procesamiento de pagos (USA - Privacy Shield)</li>
                    <li><strong>Google Analytics:</strong> Análisis web (USA - Privacy Shield)</li>
                    <li><strong>Proveedor de hosting:</strong> Almacenamiento de datos (UE)</li>
                    <li><strong>Servicio de email:</strong> Envío de comunicaciones (UE)</li>
                  </ul>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Administraciones Públicas</h4>
                  <p className="text-sm text-gray-700 mt-2">
                    Hacienda, Seguridad Social, cuando sea legalmente obligatorio.
                  </p>
                </div>

                <div className="border-l-4 border-blue-500 pl-4">
                  <h4 className="font-semibold text-gray-900">Terceros con Consentimiento</h4>
                  <p className="text-sm text-gray-700 mt-2">
                    Solo compartiremos tus datos con terceros si has dado tu consentimiento expreso.
                  </p>
                </div>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                <p className="text-sm text-gray-700">
                  <strong>Importante:</strong> No vendemos, alquilamos ni cedemos tus datos a terceros 
                  con fines comerciales.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Transferencias Internacionales</h2>
              
              <p className="text-gray-700 mb-4">
                Algunos de nuestros proveedores están ubicados fuera del Espacio Económico Europeo (EEE):
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Google (Analytics):</strong> USA - Acuerdo Privacy Shield + Cláusulas Contractuales Tipo</li>
                <li><strong>Stripe (Pagos):</strong> USA - Acuerdo Privacy Shield + Certificaciones de seguridad</li>
              </ul>

              <p className="text-gray-700 mb-4">
                Estas transferencias cumplen con las garantías adecuadas establecidas en el RGPD.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Tus Derechos</h2>
              
              <p className="text-gray-700 mb-4">
                Como titular de los datos, tienes derecho a:
              </p>

              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Acceso</h4>
                  <p className="text-sm text-gray-700">
                    Saber qué datos tenemos sobre ti y obtener una copia.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Rectificación</h4>
                  <p className="text-sm text-gray-700">
                    Corregir datos inexactos o incompletos.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Supresión</h4>
                  <p className="text-sm text-gray-700">
                    Solicitar la eliminación de tus datos (derecho al olvido).
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Limitación</h4>
                  <p className="text-sm text-gray-700">
                    Solicitar que limitemos el tratamiento de tus datos.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Portabilidad</h4>
                  <p className="text-sm text-gray-700">
                    Recibir tus datos en formato estructurado y transmitirlos a otro responsable.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">✓ Oposición</h4>
                  <p className="text-sm text-gray-700">
                    Oponerte al tratamiento de tus datos (marketing directo).
                  </p>
                </div>
              </div>

              <div className="bg-green-50 border-l-4 border-green-500 p-4 my-4">
                <h4 className="font-semibold text-gray-900 mb-2">¿Cómo ejercer tus derechos?</h4>
                <p className="text-sm text-gray-700 mb-2">
                  Puedes ejercer tus derechos enviando un email a:
                </p>
                <p className="text-sm font-semibold text-gray-900">
                  info@resonaevents.com
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Indicando tu nombre, email y derecho que deseas ejercer. Responderemos en un 
                  plazo máximo de 1 mes.
                </p>
              </div>

              <p className="text-sm text-gray-700 mb-4">
                También tienes derecho a presentar una reclamación ante la <strong>Agencia Española 
                de Protección de Datos (AEPD)</strong> si consideras que hemos vulnerado tus derechos:
              </p>
              <p className="text-sm text-gray-700">
                <strong>AEPD:</strong> <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.aepd.es</a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Seguridad de los Datos</h2>
              
              <p className="text-gray-700 mb-4">
                Hemos implementado medidas de seguridad técnicas y organizativas para proteger 
                tus datos personales:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Cifrado SSL/TLS:</strong> Todas las comunicaciones están cifradas</li>
                <li><strong>Acceso restringido:</strong> Solo personal autorizado accede a los datos</li>
                <li><strong>Contraseñas seguras:</strong> Sistema de autenticación robusto</li>
                <li><strong>Copias de seguridad:</strong> Backups regulares de la base de datos</li>
                <li><strong>Actualización continua:</strong> Parches de seguridad aplicados regularmente</li>
              </ul>

              <p className="text-gray-700 mb-4">
                Sin embargo, ningún sistema es 100% seguro. Te recomendamos usar contraseñas fuertes 
                y no compartirlas con terceros.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Menores de Edad</h2>
              
              <p className="text-gray-700 mb-4">
                Nuestros servicios están dirigidos a mayores de 18 años. No recopilamos 
                intencionadamente datos de menores sin consentimiento parental.
              </p>
              <p className="text-gray-700 mb-4">
                Si eres menor de 18 años, necesitas el consentimiento de tus padres o tutores 
                para utilizar nuestros servicios.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Redes Sociales</h2>
              
              <p className="text-gray-700 mb-4">
                Si interactúas con nosotros a través de redes sociales (Facebook, Instagram, etc.), 
                el tratamiento de tus datos se regirá también por las políticas de privacidad de 
                dichas plataformas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Modificaciones</h2>
              
              <p className="text-gray-700 mb-4">
                Nos reservamos el derecho de modificar esta Política de Privacidad en cualquier momento. 
                Los cambios serán notificados a través del sitio web y, si son sustanciales, por email.
              </p>
              <p className="text-gray-700 mb-4">
                Te recomendamos revisar periódicamente esta política para estar informado de cómo 
                protegemos tus datos.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contacto</h2>
              
              <p className="text-gray-700 mb-4">
                Para cualquier consulta sobre esta política o el tratamiento de tus datos:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>ReSona Events</strong><br />
                  <strong>Email:</strong> info@resonaevents.com<br />
                  <strong>Teléfono:</strong> 613 88 14 14<br />
                  <strong>Dirección:</strong> Valencia, España
                </p>
              </div>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Documentos Relacionados</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <Link to="/terminos-condiciones" className="text-blue-600 hover:underline">Términos y Condiciones</Link></li>
                <li>• <Link to="/politica-cookies" className="text-blue-600 hover:underline">Política de Cookies</Link></li>
                <li>• <Link to="/aviso-legal" className="text-blue-600 hover:underline">Aviso Legal</Link></li>
              </ul>
            </div>
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

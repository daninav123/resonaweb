import { Link } from 'react-router-dom';

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Términos y Condiciones</h1>
          
          <p className="text-sm text-gray-600 mb-8">
            Última actualización: 25 de noviembre de 2025
          </p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Información General</h2>
              <p className="text-gray-700 mb-4">
                El presente documento regula las condiciones de uso y contratación de los servicios 
                ofrecidos por <strong>ReSona Events</strong> (en adelante, "la Empresa") a través de 
                su sitio web <strong>resonaevents.com</strong>.
              </p>
              <p className="text-gray-700 mb-4">
                Al utilizar nuestros servicios y realizar reservas, usted acepta estar sujeto a estos 
                términos y condiciones en su totalidad.
              </p>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                <p className="text-sm text-gray-700">
                  <strong>Datos de la Empresa:</strong><br />
                  ReSona Events<br />
                  <strong>Titular:</strong> Daniel Navarro Campos<br />
                  DNI: 03152623J<br />
                  Dirección: Valencia, España<br />
                  Email: info@resonaevents.com<br />
                  Teléfono: 613 88 14 14
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Objeto del Servicio</h2>
              <p className="text-gray-700 mb-4">
                ReSona Events se dedica al <strong>alquiler de equipos audiovisuales profesionales</strong> 
                para eventos, incluyendo pero no limitándose a:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Equipos de sonido (altavoces, subwoofers, mezcladores)</li>
                <li>Iluminación profesional (cabezas móviles, focos LED, efectos)</li>
                <li>Estructuras y truss</li>
                <li>Microfonía (micrófonos inalámbricos, petacas)</li>
                <li>Servicios técnicos de instalación y montaje</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Proceso de Reserva</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Solicitud de Presupuesto</h3>
              <p className="text-gray-700 mb-4">
                El cliente puede solicitar un presupuesto a través de:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>La calculadora de presupuesto en línea</li>
                <li>Formulario de contacto en la web</li>
                <li>Teléfono: 613 88 14 14</li>
                <li>Email: info@resonaevents.com</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Confirmación de Reserva</h3>
              <p className="text-gray-700 mb-4">
                La reserva se considera confirmada cuando:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>El cliente acepta el presupuesto</li>
                <li>Se realiza el pago del anticipo (si aplica)</li>
                <li>ReSona Events envía confirmación por escrito (email)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Disponibilidad</h3>
              <p className="text-gray-700 mb-4">
                Todos los equipos están sujetos a disponibilidad. ReSona Events se reserva el derecho 
                de rechazar una reserva si los equipos solicitados no están disponibles en las fechas indicadas.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Precios y Tarifas</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Tarifas de Alquiler</h3>
              <p className="text-gray-700 mb-4">
                Los precios se calculan según:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Día:</strong> Tarifa por día de alquiler</li>
                <li><strong>Fin de semana:</strong> Viernes a domingo (tarifa especial)</li>
                <li><strong>Semana completa:</strong> 7 días consecutivos (tarifa reducida)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Servicios Adicionales</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Entrega y recogida:</strong> Calculado según distancia y peso</li>
                <li><strong>Instalación técnica:</strong> Según complejidad del montaje</li>
                <li><strong>Operador técnico:</strong> Tarifa por hora/evento</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 IVA</h3>
              <p className="text-gray-700 mb-4">
                Todos los precios mostrados incluyen IVA (21%) salvo que se indique lo contrario.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Modalidades de Pago</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Opciones de Pago</h3>
              <p className="text-gray-700 mb-4">
                ReSona Events ofrece las siguientes modalidades:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Pago completo anticipado:</strong> 100% antes del evento (descuento 5%)</li>
                <li><strong>Pago parcial:</strong> 50% anticipo + 50% tras el evento</li>
                <li><strong>Clientes VIP:</strong> Pago diferido 30 días tras el evento (descuento 10%)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Métodos de Pago Aceptados</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Tarjeta de crédito/débito (Visa, Mastercard)</li>
                <li>Transferencia bancaria</li>
                <li>Bizum</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Fianza</h3>
              <p className="text-gray-700 mb-4">
                Para equipos de alto valor, se puede solicitar una fianza equivalente al 10% del valor 
                de reposición del equipo. La fianza se devuelve en un plazo de 7 días hábiles tras la 
                devolución del equipo en perfecto estado.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Entrega y Recogida</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Opciones de Entrega</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Recogida en almacén:</strong> Sin coste adicional</li>
                <li><strong>Entrega a domicilio:</strong> Según ubicación y volumen</li>
                <li><strong>Montaje in situ:</strong> Servicio técnico de instalación</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Horarios</h3>
              <p className="text-gray-700 mb-4">
                Entrega y recogida en horario laboral (09:00 - 20:00). Servicios fuera de horario 
                disponibles bajo petición con suplemento.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Responsabilidad</h3>
              <p className="text-gray-700 mb-4">
                El cliente es responsable del equipo desde el momento de la entrega hasta su devolución. 
                Debe verificar que todo el material esté completo y en buen estado en el momento de la entrega.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Uso del Equipo</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Condiciones de Uso</h3>
              <p className="text-gray-700 mb-4">
                El cliente se compromete a:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Usar el equipo de manera adecuada y profesional</li>
                <li>No realizar modificaciones o reparaciones no autorizadas</li>
                <li>Proteger el equipo de condiciones climáticas adversas</li>
                <li>No sublicenciar o ceder el alquiler a terceros</li>
                <li>Devolver el equipo en las mismas condiciones que se entregó</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Prohibiciones</h3>
              <p className="text-gray-700 mb-4">
                Queda expresamente prohibido:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Uso del equipo bajo efectos de alcohol o drogas</li>
                <li>Exposición del equipo a líquidos sin protección</li>
                <li>Transporte inadecuado sin embalaje apropiado</li>
                <li>Uso en exteriores sin protección contra lluvia</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cancelaciones y Modificaciones</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Cancelación por el Cliente</h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>Más de 15 días:</strong> Reembolso 100% (menos gastos gestión 5%)</li>
                <li><strong>7-14 días:</strong> Reembolso 50%</li>
                <li><strong>Menos de 7 días:</strong> Sin reembolso</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Modificaciones</h3>
              <p className="text-gray-700 mb-4">
                Las modificaciones de fecha o equipos están sujetas a disponibilidad y pueden 
                conllevar ajustes en el precio. No se cobran gastos de modificación si se realiza 
                con más de 7 días de antelación.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Cancelación por ReSona Events</h3>
              <p className="text-gray-700 mb-4">
                En caso de fuerza mayor o indisponibilidad imprevista del equipo, ReSona Events 
                ofrecerá equipos alternativos de características similares o reembolso completo.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Responsabilidades</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Responsabilidad del Cliente</h3>
              <p className="text-gray-700 mb-4">
                El cliente es responsable de:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Daños, pérdida o robo del equipo durante el periodo de alquiler</li>
                <li>Costes de reparación o reposición según valor de mercado</li>
                <li>Multas o sanciones derivadas del uso inadecuado</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Responsabilidad de ReSona Events</h3>
              <p className="text-gray-700 mb-4">
                ReSona Events garantiza:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Equipos en perfecto estado de funcionamiento</li>
                <li>Revisión técnica previa a cada alquiler</li>
                <li>Soporte técnico durante el evento (si se contrata)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.3 Limitación de Responsabilidad</h3>
              <p className="text-gray-700 mb-4">
                ReSona Events no se hace responsable de:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Pérdidas económicas derivadas de fallos técnicos imprevistos</li>
                <li>Daños indirectos o lucro cesante</li>
                <li>Uso inadecuado del equipo por parte del cliente</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Garantías y Mantenimiento</h2>
              
              <p className="text-gray-700 mb-4">
                Todo el equipo se entrega revisado y en perfecto estado. En caso de mal funcionamiento 
                durante el alquiler, el cliente debe notificarlo inmediatamente a ReSona Events.
              </p>
              <p className="text-gray-700 mb-4">
                Se proporcionará equipo de reemplazo o asistencia técnica en un plazo máximo de 4 horas 
                (sujeto a disponibilidad y ubicación).
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Protección de Datos</h2>
              
              <p className="text-gray-700 mb-4">
                Los datos personales proporcionados serán tratados conforme al <Link to="/politica-privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link> y 
                el Reglamento General de Protección de Datos (RGPD).
              </p>
              <p className="text-gray-700 mb-4">
                ReSona Events garantiza la confidencialidad de la información del cliente y no la 
                cederá a terceros sin consentimiento expreso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Propiedad Intelectual</h2>
              
              <p className="text-gray-700 mb-4">
                Todos los contenidos del sitio web (textos, imágenes, logos, diseño) son propiedad 
                de ReSona Events o de terceros que han autorizado su uso. Queda prohibida su 
                reproducción sin autorización.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Legislación Aplicable</h2>
              
              <p className="text-gray-700 mb-4">
                Estos términos se rigen por la legislación española. Para cualquier controversia, 
                las partes se someten a los juzgados y tribunales de Valencia, España.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">14. Modificaciones</h2>
              
              <p className="text-gray-700 mb-4">
                ReSona Events se reserva el derecho de modificar estos términos y condiciones en 
                cualquier momento. Los cambios serán notificados a través del sitio web y entrarán 
                en vigor inmediatamente tras su publicación.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">15. Contacto</h2>
              
              <p className="text-gray-700 mb-4">
                Para cualquier duda o consulta sobre estos términos:
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>ReSona Events</strong><br />
                  Email: info@resonaevents.com<br />
                  Teléfono: 613 88 14 14<br />
                  Dirección: Valencia, España
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

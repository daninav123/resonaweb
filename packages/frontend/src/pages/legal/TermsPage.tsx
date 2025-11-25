import { Helmet } from 'react-helmet-async';
import { FileText } from 'lucide-react';

const TermsPage = () => {
  return (
    <>
      <Helmet>
        <title>Términos y Condiciones - ReSona Events</title>
        <meta name="description" content="Términos y condiciones de uso del servicio de alquiler de ReSona Events" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-resona" />
              <h1 className="text-3xl font-bold text-gray-900">Términos y Condiciones</h1>
            </div>

            <p className="text-sm text-gray-500 mb-8">
              Última actualización: 18 de noviembre de 2025
            </p>

            <div className="prose prose-blue max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
                <p className="text-gray-700 mb-4">
                  Al acceder y utilizar los servicios de ReSona Events, usted acepta quedar vinculado por estos
                  términos y condiciones. Si no está de acuerdo con alguna parte de estos términos, no debe
                  utilizar nuestros servicios.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Servicios de Alquiler</h2>
                <p className="text-gray-700 mb-4">
                  ReSona Events ofrece servicios de alquiler de equipos de sonido, iluminación, fotografía y
                  video para eventos. Todos los equipos permanecen como propiedad de ReSona Events.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.1 Reservas</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Las reservas deben realizarse con un mínimo de 30 días de antelación para equipos bajo pedido</li>
                  <li>Se requiere un depósito del 30% para confirmar la reserva</li>
                  <li>El pago total debe realizarse antes de la recogida o entrega del equipo</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">2.2 Disponibilidad</h3>
                <p className="text-gray-700 mb-4">
                  La disponibilidad del equipo está sujeta a la confirmación final. Nos reservamos el derecho
                  de cancelar o modificar una reserva si el equipo no está disponible.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Precios y Pagos</h2>
                <p className="text-gray-700 mb-4">
                  Los precios están sujetos a cambios sin previo aviso. El precio confirmado en el momento de
                  la reserva será el precio final.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Métodos de Pago</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Tarjeta de crédito/débito (Visa, Mastercard, American Express)</li>
                  <li>Transferencia bancaria</li>
                  <li>Bizum</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Fianzas</h3>
                <p className="text-gray-700 mb-4">
                  Para entregas a domicilio, se requiere una fianza reembolsable que será devuelta tras la
                  devolución del equipo en perfectas condiciones. Las recogidas en tienda no requieren fianza.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Uso del Equipo</h2>
                <p className="text-gray-700 mb-4">
                  El cliente se compromete a:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Utilizar el equipo de manera responsable y según su uso previsto</li>
                  <li>No subarrendar o prestar el equipo a terceros sin autorización</li>
                  <li>Mantener el equipo seguro y en buenas condiciones</li>
                  <li>Notificar inmediatamente cualquier daño o mal funcionamiento</li>
                  <li>Devolver el equipo en la fecha acordada</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Daños y Pérdidas</h2>
                <p className="text-gray-700 mb-4">
                  El cliente es responsable de cualquier daño, pérdida o robo del equipo durante el período
                  de alquiler. Los costes de reparación o reposición serán deducidos de la fianza o facturados
                  por separado.
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Seguro</h3>
                <p className="text-gray-700 mb-4">
                  Recomendamos contratar un seguro adicional para cubrir daños accidentales. Consulte nuestras
                  opciones de seguro al realizar la reserva.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Cancelaciones y Modificaciones</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Cancelación por el Cliente</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Más de 30 días antes: Reembolso del 100% del depósito</li>
                  <li>15-30 días antes: Reembolso del 50% del depósito</li>
                  <li>Menos de 15 días: Sin reembolso</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Cancelación por ReSona Events</h3>
                <p className="text-gray-700 mb-4">
                  Si debemos cancelar por causas de fuerza mayor, reembolsaremos el 100% del importe pagado
                  y buscaremos alternativas similares si es posible.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Entrega y Recogida</h2>
                <p className="text-gray-700 mb-4">
                  Ofrecemos dos opciones:
                </p>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.1 Entrega a Domicilio</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Entrega y recogida en la dirección especificada</li>
                  <li>Coste adicional según ubicación y volumen</li>
                  <li>Requiere fianza reembolsable</li>
                  <li>Instalación opcional disponible</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">7.2 Recogida en Tienda</h3>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Sin coste adicional</li>
                  <li>Sin fianza requerida</li>
                  <li>Horario: L-V 9:00-18:00, S 9:00-14:00</li>
                  <li>Asesoramiento técnico incluido</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitación de Responsabilidad</h2>
                <p className="text-gray-700 mb-4">
                  ReSona Events no será responsable de:
                </p>
                <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                  <li>Pérdidas indirectas o consecuenciales</li>
                  <li>Fallos técnicos fuera de nuestro control</li>
                  <li>Uso inadecuado del equipo por parte del cliente</li>
                  <li>Eventos de fuerza mayor (condiciones climáticas extremas, etc.)</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Protección de Datos</h2>
                <p className="text-gray-700 mb-4">
                  Los datos personales se tratarán conforme a nuestra{' '}
                  <a href="/legal/privacidad" className="text-resona hover:underline">
                    Política de Privacidad
                  </a>{' '}
                  y la normativa RGPD vigente.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Ley Aplicable y Jurisdicción</h2>
                <p className="text-gray-700 mb-4">
                  Estos términos se rigen por la legislación española. Para cualquier controversia, las partes
                  se someten a los juzgados y tribunales de Valencia.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contacto</h2>
                <p className="text-gray-700 mb-4">
                  Para consultas sobre estos términos:
                </p>
                <ul className="list-none text-gray-700 space-y-2">
                  <li><strong>Email:</strong> info@resonaevents.com</li>
                  <li><strong>Teléfono:</strong> +34 613 881 414</li>
                  <li><strong>Dirección:</strong> C/ de l'Illa Cabrera, 13, Quatre Carreres, 46026 València, Valencia</li>
                </ul>
              </section>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TermsPage;

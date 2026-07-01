import { Link } from 'react-router-dom';
import SEOHead from '../../components/SEO/SEOHead';

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <SEOHead
        title="Aviso Legal | ReSona Rent"
        description="Datos identificativos y condiciones legales de ReSona Rent conforme a la LSSI-CE. Alquiler de material audiovisual en Valencia."
        canonicalUrl="https://resonarent.com/aviso-legal"
      />
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Aviso Legal</h1>
          
          <p className="text-sm text-gray-600 mb-8">
            Última actualización: 25 de noviembre de 2025
          </p>

          <div className="prose prose-blue max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Datos Identificativos</h2>
              
              <p className="text-gray-700 mb-4">
                En cumplimiento del artículo 10 de la Ley 34/2002, de 11 de julio, de Servicios de 
                la Sociedad de la Información y Comercio Electrónico (LSSI-CE), se informa a los 
                usuarios de los datos identificativos del titular de este sitio web:
              </p>

              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-4">
                <p className="text-sm text-gray-700 space-y-1">
                  <strong>Denominación Social:</strong> ReSona Rent<br />
                  <strong>Titular:</strong> Daniel Navarro Campos<br />
                  <strong>DNI:</strong> 03152623J<br />
                  <strong>Domicilio Social:</strong> Valencia, España<br />
                  <strong>Teléfono:</strong> 613 88 14 14<br />
                  <strong>Email:</strong> info@resonarent.com<br />
                  <strong>Sitio web:</strong> resonarent.com<br />
                  <strong>Actividad:</strong> Alquiler de equipos audiovisuales para eventos
                </p>
              </div>

              <p className="text-gray-700 mb-4">
                ReSona Rent (en adelante, "el Titular") es el propietario y responsable del 
                presente sitio web.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Objeto y Aceptación</h2>
              
              <p className="text-gray-700 mb-4">
                El presente Aviso Legal regula el uso y utilización del sitio web <strong>resonarent.com</strong>, 
                del que es titular ReSona Rent.
              </p>

              <p className="text-gray-700 mb-4">
                La navegación por el sitio web atribuye la condición de usuario del mismo e implica 
                la aceptación plena y sin reservas de todas las disposiciones incluidas en este 
                Aviso Legal.
              </p>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-4">
                <p className="text-sm text-gray-700">
                  <strong>Importante:</strong> Si no está de acuerdo con cualquiera de las condiciones 
                  aquí establecidas, no debe usar ni acceder a este sitio web.
                </p>
              </div>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Condiciones de Acceso y Uso</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Carácter Gratuito</h3>
              <p className="text-gray-700 mb-4">
                La navegación por este sitio web es gratuita, sin perjuicio de los costes de 
                conexión a través de la red de telecomunicaciones suministrada por el proveedor 
                de acceso contratado por los usuarios.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Uso Correcto</h3>
              <p className="text-gray-700 mb-4">
                El usuario se compromete a utilizar el sitio web de conformidad con la ley y el 
                presente Aviso Legal. El usuario está expresamente prohibido:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Realizar actividades ilícitas, ilegales o contrarias a la buena fe</li>
                <li>Difundir contenidos delictivos, violentos, pornográficos, racistas o xenófobos</li>
                <li>Provocar daños en los sistemas físicos y lógicos del sitio web</li>
                <li>Introducir o difundir virus informáticos o cualquier código malicioso</li>
                <li>Intentar acceder, usar o manipular las áreas restringidas del sitio</li>
                <li>Realizar ingeniería inversa o intentar extraer el código fuente</li>
                <li>Utilizar robots, spiders o cualquier herramienta automatizada no autorizada</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Contenidos</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Veracidad</h3>
              <p className="text-gray-700 mb-4">
                El Titular se compromete a mantener la información publicada en el sitio web 
                actualizada y veraz. Sin embargo, no garantiza la ausencia de errores u omisiones, 
                ni que el contenido esté actualizado en todo momento.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Disponibilidad</h3>
              <p className="text-gray-700 mb-4">
                El Titular no garantiza la disponibilidad ininterrumpida del sitio web. Pueden 
                producirse interrupciones por:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Tareas de mantenimiento y actualizaciones</li>
                <li>Problemas técnicos del servidor o infraestructura</li>
                <li>Causas de fuerza mayor</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Modificaciones</h3>
              <p className="text-gray-700 mb-4">
                El Titular se reserva el derecho a modificar, actualizar o eliminar los contenidos 
                del sitio web sin previo aviso.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Propiedad Intelectual e Industrial</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Derechos de Autor</h3>
              <p className="text-gray-700 mb-4">
                Todos los contenidos del sitio web (textos, imágenes, logotipos, iconos, fotografías, 
                software, estructura, diseño gráfico, código fuente, etc.) son propiedad de ReSona Rent 
                o de terceros que han autorizado su uso.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Protección Legal</h3>
              <p className="text-gray-700 mb-4">
                Estos contenidos están protegidos por las leyes de propiedad intelectual e industrial:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Real Decreto Legislativo 1/1996 (Texto Refundido de la Ley de Propiedad Intelectual)</li>
                <li>Ley 17/2001 de Marcas</li>
                <li>Normativa europea e internacional aplicable</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Uso Permitido</h3>
              <p className="text-gray-700 mb-4">
                El usuario puede:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>✓ Visualizar los contenidos para uso personal y privado</li>
                <li>✓ Descargar o imprimir material para uso privado no comercial</li>
              </ul>

              <p className="text-gray-700 mb-4">
                Queda expresamente prohibido:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>✗ Reproducción, distribución o comunicación pública sin autorización</li>
                <li>✗ Modificación, transformación o alteración de los contenidos</li>
                <li>✗ Eliminación de marcas, logos o avisos de propiedad intelectual</li>
                <li>✗ Uso comercial de los contenidos sin licencia</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Enlaces Externos (Links)</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Enlaces Salientes</h3>
              <p className="text-gray-700 mb-4">
                El sitio web puede contener enlaces a sitios web de terceros. ReSona Rent no 
                controla ni es responsable del contenido, políticas de privacidad o prácticas 
                de estos sitios externos.
              </p>

              <p className="text-gray-700 mb-4">
                La inclusión de enlaces no implica:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Aprobación o recomendación de los sitios enlazados</li>
                <li>Relación comercial con los propietarios de dichos sitios</li>
                <li>Responsabilidad sobre su contenido o servicios</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Enlaces Entrantes</h3>
              <p className="text-gray-700 mb-4">
                Si desea establecer un enlace hacia nuestro sitio web, debe solicitar autorización 
                previa contactando a: info@resonarent.com
              </p>

              <p className="text-gray-700 mb-4">
                No está permitido:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Enlazar directamente a archivos internos (deep linking) sin autorización</li>
                <li>Presentar nuestro contenido en frames o ventanas de otro sitio</li>
                <li>Realizar afirmaciones falsas sobre relación con ReSona Rent</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Protección de Datos</h2>
              
              <p className="text-gray-700 mb-4">
                El tratamiento de datos personales se rige por nuestra <Link to="/politica-privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link>, 
                elaborada conforme al Reglamento (UE) 2016/679 (RGPD) y la Ley Orgánica 3/2018 (LOPDGDD).
              </p>

              <p className="text-gray-700 mb-4">
                Para más información sobre cómo tratamos tus datos personales, consulta nuestra 
                política de privacidad.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies</h2>
              
              <p className="text-gray-700 mb-4">
                Este sitio web utiliza cookies propias y de terceros. Para más información, 
                consulta nuestra <Link to="/politica-cookies" className="text-blue-600 hover:underline">Política de Cookies</Link>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Responsabilidad</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Limitación de Responsabilidad</h3>
              <p className="text-gray-700 mb-4">
                El Titular no se hace responsable de:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>Daños derivados de la falta de disponibilidad o continuidad del sitio web</li>
                <li>Fallos técnicos, interrupciones o desconexiones del servicio</li>
                <li>Daños por virus, malware o códigos maliciosos de terceros</li>
                <li>Uso ilícito o indebido del sitio web por parte de los usuarios</li>
                <li>Contenidos publicados por terceros o enlaces externos</li>
                <li>Pérdida de datos o información durante la navegación</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Exclusión de Garantías</h3>
              <p className="text-gray-700 mb-4">
                El Titular no garantiza:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li>La ausencia total de errores en los contenidos</li>
                <li>La actualización permanente de toda la información</li>
                <li>Que el sitio esté libre de virus o componentes dañinos</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Legislación Aplicable y Jurisdicción</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Legislación</h3>
              <p className="text-gray-700 mb-4">
                El presente Aviso Legal se rige por la legislación española vigente.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Resolución de Conflictos</h3>
              <p className="text-gray-700 mb-4">
                Para la resolución de cualquier controversia o cuestión relacionada con este sitio 
                web o sus contenidos, las partes se someten expresamente a los Juzgados y Tribunales 
                de <strong>Valencia, España</strong>, con renuncia a cualquier otro fuero que pudiera corresponderles.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Resolución Online de Litigios</h3>
              <p className="text-gray-700 mb-4">
                Conforme al Reglamento (UE) 524/2013, la Comisión Europea facilita una plataforma 
                de resolución de litigios online (ODR) accesible en:
              </p>
              <p className="text-sm text-gray-700 mb-4">
                <a 
                  href="https://ec.europa.eu/consumers/odr" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-600 hover:underline"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Modificaciones</h2>
              
              <p className="text-gray-700 mb-4">
                ReSona Rent se reserva el derecho a modificar el presente Aviso Legal en cualquier 
                momento, con el objetivo de adaptarlo a cambios legislativos o jurisprudenciales, 
                así como a prácticas del sector.
              </p>

              <p className="text-gray-700 mb-4">
                Se recomienda al usuario revisar periódicamente este Aviso Legal. La fecha de la 
                última actualización aparece al inicio del documento.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Normativa Aplicable</h2>
              
              <p className="text-gray-700 mb-4">
                Este sitio web cumple con la siguiente normativa:
              </p>

              <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                <li><strong>LSSI-CE:</strong> Ley 34/2002, de Servicios de la Sociedad de la Información</li>
                <li><strong>RGPD:</strong> Reglamento (UE) 2016/679 de Protección de Datos</li>
                <li><strong>LOPDGDD:</strong> Ley Orgánica 3/2018 de Protección de Datos</li>
                <li><strong>TRLPI:</strong> Real Decreto Legislativo 1/1996 de Propiedad Intelectual</li>
                <li><strong>Ley de Marcas:</strong> Ley 17/2001</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contacto</h2>
              
              <p className="text-gray-700 mb-4">
                Para cualquier consulta relacionada con este Aviso Legal:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700">
                  <strong>ReSona Rent</strong><br />
                  <strong>Dirección:</strong> Valencia, España<br />
                  <strong>Teléfono:</strong> 613 88 14 14<br />
                  <strong>Email:</strong> info@resonarent.com<br />
                  <strong>Web:</strong> resonarent.com
                </p>
              </div>
            </section>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <h3 className="font-semibold text-gray-900 mb-2">📋 Documentos Relacionados</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• <Link to="/terminos-condiciones" className="text-blue-600 hover:underline">Términos y Condiciones</Link></li>
                <li>• <Link to="/politica-privacidad" className="text-blue-600 hover:underline">Política de Privacidad</Link></li>
                <li>• <Link to="/politica-cookies" className="text-blue-600 hover:underline">Política de Cookies</Link></li>
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

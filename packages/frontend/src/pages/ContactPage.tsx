import SEOHead from '../components/SEO/SEOHead';

const ContactPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEOHead
        title="Contacto - Solicita tu Presupuesto | Resona Events"
        description="Solicita presupuesto personalizado para tu evento. Atención profesional y respuesta en 24h. Teléfono, email y formulario de contacto."
        keywords="contacto resona, presupuesto eventos, solicitar presupuesto alquiler material"
        canonicalUrl="https://resona.com/contacto"
      />
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Contacto</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600">Página de contacto en construcción...</p>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;

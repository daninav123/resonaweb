import SEOHead from '../components/SEO/SEOHead';

const AboutPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <SEOHead
        title="Sobre Nosotros - Resona Events | Empresa de Alquiler de Material"
        description="Conoce Resona Events, empresa líder en alquiler de material para eventos. Equipos profesionales, servicio de calidad y experiencia garantizada."
        keywords="sobre resona, empresa alquiler material eventos, servicio profesional eventos"
        canonicalUrl="https://resona.com/sobre-nosotros"
      />
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Sobre Nosotros</h1>
        <div className="bg-white rounded-lg shadow-md p-8">
          <p className="text-gray-600">Página sobre nosotros en construcción...</p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;

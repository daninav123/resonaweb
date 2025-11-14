import { Link } from 'react-router-dom';
import { Camera, Music, Lightbulb, Video, Headphones, Sparkles, Users, Clock, Shield, Phone } from 'lucide-react';

const ServicesPage = () => {
  const mainServices = [
    {
      icon: Camera,
      title: 'Alquiler de Equipos Fotográficos',
      description: 'Cámaras profesionales, objetivos, trípodes y accesorios para capturar cada momento perfectamente.',
      features: [
        'Cámaras DSLR y mirrorless',
        'Objetivos de todas las focales',
        'Iluminación de estudio',
        'Trípodes y estabilizadores'
      ],
      image: '📷',
    },
    {
      icon: Video,
      title: 'Equipos de Video Profesional',
      description: 'Todo lo necesario para producción de video de alta calidad, desde cámaras hasta equipos de grabación.',
      features: [
        'Cámaras de video 4K/8K',
        'Gimbals y steadicams',
        'Equipos de grabación de audio',
        'Monitores profesionales'
      ],
      image: '🎥',
    },
    {
      icon: Music,
      title: 'Sistemas de Sonido',
      description: 'Equipos de audio profesional para eventos de cualquier tamaño, desde bodas hasta conciertos.',
      features: [
        'Altavoces y subwoofers',
        'Mesas de mezclas',
        'Micrófonos inalámbricos',
        'Sistemas de monitorización'
      ],
      image: '🎵',
    },
    {
      icon: Lightbulb,
      title: 'Iluminación para Eventos',
      description: 'Iluminación escénica y ambiental para crear la atmósfera perfecta en tu evento.',
      features: [
        'Focos LED RGB',
        'Moving heads',
        'Proyectores y gobos',
        'Controladores DMX'
      ],
      image: '💡',
    },
  ];

  const additionalServices = [
    {
      icon: Users,
      title: 'Asesoramiento Técnico',
      description: 'Nuestro equipo te ayuda a elegir el equipamiento perfecto para tu evento.',
    },
    {
      icon: Clock,
      title: 'Alquiler Flexible',
      description: 'Desde unas horas hasta varios días. Adaptamos el alquiler a tus necesidades.',
    },
    {
      icon: Shield,
      title: 'Equipos Asegurados',
      description: 'Todos nuestros equipos están asegurados y en perfecto estado.',
    },
    {
      icon: Phone,
      title: 'Soporte 24/7',
      description: 'Asistencia técnica disponible durante todo el periodo de alquiler.',
    },
  ];

  const packages = [
    {
      name: 'Paquete Boda',
      description: 'Todo lo necesario para inmortalizar tu día especial',
      price: '€450',
      duration: '1 día',
      includes: [
        '2 Cámaras DSLR profesionales',
        'Sistema de sonido completo',
        'Iluminación ambiental',
        'Micrófonos inalámbricos',
        'Soporte técnico incluido',
      ],
      popular: true,
    },
    {
      name: 'Paquete Concierto',
      description: 'Equipo profesional para eventos musicales',
      price: '€850',
      duration: '1 día',
      includes: [
        'Sistema de PA completo',
        'Iluminación escénica RGB',
        'Mesa de mezclas digital',
        '6 Micrófonos profesionales',
        'Técnico de sonido incluido',
      ],
      popular: false,
    },
    {
      name: 'Paquete Corporativo',
      description: 'Equipamiento para eventos empresariales',
      price: '€350',
      duration: '1 día',
      includes: [
        'Sistema de proyección',
        'Micrófonos de conferencia',
        'Sistema de sonido portátil',
        'Iluminación profesional',
        'Instalación incluida',
      ],
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Nuestros Servicios</h1>
            <p className="text-xl text-blue-100 mb-8">
              Equipamiento profesional de alta gama para hacer de tu evento una experiencia inolvidable
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/productos"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Ver Catálogo
              </Link>
              <Link
                to="/contacto"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Contactar
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Servicios Principales</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Ofrecemos una amplia gama de equipos profesionales para todo tipo de eventos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {mainServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="text-6xl">{service.image}</div>
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
                    <p className="text-gray-600 mb-4">{service.description}</p>
                    <ul className="space-y-2">
                      {service.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center gap-2 text-gray-700">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-gray-50 px-8 py-4">
                    <Link
                      to={`/productos?category=${service.title.toLowerCase().split(' ')[0]}`}
                      className="text-blue-600 font-semibold hover:text-blue-700 inline-flex items-center gap-2"
                    >
                      Ver equipos disponibles
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Additional Services */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Servicios Adicionales</h2>
            <p className="text-lg text-gray-600">
              Más que alquiler, una experiencia completa
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {additionalServices.map((service, index) => {
              const Icon = service.icon;
              return (
                <div
                  key={index}
                  className="text-center p-6 rounded-lg hover:bg-gray-50 transition"
                >
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{service.title}</h3>
                  <p className="text-gray-600 text-sm">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Paquetes Populares</h2>
            <p className="text-lg text-gray-600">
              Soluciones completas para tu evento al mejor precio
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl shadow-lg overflow-hidden ${
                  pkg.popular ? 'ring-2 ring-blue-600 transform scale-105' : ''
                }`}
              >
                {pkg.popular && (
                  <div className="bg-blue-600 text-white text-center py-2 text-sm font-semibold">
                    ⭐ Más Popular
                  </div>
                )}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h3>
                  <p className="text-gray-600 mb-6">{pkg.description}</p>
                  
                  <div className="mb-6">
                    <div className="text-4xl font-bold text-blue-600 mb-1">{pkg.price}</div>
                    <div className="text-gray-500 text-sm">{pkg.duration}</div>
                  </div>

                  <div className="space-y-3 mb-8">
                    {pkg.includes.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>

                  <Link
                    to="/contacto"
                    className={`block text-center py-3 rounded-lg font-semibold transition ${
                      pkg.popular
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Reservar Paquete
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">
              ¿Necesitas algo personalizado?
            </p>
            <Link
              to="/contacto"
              className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700"
            >
              Solicita un presupuesto personalizado
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">¿Listo para tu evento?</h2>
            <p className="text-xl text-blue-100 mb-8">
              Contáctanos y te ayudaremos a elegir el equipamiento perfecto
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                to="/productos"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
              >
                Explorar Catálogo
              </Link>
              <Link
                to="/contacto"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition"
              >
                Contactar Ahora
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap justify-center gap-8 text-blue-100">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                <span>+34 600 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>info@resona.com</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;

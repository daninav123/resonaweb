import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Music, Lightbulb, Video, Sparkles, ArrowRight, Phone, Mail } from 'lucide-react';

const ServicesPage = () => {
  const serviceCategories = [
    {
      category: 'Sonido',
      icon: '🔊',
      color: 'from-blue-500 to-blue-700',
      services: [
        {
          title: 'Alquiler de Sonido en Valencia',
          description: 'Equipos profesionales de última generación',
          url: '/servicios/alquiler-sonido-valencia',
          popular: true
        },
        {
          title: 'Altavoces Profesionales',
          description: 'JBL, QSC, EV - Máxima potencia',
          url: '/servicios/alquiler-altavoces-profesionales'
        },
        {
          title: 'Micrófonos Inalámbricos',
          description: 'Shure, Sennheiser - Sin cables',
          url: '/servicios/alquiler-microfonos-inalambricos'
        },
        {
          title: 'Sonido para Bodas',
          description: 'Ceremonia, banquete y fiesta',
          url: '/servicios/sonido-bodas-valencia',
          popular: true
        },
        {
          title: 'Sonido Eventos Corporativos',
          description: 'Conferencias y presentaciones',
          url: '/servicios/sonido-eventos-corporativos-valencia'
        },
        {
          title: 'Mesa de Mezclas DJ',
          description: 'Pioneer, Allen & Heath',
          url: '/servicios/alquiler-mesa-mezclas-dj'
        },
        {
          title: 'Subwoofers Profesionales',
          description: 'Graves potentes para tu fiesta',
          url: '/servicios/alquiler-subwoofers-graves'
        }
      ]
    },
    {
      category: 'Iluminación',
      icon: '💡',
      color: 'from-yellow-500 to-orange-600',
      services: [
        {
          title: 'Iluminación para Bodas',
          description: 'Ambiental y arquitectónica',
          url: '/servicios/alquiler-iluminacion-bodas-valencia',
          popular: true
        },
        {
          title: 'Iluminación LED Profesional',
          description: 'RGB, RGBW - Millones de colores',
          url: '/servicios/iluminacion-led-profesional'
        },
        {
          title: 'Iluminación para Escenarios',
          description: 'Conciertos y shows',
          url: '/servicios/iluminacion-escenarios-eventos'
        },
        {
          title: 'Moving Heads',
          description: 'Luces inteligentes robotizadas',
          url: '/servicios/alquiler-moving-heads'
        },
        {
          title: 'Iluminación Arquitectónica',
          description: 'Uplights LED para fachadas',
          url: '/servicios/iluminacion-arquitectonica-eventos'
        },
        {
          title: 'Láser Profesional',
          description: 'Efectos espectaculares',
          url: '/servicios/alquiler-laser-eventos'
        }
      ]
    },
    {
      category: 'Video y Pantallas',
      icon: '🎥',
      color: 'from-purple-500 to-purple-700',
      services: [
        {
          title: 'Pantallas LED',
          description: 'Modulares de alta resolución',
          url: '/servicios/alquiler-pantallas-led-eventos'
        },
        {
          title: 'Proyectores Profesionales',
          description: 'Alta luminosidad 3.000-12.000 lúmenes',
          url: '/servicios/alquiler-proyectores-profesionales'
        },
        {
          title: 'Videoescenarios y Streaming',
          description: 'Producción en vivo',
          url: '/servicios/videoescenarios-streaming-eventos'
        }
      ]
    },
    {
      category: 'Otros Servicios',
      icon: '🎭',
      color: 'from-green-500 to-green-700',
      services: [
        {
          title: 'DJ Profesional',
          description: 'Música perfecta para tu evento',
          url: '/servicios/alquiler-dj-valencia',
          popular: true
        },
        {
          title: 'Producción Técnica Completa',
          description: 'Gestión integral audiovisual',
          url: '/servicios/produccion-tecnica-eventos-valencia'
        },
        {
          title: 'Estructuras Truss',
          description: 'Montajes profesionales certificados',
          url: '/servicios/alquiler-estructuras-truss'
        },
        {
          title: 'Máquinas FX',
          description: 'Humo, CO2, confeti',
          url: '/servicios/alquiler-maquinas-fx-humo-confeti'
        }
      ]
    }
  ];

  return (
    <>
      <Helmet>
        <title>Servicios Profesionales de Alquiler | Sonido, Iluminación, Video | ReSona Events</title>
        <meta name="description" content="Alquiler profesional de sonido, iluminación, pantallas LED, DJ y producción técnica para eventos en Valencia. Más de 20 servicios especializados." />
        <meta name="keywords" content="alquiler sonido valencia, iluminación eventos, pantallas led, dj profesional, producción técnica" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-purple-700 to-purple-900 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Servicios Profesionales para Eventos
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-purple-100">
                Más de 20 servicios especializados en sonido, iluminación, vídeo y producción técnica
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/34613881414"
                  className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  WhatsApp: 613 88 14 14
                </a>
                <Link
                  to="/calculadora-eventos"
                  className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-purple-700 font-bold py-4 px-8 rounded-lg transition-all"
                >
                  Calculadora de Presupuesto
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Services by Category */}
        {serviceCategories.map((category, catIndex) => (
          <section key={catIndex} className={`py-16 ${catIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-center gap-4 mb-12">
                <span className="text-5xl">{category.icon}</span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{category.category}</h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                {category.services.map((service, index) => (
                  <Link
                    key={index}
                    to={service.url}
                    className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
                  >
                    {service.popular && (
                      <div className="absolute top-3 right-3 z-10">
                        <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                          ⭐ Popular
                        </span>
                      </div>
                    )}

                    <div className={`h-2 bg-gradient-to-r ${category.color}`}></div>
                    
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4">
                        {service.description}
                      </p>
                      <div className="flex items-center text-purple-700 font-semibold text-sm group-hover:gap-2 transition-all">
                        Ver detalles
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:ml-2 transition-all" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        ))}

        {/* CTA Final */}
        <section className="py-20 bg-gradient-to-br from-purple-700 to-purple-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              ¿Necesitas ayuda para elegir?
            </h2>
            <p className="text-xl mb-8 text-purple-100 max-w-2xl mx-auto">
              Nuestro equipo de expertos te asesora gratuitamente para encontrar el servicio perfecto para tu evento
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <a
                href="https://wa.me/34613881414"
                className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
              >
                <Phone className="w-5 h-5 mr-2" />
                Contactar por WhatsApp
              </a>
              <a
                href="mailto:info@resonaevents.com"
                className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-purple-700 font-bold py-4 px-8 rounded-lg transition-all"
              >
                <Mail className="w-5 h-5 mr-2" />
                Enviar Email
              </a>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-purple-200">
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Presupuesto en 24h</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Equipos profesionales</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✅</span>
                <span>Técnicos especializados</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServicesPage;

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Phone, Mail, Calculator, CheckCircle } from 'lucide-react';

interface Package {
  name: string;
  subtitle: string;
  price: string;
  features: string[];
  highlighted?: boolean;
}

interface ServicePageProps {
  title: string;
  metaDescription: string;
  keywords: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage?: string;
  introduction: string;
  whyChooseUs: Array<{
    icon: string;
    title: string;
    description: string;
  }>;
  packages: Package[];
  technicalSpecs?: Array<{
    title: string;
    items: string[];
  }>;
  faqs: Array<{
    question: string;
    answer: string;
  }>;
  relatedServices?: Array<{
    title: string;
    url: string;
  }>;
}

const ServicePageTemplate: React.FC<ServicePageProps> = ({
  title,
  metaDescription,
  keywords,
  heroTitle,
  heroSubtitle,
  heroImage,
  introduction,
  whyChooseUs,
  packages,
  technicalSpecs,
  faqs,
  relatedServices,
}) => {
  const currentUrl = typeof window !== 'undefined' ? `https://resonaweb.vercel.app${window.location.pathname}` : '';
  
  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />
        <link rel="canonical" href={currentUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={title} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="ReSona Events Valencia" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={metaDescription} />
        
        {/* Schema FAQPage */}
        {faqs && faqs.length > 0 && (
          <script type="application/ld+json">
            {JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })}
          </script>
        )}
        
        {/* Schema Service + LocalBusiness */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "serviceType": heroTitle,
            "provider": {
              "@type": "LocalBusiness",
              "@id": "https://resonaweb.vercel.app",
              "name": "ReSona Events",
              "image": "https://resonaweb.vercel.app/logo.png",
              "telephone": "+34613881414",
              "email": "info@resonaevents.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Valencia",
                "addressRegion": "Valencia",
                "addressCountry": "ES"
              },
              "areaServed": {
                "@type": "City",
                "name": "Valencia"
              },
              "priceRange": "€€"
            },
            "areaServed": {
              "@type": "City",
              "name": "Valencia"
            },
            "availableChannel": {
              "@type": "ServiceChannel",
              "serviceUrl": currentUrl,
              "servicePhone": {
                "@type": "ContactPoint",
                "telephone": "+34613881414",
                "contactType": "customer service",
                "availableLanguage": ["Spanish", "English"]
              }
            }
          })}
        </script>
        
        {/* Schema BreadcrumbList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://resonaweb.vercel.app"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Servicios",
                "item": "https://resonaweb.vercel.app/servicios"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": heroTitle,
                "item": currentUrl
              }
            ]
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="relative bg-resona text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/20"></div>
          <div className="relative container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">{heroTitle}</h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">{heroSubtitle}</p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="https://wa.me/34613881414"
                  className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  WhatsApp: 613 88 14 14
                </a>
                <a
                  href="/calculadora-eventos"
                  className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-primary-600 font-bold py-4 px-8 rounded-lg transition-all"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Calculadora Online
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <p className="text-lg text-gray-700 leading-relaxed">{introduction}</p>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Por qué elegirnos</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {whyChooseUs.map((item, index) => (
                <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Packages */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-4">Paquetes y Precios</h2>
            <p className="text-center text-gray-600 mb-12">Precios transparentes sin sorpresas</p>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {packages.map((pkg, index) => (
                <div
                  key={index}
                  className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
                    pkg.highlighted ? 'ring-4 ring-primary-500 transform scale-105' : 'border border-gray-200'
                  }`}
                >
                  {pkg.highlighted && (
                    <div className="absolute top-0 right-0 bg-primary-500 text-white px-4 py-1 text-sm font-bold">
                      POPULAR
                    </div>
                  )}
                  
                  <div className="p-6">
                    <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
                    <p className="text-gray-600 mb-4">{pkg.subtitle}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-primary-600">{pkg.price}</span>
                    </div>
                    
                    <ul className="space-y-3 mb-6">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <a
                      href={`https://wa.me/34613881414?text=Quiero presupuesto para ${pkg.name}`}
                      className={`block text-center font-bold py-3 px-6 rounded-lg transition-all ${
                        pkg.highlighted
                          ? 'bg-primary-500 hover:bg-primary-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                    >
                      Solicitar Presupuesto
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        {technicalSpecs && technicalSpecs.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Especificaciones Técnicas</h2>
              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {technicalSpecs.map((spec, index) => (
                  <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold mb-4 text-primary-600">{spec.title}</h3>
                    <ul className="space-y-2">
                      {spec.items.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-primary-500 mr-2">▪</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* FAQs */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Preguntas Frecuentes</h2>
            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-xl font-bold mb-3 text-gray-800">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Services */}
        {relatedServices && relatedServices.length > 0 && (
          <section className="py-16 bg-gray-50">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold text-center mb-12">Servicios Relacionados</h2>
              <div className="flex flex-wrap justify-center gap-4 max-w-4xl mx-auto">
                {relatedServices.map((service, index) => (
                  <a
                    key={index}
                    href={service.url}
                    className="bg-white hover:bg-primary-50 border-2 border-primary-200 hover:border-primary-400 px-6 py-3 rounded-lg font-semibold text-primary-600 transition-all"
                  >
                    {service.title}
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Final */}
        <section className="relative py-20 bg-resona text-white overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/20"></div>
          <div className="relative container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">¿Listo para tu evento perfecto?</h2>
            <p className="text-xl mb-8 text-white/90">Presupuesto gratuito en menos de 24 horas</p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/34613881414"
                className="inline-flex items-center justify-center bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105"
              >
                <Phone className="w-5 h-5 mr-2" />
                WhatsApp Directo
              </a>
              <a
                href="mailto:info@resonaevents.com"
                className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-primary-600 font-bold py-4 px-8 rounded-lg transition-all"
              >
                <Mail className="w-5 h-5 mr-2" />
                Email
              </a>
            </div>
            
            <p className="mt-8 text-white/80">
              📞 613 88 14 14 | 📧 info@resonaevents.com
            </p>
          </div>
        </section>
      </div>
    </>
  );
};

export default ServicePageTemplate;

import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const SonidoEventosCorporativos = () => {
  const pageData = {
    title: "Sonido para Eventos Corporativos Valencia | Conferencias y Presentaciones",
    metaDescription: "Sonido profesional para eventos corporativos. Conferencias, presentaciones, cenas de empresa. Streaming incluido. ☎️ 613 88 14 14",
    keywords: "sonido eventos corporativos valencia, audiovisuales empresa, sonido conferencias",
    heroTitle: "Sonido para Eventos Corporativos",
    heroSubtitle: "Profesionalidad y claridad para tu empresa",
    introduction: `<strong>Sonido profesional para eventos corporativos</strong>: conferencias, presentaciones de producto, cenas de empresa, formaciones. Audio para streaming y grabación incluido.`,
   
    whyChooseUs: [
      {
        icon: "🎵",
        title: "Equipos Profesionales",
        description: "Solo marcas líderes de máxima calidad"
      },
      {
        icon: "👨‍🔧",
        title: "Técnicos Especializados",
        description: "Expertos con años de experiencia"
      },
      {
        icon: "🚚",
        title: "Servicio Completo",
        description: "Transporte, montaje y desmontaje incluidos"
      },
      {
        icon: "🔒",
        title: "Equipos de Backup",
        description: "Respaldo siempre disponible"
      },
      {
        icon: "💰",
        title: "Precios Claros",
        description: "Sin costes ocultos"
      },
      {
        icon: "⚡",
        title: "Respuesta Rápida",
        description: "Presupuesto en 24h"
      }
    ],

    packages: [
      {
        name: "Pack Básico",
        subtitle: "Para eventos pequeños",
        price: "desde 300€",
        features: [
          "Equipos básicos profesionales",
          "Transporte incluido",
          "Montaje y desmontaje",
          "Asistencia telefónica"
        ]
      },
      {
        name: "Pack Profesional",
        subtitle: "Más popular",
        price: "desde 600€",
        features: [
          "Equipos profesionales completos",
          "Técnico especializado incluido",
          "Transporte y montaje",
          "Equipos de backup",
          "Soporte completo"
        ],
        highlighted: true
      },
      {
        name: "Pack Premium",
        subtitle: "Máxima calidad",
        price: "desde 1.200€",
        features: [
          "Equipos top de gama",
          "2 técnicos especializados",
          "Equipos redundantes",
          "Prueba previa",
          "Soporte 24/7"
        ]
      }
    ],

    faqs: [
      {
        question: "¿El técnico está incluido?",
        answer: "En los packs Profesional y Premium sí. En el Básico se puede añadir."
      },
      {
        question: "¿Con cuánta antelación debo reservar?",
        answer: "Recomendamos 1-2 meses, especialmente para fines de semana."
      },
      {
        question: "¿El transporte tiene coste extra?",
        answer: "No, está incluido en Valencia y hasta 30km."
      }
    ],

    relatedServices: [
      { title: "Sonido Profesional", url: "/servicios/alquiler-sonido-valencia" },
      { title: "Iluminación LED", url: "/servicios/iluminacion-led-profesional" },
      { title: "Pantallas LED", url: "/servicios/alquiler-pantallas-led-eventos" }
    ]
  };

  return <ServicePageTemplate {...pageData} />;
};

export default SonidoEventosCorporativos;

import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const SonidoBodasValencia = () => {
  const pageData = {
    title: "Sonido Profesional para Bodas en Valencia | Ceremonia + Banquete + Fiesta",
    metaDescription: "Sonido completo para bodas en Valencia. Ceremonia, discursos y fiesta. Equipos profesionales + técnico. Desde 600€. ☎️ 613 88 14 14",
    keywords: "sonido bodas valencia, alquiler sonido boda, sonido ceremonia valencia",
    heroTitle: "Sonido Profesional para Bodas en Valencia",
    heroSubtitle: "Ceremonia, banquete y fiesta - Sonido perfecto todo el día",
    introduction: `<strong>Sonido completo para bodas</strong> en Valencia: ceremonia al aire libre, discursos con micrófonos inalámbricos y equipo DJ para la fiesta. Más de 500 bodas realizadas. Técnico especializado incluido.`,
   
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

export default SonidoBodasValencia;

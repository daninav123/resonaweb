import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const CineDeVeranoValencia = () => {
  const pageData = {
    title: "Alquiler de Cine de Verano en Valencia | ReSona Rent",
    metaDescription:
      "Monta tu cine de verano en Valencia: pantalla LED o proyector, sonido, entrega y montaje. Para urbanizaciones, terrazas, piscinas, plazas y ayuntamientos. ☎️ 613 88 14 14",
    keywords:
      "cine de verano valencia, alquiler cine de verano, pantalla cine de verano, proyector cine exterior valencia, cine al aire libre valencia, proyeccion pelicula exterior valencia",
    canonicalUrl: "https://resonarent.com/servicios/cine-de-verano-valencia",
    heroTitle: "Alquiler de Cine de Verano en Valencia",
    heroSubtitle:
      "Pantalla LED o proyector, sonido y montaje llave en mano para tus proyecciones al aire libre",

    introduction: `<img src="https://resonarent.com/images/pantalla-led-montaje.jpg" alt="Montaje de pantalla LED de ReSona Rent en Valencia" width="1050" height="700" style="width:100%;height:auto;border-radius:12px;margin-bottom:24px;" loading="lazy" />

<p>¿Quieres montar un <strong>cine de verano</strong> en tu urbanización, tu pueblo o tu terraza? En ReSona Rent lo dejamos todo listo: <strong>pantalla, proyector o pantalla LED gigante, sonido y montaje</strong>, para que solo tengas que elegir la película.</p>

<p>Trabajamos en <strong>toda la provincia de Valencia</strong> — plazas, piscinas, urbanizaciones, colegios, ayuntamientos y eventos privados. Tú pones el sitio y la fecha; nosotros llevamos, montamos y desmontamos el equipo.</p>

<p><strong>Dos formas de montarlo:</strong></p>

<ul>
<li><strong>Con proyector y pantalla:</strong> la opción más económica, ideal para espacios oscuros y aforos medianos.</li>
<li><strong>Con pantalla LED gigante:</strong> imagen brillante que se ve perfecta incluso con algo de luz, para máximo impacto y grandes aforos.</li>
</ul>

<p>Incluimos <strong>sonido</strong> para que la película se escuche con claridad en todo el recinto, y te asesoramos según tu espacio y el número de asistentes.</p>

<p><strong>El verano es temporada alta.</strong> Reserva tu fecha con antelación llamando al <strong>613 88 14 14</strong> o por WhatsApp y te confirmamos disponibilidad al momento.</p>`,

    whyChooseUs: [
      { icon: "🎬", title: "Cine al aire libre", description: "Proyecciones para urbanizaciones, plazas, piscinas y terrazas" },
      { icon: "🖥️", title: "Proyector o LED", description: "Elige según tu espacio y aforo; te asesoramos sin compromiso" },
      { icon: "🔊", title: "Sonido incluido", description: "La peli se escucha con claridad en todo el recinto" },
      { icon: "🚚", title: "Entrega y montaje", description: "Lo llevamos, montamos y desmontamos en la provincia de Valencia" },
      { icon: "☀️", title: "Pensado para verano", description: "Equipo apto para exterior, de noche y con luz ambiente" },
      { icon: "🗓️", title: "Reserva por fecha", description: "Temporada alta: reserva tu día con antelación" },
    ],

    technicalSpecs: [
      {
        title: "Opción proyector",
        items: [
          "Proyector de alta luminosidad + pantalla de proyección",
          "La opción más económica para tu cine de verano",
          "Ideal para espacios con poca luz y aforos medianos",
          "Sonido incluido",
        ],
      },
      {
        title: "Opción pantalla LED",
        items: [
          "Pantalla LED gigante P3.9, 3×2 m o 3×4 m",
          "Imagen brillante, nítida incluso con luz ambiente",
          "Máximo impacto para grandes aforos",
          "Sonido incluido",
        ],
      },
      {
        title: "Ideal para",
        items: [
          "Urbanizaciones y comunidades de vecinos",
          "Ayuntamientos, plazas y fiestas de pueblo",
          "Piscinas, terrazas y jardines privados",
          "Colegios, AMPAS y eventos infantiles",
          "Eventos de empresa y celebraciones",
        ],
      },
    ],

    packages: [
      {
        name: "Cine de verano con proyector",
        subtitle: "La opción más económica",
        price: "Consúltanos",
        features: [
          "Proyector + pantalla de proyección",
          "Sonido incluido",
          "Entrega, montaje y desmontaje en la provincia de Valencia",
          "Ideal para aforos medianos y espacios con poca luz",
        ],
      },
      {
        name: "Cine de verano con pantalla LED 3×2 m",
        subtitle: "Imagen brillante · máximo impacto",
        price: "800 € + IVA",
        features: [
          "Pantalla LED gigante de 6 m² (P3.9)",
          "Se ve nítida incluso con luz ambiente",
          "Sonido incluido",
          "Entrega y montaje en la provincia de Valencia",
          "968 € IVA incluido",
        ],
        highlighted: true,
      },
      {
        name: "Cine de verano con pantalla LED 3×4 m",
        subtitle: "Para grandes aforos",
        price: "1.500 € + IVA",
        features: [
          "Pantalla LED gigante de 12 m² (P3.9)",
          "Visible para públicos grandes",
          "Sonido incluido",
          "Entrega y montaje en la provincia de Valencia",
          "1.815 € IVA incluido",
        ],
      },
    ],

    faqs: [
      {
        question: "¿Qué incluye el alquiler para un cine de verano?",
        answer:
          "Un montaje llave en mano: la pantalla (de proyección o LED gigante), el proyector o panel LED, el sonido para que la película se escuche con claridad, y la entrega, el montaje y el desmontaje en la provincia de Valencia. Tú solo eliges el sitio, la fecha y la película.",
      },
      {
        question: "¿Es mejor un proyector o una pantalla LED para el cine de verano?",
        answer:
          "Depende del espacio y el aforo. El proyector es la opción más económica y funciona muy bien en sitios oscuros con aforo mediano. La pantalla LED gigante tiene mucho más brillo, por lo que se ve perfecta incluso con algo de luz ambiente y es ideal para grandes aforos. Te asesoramos según tu caso sin compromiso.",
      },
      {
        question: "¿Montáis el cine de verano en urbanizaciones y pueblos?",
        answer:
          "Sí. Trabajamos en toda la provincia de Valencia: urbanizaciones, comunidades de vecinos, plazas de pueblo, piscinas, colegios, jardines privados y eventos de empresa. Nos encargamos del transporte, el montaje y el desmontaje.",
      },
      {
        question: "¿Cuánto cuesta montar un cine de verano?",
        answer:
          "Depende de la opción y el tamaño. La pantalla LED de 3×2 m está en 800 € + IVA y la de 3×4 m en 1.500 € + IVA (sonido y montaje incluidos). La opción con proyector suele ser más económica; escríbenos con tu espacio y aforo y te preparamos un presupuesto a medida.",
      },
      {
        question: "¿Con cuánta antelación debo reservar?",
        answer:
          "El verano es temporada alta y las fechas vuelan, sobre todo fines de semana y festivos. Te recomendamos reservar cuanto antes llamando al 613 88 14 14 o por WhatsApp; te confirmamos disponibilidad al momento.",
      },
    ],

    relatedServices: [
      { title: "Alquiler de pantallas LED", url: "/servicios/alquiler-pantallas-led" },
      { title: "Alquiler de proyectores", url: "/servicios/alquiler-proyectores" },
      { title: "Alquiler de sonido", url: "/servicios/alquiler-sonido-valencia" },
    ],
  };

  return <ServicePageTemplate {...pageData} />;
};

export default CineDeVeranoValencia;

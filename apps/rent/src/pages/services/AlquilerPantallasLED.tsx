import React from 'react';
import ServicePageTemplate from '../../components/services/ServicePageTemplate';

const AlquilerPantallasLED = () => {
  const pageData = {
    title: "Alquiler Pantalla LED Gigante en Valencia | ReSona Rent",
    metaDescription:
      "Alquiler de pantalla LED gigante en Valencia para cine de verano, conciertos, eventos y deporte en directo. P3.9, 3×2 m (800 € + IVA) y 3×4 m (1.500 € + IVA). Entrega y montaje. ☎️ 613 88 14 14",
    keywords:
      "alquiler pantalla led valencia, pantalla led gigante valencia, alquiler pantalla cine de verano, videowall eventos valencia, pantalla led exterior valencia, pantalla gigante conciertos valencia",
    canonicalUrl: "https://resonarent.com/servicios/alquiler-pantallas-led",
    heroTitle: "Alquiler de Pantalla LED Gigante en Valencia",
    heroSubtitle:
      "Pantalla gigante con calidad LED profesional para cine de verano, conciertos, eventos de empresa y deporte en directo",

    introduction: `<img src="https://resonarent.com/images/pantalla-led-evento.jpg" alt="Pantalla LED gigante en un cine de verano al aire libre en Valencia" width="1400" height="933" style="width:100%;height:auto;border-radius:12px;margin-bottom:24px;" loading="lazy" />

<p>Una <strong>pantalla LED gigante</strong> convierte cualquier evento en algo memorable: reúnes a tu público delante de una imagen enorme, brillante y nítida que se ve perfecta de día y de noche.</p>

<p>En ReSona Rent alquilamos pantallas LED profesionales en Valencia para <strong>cine de verano, conciertos, ferias, presentaciones de empresa, bodas, comuniones y retransmisiones deportivas</strong>. Lo mismo para una terraza o una plaza que para un salón o un gran aforo.</p>

<p><strong>¿Por qué LED y no un proyector?</strong></p>

<ul>
<li><strong>Mucho más brillo:</strong> una pantalla LED P3.9 se ve perfecta incluso con luz ambiente, de día y de noche.</li>
<li><strong>Interior y exterior:</strong> vale igual para una terraza, una plaza o un salón.</li>
<li><strong>Dos formatos:</strong> 3×2 m (6 m²) y 3×4 m (12 m²), para adaptarnos a tu espacio y aforo.</li>
<li><strong>Doble pantalla:</strong> tenemos dos de 3×2 m, así que puedes cubrir varias zonas a la vez.</li>
</ul>

<p>Nos encargamos de la <strong>entrega, el montaje y el desmontaje en toda la provincia de Valencia</strong>: tú solo eliges la fecha y nosotros la dejamos lista y funcionando. Perfecta para montar un <strong>cine de verano</strong> en tu urbanización, proyectar un concierto, ambientar una feria o vivir el deporte en grande.</p>

<p><strong>La disponibilidad es limitada</strong> y las fechas de temporada alta vuelan. Reserva con antelación llamando al <strong>613 88 14 14</strong> o por WhatsApp y te confirmamos disponibilidad al momento.</p>`,

    whyChooseUs: [
      {
        icon: "🎬",
        title: "Cine de verano y eventos",
        description: "Cine al aire libre, conciertos, ferias, bodas y deporte en directo",
      },
      {
        icon: "📺",
        title: "LED P3.9 de verdad",
        description: "Imagen brillante y nítida, muy superior a un proyector",
      },
      {
        icon: "☀️",
        title: "Interior y exterior",
        description: "Apta para terrazas, plazas y salones, de día o de noche",
      },
      {
        icon: "📐",
        title: "Dos tamaños",
        description: "3×2 m (6 m²) y 3×4 m (12 m²) según tu espacio y aforo",
      },
      {
        icon: "🚚",
        title: "Entrega y montaje",
        description: "La llevamos, montamos y desmontamos en toda la provincia",
      },
      {
        icon: "🗓️",
        title: "Reserva por fecha",
        description: "Disponibilidad real: eliges tu día y la bloqueamos",
      },
    ],

    technicalSpecs: [
      {
        title: "Especificaciones",
        items: [
          "Pixel pitch P3.9 — alta resolución, nítida de cerca y de lejos",
          "Apta para interior y exterior",
          "Imagen LED de alto brillo, visible con luz de día",
          "Formato modular: montaje adaptado a tu espacio",
        ],
      },
      {
        title: "Tamaños disponibles",
        items: [
          "Pantalla LED 3×2 m — 6 m² de superficie",
          "Pantalla LED 3×4 m — 12 m² de superficie",
          "Dos unidades de 3×2 m disponibles a la vez",
          "Entrega y montaje incluidos en la provincia de Valencia",
        ],
      },
      {
        title: "Ideal para",
        items: [
          "Cine de verano y proyecciones al aire libre",
          "Conciertos, festivales y espectáculos",
          "Eventos de empresa, ferias y presentaciones",
          "Bodas, comuniones y celebraciones",
          "Deporte en directo: fútbol y grandes citas",
          "Bares, terrazas, plazas y comunidades",
        ],
      },
    ],

    packages: [
      {
        name: "Pantalla LED 3×2 m",
        subtitle: "6 m² · ideal para cine de verano, bares y locales",
        price: "800 € + IVA",
        features: [
          "Superficie de 6 m² (3×2 m) · P3.9",
          "Interior y exterior",
          "Entrega, montaje y desmontaje en la provincia de Valencia",
          "Perfecta para cine de verano y eventos medianos",
          "968 € IVA incluido · 2 unidades disponibles",
        ],
      },
      {
        name: "Pantalla LED 3×4 m",
        subtitle: "12 m² · máximo impacto",
        price: "1.500 € + IVA",
        features: [
          "Superficie de 12 m² (3×4 m) · P3.9",
          "Interior y exterior · visible para grandes aforos",
          "Entrega, montaje y desmontaje en la provincia de Valencia",
          "Ideal para conciertos, ferias y grandes eventos",
          "1.815 € IVA incluido",
        ],
        highlighted: true,
      },
      {
        name: "Dos pantallas 3×2 m",
        subtitle: "Cubre dos zonas o más aforo",
        price: "1.600 € + IVA",
        features: [
          "Dos pantallas de 6 m² a la vez",
          "Cubre dos salas, terrazas o ambientes",
          "Más puntos de visión para tu público",
          "Entrega, montaje y desmontaje en la provincia de Valencia",
        ],
      },
    ],

    faqs: [
      {
        question: "¿Para qué eventos puedo alquilar una pantalla LED gigante?",
        answer:
          "Para casi cualquier ocasión en la que quieras una imagen grande y de calidad: cine de verano al aire libre, conciertos y festivales, eventos de empresa, ferias y presentaciones, bodas y comuniones, o retransmisiones deportivas. Sirve tanto en interior como en exterior. Como disponemos de un número limitado de pantallas, te recomendamos reservar tu fecha con antelación.",
      },
      {
        question: "¿Qué tamaños de pantalla LED tenéis y cuánto cuestan?",
        answer:
          "Tenemos dos formatos, ambos con pixel pitch P3.9: la pantalla de 3×2 metros (6 m²) por 800 € + IVA (968 € IVA incluido), y la pantalla de 3×4 metros (12 m²) por 1.500 € + IVA (1.815 € IVA incluido). Disponemos de dos pantallas de 3×2 m, por lo que también puedes alquilar las dos a la vez (1.600 € + IVA) para cubrir varias zonas. Todas incluyen entrega y montaje en la provincia de Valencia.",
      },
      {
        question: "¿Sirve para montar un cine de verano?",
        answer:
          "Sí, es una de sus mejores aplicaciones. Con una pantalla LED gigante montas un cine de verano en una terraza, una piscina, una urbanización o una plaza, con una imagen que se ve nítida incluso al anochecer. Nos encargamos del montaje y, si lo necesitas, también del sonido para que la experiencia sea completa.",
      },
      {
        question: "¿La pantalla sirve para interior y exterior?",
        answer:
          "Sí, nuestras pantallas LED P3.9 son aptas tanto para interior como para exterior, así que funcionan igual de bien en una terraza, una plaza, una carpa o un salón. Gracias a su alto brillo se ven con claridad incluso con luz de día.",
      },
      {
        question: "¿Entregáis y montáis la pantalla?",
        answer:
          "Sí. La entrega, el montaje y el desmontaje están incluidos en toda la provincia de Valencia. Tú solo eliges la fecha y el espacio, y nosotros dejamos la pantalla lista y funcionando. Para ubicaciones fuera de la provincia, consúltanos y te confirmamos las condiciones.",
      },
      {
        question: "¿La pantalla LED se ve bien de día y con luz ambiente?",
        answer:
          "Sí. A diferencia de un proyector, una pantalla LED tiene mucho más brillo, por lo que ofrece una imagen nítida incluso con luz, tanto de día como de noche. Es la mejor opción para que todo el público vea el contenido con claridad.",
      },
      {
        question: "¿Con cuánta antelación debo reservar?",
        answer:
          "Cuanto antes, mejor, especialmente en fines de semana y en temporada alta de verano: la disponibilidad es limitada porque solo contamos con estas unidades. Puedes consultar disponibilidad y reservar tu fecha llamando al 613 88 14 14 o por WhatsApp; te respondemos rápido.",
      },
    ],

    relatedServices: [
      { title: "Alquiler de proyectores", url: "/servicios/alquiler-proyectores" },
      { title: "Alquiler de sonido", url: "/servicios/alquiler-sonido-valencia" },
      { title: "Ver todo el catálogo", url: "/productos" },
    ],
  };

  return <ServicePageTemplate {...pageData} />;
};

export default AlquilerPantallasLED;

const fs = require('fs');
const path = require('path');

// Contenido extendido base para cada tipo de servicio
const contentTemplates = {
  sonido: {
    intro: `El <strong>alquiler de {{KEYWORD}} en Valencia</strong> es esencial para garantizar el éxito acústico de cualquier evento. En ReSona Events contamos con más de 15 años de experiencia proporcionando sistemas de sonido profesional de las marcas líderes del mercado: JBL PRX Series, QSC K-Series, Electro-Voice, Pioneer DJ y Shure.

Nuestro servicio de <strong>{{KEYWORD}}</strong> está diseñado para cubrir desde eventos íntimos de 20 personas hasta grandes producciones de 5.000+ asistentes. Disponemos de sistemas completos que incluyen altavoces activos profesionales, subwoofers potentes, mesas de mezclas digitales, micrófonos inalámbricos de condensador y dinámicos, y todo el cableado balanceado necesario.

Todos nuestros equipos de <strong>{{KEYWORD}}</strong> están calibrados profesionalmente antes de cada evento y se entregan con técnico especializado incluido en el precio. El servicio incluye transporte en Valencia y hasta 30km, montaje completo según plano del espacio, calibración acústica personalizada, asistencia técnica durante todo el evento, y desmontaje sin coste adicional.`,
    
    specs: [
      {
        title: "Equipos JBL Disponibles",
        items: [
          "JBL PRX 712: 1500W RMS, 2 vías 12 pulgadas, cobertura 90x50°",
          "JBL PRX 715: 1500W RMS, 2 vías 15 pulgadas, ideal para música en vivo y baile",
          "JBL PRX 725: 1500W RMS, dual 15 pulgadas, graves potentes para eventos dance",
          "JBL SRX 812P: 2000W RMS, sistema profesional touring para conciertos",
          "JBL VTX Line Array: Sistema modular escalable 8-24 cajas para grandes producciones"
        ]
      },
      {
        title: "Mesas de Mezclas Profesionales",
        items: [
          "Pioneer DJM-900NXS2: 4 canales, efectos integrados, conexión USB/MIDI",
          "Allen & Heath Qu-16: 16 canales, DSP integrado, control iPad/tablet",
          "Behringer X32: 32 canales digitales, matrices, efectos Midas",
          "Yamaha MG16: 16 canales analógicos, fiabilidad profesional",
          "Soundcraft Si Expression: Mesa digital compacta 32 entradas"
        ]
      },
      {
        title: "Micrófonos y Accesorios",
        items: [
          "Shure SM58: Micrófono vocal dinámico profesional estándar mundial",
          "Shure Beta 87A: Condensador vocal alta ganancia para voces solistas",
          "Sennheiser EW 135 G4: Sistema inalámbrico UHF con 20 canales",
          "Rode NT1-A: Condensador estudio gran diafragma para grabaciones",
          "DI boxes Radial activas y pasivas para instrumentos",
          "Pies de micrófono boom ajustables Manfrotto/K&M",
          "Cables XLR balanceados Neutrik/Cordial profesionales"
        ]
      }
    ],
    
    faqs: [
      {
        question: "¿Qué potencia de sonido necesito para mi evento en Valencia?",
        answer: "La potencia depende del número de asistentes, tipo de música y acústica del espacio. Para 20-50 personas recomendamos sistema de 1000W (2 altavoces). Para 50-150 personas, 2000W con subwoofer. Para 150-300, sistema 3000W+ con Line Array compacto. Para 300-1000 personas, Line Array modular profesional. Nuestros técnicos realizan visita previa gratuita y estudio acústico del espacio para dimensionar correctamente el sistema."
      },
      {
        question: "¿El técnico de sonido está incluido en el precio?",
        answer: "Sí, en los packs Profesional y Premium está incluido un técnico especializado durante todo el evento (setup, pruebas, evento, desmontaje). En el pack Básico, el sistema es autoamplificado fácil de operar, pero puedes añadir técnico por 150€ adicionales. El técnico gestiona niveles, ecualización, mezcla de micrófonos, reproducción de música, y soluciona cualquier incidencia técnica inmediatamente."
      },
      {
        question: "¿Con cuánta antelación debo reservar el alquiler de sonido?",
        answer: "Para fechas entre semana, con 1-2 semanas de antelación suele ser suficiente. Para fines de semana y temporada alta (mayo a octubre), recomendamos reservar con 1-2 meses de antelación. Para bodas y eventos grandes que requieran sistemas complejos, lo ideal es 2-3 meses antes. Consulta disponibilidad en tiempo real llamando al 613 88 14 14 o vía WhatsApp."
      },
      {
        question: "¿El transporte y montaje tiene coste extra?",
        answer: "No, el transporte está totalmente incluido en Valencia capital y hasta 30km de radio. Para distancias superiores: 30-50km +30€, 50-80km +60€, más de 80km consultar. El precio incluye: transporte ida y vuelta, descarga, montaje completo según especificaciones, calibración acústica, pruebas de sonido, desmontaje y recogida. Todo en un precio cerrado sin sorpresas."
      },
      {
        question: "¿Qué incluye exactamente el servicio de alquiler de sonido?",
        answer: "El servicio completo incluye: altavoces profesionales autoamplificados o pasivos + etapas, subwoofers (según pack), mesa de mezclas analógica o digital, micrófonos vocales e instrumentales, soportes elevadores altura 2-3m, cables XLR balanceados profesionales Neutrik, protecciones para cables, multipar/splitter (eventos grandes), reproductor audio Bluetooth/USB/SD, transporte, montaje, calibración, asistencia durante evento, y desmontaje. Equipos de backup disponibles en packs Profesional y Premium."
      },
      {
        question: "¿Puedo recoger yo el equipo o necesito montaje profesional?",
        answer: "Ofrecemos ambas opciones. Puedes recoger el equipo en nuestro almacén de Valencia con 20% descuento, e incluimos tutorial de 15 minutos y manual de uso, más soporte telefónico durante el evento. Sin embargo, para eventos importantes (bodas, corporativos, conciertos) recomendamos encarecidamente el servicio completo con técnico para garantizar calidad de sonido óptima, ecualización del espacio, y respuesta inmediata ante incidencias."
      },
      {
        question: "¿Qué pasa si falla algún equipo durante el evento?",
        answer: "En los packs Profesional y Premium incluimos siempre equipos de respaldo (altavoz adicional, mesa mezc backup, micrófonos extra). En pack Básico se puede añadir backup por 80€. Además, tenemos técnicos de guardia 24/7 con furgoneta equipada para reemplazo urgente en menos de 60 minutos en Valencia. En 15 años de trayectoria jamás hemos cancelado un evento por fallo técnico gracias a nuestros sistemas redundantes."
      },
      {
        question: "¿Trabajáis con todos los tipos de eventos en Valencia?",
        answer: "Sí, tenemos experiencia en todo tipo de eventos: bodas (ceremonia, cocktail, banquete, baile), eventos corporativos (conferencias, presentaciones, convenciones), conciertos (bandas, DJ, electrónica), festivales, ferias comerciales, actos institucionales, eventos deportivos, teatros, musicales, desfiles, fiestas patronales, verbenas, y eventos privados. Cada tipo de evento tiene requisitos específicos que conocemos perfectamente."
      },
      {
        question: "¿Ofrecéis descuentos para eventos de varios días?",
        answer: "Sí, aplicamos descuentos progresivos para alquileres de varios días: 2-3 días: 15% descuento total, 4-7 días: 25% descuento, más de 7 días: precio especial personalizado. También ofrecemos condiciones ventajosas para clientes recurrentes, empresas con contrato marco, y organizadores de eventos que contratan múltiples servicios (sonido + iluminación + vídeo). Consulta tu caso específico para presupuesto ajustado."
      },
      {
        question: "¿Proporcionáis también música ambiente o DJ?",
        answer: "Sí, además del equipo de sonido podemos proporcionar servicio de DJ profesional especializado en bodas, eventos corporativos o fiestas. Nuestros DJs cuentan con biblioteca musical de 50.000+ canciones en todos los géneros y estilos, experiencia de 10+ años, equipo propio Pioneer profesional, e iluminación básica incluida. También ofrecemos servicio de saxofonista, violinista o músicos en vivo. Consulta packs combinados con descuento."
      }
    ]
  },
  
  iluminacion: {
    intro: `El <strong>alquiler de {{KEYWORD}} en Valencia</strong> es fundamental para crear la atmósfera perfecta y transformar cualquier espacio. En ReSona Events disponemos del catálogo más completo de iluminación profesional LED RGBW de las marcas líderes: Chauvet, Martin, ADJ, Showtec y Eurolite.

Nuestro servicio de <strong>{{KEYWORD}}</strong> cubre desde iluminación ambiental elegante hasta espectáculos de luz sincronizados con música. Disponemos de focos PAR LED RGBW, moving heads beam y spot, bañadores LED arquitectónicos, uplights wireless con batería recargable, strobos profesionales, proyectores de efectos, máquinas de humo y neblina, controladores DMX programables, y estructuras truss certificadas.

Todos nuestros sistemas de <strong>{{KEYWORD}}</strong> son LED de última generación (bajo consumo, sin calor), se entregan programados según el evento, e incluyen técnico iluminador profesional. El servicio completo incluye transporte en Valencia capital, montaje con estructuras certificadas, programación de escenas y secuencias, operación durante evento, y desmontaje.`,
    
    specs: [
      {
        title: "Focos PAR LED Profesionales",
        items: [
          "Chauvet SlimPAR Pro: 12×4W RGBW, ángulo 25°, modo DMX/autónomo",
          "ADJ Mega Par Profile Plus: 228W RGBWA, wash uniforme, flicker-free",
          "Showtec Spectral M800: 8×10W RGBA, compacto, batería recargable 12h",
          "Martin RUSH PAR 2: 12×12W RGBW Zoom 15-40°, profesional touring",
          "Eurolite LED IP PAR: 14×10W RGBWA+UV, IP65 exterior waterproof"
        ]
      },
      {
        title: "Moving Heads y Efectos",
        items: [
          "Martin RUSH MH3 Beam: 140W LED Beam, prisma, gobo, velocidad extrema",
          "Chauvet Intimidator Spot 355: 90W LED Spot, 8 gobos + 8 colores",
          "ADJ Focus Spot 4Z: 200W LED Spot Zoom, iris, gobo rotación indexada",
          "Showtec Phantom 75 LED Beam: Beam compacto 75W, prisma 3 facetas",
          "American DJ Inno Pocket Wash: Mini moving wash 7×10W, compacto"
        ]
      },
      {
        title: "Control y Efectos Especiales",
        items: [
          "Controlador DMX Martin M-Touch: Pantalla táctil, 16 universos, USB",
          "ADJ Operator 384: Mesa DMX 384 canales, 24 fixtures, 30 bancos",
          "Chauvet Obey 70: Controlador compacto DMX 192 canales, 12 escenas",
          "Antari Z-350 Fazer: Máquina neblina profesional, control DMX",
          "Chauvet Hurricane 1800 Flex: Humo 1800W, control remoto DMX/wireless"
        ]
      }
    ],
    
    faqs: [
      {
        question: "¿Qué tipo de iluminación necesito para mi evento en Valencia?",
        answer: "Depende del tipo de evento y atmósfera deseada. Para bodas ceremonia: uplights batería discretos (8-12 unidades). Para banquete: PAR LED RGBW ambientales (12-20 focos). Para fiesta/baile: moving heads + PAR LED + strobo + humo. Para eventos corporativos: iluminación frontal wash uniforme sin cambios de color. Para conciertos: moving heads beam + wash + estructuras elevadas. Realizamos visita técnica gratuita para dimensionar correctamente."
      },
      {
        question: "¿La iluminación LED consume mucha electricidad?",
        answer: "No, la iluminación LED profesional moderna es extremadamente eficiente. Un foco PAR LED 12×10W consume solo 120W (equivalente a bombilla tradicional de 500W). Sistema completo para boda 150 personas: aproximadamente 2000-3000W totales (menos que un horno doméstico). Esto permite conectar a tomas estándar sin necesidad de cuadros eléctricos especiales. Además, LED no genera calor, más seguro para espacios cerrados."
      },
      {
        question: "¿Puedo cambiar los colores de la iluminación durante el evento?",
        answer: "Sí, totalmente. Nuestros sistemas LED RGBW permiten crear cualquier color del espectro (millones de combinaciones). Puedes tener un color para ceremonia, otro para cocktail, otro para cena, y efectos dinámicos para baile. El técnico iluminador programa escenas predefinidas y las activa cuando tú indiques (botón, tiempo, música). En packs Premium incluimos sincronización con música mediante controlador audio-activado o DMX beat-sync."
      },
      {
        question: "¿Es necesario técnico iluminador o puedo operarlo yo?",
        answer: "Para iluminación ambiental estática (uplights un solo color) no es necesario técnico, los equipos tienen modo autónomo. Para iluminación dinámica con cambios de color, escenas programadas, moving heads, y sincronización con música, SÍ recomendamos técnico iluminador. El técnico programa las escenas según el timeline del evento, opera los cambios en momentos clave (entrada novios, primer baile, corte tarta), y ajusta intensidades según luz natural/artificial."
      },
      {
        question: "¿Los equipos de iluminación funcionan con batería?",
        answer: "Disponemos de uplights PAR LED con batería recargable de litio (duración 8-14 horas según intensidad). Ideales para espacios sin tomas eléctricas cercanas, ceremonias exteriores, iluminación arquitectónica de fachadas, jardines, y eventos en localizaciones complicadas. Los moving heads, bañadores de alta potencia, y máquinas de efectos requieren conexión eléctrica. Ofrecemos soluciones mixtas batería+cable según necesidades y distribución del espacio."
      },
      {
        question: "¿Incluís estructuras para elevar la iluminación?",
        answer: "Sí, incluimos estructuras truss triangular o cuadrada (30x30cm, 29x29cm) certificadas TÜV, elevadores de cremallera 1-4 metros de altura, bases lastradas con sacos de arena, y todo el cableado de seguridad. Para eventos grandes disponemos de torres elevadoras motorizadas 6-8 metros, estructuras tipo goal-post para iluminación cenital, y ground support para rigging de moving heads. Todas nuestras estructuras cumplen normativa UNE-EN vigente."
      },
      {
        question: "¿Trabajáis iluminación en exterior?",
        answer: "Sí, disponemos de focos LED con certificación IP65 waterproof específicos para exterior (aguantan lluvia ligera). Ideales para iluminar fachadas, jardines, piscinas, carpas, patios, terrazas, y eventos al aire libre. Los uplights wireless batería son perfectos para espacios exteriores sin cableado visible. En caso de lluvia intensa o tormenta eléctrica, seguimos protocolo de seguridad y apagamos equipos hasta que pase el riesgo. Incluimos lonas de protección de emergencia."
      },
      {
        question: "¿Ofrecéis efectos especiales además de iluminación?",
        answer: "Sí, disponemos de amplia gama de efectos especiales FX: máquinas de humo bajo/alto, Fazer (neblina fina), CO2 jets (columnas blancas frías), confeti cañones (papelitos colores), burbujas, nieve artificial, fuente chispas frías, y proyectores gobo personalizados (iniciales novios, logos corporativos). Todos controlables vía DMX o manual. Los efectos se sincronizan con momentos clave: entrada novios (CO2+luces), primer baile (humo+moving heads), cierre fiesta (confeti). Consulta packs combinados."
      },
      {
        question: "¿Podéis proyectar logos o iniciales con la iluminación?",
        answer: "Sí, mediante proyectores gobo profesionales. Un gobo es una plantilla metálica personalizada con tu logo, iniciales, fecha, o diseño. Se coloca en el proyector y proyecta la imagen en pared, suelo, techo, o pista de baile. Disponemos de: proyectores LED 50-200W, gobos personalizados (fabricación 3-5 días laborables), rotación y efectos dinámicos, y proyección múltiple (varias zonas simultáneas). Ideal para bodas (iniciales + fecha), eventos corporativos (logos), aniversarios (números)."
      },
      {
        question: "¿Cuánto tiempo necesitáis para montar la iluminación?",
        answer: "Depende de la complejidad del sistema. Iluminación básica (12-16 uplights): 1-1.5 horas. Sistema completo con estructuras y moving heads (boda/evento mediano): 2-3 horas. Producción grande con múltiples estructuras elevadas (concierto, festival): 4-6 horas. Siempre montamos con antelación suficiente antes del evento (normalmente día anterior o mañana del evento). El desmontaje es más rápido (1-2 horas). Incluimos tiempo de pruebas y ajustes en el montaje."
      }
    ]
  }
};

console.log('\n🚀 EXPANDIENDO PÁGINAS DE SERVICIO A 1500+ PALABRAS\n');
console.log('='.repeat(80));
console.log('\nEsto tomará varios minutos, generando contenido optimizado SEO...\n');

// Este es un ejemplo. En producción continuaría con las 20 páginas.
console.log('✅ Script preparado - Ejecutar expansión manual para control de calidad');
console.log('\n📝 Genera contenido para cada página con:');
console.log('   - Introducción extensa 200-300 palabras');
console.log('   - Especificaciones técnicas detalladas');
console.log('   - 10+ FAQs completas 100-150 palabras cada una');
console.log('   - Keywords naturales repetidas 5-8 veces');
console.log('   - Menciones de zonas Valencia');
console.log('   - Total: 1500-2000 palabras por página');

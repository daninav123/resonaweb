import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageCircle, Phone, Camera, FileText, Speaker, Instagram, ChevronRight } from 'lucide-react';
import { Logo, useLeadLink } from '@resona/ui';
import SEOHead from '../components/SEO/SEOHead';

const PHONE = '34613881414';
const SECTION = 'hola';

/** Manual de marca: packages/ui/brand/README.md */
const NEGRO = '#0A0A0A';
const AZUL = '#3D5AFE';
const AZUL_HOVER = '#1F40FE';
const AZUL_SOBRE_OSCURO = '#5B74FE';
const GRIS_TEXTO = '#9A9A9A';
const BORDE = '#262626';

/** La app todavía carga Inter y Playfair. Montserrat se pide solo aquí hasta que se rediseñe la web. */
const FUENTE = "'Montserrat', system-ui, sans-serif";

interface EnlaceProps {
  icon: React.ReactNode;
  titulo: string;
  detalle: string;
  href: string;
  interno?: boolean;
  onClick?: () => void;
  target?: string;
  rel?: string;
}

const Enlace = ({ icon, titulo, detalle, href, interno, onClick, target, rel }: EnlaceProps) => {
  const contenido = (
    <>
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
        style={{ background: 'rgba(255,255,255,0.06)', color: GRIS_TEXTO }}
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-white">{titulo}</span>
        <span className="mt-0.5 block text-[13px]" style={{ color: GRIS_TEXTO }}>
          {detalle}
        </span>
      </span>
      <ChevronRight size={18} className="shrink-0" style={{ color: '#5E5E5E' }} aria-hidden="true" />
    </>
  );

  const clases =
    'flex min-h-[64px] items-center gap-3.5 rounded px-4 py-3 transition-colors ' +
    'hover:bg-white/[0.04] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2';

  const estilo = { border: `1px solid ${BORDE}`, outlineColor: AZUL_SOBRE_OSCURO };

  if (interno) {
    return (
      <Link to={href} className={clases} style={estilo}>
        {contenido}
      </Link>
    );
  }
  return (
    <a href={href} className={clases} style={estilo} onClick={onClick} target={target} rel={rel}>
      {contenido}
    </a>
  );
};

const HolaPage = () => {
  const whatsapp = useLeadLink({
    app: 'events',
    section: SECTION,
    channel: 'whatsapp',
    phone: PHONE,
    message: 'Hola, os escribo desde la tarjeta',
  });

  const telefono = useLeadLink({
    app: 'events',
    section: SECTION,
    channel: 'telefono',
    phone: PHONE,
  });

  return (
    <>
      <SEOHead
        title="Hablamos | ReSona Events"
        description="Escríbenos por WhatsApp, llámanos o mira nuestros trabajos. Producción audiovisual para eventos en Valencia."
        canonicalUrl="https://resonaevents.com/hola"
        noindex
      />
      <Helmet>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap"
        />
      </Helmet>

      <main
        className="flex min-h-screen justify-center px-5 py-12 text-white"
        style={{ background: NEGRO, fontFamily: FUENTE }}
      >
        <div className="w-full max-w-[420px]">
          <header className="flex flex-col items-center">
            <Logo width={168} />
            <p
              className="mt-2.5 text-[10px] font-semibold uppercase"
              style={{ color: GRIS_TEXTO, letterSpacing: '0.62em', textIndent: '0.62em' }}
            >
              Events
            </p>
          </header>

          <h1
            className="mt-10 text-[28px] font-bold leading-tight"
            style={{ fontFamily: FUENTE, letterSpacing: '-0.5px' }}
          >
            ¿Hablamos?
          </h1>
          <p className="mt-2.5 text-[16px] leading-[1.6]" style={{ color: GRIS_TEXTO }}>
            Cuéntanos qué evento tienes en mente. Solemos contestar el mismo día.
          </p>

          <div className="mt-8 space-y-2.5">
            <a
              href={whatsapp.href}
              onClick={whatsapp.onClick}
              target={whatsapp.target}
              rel={whatsapp.rel}
              className="group flex min-h-[68px] items-center gap-3.5 rounded px-4 py-4 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              style={{ background: AZUL }}
              onMouseEnter={(e) => (e.currentTarget.style.background = AZUL_HOVER)}
              onMouseLeave={(e) => (e.currentTarget.style.background = AZUL)}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-paper-50/20">
                <MessageCircle size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[16px] font-bold">Escríbenos por WhatsApp</span>
                <span className="mt-0.5 block text-[13px] text-white/80">Lo más rápido · 613 88 14 14</span>
              </span>
              <ChevronRight size={18} className="shrink-0 text-white/70" aria-hidden="true" />
            </a>

            <Enlace
              icon={<Phone size={18} aria-hidden="true" />}
              titulo="Llamar"
              detalle="De lunes a viernes, de 9 a 19 h"
              href={telefono.href}
              onClick={telefono.onClick}
            />
          </div>

          <div className="my-8 h-px" style={{ background: BORDE }} />

          <div className="space-y-2.5">
            <Enlace
              icon={<Camera size={18} aria-hidden="true" />}
              titulo="Ver trabajos"
              detalle="Bodas, corporativos y festivales"
              href="/portfolio"
              interno
            />
            <Enlace
              icon={<FileText size={18} aria-hidden="true" />}
              titulo="Pedir presupuesto"
              detalle="Cuéntanos tu evento en dos minutos"
              href="/brief"
              interno
            />
            <Enlace
              icon={<Speaker size={18} aria-hidden="true" />}
              titulo="Alquilar equipos"
              detalle="Sonido, luz y vídeo · ReSona Rent"
              href="https://resonarent.com"
              target="_blank"
              rel="noopener noreferrer"
            />
            <Enlace
              icon={<Instagram size={18} aria-hidden="true" />}
              titulo="Instagram"
              detalle="@resonaevents"
              href="https://instagram.com/resonaevents"
              target="_blank"
              rel="noopener noreferrer"
            />
          </div>

          <p className="mt-10 text-center text-[11px]" style={{ color: '#5E5E5E' }}>
            Valencia · resonaevents.com
          </p>
        </div>
      </main>
    </>
  );
};

export default HolaPage;

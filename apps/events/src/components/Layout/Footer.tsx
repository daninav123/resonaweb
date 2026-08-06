import { Link } from 'react-router-dom';
import { Instagram } from 'lucide-react';
import { trackLead } from '@resona/utils';
import { useGlobalWhatsApp } from '@resona/ui';

const Footer = () => {
  const whatsapp = useGlobalWhatsApp('events', '34613881414', 'Hola, me gustaría organizar un evento');
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-cream pt-24 pb-10 px-5 md:px-10">
      <div className="max-w-[1600px] mx-auto">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-3">
            <span className="eyebrow text-cream/50">Cuéntanos tu evento</span>
            <h2 className="font-display text-display-md md:text-display-lg text-balance">
              ¿Hablamos?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8">
            <div className="md:col-span-5 flex flex-col gap-4">
              <Link
                to="/brief"
                className="inline-flex items-center justify-between max-w-md px-6 py-5 rounded-full bg-paper text-ink hover:bg-white transition"
              >
                <span className="font-medium">Empezar brief</span>
                <span aria-hidden>→</span>
              </Link>
              <a
                {...whatsapp}
                className="inline-flex items-center justify-between max-w-md px-6 py-5 rounded-full border border-cream/30 hover:border-cream transition"
              >
                <span className="font-medium">WhatsApp · 613 88 14 14</span>
                <span aria-hidden>→</span>
              </a>
            </div>

            <div className="md:col-span-3 flex flex-col gap-3">
              <span className="eyebrow text-cream/50">Navegación</span>
              <Link to="/bodas" className="hover:text-accent-300 transition">Bodas</Link>
              <Link to="/eventos" className="hover:text-accent-300 transition">Eventos</Link>
              <Link to="/portfolio" className="hover:text-accent-300 transition">Portfolio</Link>
              <Link to="/estudio" className="hover:text-accent-300 transition">Estudio</Link>
              <Link to="/contacto" className="hover:text-accent-300 transition">Contacto</Link>
            </div>

            <div className="md:col-span-4 flex flex-col gap-3">
              <span className="eyebrow text-cream/50">Estudio</span>
              <p className="text-cream/80 leading-relaxed">
                Valencia y toda la Comunidad Valenciana.<br />
                Lunes a Viernes · 10:00 – 19:00
              </p>
              <a
                href="mailto:info@resonaevents.com"
                onClick={() => trackLead({ leadType: 'email' })}
                className="hover:text-accent-300 transition"
              >
                info@resonaevents.com
              </a>
              <a
                href="https://instagram.com"
                className="inline-flex items-center gap-2 mt-2 hover:text-accent-300 transition"
                aria-label="Instagram"
              >
                <Instagram className="w-4 h-4" />
                <span className="text-sm">@resonaevents</span>
              </a>
            </div>
          </div>

          <div className="h-px bg-paper/15 mt-4" />

          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between text-sm text-cream/60">
            <div className="flex flex-col md:flex-row gap-2 md:gap-6">
              <span>© {year} ReSona Events</span>
              <Link to="/aviso-legal" className="hover:text-cream transition">Aviso legal</Link>
              <Link to="/politica-privacidad" className="hover:text-cream transition">Privacidad</Link>
              <Link to="/politica-cookies" className="hover:text-cream transition">Cookies</Link>
            </div>
            <span className="font-display italic text-cream/40">
              Producción audiovisual · Valencia
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

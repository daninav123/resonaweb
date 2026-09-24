import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CreditCard, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { Logo } from '@resona/ui';

const Footer = () => {
  return (
    <footer className="border-t border-cream/10 bg-ink text-cream">
      
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Company Info con Logo */}
          <div>
            {/* Logo */}
            <Link to="/" className="mb-4 flex flex-col text-white hover:opacity-90 transition-opacity">
              <Logo width={150} title="ReSona Rent" />
              <span
                className="mt-1 text-[10px] font-semibold uppercase text-[#9A9A9A]"
                style={{ letterSpacing: '1.4em', textIndent: '1.4em' }}
              >
                Rent
              </span>
            </Link>
            <p className="mb-4 text-[14px] leading-relaxed text-cream/60">
              Tu partner de confianza para el alquiler de material de eventos.
              Más de 10 años haciendo realidad tus celebraciones.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/productos" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Catálogo
              </Link></li>
              <li><Link to="/sobre-nosotros" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Sobre Nosotros
              </Link></li>
              <li><Link to="/contacto" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Contacto
              </Link></li>
              <li><Link to="/faqs" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                FAQs
              </Link></li>
              <li className="mt-3 border-t border-cream/10 pt-3">
                <a
                  href="https://resonaevents.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-[13px] italic text-cream/45 transition-colors hover:text-cream/80"
                >
                    ¿Evento completo? ReSona Events ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Servicios Locales SEO */}
          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">Servicios en Valencia</h4>
            <ul className="space-y-2">
              <li><Link to="/servicios/alquiler-sonido-valencia" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Alquiler Sonido Valencia
              </Link></li>
              <li><Link to="/servicios/alquiler-altavoces-profesionales" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Alquiler Altavoces Valencia
              </Link></li>
              <li><Link to="/servicios/iluminacion-led-profesional" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Iluminación Valencia
              </Link></li>
              <li><Link to="/servicios/alquiler-dj-valencia" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Alquiler DJ Valencia
              </Link></li>
              <li><Link to="/alquiler-sonido-torrent" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Alquiler Sonido Torrent
              </Link></li>
              <li><Link to="/productos?category=sonido" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Ver Equipos de Sonido
              </Link></li>
              <li><Link to="/productos?category=iluminacion" className="flex items-center gap-2 text-[14px] text-cream/70 transition-colors hover:text-cream">
                Ver Iluminación
              </Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 group">
                <div className="rounded-sm bg-ink-800/5 p-2 transition-colors group-hover:bg-white/10">
                  <MapPin className="h-4 w-4 text-cream/55" />
                </div>
                <span className="pt-2 text-[14px] text-cream/70">C/ de l'Illa Cabrera, 13, Quatre Carreres, 46026 València, Valencia</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="rounded-sm bg-ink-800/5 p-2 transition-colors group-hover:bg-white/10">
                  <Phone className="h-4 w-4 text-cream/55" />
                </div>
                <a href="tel:+34613881414" className="text-[14px] text-cream/70 transition-colors hover:text-cream">
                  +34 613 881 414
                </a>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="rounded-sm bg-ink-800/5 p-2 transition-colors group-hover:bg-white/10">
                  <Mail className="h-4 w-4 text-cream/55" />
                </div>
                <Link to="/contacto" className="text-[14px] text-cream/70 transition-colors hover:text-cream">
                  Formulario de Contacto
                </Link>
              </div>
            </div>
            
            <h4 className="mb-3 mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">Métodos de Pago</h4>
            <div className="flex gap-2 items-center">
              <div className="rounded-sm bg-ink-800/5 p-2">
                <CreditCard className="h-5 w-5 text-cream/55" />
              </div>
              <div className="text-[12px] text-cream/45">
                Tarjeta - PayPal - Transferencia
              </div>
            </div>
            
            <h4 className="mb-3 mt-8 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream/45">Síguenos</h4>
            <div className="flex gap-3">
              <a
                href="https://www.facebook.com/resonarent"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm bg-ink-800/5 p-2.5 transition-colors hover:bg-resona group"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4 text-cream/55 group-hover:text-white" />
              </a>
              <a
                href="https://www.twitter.com/resonarent"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm bg-ink-800/5 p-2.5 transition-colors hover:bg-resona group"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4 text-cream/55 group-hover:text-white" />
              </a>
              <a
                href="https://www.instagram.com/resonarent"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm bg-ink-800/5 p-2.5 transition-colors hover:bg-resona group"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4 text-cream/55 group-hover:text-white" />
              </a>
              <a
                href="https://www.linkedin.com/company/resonarent"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-sm bg-ink-800/5 p-2.5 transition-colors hover:bg-resona group"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4 text-cream/55 group-hover:text-white" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 border-t border-cream/10 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              
              <p className="text-[13px] text-cream/45">
                © 2024 <span className="font-medium text-cream/70">ReSona Rent</span>. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/politica-privacidad" className="text-[13px] text-cream/45 transition-colors hover:text-cream">
                Política de Privacidad
              </Link>
              <Link to="/aviso-legal" className="text-[13px] text-cream/45 transition-colors hover:text-cream">
                Aviso Legal
              </Link>
              <Link to="/terminos-condiciones" className="text-[13px] text-cream/45 transition-colors hover:text-cream">
                Condiciones
              </Link>
              <Link to="/politica-cookies" className="text-[13px] text-cream/45 transition-colors hover:text-cream">
                Cookies
              </Link>
              <Link to="/mis-datos" className="text-[13px] text-cream/45 transition-colors hover:text-cream">
                🔒 Mis Datos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;







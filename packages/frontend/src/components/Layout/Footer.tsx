import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, CreditCard } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Wave Decoration */}
      <div className="relative">
        <svg className="w-full h-12 text-gray-50" viewBox="0 0 1440 48" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,32L80,29.3C160,27,320,21,480,21.3C640,21,800,27,960,32C1120,37,1280,43,1360,45.3L1440,48L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
        </svg>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info con Logo */}
          <div>
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 mb-4 group hover:opacity-90 transition-opacity">
              <img src="/logo-resona.svg" alt="ReSona Events" width="48" height="48" className="h-12 w-12" />
              <div className="flex flex-col">
                <span
                  className="text-2xl font-bold leading-tight"
                  style={{ fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif', color: '#5ebbff' }}
                >
                  ReSona
                </span>
                <span className="text-xs tracking-widest text-gray-300">EVENTS</span>
              </div>
            </Link>
            <p className="text-gray-300 mb-4 text-sm">
              Tu partner de confianza para el alquiler de material de eventos.
              Más de 10 años haciendo realidad tus celebraciones.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-resona">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/productos" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Catálogo
              </Link></li>
              <li><Link to="/servicios" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Servicios
              </Link></li>
              <li><Link to="/sobre-nosotros" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Sobre Nosotros
              </Link></li>
              <li><Link to="/blog" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Blog
              </Link></li>
              <li><Link to="/contacto" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Contacto
              </Link></li>
              <li><Link to="/faqs" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                FAQs
              </Link></li>
            </ul>
          </div>

          {/* Servicios Locales SEO */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-resona">Servicios en Valencia</h4>
            <ul className="space-y-2">
              <li><Link to="/servicios/alquiler-sonido-valencia" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Alquiler Sonido Valencia
              </Link></li>
              <li><Link to="/servicios/alquiler-altavoces-profesionales" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Alquiler Altavoces Valencia
              </Link></li>
              <li><Link to="/servicios/iluminacion-led-profesional" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Iluminación Valencia
              </Link></li>
              <li><Link to="/servicios/sonido-bodas-valencia" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Sonido para Bodas
              </Link></li>
              <li><Link to="/alquiler-sonido-torrent" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Alquiler Sonido Torrent
              </Link></li>
              <li><Link to="/productos?category=sonido" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Ver Equipos de Sonido
              </Link></li>
              <li><Link to="/productos?category=iluminacion" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Ver Iluminación
              </Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-resona">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 group">
                <div className="bg-resona/10 p-2 rounded-lg group-hover:bg-resona/20 transition">
                  <MapPin className="w-5 h-5 text-resona" />
                </div>
                <span className="text-gray-300 text-sm pt-2">C/ de l'Illa Cabrera, 13, Quatre Carreres, 46026 València, Valencia</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="bg-resona/10 p-2 rounded-lg group-hover:bg-resona/20 transition">
                  <Phone className="w-5 h-5 text-resona" />
                </div>
                <a href="tel:+34613881414" className="text-gray-300 hover:text-resona transition text-sm">
                  +34 613 881 414
                </a>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="bg-resona/10 p-2 rounded-lg group-hover:bg-resona/20 transition">
                  <Mail className="w-5 h-5 text-resona" />
                </div>
                <a href="mailto:info@resonaevents.com" className="text-gray-300 hover:text-resona transition text-sm">
                  info@resonaevents.com
                </a>
              </div>
            </div>
            
            <h4 className="text-sm font-semibold mt-6 mb-3 text-gray-400">Métodos de Pago</h4>
            <div className="flex gap-2 items-center">
              <div className="bg-white p-2 rounded">
                <CreditCard className="w-6 h-6 text-gray-700" />
              </div>
              <div className="text-xs text-gray-400">
                Tarjeta - PayPal - Transferencia
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700/50 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-resona rounded-full animate-pulse"></div>
              <p className="text-gray-400 text-sm">
                © 2024 <span className="text-resona font-semibold">ReSona Events</span>. Todos los derechos reservados.
              </p>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              <Link to="/politica-privacidad" className="text-gray-400 hover:text-resona text-sm transition">
                Política de Privacidad
              </Link>
              <Link to="/aviso-legal" className="text-gray-400 hover:text-resona text-sm transition">
                Aviso Legal
              </Link>
              <Link to="/terminos-condiciones" className="text-gray-400 hover:text-resona text-sm transition">
                Condiciones
              </Link>
              <Link to="/politica-cookies" className="text-gray-400 hover:text-resona text-sm transition">
                Cookies
              </Link>
              <Link to="/mis-datos" className="text-gray-400 hover:text-resona text-sm transition">
                🔒 Mis Datos
              </Link>
            </div>
          </div>
          
          {/* Decorative Bottom Line */}
          <div className="mt-6 h-1 bg-resona/30 rounded-full mx-auto max-w-md"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;







import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
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
              <img src="/logo-resona.svg" alt="ReSona Events" className="h-12 w-auto" />
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
            <div className="flex gap-3">
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-resona transition group">
                <Facebook className="w-5 h-5 group-hover:scale-110 transition" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-resona transition group">
                <Instagram className="w-5 h-5 group-hover:scale-110 transition" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-resona transition group">
                <Twitter className="w-5 h-5 group-hover:scale-110 transition" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-resona transition group">
                <Youtube className="w-5 h-5 group-hover:scale-110 transition" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-resona">Enlaces Rapidos</h4>
            <ul className="space-y-2">
              <li><Link to="/productos" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Catalogo
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

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-resona">Categorias</h4>
            <ul className="space-y-2">
              <li><Link to="/productos?category=sonido" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Sonido
              </Link></li>
              <li><Link to="/productos?category=iluminacion" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Iluminacion
              </Link></li>
              <li><Link to="/productos?category=fotografia-y-video" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Fotografia y Video
              </Link></li>
              <li><Link to="/productos?category=mobiliario" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Mobiliario
              </Link></li>
              <li><Link to="/productos?category=elementos-decorativos" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Decoracion
              </Link></li>
              <li><Link to="/productos" className="text-gray-300 hover:text-resona transition flex items-center group">
                <span className="w-1 h-1 bg-resona rounded-full mr-2 group-hover:w-2 transition-all"></span>
                Ver Todas
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
                <a href="tel:+34600123456" className="text-gray-300 hover:text-resona transition text-sm">
                  +34 600 123 456
                </a>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="bg-resona/10 p-2 rounded-lg group-hover:bg-resona/20 transition">
                  <Mail className="w-5 h-5 text-resona" />
                </div>
                <a href="mailto:info@resona.com" className="text-gray-300 hover:text-resona transition text-sm">
                  info@resona.com
                </a>
              </div>
            </div>
            
            <h4 className="text-sm font-semibold mt-6 mb-3 text-gray-400">Metodos de Pago</h4>
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
              <Link to="/legal/privacidad" className="text-gray-400 hover:text-resona text-sm transition">
                Privacidad
              </Link>
              <Link to="/legal/terminos" className="text-gray-400 hover:text-resona text-sm transition">
                Términos y Condiciones
              </Link>
              <Link to="/legal/cookies" className="text-gray-400 hover:text-resona text-sm transition">
                Cookies
              </Link>
            </div>
          </div>
          
          {/* Decorative Bottom Line */}
          <div className="mt-6 h-1 bg-gradient-to-r from-transparent via-resona to-transparent rounded-full"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;







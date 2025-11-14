import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, Phone, MapPin, CreditCard } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-2xl font-bold mb-4">
              Re<span className="text-orange-500">Sona</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Tu partner de confianza para el alquiler de material de eventos. 
              Más de 10 años haciendo realidad tus celebraciones.
            </p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-orange-500"><Facebook className="w-5 h-5" /></a>
              <a href="#" className="hover:text-orange-500"><Instagram className="w-5 h-5" /></a>
              <a href="#" className="hover:text-orange-500"><Twitter className="w-5 h-5" /></a>
              <a href="#" className="hover:text-orange-500"><Youtube className="w-5 h-5" /></a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Enlaces Rápidos</h4>
            <ul className="space-y-2">
              <li><Link to="/productos" className="text-gray-400 hover:text-white">Catálogo</Link></li>
              <li><Link to="/servicios" className="text-gray-400 hover:text-white">Servicios</Link></li>
              <li><Link to="/sobre-nosotros" className="text-gray-400 hover:text-white">Sobre Nosotros</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-white">Blog</Link></li>
              <li><Link to="/contacto" className="text-gray-400 hover:text-white">Contacto</Link></li>
              <li><Link to="/faqs" className="text-gray-400 hover:text-white">Preguntas Frecuentes</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Categorías</h4>
            <ul className="space-y-2">
              <li><Link to="/productos?categoria=sonido" className="text-gray-400 hover:text-white">Sonido</Link></li>
              <li><Link to="/productos?categoria=iluminacion" className="text-gray-400 hover:text-white">Iluminación</Link></li>
              <li><Link to="/productos?categoria=audiovisual" className="text-gray-400 hover:text-white">Audiovisual</Link></li>
              <li><Link to="/productos?categoria=mobiliario" className="text-gray-400 hover:text-white">Mobiliario</Link></li>
              <li><Link to="/productos?categoria=decoracion" className="text-gray-400 hover:text-white">Decoración</Link></li>
              <li><Link to="/productos?categoria=carpas" className="text-gray-400 hover:text-white">Carpas y Estructuras</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contacto</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">Calle Example 123, Valencia, España</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">+34 600 123 456</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-orange-500" />
                <span className="text-gray-400">info@resona.com</span>
              </div>
            </div>
            
            <h4 className="text-lg font-semibold mt-6 mb-3">Métodos de Pago</h4>
            <div className="flex gap-3">
              <CreditCard className="w-8 h-8 text-gray-400" />
              <img src="/visa.png" alt="Visa" className="h-8" />
              <img src="/mastercard.png" alt="Mastercard" className="h-8" />
              <img src="/paypal.png" alt="PayPal" className="h-8" />
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 ReSona. Todos los derechos reservados.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <Link to="/privacidad" className="text-gray-400 hover:text-white text-sm">Política de Privacidad</Link>
              <Link to="/terminos" className="text-gray-400 hover:text-white text-sm">Términos y Condiciones</Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white text-sm">Cookies</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

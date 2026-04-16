import { Shield, Truck, Clock, Star } from 'lucide-react';

const TrustBar = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-4 sm:gap-8 py-2 text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
          <div className="flex items-center gap-1.5 text-gray-700">
            <Truck className="w-4 h-4 text-green-600 flex-shrink-0" />
            <span className="font-medium">Entrega gratis Valencia</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-gray-700">
            <Shield className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span className="font-medium">Pago 100% seguro</span>
          </div>
          <div className="flex items-center gap-1.5 text-gray-700">
            <Clock className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <span className="font-medium">Solo 25% de reserva</span>
          </div>
          <div className="hidden md:flex items-center gap-1.5 text-gray-700">
            <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />
            <span className="font-medium">+500 eventos · 4.8/5 valoraciones</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBar;

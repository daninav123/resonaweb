import { MapPin, Phone, Mail, Clock } from 'lucide-react';

interface LocalBusinessInfoProps {
  variant?: 'compact' | 'full';
  showMap?: boolean;
  className?: string;
}

const LocalBusinessInfo = ({ 
  variant = 'compact', 
  showMap = false,
  className = '' 
}: LocalBusinessInfoProps) => {
  const businessInfo = {
    name: 'ReSona Events',
    address: {
      street: "C/ de l'Illa Cabrera, 13",
      neighborhood: 'Quatre Carreres',
      postal: '46026',
      city: 'València',
      province: 'Valencia',
      country: 'España'
    },
    phone: '+34 613 881 414',
    phoneDisplay: '+34 613 881 414',
    email: 'info@resonaevents.com',
    hours: {
      weekday: 'Lun - Vie: 9:00 - 20:00',
      saturday: 'Sáb: 10:00 - 14:00',
      sunday: 'Dom: Cerrado'
    },
    coordinates: {
      lat: 39.4523,
      lng: -0.3744
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${businessInfo.coordinates.lat},${businessInfo.coordinates.lng}`;

  if (variant === 'compact') {
    return (
      <div className={`bg-gradient-to-br from-resona/5 to-resona/10 border border-resona/20 rounded-lg p-6 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-resona" />
          Encuéntranos en Valencia
        </h3>
        
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-resona flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-gray-900">{businessInfo.address.street}</p>
              <p className="text-gray-600">{businessInfo.address.neighborhood}</p>
              <p className="text-gray-600">
                {businessInfo.address.postal} {businessInfo.address.city}, {businessInfo.address.province}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-resona flex-shrink-0" />
            <a 
              href={`tel:${businessInfo.phone.replace(/\s/g, '')}`}
              className="text-sm font-medium text-resona hover:text-resona-dark transition"
            >
              {businessInfo.phoneDisplay}
            </a>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-resona flex-shrink-0" />
            <a 
              href={`mailto:${businessInfo.email}`}
              className="text-sm text-gray-600 hover:text-resona transition"
            >
              {businessInfo.email}
            </a>
          </div>

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark transition text-sm font-medium w-full justify-center mt-2"
          >
            <MapPin className="w-4 h-4" />
            Cómo Llegar
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}>
      <div className="bg-gradient-to-r from-resona to-resona-dark p-6 text-white">
        <h3 className="text-2xl font-bold mb-2">Visítanos en Valencia</h3>
        <p className="text-resona-light">Servicio profesional en Valencia y provincia</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Dirección */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-resona/10 rounded-full flex items-center justify-center flex-shrink-0">
            <MapPin className="w-6 h-6 text-resona" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Dirección</h4>
            <p className="text-gray-700">{businessInfo.address.street}</p>
            <p className="text-gray-600">{businessInfo.address.neighborhood}</p>
            <p className="text-gray-600">
              {businessInfo.address.postal} {businessInfo.address.city}, {businessInfo.address.province}
            </p>
            <p className="text-gray-600">{businessInfo.address.country}</p>
          </div>
        </div>

        {/* Teléfono */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-resona/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Phone className="w-6 h-6 text-resona" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Teléfono</h4>
            <a 
              href={`tel:${businessInfo.phone.replace(/\s/g, '')}`}
              className="text-lg font-medium text-resona hover:text-resona-dark transition"
            >
              {businessInfo.phoneDisplay}
            </a>
            <p className="text-sm text-gray-600 mt-1">Llamadas y WhatsApp</p>
          </div>
        </div>

        {/* Email */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-resona/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Mail className="w-6 h-6 text-resona" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Email</h4>
            <a 
              href={`mailto:${businessInfo.email}`}
              className="text-resona hover:text-resona-dark transition"
            >
              {businessInfo.email}
            </a>
            <p className="text-sm text-gray-600 mt-1">Respuesta en menos de 24h</p>
          </div>
        </div>

        {/* Horario */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-resona/10 rounded-full flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6 text-resona" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-1">Horario</h4>
            <p className="text-gray-700">{businessInfo.hours.weekday}</p>
            <p className="text-gray-700">{businessInfo.hours.saturday}</p>
            <p className="text-gray-600">{businessInfo.hours.sunday}</p>
          </div>
        </div>

        {/* Botón Cómo Llegar */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-resona text-white rounded-lg hover:bg-resona-dark transition font-semibold w-full justify-center"
        >
          <MapPin className="w-5 h-5" />
          Cómo Llegar
        </a>

        {/* Mapa embebido */}
        {showMap && (
          <div className="aspect-video rounded-lg overflow-hidden border border-gray-200">
            <iframe
              src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3080.0!2d${businessInfo.coordinates.lng}!3d${businessInfo.coordinates.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1ses!2ses!4v1234567890123!5m2!1ses!2ses`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación de ReSona Events en Valencia"
            />
          </div>
        )}

        {/* Área de servicio */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2 text-sm">Servimos en:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-resona rounded-full"></div>
              Valencia capital
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-resona rounded-full"></div>
              Área metropolitana
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-resona rounded-full"></div>
              Manises
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-resona rounded-full"></div>
              Paterna
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-resona rounded-full"></div>
              Torrent
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-resona rounded-full"></div>
              Y toda la provincia
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocalBusinessInfo;

import { useEffect, useRef, useState } from 'react';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressAutocompleteProps {
  onAddressSelect: (address: string, distance: number) => void;
  baseAddress?: string;
}

const AddressAutocomplete = ({ onAddressSelect, baseAddress = 'Madrid, España' }: AddressAutocompleteProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState('');

  useEffect(() => {
    const initAutocomplete = () => {
      // API Key
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY_HERE';
      
      if (apiKey === 'YOUR_API_KEY_HERE') {
        setError('⚠️ Configura VITE_GOOGLE_MAPS_API_KEY en el archivo .env');
        return;
      }

      // Verificar si Google Maps ya está cargado
      if (window.google && window.google.maps) {
        setupAutocomplete();
        return;
      }

      // Cargar Google Maps script
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initMap`;
      script.async = true;
      script.defer = true;
      
      // Callback global para cuando se carga el script
      (window as any).initMap = () => {
        setupAutocomplete();
      };

      script.onerror = () => {
        console.error('Error cargando Google Maps');
        setError('Error cargando Google Maps. Verifica tu API key.');
      };

      document.head.appendChild(script);
    };

    const setupAutocomplete = () => {
      if (!inputRef.current || !window.google) return;

      try {
        // Configurar autocompletado
        const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
          types: ['address'],
          componentRestrictions: { country: 'es' },
          fields: ['formatted_address', 'geometry'],
        });

        autocomplete.addListener('place_changed', () => {
          const place = autocomplete.getPlace();
          
          if (!place.geometry || !place.formatted_address) {
            setError('Por favor selecciona una dirección de la lista');
            return;
          }

          setLoading(true);
          setError(null);
          setSelectedAddress(place.formatted_address);

          try {
            // Calcular distancia usando Distance Matrix
            const service = new google.maps.DistanceMatrixService();
            
            const request = {
              origins: [baseAddress],
              destinations: [place.formatted_address],
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC,
            };

            service.getDistanceMatrix(request, (response, status) => {
              setLoading(false);

              if (status === 'OK' && response?.rows[0]?.elements[0]?.status === 'OK') {
                const distanceInMeters = response.rows[0].elements[0].distance.value;
                const distanceInKm = Math.round(distanceInMeters / 1000);
                
                console.log('📍 Distancia calculada:', {
                  desde: baseAddress,
                  hasta: place.formatted_address,
                  distancia: `${distanceInKm}km`
                });

                onAddressSelect(place.formatted_address, distanceInKm);
              } else {
                setError('No se pudo calcular la distancia. Usa la entrada manual.');
                console.error('Error en Distance Matrix:', status);
              }
            });
          } catch (err) {
            setLoading(false);
            setError('Error al calcular distancia');
            console.error(err);
          }
        });
      } catch (err) {
        console.error('Error configurando autocomplete:', err);
        setError('Error configurando búsqueda de direcciones');
      }
    };

    initAutocomplete();
  }, [baseAddress, onAddressSelect]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-900 flex items-center gap-2">
        <MapPin className="h-4 w-4" />
        Dirección de entrega
      </label>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          placeholder="Escribe tu dirección..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
        
        {loading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          </div>
        )}
      </div>

      {selectedAddress && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          ✅ {selectedAddress}
        </div>
      )}

      {error && (
        <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
          {error}
        </div>
      )}

      <p className="text-xs text-gray-500">
        Empieza a escribir y selecciona de la lista para calcular distancia automáticamente
      </p>
    </div>
  );
};

export default AddressAutocomplete;

import { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Search, X, Navigation, Loader2 } from 'lucide-react';

export interface LocationData {
  address: string;
  lat: number | null;
  lng: number | null;
  city?: string;
  postalCode?: string;
  province?: string;
  country?: string;
  displayName?: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    house_number?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    postcode?: string;
    state?: string;
    province?: string;
    country?: string;
    county?: string;
  };
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
}

const DEBOUNCE_MS = 400;
const MIN_CHARS = 3;

const LocationAutocomplete = ({
  value,
  onChange,
  placeholder = 'Escribe una dirección...',
  className = '',
}: LocationAutocompleteProps) => {
  const [query, setQuery] = useState(value || '');
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Sync external value
  useEffect(() => {
    if (value !== query && value !== selectedLocation?.address) {
      setQuery(value || '');
    }
  }, [value]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const searchAddress = useCallback(async (q: string) => {
    if (q.length < MIN_CHARS) {
      setResults([]);
      setShowDropdown(false);
      return;
    }

    // Cancel previous request
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const params = new URLSearchParams({
        q,
        format: 'json',
        addressdetails: '1',
        limit: '6',
        countrycodes: 'es',
        'accept-language': 'es',
      });

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?${params}`,
        {
          signal: abortRef.current.signal,
          headers: { 'User-Agent': 'ResonaWeb/1.0' },
        }
      );

      if (!res.ok) throw new Error('Nominatim error');
      const data: NominatimResult[] = await res.json();
      setResults(data);
      setShowDropdown(data.length > 0);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Error buscando dirección:', err);
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (val: string) => {
    setQuery(val);
    setSelectedLocation(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(val), DEBOUNCE_MS);
  };

  const selectResult = (result: NominatimResult) => {
    const addr = result.address;
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    const province = addr.state || addr.province || addr.county || '';
    const postalCode = addr.postcode || '';
    const country = addr.country || 'España';

    // Build readable address
    const parts: string[] = [];
    if (addr.road) {
      parts.push(addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road);
    }
    if (postalCode || city) {
      parts.push([postalCode, city].filter(Boolean).join(' '));
    }
    if (province && province !== city) {
      parts.push(province);
    }

    const shortAddress = parts.join(', ') || result.display_name;

    const locationData: LocationData = {
      address: shortAddress,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      city,
      postalCode,
      province,
      country,
      displayName: result.display_name,
    };

    setQuery(shortAddress);
    setSelectedLocation(locationData);
    setShowDropdown(false);
    setResults([]);
    onChange(locationData);
  };

  const clearSelection = () => {
    setQuery('');
    setSelectedLocation(null);
    setResults([]);
    onChange({ address: '', lat: null, lng: null });
  };

  const formatResultDisplay = (result: NominatimResult) => {
    const addr = result.address;
    const mainPart = addr.road
      ? (addr.house_number ? `${addr.road} ${addr.house_number}` : addr.road)
      : result.display_name.split(',')[0];
    const city = addr.city || addr.town || addr.village || addr.municipality || '';
    const province = addr.state || addr.province || '';
    const secondary = [city, province].filter(Boolean).join(', ');
    return { main: mainPart, secondary };
  };

  // Static map tile URL (OpenStreetMap)
  const mapUrl = selectedLocation?.lat && selectedLocation?.lng
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${selectedLocation.lng - 0.005},${selectedLocation.lat - 0.003},${selectedLocation.lng + 0.005},${selectedLocation.lat + 0.003}&layer=mapnik&marker=${selectedLocation.lat},${selectedLocation.lng}`
    : null;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Ubicación del Evento
      </label>

      {/* Input */}
      <div className="relative">
        <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={e => handleInputChange(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {loading && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
          {query && !loading && (
            <button onClick={clearSelection} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {results.map((result) => {
            const { main, secondary } = formatResultDisplay(result);
            return (
              <button
                key={result.place_id}
                onClick={() => selectResult(result)}
                className="w-full text-left px-3 py-2.5 hover:bg-blue-50 border-b border-gray-50 last:border-0 transition flex items-start gap-2.5"
              >
                <MapPin className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{main}</p>
                  {secondary && (
                    <p className="text-xs text-gray-500 truncate">{secondary}</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Selected location details + map */}
      {selectedLocation && selectedLocation.lat && (
        <div className="mt-2 rounded-lg border border-gray-200 overflow-hidden">
          {/* Mini map */}
          <div className="h-32 bg-gray-100 relative">
            <iframe
              title="Mapa de ubicación"
              src={mapUrl || ''}
              className="w-full h-full border-0"
              loading="lazy"
            />
          </div>

          {/* Address details */}
          <div className="px-3 py-2 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <Navigation className="w-3.5 h-3.5 text-green-600 shrink-0" />
              <div className="text-xs text-gray-600 truncate">
                {selectedLocation.city && <span className="font-medium">{selectedLocation.city}</span>}
                {selectedLocation.province && selectedLocation.province !== selectedLocation.city && (
                  <span> · {selectedLocation.province}</span>
                )}
                {selectedLocation.postalCode && <span> · CP {selectedLocation.postalCode}</span>}
              </div>
            </div>
            <div className="text-[10px] text-gray-400 shrink-0 ml-2">
              {selectedLocation.lat?.toFixed(4)}, {selectedLocation.lng?.toFixed(4)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationAutocomplete;

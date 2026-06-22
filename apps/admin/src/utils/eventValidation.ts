/**
 * Utilidades para validación de eventos
 */

// Coordenadas de Valencia
const VALENCIA_COORDS = { lat: 39.4699, lng: -0.3763 };

// Fechas especiales (mes: 0-11, día: 1-31)
const SPECIAL_DATES = [
  { month: 11, day: 31, name: 'Nochevieja' },
  { month: 0, day: 1, name: 'Año Nuevo' },
  { month: 0, day: 6, name: 'Reyes' },
  { month: 11, day: 24, name: 'Nochebuena' },
  { month: 11, day: 25, name: 'Navidad' },
  // Añade más fechas especiales aquí
];

/**
 * Verifica si una fecha es especial (festivo/día con recargo)
 */
export function isSpecialDate(dateString: string): { isSpecial: boolean; name?: string } {
  if (!dateString) return { isSpecial: false };
  
  const date = new Date(dateString);
  const month = date.getMonth();
  const day = date.getDate();
  
  const special = SPECIAL_DATES.find(sd => sd.month === month && sd.day === day);
  
  return {
    isSpecial: !!special,
    name: special?.name,
  };
}

/**
 * Calcula distancia aproximada entre dos puntos (fórmula Haversine)
 * Retorna distancia en kilómetros
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Obtiene coordenadas de una dirección usando geocoding
 * Nota: Requiere API key de Google Maps o servicio similar
 */
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  try {
    // Opción 1: Usar servicio de geocoding gratuito (Nominatim - OpenStreetMap)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address + ', España')}&limit=1`
    );
    
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Calcula la distancia desde Valencia hasta una dirección
 */
export async function getDistanceFromValencia(address: string): Promise<number | null> {
  if (!address) return null;
  
  const coords = await geocodeAddress(address);
  if (!coords) return null;
  
  const distance = calculateDistance(
    VALENCIA_COORDS.lat,
    VALENCIA_COORDS.lng,
    coords.lat,
    coords.lng
  );
  
  return Math.round(distance);
}

/**
 * Valida si el evento está dentro de los parámetros estándar
 */
export interface EventValidation {
  hasLocation: boolean;
  hasDate: boolean;
  distance: number | null;
  isWithinRange: boolean | null; // true si < 50km
  isSpecialDate: boolean;
  specialDateName?: string;
  warnings: string[];
}

export async function validateEventData(
  location: string,
  date: string
): Promise<EventValidation> {
  const warnings: string[] = [];
  
  // Validar fecha especial
  const dateCheck = isSpecialDate(date);
  
  // Validar distancia
  let distance: number | null = null;
  let isWithinRange: boolean | null = null;
  
  if (location) {
    distance = await getDistanceFromValencia(location);
    if (distance !== null) {
      isWithinRange = distance <= 50;
      if (!isWithinRange) {
        warnings.push(`El evento está a ${distance}km de Valencia. Puede aplicar recargo por desplazamiento.`);
      }
    }
  } else {
    warnings.push('No se especificó ubicación. El precio es válido solo para eventos a menos de 50km de Valencia.');
  }
  
  if (!date) {
    warnings.push('No se especificó fecha. El precio es válido solo para fechas normales (excluye Nochevieja y otros días especiales).');
  } else if (dateCheck.isSpecial) {
    warnings.push(`${dateCheck.name} es una fecha especial. Puede aplicar recargo.`);
  }
  
  return {
    hasLocation: !!location,
    hasDate: !!date,
    distance,
    isWithinRange,
    isSpecialDate: dateCheck.isSpecial,
    specialDateName: dateCheck.name,
    warnings,
  };
}

/**
 * Calcula el recargo por distancia
 */
export function calculateDistanceSurcharge(distance: number | null): number {
  if (!distance || distance <= 50) return 0;
  
  // Ejemplo: €1 por km adicional después de 50km
  const extraKm = distance - 50;
  return extraKm * 1;
}

/**
 * Calcula el recargo por fecha especial
 */
export function calculateSpecialDateSurcharge(isSpecial: boolean, basePrice: number): number {
  if (!isSpecial) return 0;
  
  // Ejemplo: 20% de recargo en fechas especiales
  return basePrice * 0.2;
}

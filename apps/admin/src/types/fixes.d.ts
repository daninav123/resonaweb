// Archivo de declaraciones para corregir errores de tipos

// Extender tipos que faltan
declare global {
  interface ServicePrices {
    [key: string]: number;
  }

  interface WeddingPart {
    id: string;
    name: string;
    icon: string;
    quantity: number;
  }
}

// Hacer que todas las respuestas de API tengan data
declare module '../services/api' {
  interface ApiResponse {
    data?: any;
    message?: string;
    error?: string;
  }
}

export {};

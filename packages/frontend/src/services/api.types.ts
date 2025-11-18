// Tipos para respuestas de API

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  status?: number;
}

// Helper para tipar respuestas de axios
export function typedApiResponse<T>(response: any): ApiResponse<T> {
  return response as ApiResponse<T>;
}

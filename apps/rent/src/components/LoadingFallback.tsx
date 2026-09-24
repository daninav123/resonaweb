import { memo } from 'react';

// Componente de loading minimalista y optimizado
const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center min-h-screen bg-ink">
    <div className="text-center">
      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#3D5AFE]"></div>
      <p className="mt-4 text-cream/65 font-medium">Cargando...</p>
    </div>
  </div>
));

LoadingFallback.displayName = 'LoadingFallback';

export default LoadingFallback;

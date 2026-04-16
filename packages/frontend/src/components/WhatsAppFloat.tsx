import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';

const WHATSAPP_NUMBER = '34613881414';
const DEFAULT_MESSAGE = 'Hola, estoy interesado en alquiler de equipos para mi evento. ¿Podéis ayudarme?';

const WhatsAppFloat = () => {
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Mostrar tooltip automáticamente después de 8 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!dismissed) {
        setIsTooltipVisible(true);
      }
    }, 8000);

    return () => clearTimeout(timer);
  }, [dismissed]);

  // Auto-ocultar tooltip después de 10 segundos
  useEffect(() => {
    if (isTooltipVisible) {
      const timer = setTimeout(() => {
        setIsTooltipVisible(false);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [isTooltipVisible]);

  const handleClick = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleDismissTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsTooltipVisible(false);
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* Tooltip */}
      {isTooltipVisible && (
        <div className="bg-white rounded-xl shadow-2xl p-4 max-w-[260px] animate-fade-in border border-gray-100 relative">
          <button
            onClick={handleDismissTooltip}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
          <p className="text-sm text-gray-800 font-medium pr-4">
            ¿Necesitas ayuda con tu evento?
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Escríbenos por WhatsApp y te asesoramos gratis
          </p>
          {/* Triangle */}
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white border-r border-b border-gray-100 transform rotate-45"></div>
        </div>
      )}

      {/* WhatsApp Button */}
      <button
        onClick={handleClick}
        onMouseEnter={() => !dismissed && setIsTooltipVisible(true)}
        onMouseLeave={() => setIsTooltipVisible(false)}
        className="group bg-[#25D366] hover:bg-[#20BD5A] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-110 active:scale-95"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle className="w-7 h-7" />
      </button>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default WhatsAppFloat;

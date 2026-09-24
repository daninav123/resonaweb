import { useNavigate, useSearchParams } from 'react-router-dom';
import { XCircle, RefreshCw, Home, HelpCircle } from 'lucide-react';

const PaymentErrorPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error') || 'Error desconocido';

  const handleRetry = () => {
    if (orderId) {
      navigate(`/checkout/stripe?orderId=${orderId}`);
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-ink-800 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-ink-800 rounded-lg shadow-lg p-8 text-center">
          {/* Icono de error */}
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-500/15 mb-6">
            <XCircle className="h-12 w-12 text-red-600" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-cream mb-2">
            Error en el Pago
          </h1>
          <p className="text-lg text-cream/65 mb-4">
            No se pudo procesar tu pago
          </p>

          {/* Mensaje de error */}
          <div className="bg-red-500/10 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-300 font-medium">
              {error}
            </p>
          </div>

          {/* Causas comunes */}
          <div className="bg-ink-800 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-cream mb-3 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-cream/65" />
              Causas Comunes
            </h2>
            <ul className="space-y-2 text-cream/75 text-sm">
              <li className="flex items-start">
                <span className="text-resona-light mr-2">•</span>
                <span>Fondos insuficientes en la tarjeta</span>
              </li>
              <li className="flex items-start">
                <span className="text-resona-light mr-2">•</span>
                <span>Datos de la tarjeta incorrectos</span>
              </li>
              <li className="flex items-start">
                <span className="text-resona-light mr-2">•</span>
                <span>La tarjeta ha sido rechazada por el banco</span>
              </li>
              <li className="flex items-start">
                <span className="text-resona-light mr-2">•</span>
                <span>Problemas de conexión durante el proceso</span>
              </li>
            </ul>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handleRetry}
              className="bg-resona text-white px-6 py-3 rounded-lg font-semibold hover:bg-resona-dark transition-colors flex items-center justify-center"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Intentar de Nuevo
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-ink-700 text-cream/75 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center"
            >
              <Home className="w-5 h-5 mr-2" />
              Volver al Inicio
            </button>
          </div>

          {/* Información de contacto */}
          <div className="mt-8 pt-8 border-t border-cream/10">
            <p className="text-sm text-cream/65 mb-2">
              Si el problema persiste, por favor contáctanos
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
              <a
                href="mailto:info@resonarent.com"
                className="text-resona-light hover:underline"
              >
                📧 info@resonarent.com
              </a>
              <a
                href="tel:+34613881414"
                className="text-resona-light hover:underline"
              >
                📞 +34 613 881 414
              </a>
            </div>
          </div>

          {/* Nota de seguridad */}
          <div className="mt-6 p-4 bg-resona/10 rounded-lg">
            <p className="text-xs text-cream/65">
              🔒 Tu información está segura. No se ha realizado ningún cargo en tu tarjeta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentErrorPage;

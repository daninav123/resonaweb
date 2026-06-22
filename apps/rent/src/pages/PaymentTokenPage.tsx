import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '@resona/api-client';
import { CreditCard, Calendar, MapPin, AlertTriangle, Loader2, CheckCircle, Phone, ArrowRight } from 'lucide-react';

const PaymentTokenPage = () => {
  const { token } = useParams();

  const { data: quote, isLoading, error } = useQuery({
    queryKey: ['payment-token', token],
    queryFn: async () => {
      const res: any = await api.get(`/quote-requests/payment/${token}`);
      return res.data || res;
    },
    enabled: !!token,
    retry: false,
  });

  const fmt = (n: number) => Number(n).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' }) : 'Por confirmar';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
          <p className="text-gray-600">Cargando datos de pago...</p>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Enlace no válido</h1>
          <p className="text-gray-600 mb-6">Este enlace de pago no existe o ha expirado. Contacta con nosotros si necesitas ayuda.</p>
          <a href="tel:+34600000000" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <Phone className="w-4 h-4" /> Contactar
          </a>
        </div>
      </div>
    );
  }

  const total = Number(quote.estimatedTotal || 0);
  const first = Number(quote.firstPayment || total * 0.25);
  const second = Number(quote.secondPayment || total * 0.50);
  const third = Number(quote.thirdPayment || total * 0.25);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-lg mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Resumen de tu reserva</h1>
          <p className="text-gray-500 mt-1">¡Hola {quote.customerName}! Aquí tienes los detalles de tu evento.</p>
        </div>

        {/* Event Info Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">{quote.eventType || 'Tu evento'}</h2>
          <div className="space-y-3">
            {quote.eventDate && (
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="w-5 h-5 text-blue-500" />
                <span>{fmtDate(quote.eventDate)}</span>
              </div>
            )}
            {quote.eventLocation && (
              <div className="flex items-center gap-3 text-gray-600">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>{quote.eventLocation}</span>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Total del presupuesto</span>
              <span className="text-2xl font-bold text-gray-900">{fmt(total)}€</span>
            </div>
          </div>
        </div>

        {/* Payment Plan */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="font-semibold text-gray-900 text-lg mb-4">Plan de pagos</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-green-700 text-sm font-bold">1</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Reserva (25%)</p>
                    <p className="text-sm text-gray-500">Al confirmar la reserva</p>
                  </div>
                  <span className="font-bold text-gray-900">{fmt(first)}€</span>
                </div>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4"></div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-blue-700 text-sm font-bold">2</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Intermedio (50%)</p>
                    <p className="text-sm text-gray-500">Un mes antes del evento</p>
                  </div>
                  <span className="font-bold text-gray-900">{fmt(second)}€</span>
                </div>
              </div>
            </div>

            <div className="ml-4 border-l-2 border-dashed border-gray-200 h-4"></div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-purple-700 text-sm font-bold">3</span>
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Resto (25%)</p>
                    <p className="text-sm text-gray-500">El día del evento</p>
                  </div>
                  <span className="font-bold text-gray-900">{fmt(third)}€</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact / CTA */}
        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
          <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">¿Quieres confirmar?</h3>
          <p className="text-gray-500 text-sm mb-4">
            Contacta con nosotros para confirmar tu reserva y realizar el primer pago. 
            Te enviaremos las instrucciones de pago por email.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="tel:+34600000000"
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              <Phone className="w-4 h-4" /> Llamar
            </a>
            <a
              href={`mailto:info@resona.es?subject=Confirmar reserva - ${quote.eventType}&body=Hola, quiero confirmar mi reserva para ${quote.eventType} el ${fmtDate(quote.eventDate)}. Mi nombre es ${quote.customerName}. Gracias.`}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium transition"
            >
              Enviar email <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Este enlace es personal e intransferible. Si tienes dudas, contacta con nosotros.
        </p>
      </div>
    </div>
  );
};

export default PaymentTokenPage;

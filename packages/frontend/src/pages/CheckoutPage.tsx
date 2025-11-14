import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import { CreditCard, Lock, Calendar, User, Mail, Phone, MapPin, ShoppingBag, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    // Datos personales
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    
    // Dirección de entrega
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'España',
    
    // Fechas de alquiler
    startDate: '',
    endDate: '',
    
    // Datos de pago
    cardNumber: '',
    cardExpiry: '',
    cardCvc: '',
    cardName: '',
    
    // Opciones adicionales
    deliveryOption: 'pickup', // pickup, delivery
    notes: '',
    acceptTerms: false,
  });

  // Obtener carrito actual
  const { data: cart, isLoading: cartLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const response: any = await api.get('/cart');
      return response.data;
    },
  });

  // Crear orden
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const response: any = await api.post('/orders', orderData);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('¡Pedido realizado con éxito!');
      navigate(`/mis-pedidos/${data.id}`);
    },
    onError: () => {
      toast.error('Error al procesar el pedido');
      setIsProcessing(false);
    },
  });

  const calculateTotal = () => {
    if (!cart?.items) return 0;
    const subtotal = cart.items.reduce((total: number, item: any) => {
      return total + (item.product.pricePerDay * item.quantity);
    }, 0);
    return subtotal * 1.21; // Con IVA
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.acceptTerms) {
      toast.error('Debes aceptar los términos y condiciones');
      return;
    }

    setIsProcessing(true);

    // Simular proceso de pago
    setTimeout(() => {
      createOrderMutation.mutate({
        ...formData,
        items: cart?.items || [],
        total: calculateTotal(),
        paymentMethod: 'CARD',
      });
    }, 2000);
  };

  const updateFormData = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  if (cartLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const total = calculateTotal();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <ShoppingBag className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Tu carrito está vacío</h2>
            <p className="text-gray-600 mb-6">Añade productos antes de continuar con el checkout</p>
            <button
              onClick={() => navigate('/productos')}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700"
            >
              Ver Productos
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            <div className={`flex-1 text-center ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>1</div>
              <p className="text-sm mt-1">Datos</p>
            </div>
            <div className="flex-1 border-t-2 ${step >= 2 ? 'border-blue-600' : 'border-gray-200'}" />
            <div className={`flex-1 text-center ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>2</div>
              <p className="text-sm mt-1">Entrega</p>
            </div>
            <div className="flex-1 border-t-2 ${step >= 3 ? 'border-blue-600' : 'border-gray-200'}" />
            <div className={`flex-1 text-center ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>3</div>
              <p className="text-sm mt-1">Pago</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit}>
              {/* Step 1: Datos Personales */}
              {step === 1 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Datos Personales
                  </h2>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => updateFormData('firstName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Apellidos</label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => updateFormData('lastName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => updateFormData('phone', e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Dirección y Fechas */}
              {step === 2 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Entrega y Fechas
                  </h2>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Método de entrega</label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <label className={`border rounded-lg p-4 cursor-pointer ${formData.deliveryOption === 'pickup' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <input
                          type="radio"
                          name="delivery"
                          value="pickup"
                          checked={formData.deliveryOption === 'pickup'}
                          onChange={(e) => updateFormData('deliveryOption', e.target.value)}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-medium">Recogida en tienda</p>
                          <p className="text-sm text-gray-600">Gratis - Calle Example 123, Valencia</p>
                        </div>
                      </label>
                      <label className={`border rounded-lg p-4 cursor-pointer ${formData.deliveryOption === 'delivery' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}>
                        <input
                          type="radio"
                          name="delivery"
                          value="delivery"
                          checked={formData.deliveryOption === 'delivery'}
                          onChange={(e) => updateFormData('deliveryOption', e.target.value)}
                          className="sr-only"
                        />
                        <div>
                          <p className="font-medium">Envío a domicilio</p>
                          <p className="text-sm text-gray-600">+€50 - Introduce tu dirección</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {formData.deliveryOption === 'delivery' && (
                    <div className="space-y-4 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                        <input
                          type="text"
                          required
                          value={formData.address}
                          onChange={(e) => updateFormData('address', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Ciudad</label>
                          <input
                            type="text"
                            required
                            value={formData.city}
                            onChange={(e) => updateFormData('city', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                          <input
                            type="text"
                            required
                            value={formData.zipCode}
                            onChange={(e) => updateFormData('zipCode', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Fechas de alquiler
                    </label>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Fecha inicio</label>
                        <input
                          type="date"
                          required
                          value={formData.startDate}
                          onChange={(e) => updateFormData('startDate', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Fecha fin</label>
                        <input
                          type="date"
                          required
                          value={formData.endDate}
                          onChange={(e) => updateFormData('endDate', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
                    >
                      Siguiente
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Pago */}
              {step === 3 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Información de Pago
                  </h2>

                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-yellow-800">
                          <strong>Modo Demo:</strong> Usa la tarjeta 4242 4242 4242 4242 con cualquier fecha futura y CVC.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titular de la tarjeta</label>
                      <input
                        type="text"
                        required
                        value={formData.cardName}
                        onChange={(e) => updateFormData('cardName', e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Juan Pérez"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Número de tarjeta</label>
                      <div className="relative">
                        <CreditCard className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          value={formData.cardNumber}
                          onChange={(e) => updateFormData('cardNumber', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="4242 4242 4242 4242"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de expiración</label>
                        <input
                          type="text"
                          required
                          value={formData.cardExpiry}
                          onChange={(e) => updateFormData('cardExpiry', e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="MM/YY"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">CVC</label>
                        <div className="relative">
                          <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                          <input
                            type="text"
                            required
                            value={formData.cardCvc}
                            onChange={(e) => updateFormData('cardCvc', e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="123"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.acceptTerms}
                        onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        Acepto los términos y condiciones y la política de privacidad
                      </span>
                    </label>
                  </div>

                  <div className="flex justify-between mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Anterior
                    </button>
                    <button
                      type="submit"
                      disabled={isProcessing}
                      className="bg-blue-600 text-white px-8 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" />
                          Pagar €{total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
              
              <div className="space-y-3 mb-4">
                {cartItems.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.product.name} x{item.quantity}</span>
                    <span className="font-medium">€{(item.product.pricePerDay * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>€{(total / 1.21).toFixed(2)}</span>
                </div>
                {formData.deliveryOption === 'delivery' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Envío</span>
                    <span>€50.00</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (21%)</span>
                  <span>€{(total - (total / 1.21)).toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <div className="flex justify-between text-lg font-bold">
                  <span>Total</span>
                  <span className="text-blue-600">
                    €{(formData.deliveryOption === 'delivery' ? total + 50 : total).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Pago Seguro</span>
                </div>
                <p className="text-xs text-gray-500">
                  Tus datos están protegidos con encriptación SSL.
                  Procesamos los pagos a través de Stripe.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

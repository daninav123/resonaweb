import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@resona/api-client';
import { Truck, Save, DollarSign, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const ShippingConfigPage = () => {
  const queryClient = useQueryClient();

  const { data: config, isLoading } = useQuery({
    queryKey: ['shipping-config'],
    queryFn: async () => {
      const response: any = await api.get('/shipping-config');
      return response;
    },
  });

  const [formData, setFormData] = useState<any>(null);

  // Inicializar formData cuando llega la config
  useState(() => {
    if (config && !formData) {
      setFormData(config);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.put('/shipping-config', data);
    },
    onSuccess: () => {
      toast.success('Configuración actualizada exitosamente');
      queryClient.invalidateQueries({ queryKey: ['shipping-config'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error?.message || 'Error al actualizar configuración');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentConfig = formData || config;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Truck className="h-8 w-8 text-blue-600" />
            Configuración de Envío
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona las tarifas de envío y montaje según la distancia
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dirección Base */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Dirección Base
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección de referencia para cálculos
              </label>
              <input
                type="text"
                value={currentConfig?.baseAddress || ''}
                onChange={(e) => handleChange('baseAddress', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Madrid, España"
              />
            </div>
          </div>

          {/* Tarifas por Zona */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-blue-600" />
              Tarifas por Zona de Distancia
            </h2>
            
            <div className="space-y-4">
              {/* Zona Local */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-green-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🟢 Zona Local - Máximo (km)
                  </label>
                  <input
                    type="number"
                    value={currentConfig?.localZoneMax || 10}
                    onChange={(e) => handleChange('localZoneMax', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarifa (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentConfig?.localZoneRate || 15}
                    onChange={(e) => handleChange('localZoneRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Zona Regional */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔵 Zona Regional - Máximo (km)
                  </label>
                  <input
                    type="number"
                    value={currentConfig?.regionalZoneMax || 30}
                    onChange={(e) => handleChange('regionalZoneMax', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarifa (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentConfig?.regionalZoneRate || 30}
                    onChange={(e) => handleChange('regionalZoneRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Zona Ampliada */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-yellow-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🟡 Zona Ampliada - Máximo (km)
                  </label>
                  <input
                    type="number"
                    value={currentConfig?.extendedZoneMax || 50}
                    onChange={(e) => handleChange('extendedZoneMax', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tarifa (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={currentConfig?.extendedZoneRate || 50}
                    onChange={(e) => handleChange('extendedZoneRate', parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>

              {/* Zona Personalizada */}
              <div className="p-4 bg-red-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🔴 Zona Personalizada (&gt;{currentConfig?.extendedZoneMax || 50}km) - Tarifa por km (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentConfig?.customZoneRatePerKm || 1.5}
                  onChange={(e) => handleChange('customZoneRatePerKm', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Mínimos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              💰 Costes Mínimos
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mínimo Solo Envío (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentConfig?.minimumShippingCost || 20}
                  onChange={(e) => handleChange('minimumShippingCost', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Se aplicará incluso si el cálculo por distancia es menor
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mínimo con Instalación (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentConfig?.minimumWithInstallation || 50}
                  onChange={(e) => handleChange('minimumWithInstallation', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Mínimo cuando se incluye montaje/instalación
                </p>
              </div>
            </div>
          </div>

          {/* Recargos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Recargos Especiales
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recargo Urgente (&lt;24h) - (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentConfig?.urgentSurcharge || 50}
                  onChange={(e) => handleChange('urgentSurcharge', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Recargo Nocturno (18:00-08:00) (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={currentConfig?.nightSurcharge || 30}
                  onChange={(e) => handleChange('nightSurcharge', parseFloat(e.target.value))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Botón Guardar */}
          <div className="flex justify-end gap-4">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50"
            >
              <Save className="h-5 w-5" />
              {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>

          {/* Ejemplos */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="font-semibold text-blue-900 mb-2">📝 Ejemplos con configuración actual:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Pedido a 5km: €{Math.max(Number(currentConfig?.localZoneRate || 15), Number(currentConfig?.minimumShippingCost || 20)).toFixed(2)} (mínimo aplicado)</li>
              <li>• Pedido a 15km: €{Number(currentConfig?.regionalZoneRate || 30).toFixed(2)} (zona regional)</li>
              <li>• Pedido a 35km: €{Number(currentConfig?.extendedZoneRate || 50).toFixed(2)} (zona ampliada)</li>
              <li>• Pedido a 60km: €{(60 * Number(currentConfig?.customZoneRatePerKm || 1.5)).toFixed(2)} (personalizada)</li>
              <li>• Con instalación a 5km: €{Math.max(Number(currentConfig?.localZoneRate || 15), Number(currentConfig?.minimumWithInstallation || 50)).toFixed(2)}</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShippingConfigPage;

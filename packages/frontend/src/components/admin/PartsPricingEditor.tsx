import { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';

interface PartsPricingEditorProps {
  eventParts: any[]; // Partes del tipo de evento
  packFinalPrice: number; // Precio final del pack
  partsPricing: Record<string, { percentage: number; included: boolean }> | null;
  enablePartsPricing: boolean;
  onChange: (data: { partsPricing: Record<string, { percentage: number; included: boolean }>; enablePartsPricing: boolean }) => void;
}

const PartsPricingEditor: React.FC<PartsPricingEditorProps> = ({
  eventParts,
  packFinalPrice,
  partsPricing: initialPartsPricing,
  enablePartsPricing: initialEnabled,
  onChange
}) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [pricing, setPricing] = useState<Record<string, { percentage: number; included: boolean }>>(
    initialPartsPricing || {}
  );

  // Calcular porcentaje total
  const totalPercentage = Object.values(pricing).reduce((sum, part) => 
    part.included ? sum + part.percentage : sum, 0
  );

  // Inicializar con distribución equitativa si está vacío
  useEffect(() => {
    if (enabled && eventParts.length > 0 && Object.keys(pricing).length === 0) {
      const equalPercentage = Math.floor(100 / eventParts.length);
      const newPricing: Record<string, { percentage: number; included: boolean }> = {};
      
      eventParts.forEach((part, index) => {
        // Ajustar el último para que sume exactamente 100%
        const percentage = index === eventParts.length - 1 
          ? 100 - (equalPercentage * (eventParts.length - 1))
          : equalPercentage;
        
        newPricing[part.id] = {
          percentage,
          included: true
        };
      });
      
      setPricing(newPricing);
      onChange({ partsPricing: newPricing, enablePartsPricing: true });
    }
  }, [enabled, eventParts]);

  const handleToggleEnable = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    onChange({ partsPricing: pricing, enablePartsPricing: newEnabled });
  };

  const handlePercentageChange = (partId: string, percentage: number) => {
    const newPricing = {
      ...pricing,
      [partId]: { ...pricing[partId], percentage: Math.max(0, Math.min(100, percentage)) }
    };
    setPricing(newPricing);
    onChange({ partsPricing: newPricing, enablePartsPricing: enabled });
  };

  const handleToggleIncluded = (partId: string) => {
    const newPricing = {
      ...pricing,
      [partId]: { ...pricing[partId], included: !pricing[partId]?.included }
    };
    setPricing(newPricing);
    onChange({ partsPricing: newPricing, enablePartsPricing: enabled });
  };

  const distributeEqually = () => {
    const includedParts = eventParts.filter(part => pricing[part.id]?.included !== false);
    if (includedParts.length === 0) return;

    const equalPercentage = Math.floor(100 / includedParts.length);
    const newPricing = { ...pricing };
    
    includedParts.forEach((part, index) => {
      const percentage = index === includedParts.length - 1 
        ? 100 - (equalPercentage * (includedParts.length - 1))
        : equalPercentage;
      
      newPricing[part.id] = {
        ...newPricing[part.id],
        percentage
      };
    });
    
    setPricing(newPricing);
    onChange({ partsPricing: newPricing, enablePartsPricing: enabled });
  };

  if (eventParts.length === 0) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">Sin partes de evento</p>
            <p className="text-xs text-amber-700 mt-1">
              Este pack no está asociado a un tipo de evento con partes configuradas. 
              Necesitas configurar primero las partes del evento en la calculadora.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Toggle Principal */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Calculator className="w-5 h-5 text-blue-600" />
          <div>
            <h4 className="font-semibold text-blue-900">Precio Variable por Partes</h4>
            <p className="text-xs text-blue-700 mt-0.5">
              El precio cambiará según las partes del evento que el cliente seleccione
            </p>
          </div>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={enabled}
            onChange={handleToggleEnable}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
        </label>
      </div>

      {/* Configuración de Partes */}
      {enabled && (
        <div className="space-y-4">
          {/* Botón distribución equitativa */}
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">Distribución de Precio por Parte</h5>
            <button
              onClick={distributeEqually}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Distribuir Equitativamente
            </button>
          </div>

          {/* Lista de partes */}
          <div className="space-y-2">
            {eventParts.map((part) => {
              const partData = pricing[part.id] || { percentage: 0, included: true };
              const partPrice = (packFinalPrice * partData.percentage) / 100;

              return (
                <div
                  key={part.id}
                  className={`border rounded-lg p-3 transition-all ${
                    partData.included
                      ? 'border-gray-200 bg-white'
                      : 'border-gray-100 bg-gray-50 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Checkbox Incluir */}
                    <input
                      type="checkbox"
                      checked={partData.included}
                      onChange={() => handleToggleIncluded(part.id)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />

                    {/* Info de la parte */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{part.icon}</span>
                        <span className="font-medium text-gray-900">{part.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-0.5">{part.description}</p>
                    </div>

                    {/* Control de porcentaje */}
                    {partData.included && (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={partData.percentage}
                          onChange={(e) => handlePercentageChange(part.id, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1.5 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                        />
                        <span className="text-sm font-medium text-gray-700">%</span>
                      </div>
                    )}

                    {/* Precio calculado */}
                    {partData.included && (
                      <div className="text-right min-w-[80px]">
                        <div className="text-sm font-bold text-gray-900">
                          €{partPrice.toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {partData.percentage}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className={`border-2 rounded-lg p-4 ${
            Math.abs(totalPercentage - 100) < 0.01
              ? 'border-green-500 bg-green-50'
              : 'border-red-500 bg-red-50'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">Total</div>
                <div className="text-xs text-gray-600 mt-0.5">
                  {Math.abs(totalPercentage - 100) < 0.01
                    ? '✓ La suma es correcta'
                    : '⚠️ La suma debe ser 100%'}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-2xl font-bold ${
                  Math.abs(totalPercentage - 100) < 0.01 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {totalPercentage.toFixed(0)}%
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  €{packFinalPrice.toFixed(2)}
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>¿Cómo funciona?</strong> En la calculadora, el precio se calculará sumando solo los porcentajes
              de las partes que el cliente seleccione. Por ejemplo, si el cliente solo selecciona 2 de 4 partes,
              pagará solo el porcentaje correspondiente a esas 2 partes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsPricingEditor;

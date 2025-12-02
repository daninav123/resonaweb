import { useState, useEffect } from 'react';
import { Calculator, AlertCircle } from 'lucide-react';

interface PartsPricingEditorProps {
  eventParts: any[]; // Partes del tipo de evento
  packBasePrice: number; // Precio BASE del pack (sin partes)
  partsPricing: Record<string, { price: number; included: boolean }> | null;
  enablePartsPricing: boolean;
  onChange: (data: { partsPricing: Record<string, { price: number; included: boolean }>; enablePartsPricing: boolean; basePrice: number }) => void;
}

const PartsPricingEditor: React.FC<PartsPricingEditorProps> = ({
  eventParts,
  packBasePrice: initialBasePrice,
  partsPricing: initialPartsPricing,
  enablePartsPricing: initialEnabled,
  onChange
}) => {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [basePrice, setBasePrice] = useState(initialBasePrice);
  const [pricing, setPricing] = useState<Record<string, { price: number; included: boolean }>>(
    initialPartsPricing || {}
  );

  // Calcular precio total de partes
  const totalPartsPrice = Object.values(pricing).reduce((sum, part) => 
    part.included ? sum + part.price : sum, 0
  );

  // Precio final = base + partes
  const totalPrice = basePrice + totalPartsPrice;

  // Inicializar con precios vacíos si está vacío
  useEffect(() => {
    if (enabled && eventParts.length > 0 && Object.keys(pricing).length === 0) {
      const newPricing: Record<string, { price: number; included: boolean }> = {};
      
      eventParts.forEach((part) => {
        newPricing[part.id] = {
          price: 0,
          included: false
        };
      });
      
      setPricing(newPricing);
      onChange({ partsPricing: newPricing, enablePartsPricing: true, basePrice });
    }
  }, [enabled, eventParts]);

  const handleToggleEnable = () => {
    const newEnabled = !enabled;
    setEnabled(newEnabled);
    onChange({ partsPricing: pricing, enablePartsPricing: newEnabled, basePrice });
  };

  const handlePriceChange = (partId: string, price: number) => {
    const newPricing = {
      ...pricing,
      [partId]: { ...pricing[partId], price: Math.max(0, price) }
    };
    setPricing(newPricing);
    onChange({ partsPricing: newPricing, enablePartsPricing: enabled, basePrice });
  };

  const handleBasePriceChange = (price: number) => {
    const newBasePrice = Math.max(0, price);
    setBasePrice(newBasePrice);
    onChange({ partsPricing: pricing, enablePartsPricing: enabled, basePrice: newBasePrice });
  };

  const handleToggleIncluded = (partId: string) => {
    const newPricing = {
      ...pricing,
      [partId]: { ...pricing[partId], included: !pricing[partId]?.included }
    };
    setPricing(newPricing);
    onChange({ partsPricing: newPricing, enablePartsPricing: enabled, basePrice });
  };

  const distributeEqually = () => {
    const includedParts = eventParts.filter(part => pricing[part.id]?.included !== false);
    if (includedParts.length === 0) return;

    const pricePerPart = Math.floor(basePrice / includedParts.length);
    const newPricing = { ...pricing };
    
    includedParts.forEach((part, index) => {
      const price = index === includedParts.length - 1 
        ? basePrice - (pricePerPart * (includedParts.length - 1))
        : pricePerPart;
      
      newPricing[part.id] = {
        ...newPricing[part.id],
        price
      };
    });
    
    setPricing(newPricing);
    onChange({ partsPricing: newPricing, enablePartsPricing: enabled, basePrice });
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
          {/* Precio Base */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Precio Base del Pack (sin partes)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-600">€</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={basePrice}
                onChange={(e) => handleBasePriceChange(parseFloat(e.target.value) || 0)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg font-semibold"
                placeholder="300.00"
              />
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Este es el precio base. Cada parte que el cliente seleccione sumará su precio individual.
            </p>
          </div>

          {/* Botón distribución equitativa */}
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-medium text-gray-700">Precio de Cada Parte</h5>
            <button
              onClick={distributeEqually}
              className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Distribuir Base Equitativamente
            </button>
          </div>

          {/* Lista de partes */}
          <div className="space-y-2">
            {eventParts.map((part) => {
              const partData = pricing[part.id] || { price: 0, included: false };
              const partPrice = partData.price;

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

                    {/* Control de precio */}
                    {partData.included && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">€</span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={partData.price}
                          onChange={(e) => handlePriceChange(part.id, parseFloat(e.target.value) || 0)}
                          className="w-24 px-2 py-1.5 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm font-medium"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen */}
          <div className="border-2 border-blue-500 bg-blue-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Precio Base:</span>
                <span className="font-semibold text-gray-900">€{basePrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Suma de Partes Incluidas:</span>
                <span className="font-semibold text-gray-900">+€{totalPartsPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-blue-200 pt-2 mt-2">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-blue-900">Precio Total:</span>
                  <span className="text-2xl font-bold text-blue-600">€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              <strong>¿Cómo funciona?</strong> En la calculadora, el precio se calculará sumando el precio base (€{basePrice.toFixed(2)}) 
              más el precio de cada parte que el cliente seleccione. Por ejemplo, si marca Cóctel (€150) y Banquete (€150), 
              pagará: €{basePrice.toFixed(2)} + €150 + €150 = €{(basePrice + 300).toFixed(2)}.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsPricingEditor;

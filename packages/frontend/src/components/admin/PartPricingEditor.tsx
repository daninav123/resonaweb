import { useState } from 'react';
import { DollarSign, Users, Package, X } from 'lucide-react';

interface PartPricingEditorProps {
  part: any;
  allProducts: any[];
  onChange: (updatedPart: any) => void;
}

const PartPricingEditor: React.FC<PartPricingEditorProps> = ({
  part,
  allProducts,
  onChange
}) => {
  const [pricing, setPricing] = useState(part.pricing || {
    basePrice: 0,
    pricePerPerson: 0,
    minAttendees: 0,
    maxAttendees: 1000
  });

  const [recommendedProducts, setRecommendedProducts] = useState<string[]>(
    part.recommendedProducts || []
  );

  const handlePricingChange = (field: string, value: number) => {
    const newPricing = { ...pricing, [field]: value };
    setPricing(newPricing);
    onChange({ ...part, pricing: newPricing });
  };

  const handleAddProduct = (productId: string) => {
    if (!recommendedProducts.includes(productId)) {
      const newProducts = [...recommendedProducts, productId];
      setRecommendedProducts(newProducts);
      onChange({ ...part, recommendedProducts: newProducts });
    }
  };

  const handleRemoveProduct = (productId: string) => {
    const newProducts = recommendedProducts.filter(id => id !== productId);
    setRecommendedProducts(newProducts);
    onChange({ ...part, recommendedProducts: newProducts });
  };

  // Calcular precio ejemplo
  const calculateExamplePrice = (attendees: number) => {
    return pricing.basePrice + (pricing.pricePerPerson || 0) * attendees;
  };

  return (
    <div className="space-y-6 bg-gray-50 rounded-lg p-6">
      {/* Configuración de Precio */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Configuración de Precio
        </h4>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio Base (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pricing.basePrice}
              onChange={(e) => handlePricingChange('basePrice', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
              placeholder="150.00"
            />
            <p className="text-xs text-gray-500 mt-1">Precio fijo de esta parte</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Precio por Persona (€)
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={pricing.pricePerPerson || 0}
              onChange={(e) => handlePricingChange('pricePerPerson', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
              placeholder="2.50"
            />
            <p className="text-xs text-gray-500 mt-1">Coste adicional por invitado</p>
          </div>
        </div>

        {/* Ejemplo de cálculo */}
        {(pricing.basePrice > 0 || pricing.pricePerPerson > 0) && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">💡 Ejemplo de cálculo:</p>
            <div className="space-y-1 text-sm text-blue-800">
              <div className="flex justify-between">
                <span>50 invitados:</span>
                <span className="font-semibold">€{calculateExamplePrice(50).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>100 invitados:</span>
                <span className="font-semibold">€{calculateExamplePrice(100).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>200 invitados:</span>
                <span className="font-semibold">€{calculateExamplePrice(200).toFixed(2)}</span>
              </div>
            </div>
            {pricing.pricePerPerson > 0 && (
              <p className="text-xs text-blue-700 mt-2">
                Fórmula: €{pricing.basePrice} + (€{pricing.pricePerPerson} × número de invitados)
              </p>
            )}
          </div>
        )}
      </div>

      {/* Productos Recomendados */}
      <div>
        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-600" />
          Materiales/Productos Recomendados
        </h4>

        {/* Selector de productos */}
        <div className="mb-3">
          <select
            onChange={(e) => {
              if (e.target.value) {
                handleAddProduct(e.target.value);
                e.target.value = '';
              }
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
          >
            <option value="">+ Añadir producto...</option>
            {allProducts
              .filter(p => !recommendedProducts.includes(p.id))
              .map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} - €{Number(product.pricePerDay || 0).toFixed(2)}/día
                </option>
              ))}
          </select>
        </div>

        {/* Lista de productos seleccionados */}
        {recommendedProducts.length > 0 ? (
          <div className="space-y-2">
            {recommendedProducts.map(productId => {
              const product = allProducts.find(p => p.id === productId);
              if (!product) return null;

              return (
                <div
                  key={productId}
                  className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{product.name}</div>
                    <div className="text-xs text-gray-600">
                      €{Number(product.pricePerDay || 0).toFixed(2)}/día
                      {product.category && ` • ${product.category.name}`}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(productId)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Eliminar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 bg-white border-2 border-dashed border-gray-300 rounded-lg">
            <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No hay productos asignados</p>
            <p className="text-xs text-gray-500 mt-1">
              Los productos aquí serán sugeridos en la calculadora
            </p>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
        <p className="text-xs text-amber-800">
          <strong>¿Cómo funciona?</strong> Cuando un cliente seleccione esta parte en la calculadora,
          se calculará el precio según el número de invitados y se le mostrarán los productos recomendados.
        </p>
      </div>
    </div>
  );
};

export default PartPricingEditor;

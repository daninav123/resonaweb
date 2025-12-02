import { useState } from 'react';
import { DollarSign, Package, X } from 'lucide-react';
import PricingRangesEditor from './PricingRangesEditor';
import { PricingRange } from '../../types/calculator.types';

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
  const [pricingRanges, setPricingRanges] = useState<PricingRange[]>(
    part.pricingRanges || [{ minAttendees: 0, maxAttendees: 50, price: 0 }]
  );

  const [recommendedProducts, setRecommendedProducts] = useState<string[]>(
    part.recommendedProducts || []
  );

  const handlePricingRangesChange = (ranges: PricingRange[]) => {
    setPricingRanges(ranges);
    onChange({ ...part, pricingRanges: ranges });
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

  return (
    <div className="space-y-6 bg-gray-50 rounded-lg p-6">
      {/* Configuración de Rangos de Precio */}
      <PricingRangesEditor
        ranges={pricingRanges}
        onChange={handlePricingRangesChange}
      />

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

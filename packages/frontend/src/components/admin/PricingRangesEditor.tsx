import { useState } from 'react';
import { DollarSign, Plus, Trash2, Users, Package, X } from 'lucide-react';
import { PricingRange } from '../../types/calculator.types';

interface PricingRangesEditorProps {
  ranges: PricingRange[];
  allProducts: any[];
  onChange: (ranges: PricingRange[]) => void;
}

const PricingRangesEditor: React.FC<PricingRangesEditorProps> = ({ ranges, allProducts, onChange }) => {
  const [localRanges, setLocalRanges] = useState<PricingRange[]>(
    ranges && ranges.length > 0 
      ? ranges 
      : [{ minAttendees: 0, maxAttendees: 50, price: 0, recommendedProducts: [] }]
  );
  const [expandedRange, setExpandedRange] = useState<number | null>(0);

  const handleAddRange = () => {
    const lastRange = localRanges[localRanges.length - 1];
    const newRange: PricingRange = {
      minAttendees: lastRange.maxAttendees + 1,
      maxAttendees: lastRange.maxAttendees + 50,
      price: 0,
      recommendedProducts: []
    };
    const updated = [...localRanges, newRange];
    setLocalRanges(updated);
    setExpandedRange(updated.length - 1);
    onChange(updated);
  };

  const handleRemoveRange = (index: number) => {
    if (localRanges.length > 1) {
      const updated = localRanges.filter((_, i) => i !== index);
      setLocalRanges(updated);
      onChange(updated);
    }
  };

  const handleRangeChange = (index: number, field: keyof PricingRange, value: any) => {
    const updated = [...localRanges];
    updated[index] = { ...updated[index], [field]: value };
    setLocalRanges(updated);
    onChange(updated);
  };

  const handleAddProduct = (rangeIndex: number, productId: string) => {
    const updated = [...localRanges];
    const products = updated[rangeIndex].recommendedProducts || [];
    if (!products.includes(productId)) {
      updated[rangeIndex] = {
        ...updated[rangeIndex],
        recommendedProducts: [...products, productId]
      };
      setLocalRanges(updated);
      onChange(updated);
    }
  };

  const handleRemoveProduct = (rangeIndex: number, productId: string) => {
    const updated = [...localRanges];
    const products = updated[rangeIndex].recommendedProducts || [];
    updated[rangeIndex] = {
      ...updated[rangeIndex],
      recommendedProducts: products.filter(id => id !== productId)
    };
    setLocalRanges(updated);
    onChange(updated);
  };

  // Calcular el precio promedio
  const avgPrice = localRanges.length > 0
    ? (localRanges.reduce((sum, r) => sum + r.price, 0) / localRanges.length).toFixed(2)
    : '0';

  return (
    <div className="space-y-4 bg-gray-50 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-600" />
          Rangos de Precio por Invitados
        </h4>
        <button
          onClick={handleAddRange}
          className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
        >
          <Plus className="w-4 h-4" />
          Añadir Rango
        </button>
      </div>

      {/* Rangos */}
      <div className="space-y-3">
        {localRanges.map((range, index) => (
          <div
            key={index}
            className="bg-white border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* Header del rango */}
            <button
              onClick={() => setExpandedRange(expandedRange === index ? null : index)}
              className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1 text-left">
                <Users className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">
                    {range.minAttendees} - {range.maxAttendees} invitados
                  </div>
                  <div className="text-sm text-gray-600">
                    €{range.price.toFixed(2)} 
                    {range.recommendedProducts && range.recommendedProducts.length > 0 && (
                      <span className="ml-2 text-blue-600 font-medium">
                        • {range.recommendedProducts.length} producto(s)
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {localRanges.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveRange(index);
                    }}
                    className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                    title="Eliminar rango"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <div className="text-gray-400">
                  {expandedRange === index ? '▼' : '▶'}
                </div>
              </div>
            </button>

            {/* Contenido expandido */}
            {expandedRange === index && (
              <div className="border-t bg-gray-50 p-4 space-y-4">
                {/* Rango de invitados */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Desde invitados
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={range.minAttendees}
                      onChange={(e) =>
                        handleRangeChange(index, 'minAttendees', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Hasta invitados
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={range.maxAttendees}
                      onChange={(e) =>
                        handleRangeChange(index, 'maxAttendees', parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Precio (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={range.price}
                      onChange={(e) =>
                        handleRangeChange(index, 'price', parseFloat(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona text-sm"
                    />
                  </div>
                </div>

                {/* Productos recomendados */}
                <div className="border-t pt-4">
                  <h5 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    Materiales para este rango
                  </h5>

                  {/* Selector de productos */}
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleAddProduct(index, e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona text-sm mb-3"
                  >
                    <option value="">+ Añadir producto...</option>
                    {allProducts
                      .filter(p => !(range.recommendedProducts || []).includes(p.id))
                      .map(product => (
                        <option key={product.id} value={product.id}>
                          {product.name} - €{Number(product.pricePerDay || 0).toFixed(2)}/día
                        </option>
                      ))}
                  </select>

                  {/* Lista de productos */}
                  {range.recommendedProducts && range.recommendedProducts.length > 0 ? (
                    <div className="space-y-2">
                      {range.recommendedProducts.map(productId => {
                        const product = allProducts.find(p => p.id === productId);
                        if (!product) return null;
                        return (
                          <div
                            key={productId}
                            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-2"
                          >
                            <div className="text-sm">
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-600">
                                €{Number(product.pricePerDay || 0).toFixed(2)}/día
                              </div>
                            </div>
                            <button
                              onClick={() => handleRemoveProduct(index, productId)}
                              className="text-red-600 hover:text-red-800 p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-3 bg-white border-2 border-dashed border-gray-300 rounded-lg">
                      <p className="text-xs text-gray-600">Sin productos asignados</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Resumen */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-blue-600 font-semibold">Rangos</div>
            <div className="text-2xl font-bold text-blue-900">{localRanges.length}</div>
          </div>
          <div>
            <div className="text-blue-600 font-semibold">Precio Mínimo</div>
            <div className="text-2xl font-bold text-blue-900">
              €{Math.min(...localRanges.map(r => r.price)).toFixed(2)}
            </div>
          </div>
          <div>
            <div className="text-blue-600 font-semibold">Precio Máximo</div>
            <div className="text-2xl font-bold text-blue-900">
              €{Math.max(...localRanges.map(r => r.price)).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Ejemplos de cálculo */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-semibold text-amber-900 mb-2">💡 Ejemplos de cálculo:</p>
        <div className="space-y-1 text-xs text-amber-800">
          {localRanges.slice(0, 3).map((range, idx) => (
            <div key={idx} className="flex justify-between">
              <span>
                {range.minAttendees} - {range.maxAttendees} invitados:
              </span>
              <span className="font-semibold">€{range.price.toFixed(2)}</span>
            </div>
          ))}
          {localRanges.length > 3 && (
            <div className="text-amber-600 italic">+ {localRanges.length - 3} rangos más</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PricingRangesEditor;

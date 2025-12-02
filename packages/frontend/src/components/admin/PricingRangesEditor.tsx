import { useState } from 'react';
import { DollarSign, Plus, Trash2, Users } from 'lucide-react';
import { PricingRange } from '../../types/calculator.types';

interface PricingRangesEditorProps {
  ranges: PricingRange[];
  onChange: (ranges: PricingRange[]) => void;
}

const PricingRangesEditor: React.FC<PricingRangesEditorProps> = ({ ranges, onChange }) => {
  const [localRanges, setLocalRanges] = useState<PricingRange[]>(
    ranges && ranges.length > 0 
      ? ranges 
      : [{ minAttendees: 0, maxAttendees: 50, price: 0 }]
  );

  const handleAddRange = () => {
    const lastRange = localRanges[localRanges.length - 1];
    const newRange: PricingRange = {
      minAttendees: lastRange.maxAttendees + 1,
      maxAttendees: lastRange.maxAttendees + 50,
      price: 0
    };
    const updated = [...localRanges, newRange];
    setLocalRanges(updated);
    onChange(updated);
  };

  const handleRemoveRange = (index: number) => {
    if (localRanges.length > 1) {
      const updated = localRanges.filter((_, i) => i !== index);
      setLocalRanges(updated);
      onChange(updated);
    }
  };

  const handleRangeChange = (index: number, field: keyof PricingRange, value: number) => {
    const updated = [...localRanges];
    updated[index] = { ...updated[index], [field]: value };
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
            className="bg-white border border-gray-200 rounded-lg p-4 flex items-end gap-4"
          >
            {/* Rango de invitados */}
            <div className="flex-1 flex items-end gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Desde invitados
                </label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
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
              </div>

              <div className="text-gray-400 font-bold">→</div>

              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Hasta invitados
                </label>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-gray-400" />
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
              </div>
            </div>

            {/* Precio */}
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Precio (€)
              </label>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-green-600" />
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

            {/* Botón eliminar */}
            {localRanges.length > 1 && (
              <button
                onClick={() => handleRemoveRange(index)}
                className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                title="Eliminar rango"
              >
                <Trash2 className="w-4 h-4" />
              </button>
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

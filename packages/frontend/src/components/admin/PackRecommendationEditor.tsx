import { Plus, Trash2, AlertCircle } from 'lucide-react';
import { PackRecommendationRule } from '../../types/calculator.types';

interface PackRecommendationEditorProps {
  rules: PackRecommendationRule[];
  availablePacks: string[];
  allPacks: any[];
  onChange: (rules: PackRecommendationRule[]) => void;
}

const PackRecommendationEditor: React.FC<PackRecommendationEditorProps> = ({
  rules,
  availablePacks,
  allPacks,
  onChange
}) => {
  const addRule = () => {
    const firstAvailablePack = availablePacks[0] || '';
    onChange([...rules, {
      packId: firstAvailablePack,
      priority: rules.length + 1,
      minAttendees: 0,
      maxAttendees: 1000,
      reason: ''
    }]);
  };

  const updateRule = (index: number, field: keyof PackRecommendationRule, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    onChange(newRules);
  };

  const removeRule = (index: number) => {
    onChange(rules.filter((_, i) => i !== index));
  };

  const availablePacksData = allPacks.filter(p => availablePacks.includes(p.id));

  if (availablePacks.length === 0) {
    return (
      <div className="text-center py-8 bg-amber-50 rounded-lg border border-amber-200">
        <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-2" />
        <p className="text-amber-800 text-sm font-medium">
          Primero selecciona packs disponibles arriba
        </p>
        <p className="text-amber-600 text-xs mt-1">
          Las reglas de recomendación solo pueden usar packs que estén en la lista de disponibles
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {rules.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm mb-3">
            No hay reglas de recomendación configuradas
          </p>
          <button
            onClick={addRule}
            className="inline-flex items-center gap-2 px-4 py-2 bg-resona hover:bg-resona-dark text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Añadir Primera Regla
          </button>
        </div>
      ) : (
        <>
          {rules.map((rule, index) => {
            const pack = allPacks.find(p => p.id === rule.packId);
            const isPackAvailable = availablePacks.includes(rule.packId);
            
            return (
              <div 
                key={index} 
                className={`border rounded-lg p-4 ${
                  isPackAvailable 
                    ? 'border-gray-200 bg-white' 
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex items-start gap-4">
                  {/* Pack Image */}
                  {pack?.mainImageUrl && (
                    <img 
                      src={pack.mainImageUrl} 
                      alt={pack.name} 
                      className="w-20 h-20 object-cover rounded flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  )}
                  
                  {/* Form Fields */}
                  <div className="flex-1 space-y-3">
                    {/* Pack Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pack a Recomendar
                      </label>
                      <select
                        value={rule.packId}
                        onChange={(e) => updateRule(index, 'packId', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-resona ${
                          isPackAvailable 
                            ? 'border-gray-300' 
                            : 'border-red-300 bg-red-50'
                        }`}
                      >
                        {!isPackAvailable && (
                          <option value={rule.packId}>
                            ⚠️ {pack?.name || 'Pack no disponible'} (no está en la lista)
                          </option>
                        )}
                        {availablePacksData.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} - €{p.pricePerDay}/día
                          </option>
                        ))}
                      </select>
                      {!isPackAvailable && (
                        <p className="text-xs text-red-600 mt-1">
                          ⚠️ Este pack no está en la lista de packs disponibles
                        </p>
                      )}
                    </div>

                    {/* Attendees Range */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mínimo Asistentes
                        </label>
                        <input
                          type="number"
                          value={rule.minAttendees || 0}
                          onChange={(e) => updateRule(index, 'minAttendees', parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Máximo Asistentes
                        </label>
                        <input
                          type="number"
                          value={rule.maxAttendees || 1000}
                          onChange={(e) => updateRule(index, 'maxAttendees', parseInt(e.target.value) || 1000)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                          min="0"
                        />
                      </div>
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prioridad
                        <span className="text-xs text-gray-500 ml-2">(1 = más alta, se mostrará primero)</span>
                      </label>
                      <input
                        type="number"
                        value={rule.priority}
                        onChange={(e) => updateRule(index, 'priority', parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                        min="1"
                      />
                    </div>

                    {/* Reason */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Razón de la Recomendación
                        <span className="text-xs text-gray-500 ml-2">(opcional, se mostrará al cliente)</span>
                      </label>
                      <input
                        type="text"
                        value={rule.reason || ''}
                        onChange={(e) => updateRule(index, 'reason', e.target.value)}
                        placeholder="Ej: Ideal para grupos pequeños, Perfecto para grandes eventos..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona"
                      />
                    </div>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeRule(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors flex-shrink-0"
                    title="Eliminar regla"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                {/* Preview */}
                <div className="mt-3 pt-3 border-t border-gray-200 text-sm">
                  <div className="flex items-start gap-2 text-gray-600">
                    <span className="text-blue-500">📋</span>
                    <div>
                      <span className="font-medium">Se recomendará:</span> "{pack?.name || 'Pack desconocido'}" 
                      <span className="mx-1">para eventos con</span>
                      <span className="font-semibold text-gray-900">
                        {rule.minAttendees || 0} a {rule.maxAttendees || '∞'} asistentes
                      </span>
                      {rule.reason && (
                        <div className="mt-1 text-gray-500 italic">
                          Motivo: "{rule.reason}"
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Add New Rule Button */}
          <button
            onClick={addRule}
            className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-resona hover:text-resona hover:bg-resona/5 transition-all flex items-center justify-center gap-2 font-medium"
          >
            <Plus className="w-5 h-5" />
            Añadir Regla de Recomendación
          </button>
        </>
      )}
    </div>
  );
};

export default PackRecommendationEditor;

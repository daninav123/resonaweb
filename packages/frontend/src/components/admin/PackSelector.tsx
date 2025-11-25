import { Package } from 'lucide-react';

interface PackSelectorProps {
  allPacks: any[];
  selectedPacks: string[];
  onChange: (packIds: string[]) => void;
}

const PackSelector: React.FC<PackSelectorProps> = ({ allPacks, selectedPacks, onChange }) => {
  const togglePack = (packId: string) => {
    if (selectedPacks.includes(packId)) {
      onChange(selectedPacks.filter(id => id !== packId));
    } else {
      onChange([...selectedPacks, packId]);
    }
  };

  return (
    <div className="space-y-2">
      {allPacks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            No hay packs disponibles. Crea packs en "Gestión de Productos".
          </p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
          {allPacks.map(pack => (
            <label 
              key={pack.id} 
              className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-all ${
                selectedPacks.includes(pack.id)
                  ? 'border-resona bg-resona/5 shadow-sm'
                  : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedPacks.includes(pack.id)}
                onChange={() => togglePack(pack.id)}
                className="w-4 h-4 text-resona rounded focus:ring-2 focus:ring-resona"
              />
              {pack.mainImageUrl && (
                <img 
                  src={pack.mainImageUrl} 
                  alt={pack.name} 
                  className="w-12 h-12 object-cover rounded"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{pack.name}</div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>€{pack.pricePerDay}/día</span>
                  {pack.realStock !== undefined && (
                    <span className="text-xs">• {pack.realStock} disponibles</span>
                  )}
                </div>
              </div>
              {selectedPacks.includes(pack.id) && (
                <div className="text-resona">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </label>
          ))}
        </div>
      )}
      
      {selectedPacks.length > 0 && (
        <div className="mt-3 pt-3 border-t text-sm text-gray-600">
          ✅ {selectedPacks.length} {selectedPacks.length === 1 ? 'pack seleccionado' : 'packs seleccionados'}
        </div>
      )}
    </div>
  );
};

export default PackSelector;

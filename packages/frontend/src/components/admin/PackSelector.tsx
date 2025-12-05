import { Package, X } from 'lucide-react';
import { useState, useMemo } from 'react';

interface PackSelectorProps {
  allPacks: any[];
  selectedPacks: string[];
  onChange: (packIds: string[]) => void;
}

const PackSelector: React.FC<PackSelectorProps> = ({ allPacks, selectedPacks, onChange }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'packs' | 'products'>('all');

  // Obtener categorías únicas
  const categories = useMemo(() => {
    const cats = new Set(allPacks.map(p => p.category?.name || 'Sin categoría'));
    return Array.from(cats).sort();
  }, [allPacks]);

  // Filtrar packs según categoría, búsqueda y tipo
  const filteredPacks = useMemo(() => {
    return allPacks.filter(pack => {
      const categoryMatch = !selectedCategory || pack.category?.name === selectedCategory || (selectedCategory === 'Sin categoría' && !pack.category);
      const searchMatch = pack.name.toLowerCase().includes(searchTerm.toLowerCase());
      const typeMatch = typeFilter === 'all' || 
                       (typeFilter === 'packs' && pack.isPack) || 
                       (typeFilter === 'products' && !pack.isPack);
      return categoryMatch && searchMatch && typeMatch;
    });
  }, [allPacks, selectedCategory, searchTerm, typeFilter]);

  const togglePack = (packId: string) => {
    if (selectedPacks.includes(packId)) {
      onChange(selectedPacks.filter(id => id !== packId));
    } else {
      onChange([...selectedPacks, packId]);
    }
  };

  const selectAll = () => {
    const allIds = filteredPacks.map(p => p.id);
    onChange([...new Set([...selectedPacks, ...allIds])]);
  };

  const deselectAll = () => {
    const filteredIds = new Set(filteredPacks.map(p => p.id));
    onChange(selectedPacks.filter(id => !filteredIds.has(id)));
  };

  const packsCount = allPacks.filter(p => p.isPack).length;
  const productsCount = allPacks.filter(p => !p.isPack).length;

  return (
    <div className="space-y-4">
      {/* Info de tipos y filtros */}
      <div className="space-y-2">
        <div className="flex gap-2 text-xs">
          <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded">
            🚚 {packsCount} Montajes
          </span>
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
            📋 {productsCount} Productos
          </span>
        </div>
        
        {/* Filtro por tipo */}
        <div className="flex gap-2">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              typeFilter === 'all'
                ? 'bg-gray-800 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Todos
          </button>
          <button
            onClick={() => setTypeFilter('packs')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              typeFilter === 'packs'
                ? 'bg-gray-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Solo Montajes
          </button>
          <button
            onClick={() => setTypeFilter('products')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              typeFilter === 'products'
                ? 'bg-green-600 text-white'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Solo Productos
          </button>
        </div>
      </div>

      {/* Búsqueda */}
      <div>
        <input
          type="text"
          placeholder="Buscar productos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
        />
      </div>

      {/* Filtro por categorías */}
      {categories.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Categorías</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                selectedCategory === null
                  ? 'bg-resona text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Todas
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? 'bg-resona text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Acciones rápidas */}
      {filteredPacks.length > 0 && (
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition"
          >
            Seleccionar todos
          </button>
          <button
            onClick={deselectAll}
            className="text-sm px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition"
          >
            Deseleccionar todos
          </button>
        </div>
      )}

      {/* Lista de productos */}
      {allPacks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">
            No hay productos disponibles. Crea productos en "Gestión de Productos".
          </p>
        </div>
      ) : filteredPacks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">
            No hay productos que coincidan con los filtros seleccionados.
          </p>
        </div>
      ) : (
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2">
          {filteredPacks.map(pack => (
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
                <div className="font-medium text-gray-900 truncate flex items-center gap-2">
                  {pack.name}
                  {pack.isPack && (
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded font-semibold">
                      MONTAJE
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>€{pack.pricePerDay}/día</span>
                  {pack.realStock !== undefined && (
                    <span className="text-xs">• {pack.realStock} disponibles</span>
                  )}
                  {pack.category && (
                    <span className="text-xs bg-gray-200 px-2 py-0.5 rounded">
                      {pack.category.name}
                    </span>
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
        <div className="mt-3 pt-3 border-t text-sm text-gray-600 flex items-center justify-between">
          <span>✅ {selectedPacks.length} {selectedPacks.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}</span>
          <button
            onClick={() => onChange([])}
            className="text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
};

export default PackSelector;

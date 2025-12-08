import { useState } from 'react';
import { Plus, Trash2, Search, X } from 'lucide-react';

interface ExtraCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  extrasIds: string[];
}

interface ExtrasManagerTabsProps {
  categories: ExtraCategory[];
  allExtras: any[];
  onUpdateCategories: (categories: ExtraCategory[]) => void;
}

const AVAILABLE_COLORS = [
  { name: 'Púrpura', value: 'purple', class: 'bg-purple-500', textClass: 'text-purple-700', bgClass: 'bg-purple-50', borderClass: 'border-purple-500' },
  { name: 'Azul', value: 'blue', class: 'bg-blue-500', textClass: 'text-blue-700', bgClass: 'bg-blue-50', borderClass: 'border-blue-500' },
  { name: 'Rosa', value: 'pink', class: 'bg-pink-500', textClass: 'text-pink-700', bgClass: 'bg-pink-50', borderClass: 'border-pink-500' },
  { name: 'Amarillo', value: 'yellow', class: 'bg-yellow-500', textClass: 'text-yellow-700', bgClass: 'bg-yellow-50', borderClass: 'border-yellow-500' },
  { name: 'Verde', value: 'green', class: 'bg-green-500', textClass: 'text-green-700', bgClass: 'bg-green-50', borderClass: 'border-green-500' },
  { name: 'Naranja', value: 'orange', class: 'bg-orange-500', textClass: 'text-orange-700', bgClass: 'bg-orange-50', borderClass: 'border-orange-500' },
];

const POPULAR_ICONS = ['🎨', '💡', '🎭', '🎪', '🎸', '🎹', '🎺', '🎻', '🥁', '🎬', '📸', '🎥', '💐', '🎈', '🎀', '🕯️', '✨', '⭐', '🌟', '💫'];

const ExtrasManagerTabs = ({ categories, allExtras, onUpdateCategories }: ExtrasManagerTabsProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editingCategory, setEditingCategory] = useState(false);

  const addCategory = () => {
    const newCategory: ExtraCategory = {
      id: `cat-${Date.now()}`,
      name: 'Nueva Categoría',
      icon: '✨',
      color: 'purple',
      extrasIds: []
    };
    onUpdateCategories([...categories, newCategory]);
    setActiveTab(categories.length);
  };

  const updateCategory = (index: number, field: string, value: any) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    onUpdateCategories(updated);
  };

  const removeCategory = (index: number) => {
    if (confirm('¿Eliminar esta categoría?')) {
      onUpdateCategories(categories.filter((_, i) => i !== index));
      setActiveTab(Math.max(0, index - 1));
    }
  };

  const toggleExtra = (extraId: string) => {
    const updated = [...categories];
    const currentIds = updated[activeTab].extrasIds || [];
    
    if (currentIds.includes(extraId)) {
      updated[activeTab].extrasIds = currentIds.filter(id => id !== extraId);
    } else {
      updated[activeTab].extrasIds = [...currentIds, extraId];
    }
    
    onUpdateCategories(updated);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <span className="text-6xl mb-4 block">✨</span>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No hay categorías de extras</h3>
        <p className="text-sm text-gray-600 mb-4">Crea tu primera categoría para organizar los extras</p>
        <button
          onClick={addCategory}
          className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        >
          <Plus className="w-4 h-4" />
          Crear Primera Categoría
        </button>
      </div>
    );
  }

  const activeCategory = categories[activeTab];
  const colorConfig = AVAILABLE_COLORS.find(c => c.value === activeCategory?.color) || AVAILABLE_COLORS[0];
  
  // Filtrar extras por búsqueda
  const filteredExtras = allExtras.filter(extra =>
    extra.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedExtras = filteredExtras.filter(extra => activeCategory.extrasIds?.includes(extra.id));
  const unselectedExtras = filteredExtras.filter(extra => !activeCategory.extrasIds?.includes(extra.id));

  return (
    <div className="space-y-6">
      {/* Pestañas de categorías */}
      <div className="border-b border-gray-200">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat, index) => {
            const catColor = AVAILABLE_COLORS.find(c => c.value === cat.color) || AVAILABLE_COLORS[0];
            const isActive = activeTab === index;
            const numExtras = cat.extrasIds?.length || 0;
            
            return (
              <button
                key={cat.id}
                onClick={() => setActiveTab(index)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-t-lg font-medium transition-all whitespace-nowrap
                  ${isActive 
                    ? `${catColor.bgClass} ${catColor.textClass} border-b-2 ${catColor.borderClass}` 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }
                `}
              >
                <span className="text-xl">{cat.icon}</span>
                <span>{cat.name}</span>
                {numExtras > 0 && (
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${isActive ? 'bg-white bg-opacity-50' : 'bg-gray-300 text-gray-700'}
                  `}>
                    {numExtras}
                  </span>
                )}
              </button>
            );
          })}
          
          <button
            onClick={addCategory}
            className="flex items-center gap-1 px-3 py-3 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nueva
          </button>
        </div>
      </div>

      {/* Contenido de la categoría activa */}
      <div className="space-y-4">
        {/* Configuración de categoría */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-start gap-4">
            {/* Selector de icono */}
            <div className="relative">
              <button
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="text-5xl hover:scale-110 transition-transform"
              >
                {activeCategory.icon}
              </button>
              {showIconPicker && (
                <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-xl border border-gray-200 grid grid-cols-5 gap-2">
                  {POPULAR_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => {
                        updateCategory(activeTab, 'icon', icon);
                        setShowIconPicker(false);
                      }}
                      className="text-2xl hover:scale-125 transition-transform p-1"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Nombre y color */}
            <div className="flex-1 space-y-3">
              <input
                type="text"
                value={activeCategory.name}
                onChange={(e) => updateCategory(activeTab, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-medium"
                placeholder="Nombre de la categoría"
              />
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Color:</span>
                {AVAILABLE_COLORS.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateCategory(activeTab, 'color', color.value)}
                    className={`w-8 h-8 rounded ${color.class} ${
                      activeCategory.color === color.value ? 'ring-4 ring-offset-2 ring-gray-400' : ''
                    }`}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Botón eliminar */}
            <button
              onClick={() => removeCategory(activeTab)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar categoría"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar montajes..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Lista de montajes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Montajes seleccionados */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Seleccionados ({selectedExtras.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {selectedExtras.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500">No hay montajes seleccionados</p>
                </div>
              ) : (
                selectedExtras.map(extra => (
                  <div
                    key={extra.id}
                    className={`p-3 rounded-lg border-2 ${colorConfig.borderClass} ${colorConfig.bgClass} cursor-pointer hover:shadow-md transition-shadow`}
                    onClick={() => toggleExtra(extra.id)}
                  >
                    <div className="flex items-center gap-3">
                      {extra.mainImageUrl && (
                        <img src={extra.mainImageUrl} alt={extra.name} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{extra.name}</div>
                        <div className="text-sm text-gray-600">€{Number(extra.pricePerDay || 0).toFixed(2)}/día</div>
                      </div>
                      <X className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Montajes disponibles */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Disponibles ({unselectedExtras.length})
            </h4>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {unselectedExtras.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                  <p className="text-sm text-gray-500">
                    {searchTerm ? 'No hay resultados' : 'Todos los montajes están seleccionados'}
                  </p>
                </div>
              ) : (
                unselectedExtras.map(extra => (
                  <div
                    key={extra.id}
                    className="p-3 bg-white rounded-lg border border-gray-200 cursor-pointer hover:border-purple-300 hover:shadow-md transition-all"
                    onClick={() => toggleExtra(extra.id)}
                  >
                    <div className="flex items-center gap-3">
                      {extra.mainImageUrl && (
                        <img src={extra.mainImageUrl} alt={extra.name} className="w-12 h-12 object-cover rounded" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 truncate">{extra.name}</div>
                        <div className="text-sm text-gray-600">€{Number(extra.pricePerDay || 0).toFixed(2)}/día</div>
                      </div>
                      <Plus className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExtrasManagerTabs;

import { useState } from 'react';

interface MontajeCategorySelectorProps {
  selectedCategories: string[];
  onChange: (categories: string[]) => void;
}

// Categorías disponibles para montajes
const MONTAJE_CATEGORIES = [
  { id: 'BODAS', name: 'Bodas', icon: '💒', color: 'bg-pink-100 text-pink-800 border-pink-300' },
  { id: 'EVENTOS_PRIVADOS', name: 'Eventos Privados', icon: '🎉', color: 'bg-purple-100 text-purple-800 border-purple-300' },
  { id: 'CONCIERTOS', name: 'Conciertos', icon: '🎵', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'EVENTOS_CORPORATIVOS', name: 'Eventos Corporativos', icon: '💼', color: 'bg-gray-100 text-gray-800 border-gray-300' },
  { id: 'CONFERENCIAS', name: 'Conferencias', icon: '🎤', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
  { id: 'EXTRAS', name: 'Extras', icon: '✨', color: 'bg-cyan-100 text-cyan-800 border-cyan-300' },
  { id: 'OTROS', name: 'Otros', icon: '📅', color: 'bg-amber-100 text-amber-800 border-amber-300' },
];

const MontajeCategorySelector = ({ selectedCategories, onChange }: MontajeCategorySelectorProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onChange(selectedCategories.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategories, categoryId]);
    }
  };

  const selectAll = () => {
    onChange(MONTAJE_CATEGORIES.map(cat => cat.id));
  };

  const deselectAll = () => {
    onChange([]);
  };

  const filteredCategories = MONTAJE_CATEGORIES.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Header con contador */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="font-semibold text-lg text-gray-900">
            {selectedCategories.length}
          </span>
          <span>
            {selectedCategories.length === 1 ? 'categoría seleccionada' : 'categorías seleccionadas'}
          </span>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Seleccionar todas
          </button>
          <span className="text-gray-300">|</span>
          <button
            onClick={deselectAll}
            className="text-sm text-red-600 hover:text-red-700 font-medium"
          >
            Deseleccionar todas
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div>
        <input
          type="text"
          placeholder="Buscar categorías..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Grid de categorías */}
      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
        {filteredCategories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);
          
          return (
            <button
              key={category.id}
              onClick={() => toggleCategory(category.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all text-left
                ${isSelected 
                  ? `${category.color} border-current shadow-md scale-105` 
                  : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {/* Checkbox visual */}
              <div className="absolute top-2 right-2">
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center
                  ${isSelected 
                    ? 'bg-current border-current' 
                    : 'bg-white border-gray-300'
                  }
                `}>
                  {isSelected && (
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="flex items-center gap-3">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <div className="font-semibold text-gray-900">
                    {category.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Categoría de montaje
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No se encontraron categorías</p>
        </div>
      )}

      {/* Info adicional */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-sm text-blue-800">
            <strong>Funcionamiento:</strong> Al seleccionar una categoría, todos los montajes de esa categoría estarán disponibles automáticamente para este tipo de evento.
          </div>
        </div>
      </div>
    </div>
  );
};

export default MontajeCategorySelector;

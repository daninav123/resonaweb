import { Link } from 'react-router-dom';

interface CategorySidebarProps {
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}

const getCategoryIcon = (slug: string) => {
  const icons: { [key: string]: string } = {
    'fotografia-video': '📷',
    'sonido': '🎵',
    'iluminacion': '💡',
    'equipamiento-dj': '🎧',
    'mobiliario': '🪑',
    'elementos-escenario': '🎭',
    'mesas-mezcla': '🎚️',
    'microfonia': '🎤',
    'efectos-especiales': '✨',
    'energia-distribucion': '⚡',
    'pantallas-proyeccion': '📺',
    'elementos-decorativos': '🎨',
    'backline': '🎸',
    'cables-conectores': '🔌',
    'comunicaciones': '📡',
  };
  return icons[slug] || '📦';
};

export const CategorySidebar = ({ categories, selectedCategory, onCategoryChange }: CategorySidebarProps) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
      <div className="mb-4">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
          Por Categoría ({categories?.length || 0})
        </h2>
      </div>

      <div className="space-y-1">
        {/* All Products */}
        <button
          onClick={() => onCategoryChange('')}
          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
            !selectedCategory
              ? 'bg-resona text-white font-medium'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🛍️</span>
            <span>Ver Todo el Catálogo</span>
          </span>
        </button>

        {/* Category List */}
        {categories && categories.map((category: any) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.slug)}
            className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
              selectedCategory === category.slug
                ? 'bg-resona text-white font-medium'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>{getCategoryIcon(category.slug)}</span>
              <span>{category.name}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Additional filters section */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Filtros rápidos</h3>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
            <input type="checkbox" className="rounded text-resona focus:ring-resona" />
            <span>Solo disponibles</span>
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-gray-900">
            <input type="checkbox" className="rounded text-resona focus:ring-resona" />
            <span>Ofertas especiales</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default CategorySidebar;

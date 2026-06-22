import { Link } from 'react-router-dom';

interface CategorySidebarProps {
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}

const getCategoryIcon = (slug: string) => {
  const icons: { [key: string]: string } = {
    'fotografia-video': '📹',
    'sonido': '🔊',
    'iluminacion': '💡',
    'equipamiento-dj': '🎧',
    'mobiliario': '🪑',
    'elementos-escenario': '🎪',
    'mesas-mezcla': '🎛️',
    'microfonia': '🎤',
    'efectos-especiales': '🎆',
    'energia-distribucion': '⚡',
    'pantallas-proyeccion': '📺',
    'elementos-decorativos': '✨',
    'backline': '🎸',
    'cables-conectores': '🔌',
    'comunicaciones': '📡',
    'packs': '📦',
    'estructuras': '🏗️',
    'control-sonido': '🎚️',
    'control-iluminacion': '🕯️',
    'generacion-y-distribucion': '🔌',
    'pantallas-y-proteccion': '🛡️',
    'cableado': '🔗',
  };
  return icons[slug] || '🎉';
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
        {categories && categories
          .filter((category: any) => 
            // Filtrar categorías que no queremos mostrar
            !category.name?.toLowerCase().includes('eventos personalizados') &&
            !category.name?.toLowerCase().includes('personal') &&
            !category.isHidden // No mostrar categorías ocultas
          )
          .sort((a: any, b: any) => {
            // Ordenar por sortOrder (menor = primero)
            const orderA = a.sortOrder !== undefined ? a.sortOrder : 999;
            const orderB = b.sortOrder !== undefined ? b.sortOrder : 999;
            
            // Si ambos tienen el mismo sortOrder, ordenar alfabéticamente
            if (orderA === orderB) {
              return (a.name || '').localeCompare(b.name || '');
            }
            
            return orderA - orderB;
          })
          .map((category: any) => (
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
    </div>
  );
};

export default CategorySidebar;

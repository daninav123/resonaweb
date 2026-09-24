import { LayoutGrid } from 'lucide-react';
import { CategoryIcon } from './CategoryIcon';

interface CategorySidebarProps {
  categories: any[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}

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
          <span className="flex items-center gap-2.5">
            <LayoutGrid size={16} strokeWidth={1.75} className="shrink-0" />
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
            <span className="flex items-center gap-2.5">
              <CategoryIcon slug={category.slug} size={16} strokeWidth={1.75} className="shrink-0" />
              <span>{category.name}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategorySidebar;

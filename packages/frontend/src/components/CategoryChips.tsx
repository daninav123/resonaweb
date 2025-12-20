import { CategoryIcon } from './CategoryIcon';
import type { Category } from '../types';

interface CategoryChipsProps {
  categories: Category[];
  selectedCategory: string;
  onCategoryChange: (slug: string) => void;
}

export const CategoryChips = ({
  categories,
  selectedCategory,
  onCategoryChange,
}: CategoryChipsProps) => {
  // Filtrar categorías que no deben mostrarse
  const visibleCategories = categories.filter(cat => {
    const name = cat.name?.toLowerCase() || '';
    return name !== 'eventos personalizados' && name !== 'personal';
  });

  return (
    <div className="w-full bg-white rounded-lg shadow-md p-3 mb-6">
      {/* Scroll horizontal container */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          {/* Chip "Todas" */}
          <button
            onClick={() => onCategoryChange('')}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all
              ${!selectedCategory
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            <span className="text-lg">📦</span>
            <span className="text-sm">Todas</span>
          </button>

          {/* Chips de categorías */}
          {visibleCategories.map((category) => {
            const isSelected = selectedCategory === category.slug;
            
            return (
              <button
                key={category.id}
                onClick={() => onCategoryChange(category.slug)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all
                  ${isSelected
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <CategoryIcon slug={category.slug} className="text-lg" size={18} />
                <span className="text-sm">{category.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

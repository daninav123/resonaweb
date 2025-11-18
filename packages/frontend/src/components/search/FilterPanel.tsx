import { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface FilterPanelProps {
  onFilterChange: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
  className?: string;
}

export interface ProductFilters {
  categories?: string[];
  minPrice?: number;
  maxPrice?: number;
  availability?: 'ALL' | 'IN_STOCK' | 'ON_DEMAND';
  sortBy?: 'NAME_ASC' | 'NAME_DESC' | 'PRICE_ASC' | 'PRICE_DESC' | 'POPULAR';
}

export const FilterPanel = ({
  onFilterChange,
  initialFilters = {},
  className = ''
}: FilterPanelProps) => {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);
  const [showCategories, setShowCategories] = useState(true);
  const [showPrice, setShowPrice] = useState(true);
  const [showAvailability, setShowAvailability] = useState(true);

  // Cargar categorías
  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await api.get('/categories');
      return response.categories || [];
    }
  });

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleCategoryToggle = (categoryId: string) => {
    setFilters(prev => {
      const current = prev.categories || [];
      const updated = current.includes(categoryId)
        ? current.filter(id => id !== categoryId)
        : [...current, categoryId];
      return { ...prev, categories: updated };
    });
  };

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const numValue = value === '' ? undefined : Number(value);
    setFilters(prev => ({
      ...prev,
      [type === 'min' ? 'minPrice' : 'maxPrice']: numValue
    }));
  };

  const handleAvailabilityChange = (value: ProductFilters['availability']) => {
    setFilters(prev => ({ ...prev, availability: value }));
  };

  const handleSortChange = (value: ProductFilters['sortBy']) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
  };

  const clearAllFilters = () => {
    setFilters({});
  };

  const hasActiveFilters = () => {
    return (
      (filters.categories && filters.categories.length > 0) ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      (filters.availability && filters.availability !== 'ALL')
    );
  };

  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-resona" />
          <h3 className="font-semibold text-gray-900">Filtros</h3>
        </div>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-resona hover:text-resona-dark flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Sort */}
      <div className="mb-4 pb-4 border-b">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ordenar por
        </label>
        <select
          value={filters.sortBy || 'POPULAR'}
          onChange={(e) => handleSortChange(e.target.value as ProductFilters['sortBy'])}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-resona focus:border-transparent"
        >
          <option value="POPULAR">Más Popular</option>
          <option value="NAME_ASC">Nombre (A-Z)</option>
          <option value="NAME_DESC">Nombre (Z-A)</option>
          <option value="PRICE_ASC">Precio (Menor a Mayor)</option>
          <option value="PRICE_DESC">Precio (Mayor a Menor)</option>
        </select>
      </div>

      {/* Categories */}
      <div className="mb-4 pb-4 border-b">
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
        >
          <span>Categorías</span>
          {showCategories ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showCategories && (
          <div className="space-y-2 mt-2">
            {categories && categories.map((category: any) => (
              <label key={category.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.categories?.includes(category.id) || false}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="rounded text-resona focus:ring-resona"
                />
                <span className="text-sm text-gray-700">{category.name}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="mb-4 pb-4 border-b">
        <button
          onClick={() => setShowPrice(!showPrice)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
        >
          <span>Precio por día</span>
          {showPrice ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showPrice && (
          <div className="space-y-2 mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-600">Mínimo (€)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={filters.minPrice || ''}
                  onChange={(e) => handlePriceChange('min', e.target.value)}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600">Máximo (€)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={filters.maxPrice || ''}
                  onChange={(e) => handlePriceChange('max', e.target.value)}
                  placeholder="1000"
                  className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="mb-4">
        <button
          onClick={() => setShowAvailability(!showAvailability)}
          className="flex items-center justify-between w-full text-sm font-medium text-gray-700 mb-2"
        >
          <span>Disponibilidad</span>
          {showAvailability ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showAvailability && (
          <div className="space-y-2 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="ALL"
                checked={!filters.availability || filters.availability === 'ALL'}
                onChange={() => handleAvailabilityChange('ALL')}
                className="text-resona focus:ring-resona"
              />
              <span className="text-sm text-gray-700">Todos</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="IN_STOCK"
                checked={filters.availability === 'IN_STOCK'}
                onChange={() => handleAvailabilityChange('IN_STOCK')}
                className="text-resona focus:ring-resona"
              />
              <span className="text-sm text-gray-700">Disponible ahora</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="availability"
                value="ON_DEMAND"
                checked={filters.availability === 'ON_DEMAND'}
                onChange={() => handleAvailabilityChange('ON_DEMAND')}
                className="text-resona focus:ring-resona"
              />
              <span className="text-sm text-gray-700">Bajo pedido</span>
            </label>
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters() && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-gray-600 mb-2">Filtros activos:</p>
          <div className="flex flex-wrap gap-2">
            {filters.categories && filters.categories.length > 0 && (
              <span className="text-xs bg-resona/10 text-resona px-2 py-1 rounded">
                {filters.categories.length} categorías
              </span>
            )}
            {filters.minPrice && (
              <span className="text-xs bg-resona/10 text-resona px-2 py-1 rounded">
                Desde €{filters.minPrice}
              </span>
            )}
            {filters.maxPrice && (
              <span className="text-xs bg-resona/10 text-resona px-2 py-1 rounded">
                Hasta €{filters.maxPrice}
              </span>
            )}
            {filters.availability && filters.availability !== 'ALL' && (
              <span className="text-xs bg-resona/10 text-resona px-2 py-1 rounded">
                {filters.availability === 'IN_STOCK' ? 'Disponible' : 'Bajo pedido'}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;

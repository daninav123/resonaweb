import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  price: number;
  imageUrl: string;
  category: {
    name: string;
  };
}

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar = ({
  onSearch,
  placeholder = 'Buscar productos...',
  className = ''
}: SearchBarProps) => {
  const [query, setQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Búsqueda con debounce
  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query],
    queryFn: async () => {
      if (query.length < 2) return [];
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}&limit=5`);
      return response.products || [];
    },
    enabled: query.length >= 2,
    staleTime: 30000 // 30 segundos
  });

  // Cerrar resultados al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      if (onSearch) {
        onSearch(query);
      } else {
        navigate(`/productos?search=${encodeURIComponent(query)}`);
      }
      setShowResults(false);
      setQuery('');
    }
  };

  const handleResultClick = (slug: string) => {
    navigate(`/productos/${slug}`);
    setShowResults(false);
    setQuery('');
  };

  const handleClear = () => {
    setQuery('');
    setShowResults(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => query.length >= 2 && setShowResults(true)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </form>

      {/* Results Dropdown */}
      {showResults && query.length >= 2 && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-resona" />
              <p className="text-sm text-gray-500 mt-2">Buscando...</p>
            </div>
          ) : results && results.length > 0 ? (
            <>
              {results.map((product: SearchResult) => (
                <button
                  key={product.id}
                  onClick={() => handleResultClick(product.slug)}
                  className="w-full p-3 hover:bg-gray-50 flex items-center gap-3 text-left border-b last:border-b-0 transition-colors"
                >
                  <img
                    src={product.imageUrl || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                    <p className="text-xs text-gray-500">{product.category?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-resona">
                      €{Number(product.price).toFixed(2)}
                      <span className="text-xs text-gray-500">/día</span>
                    </p>
                  </div>
                </button>
              ))}
              <div className="p-2 bg-gray-50 border-t">
                <button
                  onClick={handleSearch}
                  className="w-full py-2 text-sm text-resona hover:text-resona-dark font-medium text-center"
                >
                  Ver todos los resultados ({results.length}+)
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center">
              <Search className="w-8 h-8 mx-auto text-gray-300 mb-2" />
              <p className="text-sm text-gray-500">No se encontraron resultados</p>
              <p className="text-xs text-gray-400 mt-1">
                Prueba con otros términos de búsqueda
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;

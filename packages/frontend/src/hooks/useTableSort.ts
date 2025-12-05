import { useState, useMemo } from 'react';

export type SortDirection = 'asc' | 'desc' | null;
export type SortField = string;

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export function useTableSort<T>(items: T[], defaultSort?: SortConfig) {
  const [sortConfig, setSortConfig] = useState<SortConfig>(
    defaultSort || { field: '', direction: null }
  );

  const sortedItems = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return items;
    }

    const sorted = [...items].sort((a: any, b: any) => {
      let aValue = getNestedValue(a, sortConfig.field);
      let bValue = getNestedValue(b, sortConfig.field);

      // Manejo de valores nulos/undefined
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Convertir objetos Decimal/Prisma a números
      // Los objetos Decimal tienen un método toNumber() o se pueden convertir con Number()
      if (typeof aValue === 'object' && aValue !== null) {
        aValue = Number(aValue);
      }
      if (typeof bValue === 'object' && bValue !== null) {
        bValue = Number(bValue);
      }

      // Comparación numérica
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Comparación de strings (case-insensitive)
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();

      if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [items, sortConfig]);

  const requestSort = (field: SortField) => {
    let direction: SortDirection = 'asc';

    if (sortConfig.field === field) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = null;
      }
    }

    setSortConfig({ field, direction });
  };

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return '⇅'; // Sin ordenar
    }
    if (sortConfig.direction === 'asc') {
      return '↑'; // Ascendente
    }
    if (sortConfig.direction === 'desc') {
      return '↓'; // Descendente
    }
    return '⇅';
  };

  return {
    sortedItems,
    sortConfig,
    requestSort,
    getSortIcon,
  };
}

// Helper para acceder a valores anidados (ej: "product.name")
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

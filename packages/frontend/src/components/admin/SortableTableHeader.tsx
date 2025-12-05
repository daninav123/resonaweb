import React from 'react';

interface SortableTableHeaderProps {
  label: string;
  field: string;
  sortIcon: string;
  onSort: (field: string) => void;
  className?: string;
}

export const SortableTableHeader: React.FC<SortableTableHeaderProps> = ({
  label,
  field,
  sortIcon,
  onSort,
  className = '',
}) => {
  return (
    <th className={`${className} cursor-pointer hover:bg-gray-100 transition-colors select-none`}>
      <div
        onClick={() => onSort(field)}
        className="flex items-center justify-between gap-2 px-4 py-3"
      >
        <span className="font-semibold text-gray-700">{label}</span>
        <span className="text-gray-400 text-lg">{sortIcon}</span>
      </div>
    </th>
  );
};

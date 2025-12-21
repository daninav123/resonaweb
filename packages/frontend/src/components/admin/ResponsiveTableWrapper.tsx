import { ReactNode } from 'react';

interface ResponsiveTableWrapperProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveTableWrapper = ({ children, className = '' }: ResponsiveTableWrapperProps) => {
  return (
    <div className={`w-full overflow-x-auto -mx-2 sm:mx-0 ${className}`}>
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          {children}
        </div>
      </div>
    </div>
  );
};

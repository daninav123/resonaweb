import { ReactNode } from 'react';

interface ResponsiveTableWrapperProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveTableWrapper = ({ children, className = '' }: ResponsiveTableWrapperProps) => {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      {children}
    </div>
  );
};

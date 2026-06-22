import { ReactNode } from 'react';

interface ResponsiveTableWrapperProps {
  children: ReactNode;
  className?: string;
}

export const ResponsiveTableWrapper = ({ children, className = '' }: ResponsiveTableWrapperProps) => {
  return (
    <div 
      className={`w-full ${className}`}
      style={{ 
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        display: 'block',
        width: '100%',
        maxWidth: '100%',
        position: 'relative',
        touchAction: 'pan-x pan-y'
      }}
    >
      {children}
    </div>
  );
};

/**
 * Componente de Breadcrumbs con Schema.org integrado
 * Mejora la navegación y el SEO
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { generateBreadcrumbSchema, Breadcrumb as BreadcrumbType } from '../../utils/seo/schemaGenerator';

interface BreadcrumbsProps {
  items: BreadcrumbType[];
  className?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const schema = generateBreadcrumbSchema(items);

  return (
    <>
      {/* Schema.org JSON-LD */}
      <Helmet>
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      </Helmet>

      {/* UI Visual */}
      <nav aria-label="Breadcrumb" className={`flex items-center space-x-2 text-sm text-gray-600 ${className}`}>
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {index > 0 && (
              <span className="text-gray-400">/</span>
            )}
            {index === items.length - 1 ? (
              <span className="text-gray-900 font-medium" aria-current="page">
                {item.name}
              </span>
            ) : (
              <Link 
                to={item.url} 
                className="hover:text-blue-600 transition-colors"
              >
                {item.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>
    </>
  );
};

export default Breadcrumbs;

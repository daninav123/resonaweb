import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  schema?: object | object[];
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  product?: {
    price?: number;
    currency?: string;
    availability?: string;
  };
}

const SEOHead = ({
  title = 'Resona Events - Alquiler de Material para Eventos',
  description = 'Alquiler profesional de equipos de sonido, iluminación, fotografía y video para eventos. Bodas, conciertos, conferencias y eventos corporativos. Presupuesto online.',
  keywords = 'alquiler sonido, alquiler iluminación, alquiler material eventos, alquiler equipos audiovisuales, sonido profesional, iluminación eventos, fotografía eventos, video eventos, bodas, conciertos',
  ogImage = 'https://resonaevents.com/og-image.jpg',
  ogType = 'website',
  canonicalUrl,
  noindex = false,
  schema,
  article,
  product,
}: SEOProps) => {
  const fullTitle = title.includes('Resona') ? title : `${title} | Resona Events`;
  const baseUrl = 'https://resonaevents.com';
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : baseUrl);

  // Asegurar que la imagen tiene URL completa
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${baseUrl}${ogImage}`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots */}
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      )}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Resona Events" />
      <meta property="og:locale" content="es_ES" />
      
      {/* Article specific */}
      {article && (
        <>
          {article.publishedTime && <meta property="article:published_time" content={article.publishedTime} />}
          {article.modifiedTime && <meta property="article:modified_time" content={article.modifiedTime} />}
          {article.author && <meta property="article:author" content={article.author} />}
          {article.section && <meta property="article:section" content={article.section} />}
          {article.tags && article.tags.map(tag => (
            <meta key={tag} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Product specific */}
      {product && (
        <>
          {product.price && <meta property="product:price:amount" content={product.price.toString()} />}
          {product.currency && <meta property="product:price:currency" content={product.currency} />}
          {product.availability && <meta property="product:availability" content={product.availability} />}
        </>
      )}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* Additional SEO */}
      <meta name="language" content="Spanish" />
      <meta name="geo.region" content="ES" />
      <meta name="geo.placename" content="España" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Resona Events" />
      
      {/* Mobile */}
      <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      <meta name="theme-color" content="#667eea" />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        Array.isArray(schema) ? (
          schema.map((s, index) => (
            <script key={index} type="application/ld+json">
              {JSON.stringify(s)}
            </script>
          ))
        ) : (
          <script type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        )
      )}
    </Helmet>
  );
};

export default SEOHead;

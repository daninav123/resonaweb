import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  schema?: object;
}

const SEOHead = ({
  title = 'Resona Events - Alquiler de Material para Eventos',
  description = 'Alquiler profesional de equipos de sonido, iluminación, fotografía y video para eventos. Bodas, conciertos, conferencias y eventos corporativos. Presupuesto online.',
  keywords = 'alquiler sonido, alquiler iluminación, alquiler material eventos, alquiler equipos audiovisuales, sonido profesional, iluminación eventos, fotografía eventos, video eventos, bodas, conciertos',
  ogImage = 'https://resona.com/og-image.jpg',
  ogType = 'website',
  canonicalUrl,
  noindex = false,
  schema,
}: SEOProps) => {
  const fullTitle = title.includes('Resona') ? title : `${title} | Resona Events`;
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : 'https://resona.com');

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Robots */}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:site_name" content="Resona Events" />
      <meta property="og:locale" content="es_ES" />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={currentUrl} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="language" content="Spanish" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Resona Events" />
      
      {/* Schema.org JSON-LD */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  );
};

export default SEOHead;

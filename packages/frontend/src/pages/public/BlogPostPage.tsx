import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { blogService } from '../../services/blog.service';
import SEOHead from '../../components/SEO/SEOHead';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  publishedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  category: {
    name: string;
    color: string;
  };
  author: {
    firstName: string;
    lastName: string;
  };
  featuredImage?: string;
  tags?: { name: string }[];
}

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (slug) {
      loadPost();
    }
  }, [slug]);

  const loadPost = async () => {
    try {
      setLoading(true);
      setError(false);
      const data = await blogService.getPostBySlug(slug!);
      setPost(data as any);
    } catch (err) {
      console.error('Error cargando artículo:', err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const shareOnSocial = (platform: string) => {
    const url = window.location.href;
    const text = post?.title || '';
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`,
    };

    window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Artículo no encontrado</h1>
        <Link to="/blog" className="text-resona hover:text-resona-dark">
          ← Volver al blog
        </Link>
      </div>
    );
  }

  // Construir URL completa de la imagen
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3001${imagePath}`;
  };

  const imageUrl = getImageUrl(post.featuredImage);

  return (
    <>
      <SEOHead
        title={post.metaTitle || post.title}
        description={post.metaDescription || post.excerpt}
      />

      <article className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b">
          <div className="container mx-auto px-4 py-6">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 text-resona hover:text-resona-dark mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al blog
            </Link>
          </div>
        </div>

        {/* Imagen destacada */}
        {imageUrl && (
          <div className="w-full aspect-[21/9] overflow-hidden bg-gray-200">
            <img
              src={imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Contenido */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Categoría */}
            <div className="mb-6">
              <span
                className="px-4 py-2 rounded-full text-sm font-semibold text-white"
                style={{ backgroundColor: post.category.color || '#5ebbff' }}
              >
                {post.category.name}
              </span>
            </div>

            {/* Título */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              {post.title}
            </h1>

            {/* Metadatos */}
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-8 pb-8 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>{post.author.firstName} {post.author.lastName}</span>
              </div>

              {/* Compartir */}
              <div className="flex items-center gap-2 ml-auto">
                <Share2 className="w-5 h-5" />
                <button
                  onClick={() => shareOnSocial('facebook')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Compartir en Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </button>
                <button
                  onClick={() => shareOnSocial('twitter')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Compartir en Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </button>
                <button
                  onClick={() => shareOnSocial('linkedin')}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Compartir en LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Contenido del artículo */}
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t">
                <h3 className="text-lg font-semibold mb-4">Etiquetas:</h3>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="mt-12 p-8 bg-gradient-to-br from-resona to-resona-dark rounded-xl text-white text-center">
              <h3 className="text-2xl font-bold mb-4">
                ¿Necesitas equipo para tu evento?
              </h3>
              <p className="text-lg mb-6 text-gray-100">
                Descubre nuestro catálogo completo y calcula el presupuesto de tu evento
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Link
                  to="/productos"
                  className="px-6 py-3 bg-white text-resona font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Ver Productos
                </Link>
                <Link
                  to="/calculadora-evento"
                  className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-resona transition-colors"
                >
                  Calcular Presupuesto
                </Link>
              </div>
            </div>
          </div>
        </div>
      </article>
    </>
  );
};

export default BlogPostPage;

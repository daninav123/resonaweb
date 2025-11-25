import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Tag, Clock } from 'lucide-react';

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    publishedAt: string;
    category: {
      name: string;
      color: string;
    };
    author: {
      firstName: string;
      lastName: string;
    };
    featuredImage?: string;
    readingTime?: number;
  };
}

export const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  const [imageError, setImageError] = React.useState(false);
  
  // Validar datos
  if (!post || !post.title || !post.slug) {
    console.error('BlogCard: Post inválido', post);
    return null;
  }
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('es-ES', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return 'Fecha no disponible';
    }
  };

  // Construir URL completa de la imagen
  const getImageUrl = (imagePath: string | undefined) => {
    if (!imagePath) return null;
    // Si ya es una URL completa, devolverla tal cual
    if (imagePath.startsWith('http')) return imagePath;
    // Construir URL con el backend
    return `http://localhost:3001${imagePath}`;
  };

  const imageUrl = getImageUrl(post.featuredImage);

  return (
    <article className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Imagen destacada */}
      {imageUrl ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={imageUrl}
            alt={post.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Si falla la carga, mostrar placeholder
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="aspect-video bg-resona flex items-center justify-center"><span class="text-white text-4xl font-bold opacity-20">ReSona</span></div>';
            }}
          />
        </div>
      ) : (
        <div className="aspect-video bg-resona flex items-center justify-center">
          <span className="text-white text-4xl font-bold opacity-20">ReSona</span>
        </div>
      )}

      {/* Contenido */}
      <div className="p-6">
        {/* Categoría */}
        {post.category && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold text-white"
              style={{ backgroundColor: post.category.color || '#5ebbff' }}
            >
              {post.category.name}
            </span>
          </div>
        )}

        {/* Título */}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="text-2xl font-bold text-gray-900 mb-3 hover:text-resona transition-colors line-clamp-2">
            {post.title}
          </h2>
        </Link>

        {/* Extracto */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Metadatos */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
          {post.publishedAt && (
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(post.publishedAt)}</span>
            </div>
          )}
          
          {post.author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{post.author.firstName} {post.author.lastName}</span>
            </div>
          )}

          {post.readingTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{post.readingTime} min lectura</span>
            </div>
          )}
        </div>

        {/* Botón Leer más */}
        <Link
          to={`/blog/${post.slug}`}
          className="inline-block mt-4 text-resona font-semibold hover:text-resona-dark transition-colors"
        >
          Leer más →
        </Link>
      </div>
    </article>
  );
};

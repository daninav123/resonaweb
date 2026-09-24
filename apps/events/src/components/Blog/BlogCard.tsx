import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Tag, Clock } from 'lucide-react';
import { getImageUrl } from '@resona/utils';

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

  const imageUrl = post.featuredImage ? getImageUrl(post.featuredImage) : null;

  return (
    <article className="group">
      {/* Imagen destacada */}
      {imageUrl ? (
        <div className="aspect-[3/2] overflow-hidden bg-paper-200">
          <img
            src={imageUrl}
            alt={post.title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            onError={(e) => {
              // Si falla la carga, mostrar placeholder
              e.currentTarget.style.display = 'none';
              e.currentTarget.parentElement!.innerHTML = '<div class="flex aspect-[3/2] items-center justify-center bg-paper-300"></div>';
            }}
          />
        </div>
      ) : (
        <div className="flex aspect-[3/2] items-center justify-center bg-paper-300">
          <span className="text-[11px] uppercase tracking-[0.18em] text-ink-400">ReSona</span>
        </div>
      )}

      {/* Contenido */}
      <div className="pt-5">
        {/* Categoría */}
        {post.category && (
          <div className="flex items-center gap-2 mb-3">
            <span
              className="rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-white"
              style={{ backgroundColor: post.category.color || '#3D5AFE' }}
            >
              {post.category.name}
            </span>
          </div>
        )}

        {/* Título */}
        <Link to={`/blog/${post.slug}`}>
          <h2 className="mb-3 line-clamp-2 text-[20px] font-medium leading-snug tracking-tight text-ink transition-opacity hover:opacity-60">
            {post.title}
          </h2>
        </Link>

        {/* Extracto */}
        <p className="text-ink-600 mb-4 line-clamp-3">
          {post.excerpt}
        </p>

        {/* Metadatos */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-ink-500">
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
          className="inline-block mt-4 text-accent-600 font-semibold hover:text-accent-700 transition-colors"
        >
          Leer más →
        </Link>
      </div>
    </article>
  );
};

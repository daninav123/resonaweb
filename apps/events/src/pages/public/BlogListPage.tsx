import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BlogCard } from '../../components/Blog/BlogCard';
import { blogService } from '../../services/blog.service';
import SEOHead from '../../components/SEO/SEOHead';

interface BlogPost {
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
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

const BlogListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const selectedCategory = searchParams.get('category');
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    loadData();
  }, [selectedCategory, currentPage]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        blogService.getPublishedPosts({
          categoryId: selectedCategory || undefined,
          page: currentPage,
          limit: 9,
        }),
        blogService.getCategories(),
      ]);

      console.log('📦 Datos del blog recibidos:', postsData);
      console.log('📁 Categorías recibidas:', categoriesData);

      setPosts((postsData as any)?.posts || []);
      setPagination((postsData as any)?.pagination || { page: 1, totalPages: 1, total: 0 });
      setCategories((categoriesData as any) || []);
    } catch (error) {
      console.error('Error cargando blog:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = (categoryId: string | null) => {
    const params = new URLSearchParams();
    if (categoryId) params.set('category', categoryId);
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <SEOHead
        title="Blog - ReSona Events"
        description="Artículos, guías y consejos sobre alquiler de material audiovisual para eventos. Encuentra toda la información que necesitas para tu evento perfecto."
      />

      <div className="min-h-screen bg-paper">
        <section className="mx-auto max-w-[1200px] px-5 pb-14 pt-32 md:px-10 md:pb-20 md:pt-44">
          <p className="mb-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-500">
            Diario
          </p>
          <h1 className="max-w-3xl text-[38px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink md:text-[64px]">
            Lo que aprendemos
            <br className="hidden sm:block" /> montando eventos.
          </h1>
          <p className="mt-8 max-w-xl text-[16px] leading-relaxed text-ink-600">
            Guías y decisiones técnicas explicadas sin jerga, para que sepas qué estás
            contratando antes de contratarlo.
          </p>
        </section>

        <div className="mx-auto max-w-[1200px] border-t border-paper-400/60 px-5 py-8 md:px-10">
          <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`rounded-full px-5 py-2 text-[14px] transition-colors ${
                  !selectedCategory
                    ? 'bg-ink text-cream-100'
                    : 'border border-ink/15 text-ink-600 hover:border-ink/40 hover:text-ink'
                }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`rounded-full px-5 py-2 text-[14px] transition-colors ${
                    selectedCategory === category.id
                      ? 'text-white'
                      : 'border border-ink/15 text-ink-600 hover:border-ink/40 hover:text-ink'
                  }`}
                  style={{
                    backgroundColor: selectedCategory === category.id ? category.color : undefined,
                  }}
                >
                  {category.name}
                </button>
              ))}
          </div>
        </div>

        {/* Lista de Artículos */}
        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-ink-600">No hay artículos disponibles</p>
            </div>
          ) : (
            <>
              {/* Grid de Artículos */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>

              {/* Paginación */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-paper-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-paper-200 transition-colors"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-accent text-white'
                          : 'border border-paper-400 hover:bg-paper-200'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 rounded-lg border border-paper-400 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-paper-200 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogListPage;

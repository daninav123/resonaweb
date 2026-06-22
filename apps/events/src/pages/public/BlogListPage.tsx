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

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="relative bg-resona text-white py-16">
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/15 to-black/20"></div>
          <div className="relative container mx-auto px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Blog de ReSona</h1>
            <p className="text-xl text-gray-100 max-w-2xl">
              Guías, consejos y las últimas tendencias en alquiler de material audiovisual para eventos
            </p>
          </div>
        </div>

        {/* Filtros de Categorías */}
        <div className="bg-white shadow-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  !selectedCategory
                    ? 'bg-resona text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategoryFilter(category.id)}
                  className={`px-4 py-2 rounded-full font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
        </div>

        {/* Lista de Artículos */}
        <div className="container mx-auto px-4 py-12">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-xl text-gray-600">No hay artículos disponibles</p>
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
                    className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    Anterior
                  </button>
                  
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-resona text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
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

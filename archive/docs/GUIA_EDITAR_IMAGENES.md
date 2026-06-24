import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Package, Edit2, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

export const ProductsManager = () => {
  const [search, setSearch] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(['']);
  const queryClient = useQueryClient();

  // Fetch products
  const { data: products, isLoading } = useQuery({
    queryKey: ['admin-products', search],
    queryFn: async () => {
      const response = await api.get('/products', {
        params: { search, limit: 50 }
      });
      return response.data || [];
    }
  });

  // Update product mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      return await api.patch(`/products/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Producto actualizado');
      setEditingProduct(null);
    },
    onError: () => {
      toast.error('Error al actualizar');
    }
  });

  const handleEditImages = (product: any) => {
    setEditingProduct(product);
    setImageUrls(product.images?.length > 0 ? product.images : ['']);
  };

  const handleAddImageField = () => {
    setImageUrls([...imageUrls, '']);
  };

  const handleRemoveImageField = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleImageUrlChange = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    setImageUrls(newUrls);
  };

  const handleSaveImages = () => {
    const validUrls = imageUrls.filter(url => url.trim() !== '');
    
    updateMutation.mutate({
      id: editingProduct.id,
      data: {
        images: validUrls,
        mainImageUrl: validUrls[0] || null
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Productos
          </h1>
          <p className="text-gray-600">Edita imágenes y detalles de tus productos</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <input
            type="text"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map((product: any) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Product Image */}
                <div className="relative h-48 bg-gray-200">
                  {product.images && product.images[0] ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Package className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-xs font-semibold">
                    {product.images?.length || 0} {product.images?.length === 1 ? 'imagen' : 'imágenes'}
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                    {product.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-2">
                    Stock: {product.stock} | €{product.pricePerDay}/día
                  </p>
                  <p className="text-xs text-gray-500 mb-4">
                    Slug: {product.slug}
                  </p>

                  {/* Actions */}
                  <button
                    onClick={() => handleEditImages(product)}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                  >
                    <ImageIcon className="w-4 h-4" />
                    Editar Imágenes
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Images Modal */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                Editar Imágenes: {editingProduct.name}
              </h2>

              <div className="space-y-4 mb-6">
                {imageUrls.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        URL Imagen {index + 1} {index === 0 && '(Principal)'}
                      </label>
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageUrlChange(index, e.target.value)}
                        placeholder="https://ejemplo.com/imagen.jpg"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    {imageUrls.length > 1 && (
                      <button
                        onClick={() => handleRemoveImageField(index)}
                        className="mt-7 p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  onClick={handleAddImageField}
                  className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Añadir otra imagen
                </button>
              </div>

              {/* Preview */}
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Vista previa:</h3>
                <div className="grid grid-cols-2 gap-2">
                  {imageUrls.filter(url => url.trim()).map((url, i) => (
                    <div key={i} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={url}
                        alt={`Preview ${i + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Error+al+cargar';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setEditingProduct(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveImages}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;

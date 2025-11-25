import { useState } from 'react';
import { X, Save } from 'lucide-react';
import { ImageUploader } from './ImageUploader';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface ProductImageManagerProps {
  product: {
    id: string;
    name: string;
    images?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProductImageManager = ({ product, isOpen, onClose, onSuccess }: ProductImageManagerProps) => {
  const [images, setImages] = useState<string[]>(product.images || []);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/products/${product.id}`, {
        mainImageUrl: images[0] || null
      });

      toast.success('Imágenes actualizadas');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error al guardar imágenes:', error);
      const errorMessage = typeof error.response?.data?.error === 'string' 
        ? error.response.data.error 
        : error.response?.data?.message || error.message || 'Error al guardar las imágenes';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Gestionar Imágenes
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {product.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <ImageUploader
            currentImages={images}
            onImagesChange={setImages}
            maxImages={10}
          />
        </div>

        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3">
          <button
            onClick={onClose}
            disabled={saving}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

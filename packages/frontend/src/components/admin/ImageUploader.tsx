import { useState, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface ImageUploaderProps {
  currentImages: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export const ImageUploader = ({ currentImages, onImagesChange, maxImages = 5 }: ImageUploaderProps) => {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (files: FileList) => {
    if (!files || files.length === 0) return;

    // Validar número máximo de imágenes
    if (currentImages.length + files.length > maxImages) {
      toast.error(`Máximo ${maxImages} imágenes permitidas`);
      return;
    }

    setUploading(true);

    try {
      const uploadedUrls: string[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
          toast.error(`${file.name} no es una imagen`);
          errorCount++;
          continue;
        }

        // Validar tamaño (5MB)
        if (file.size > 5 * 1024 * 1024) {
          toast.error(`${file.name} es demasiado grande (máx. 5MB)`);
          errorCount++;
          continue;
        }

        try {
          // Crear FormData
          const formData = new FormData();
          formData.append('image', file);

          console.log(`📤 Subiendo ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024).toFixed(2)}KB)...`);

          // Subir al servidor
          const response: any = await api.post('/upload/image', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          });

          // Validar respuesta (puede venir en response.data o directamente en response)
          const responseData = response.data || response;
          
          if (!responseData || !responseData.imageUrl) {
            console.error('❌ Respuesta inválida del servidor:', response);
            toast.error(`Error al subir ${file.name}: respuesta inválida`);
            errorCount++;
            continue;
          }

          // El backend devuelve rutas como: /uploads/products/filename.jpg
          const imagePath = responseData.imageUrl;
          
          // Si ya es URL completa, usar directamente
          if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            uploadedUrls.push(imagePath);
            console.log(`✅ ${i + 1}/${files.length}: URL completa guardada`);
            successCount++;
            continue;
          }
          
          // Construir URL completa del backend
          const hostname = window.location.hostname;
          const isDevelopment = hostname === 'localhost' || hostname === '127.0.0.1';
          const backendUrl = isDevelopment 
            ? 'http://localhost:3001'
            : 'https://resona-backend.onrender.com';
          
          const imageUrl = `${backendUrl}${imagePath}`;
          
          console.log(`✅ ${i + 1}/${files.length}: ${file.name} subido correctamente`);
          uploadedUrls.push(imageUrl);
          successCount++;

          // Pequeño delay entre uploads para no saturar el servidor
          if (i < files.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 200));
          }

        } catch (uploadError: any) {
          console.error(`❌ Error al subir ${file.name}:`, uploadError);
          const errorMsg = uploadError.response?.data?.error || uploadError.message || 'Error desconocido';
          toast.error(`${file.name}: ${errorMsg}`);
          errorCount++;
        }
      }

      if (uploadedUrls.length > 0) {
        onImagesChange([...currentImages, ...uploadedUrls]);
      }

      // Mensaje de resumen
      if (successCount > 0 && errorCount === 0) {
        toast.success(`✅ ${successCount} imagen(es) subida(s) correctamente`);
      } else if (successCount > 0 && errorCount > 0) {
        toast.success(`✅ ${successCount} correctas, ❌ ${errorCount} con errores`);
      } else if (errorCount > 0) {
        toast.error(`❌ Error al subir ${errorCount} imagen(es)`);
      }
    } catch (error: any) {
      console.error('Error al subir imágenes:', error);
      toast.error(error.response?.data?.error || 'Error al subir las imágenes');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleUpload(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = currentImages.filter((_, i) => i !== index);
    onImagesChange(newImages);
    toast.success('Imagen eliminada');
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...currentImages];
    const [moved] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, moved);
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Zona de carga */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading || currentImages.length >= maxImages}
        />

        {uploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-sm text-gray-600">Subiendo imágenes...</p>
          </div>
        ) : (
          <>
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">
              Arrastra imágenes aquí o haz click para seleccionar
            </p>
            <p className="text-sm text-gray-500 mb-4">
              PNG, JPG, GIF, WebP (máx. 5MB por imagen)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              disabled={currentImages.length >= maxImages}
            >
              Seleccionar Archivos
            </button>
            <p className="text-xs text-gray-400 mt-2">
              {currentImages.length}/{maxImages} imágenes
            </p>
          </>
        )}
      </div>

      {/* Previsualización de imágenes */}
      {currentImages.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-medium text-gray-900">Imágenes actuales:</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((imageUrl, index) => (
              <div
                key={index}
                className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition"
              >
                <img
                  src={imageUrl}
                  alt={`Imagen ${index + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300"%3E%3Crect fill="%23ddd" width="300" height="300"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="20" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E';
                  }}
                />

                {/* Badge de imagen principal */}
                {index === 0 && (
                  <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                    Principal
                  </div>
                )}

                {/* Overlay con acciones */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center gap-2">
                  {/* Botón eliminar */}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition"
                    title="Eliminar imagen"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Botón mover a la izquierda */}
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index - 1)}
                      className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition text-xs"
                      title="Mover a la izquierda"
                    >
                      ←
                    </button>
                  )}

                  {/* Botón mover a la derecha */}
                  {index < currentImages.length - 1 && (
                    <button
                      type="button"
                      onClick={() => moveImage(index, index + 1)}
                      className="opacity-0 group-hover:opacity-100 bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition text-xs"
                      title="Mover a la derecha"
                    >
                      →
                    </button>
                  )}
                </div>

                {/* Número de orden */}
                <div className="absolute bottom-2 right-2 bg-gray-900 bg-opacity-75 text-white text-xs px-2 py-1 rounded-full">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-500">
            💡 La primera imagen será la imagen principal del producto. Arrastra para reordenar.
          </p>
        </div>
      )}
    </div>
  );
};

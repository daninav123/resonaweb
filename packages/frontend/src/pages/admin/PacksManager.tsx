import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Package, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../../services/api';

const PacksManager = () => {
  const navigate = useNavigate();
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPacks();
  }, []);

  const loadPacks = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/products/packs');
      console.log('📦 Respuesta de packs:', response);
      
      // El backend retorna { packs: [...] }
      const packsData = response?.packs || response || [];
      console.log('📦 Packs procesados:', packsData);
      
      setPacks(Array.isArray(packsData) ? packsData : []);
    } catch (error) {
      console.error('Error cargando packs:', error);
      toast.error('Error al cargar los packs');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    // Navegar a productos con el flag de crear pack
    navigate('/admin/products?createPack=true');
  };

  const handleEdit = (pack: any) => {
    // Navegar a productos para editar el pack
    navigate(`/admin/products?editPack=${pack.id}`);
  };

  const handleDelete = async (pack: any) => {
    if (!confirm(`¿Estás seguro de eliminar el pack "${pack.name}"?`)) {
      return;
    }
    
    try {
      await api.delete(`/products/${pack.id}`);
      toast.success('Pack eliminado');
      loadPacks();
    } catch (error: any) {
      console.error('Error eliminando pack:', error);
      toast.error(error.response?.data?.message || 'Error al eliminar el pack');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Gestión de Packs</h1>
        <button
          data-testid="create-pack"
          onClick={handleCreate}
          className="flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
        >
          <Plus className="w-5 h-5" />
          Crear Pack
        </button>
      </div>

      {packs.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No hay packs creados</p>
          <button
            data-testid="create-first-pack"
            onClick={handleCreate}
            className="px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
          >
            Crear primer pack
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nombre</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Descripción</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Precio/Día</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Estado</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {packs.map((pack) => (
                <tr key={pack.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{pack.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{pack.description || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">€{Number(pack.pricePerDay || 0).toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      pack.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {pack.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button 
                      onClick={() => handleEdit(pack)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pack)}
                      className="text-red-600 hover:text-red-800"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PacksManager;

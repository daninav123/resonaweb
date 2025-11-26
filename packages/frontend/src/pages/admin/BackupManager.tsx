import { useState, useEffect } from 'react';
import { Database, Download, Upload, RefreshCw, Clock, HardDrive, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface Backup {
  filename: string;
  date: string;
  size: string;
  products: number;
  users: number;
  packs: number;
}

export default function BackupManager() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/backups');
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      
      // Axios devuelve los datos en response.data
      const data = response.data || response || {};
      const backupList = data.backups || [];
      
      console.log('Backups list:', backupList);
      setBackups(backupList);
    } catch (error: any) {
      console.error('Error al cargar backups:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al cargar backups');
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async () => {
    if (!confirm('¿Crear un backup completo de la base de datos?')) return;

    try {
      setCreating(true);
      const response = await api.post('/admin/backups/create');
      console.log('Backup created:', response.data);
      toast.success('Backup creado exitosamente');
      
      // Esperar un poco y recargar
      setTimeout(() => {
        loadBackups();
      }, 500);
    } catch (error: any) {
      console.error('Create backup error:', error);
      toast.error(error.response?.data?.message || 'Error al crear backup');
    } finally {
      setCreating(false);
    }
  };

  const restoreBackup = async (filename: string) => {
    if (!confirm(`⚠️ ADVERTENCIA: Esto BORRARÁ todos los datos actuales y restaurará el backup.\n\n¿Estás seguro de que quieres restaurar "${filename}"?`)) {
      return;
    }

    if (!confirm('ÚLTIMA CONFIRMACIÓN: Esta acción NO se puede deshacer. ¿Continuar?')) {
      return;
    }

    try {
      setLoading(true);
      await api.post(`/admin/backups/restore`, { filename });
      toast.success('Backup restaurado. Recarga la página.');
      setTimeout(() => window.location.reload(), 2000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al restaurar backup');
      setLoading(false);
    }
  };

  const downloadBackup = async (filename: string) => {
    try {
      const response = await api.get(`/admin/backups/download/${filename}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      toast.success('Backup descargado');
    } catch (error) {
      toast.error('Error al descargar backup');
    }
  };

  if (loading && backups.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-8 h-8" />
            Backups de Base de Datos
          </h1>
          <p className="text-gray-600">Gestiona copias de seguridad de tu base de datos</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={loadBackups}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={createBackup}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {creating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <Database className="w-5 h-5" />
                Crear Backup Ahora
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900">Backups Automáticos Activos</h3>
            <p className="text-sm text-blue-800 mt-1">
              Los backups se crean automáticamente cada día a las 3:00 AM. 
              También puedes crear backups manuales en cualquier momento.
            </p>
            <div className="mt-2 flex items-center gap-2 text-sm text-blue-700">
              <Clock className="w-4 h-4" />
              <span>Próximo backup automático: Hoy a las 3:00 AM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">Backups Disponibles</h2>
          <p className="text-sm text-gray-600">
            {backups.length} backup{backups.length !== 1 ? 's' : ''} disponible{backups.length !== 1 ? 's' : ''}
          </p>
        </div>

        {backups.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No hay backups disponibles</p>
            <button
              onClick={createBackup}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Crear Primer Backup
            </button>
          </div>
        ) : (
          <div className="divide-y">
            {backups.map((backup) => (
              <div key={backup.filename} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-gray-400" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{backup.filename}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {backup.date}
                          </span>
                          <span>{backup.size}</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-4 text-sm">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        📦 {backup.products} productos
                      </span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                        👥 {backup.users} usuarios
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                        📦 {backup.packs} packs
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => downloadBackup(backup.filename)}
                      className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                      Descargar
                    </button>
                    <button
                      onClick={() => restoreBackup(backup.filename)}
                      className="px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                      title="Restaurar"
                    >
                      <Upload className="w-4 h-4" />
                      Restaurar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-semibold text-yellow-900 mb-2">💡 Recomendaciones</h3>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• Crea un backup manual ANTES de hacer cambios importantes</li>
          <li>• Descarga los backups importantes a tu PC como respaldo adicional</li>
          <li>• Los backups se mantienen automáticamente (últimos 20)</li>
          <li>• Restaurar un backup BORRA todos los datos actuales</li>
        </ul>
      </div>
    </div>
  );
}

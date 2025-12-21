import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Shield, Mail, Star, Crown, Loader2 } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { ResponsiveTableWrapper } from '../../components/admin/ResponsiveTableWrapper';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  userLevel: string;
  isActive: boolean;
  createdAt: string;
  phone?: string;
}

const UsersManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/users?limit=1000');
      console.log(`👥 Usuarios cargados: ${response.data?.length || 0}`);
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserLevelChange = async (userId: string, newLevel: string) => {
    try {
      await api.patch(`/users/${userId}/level`, { userLevel: newLevel });
      toast.success(`Nivel de usuario actualizado a ${newLevel}`);
      // Recargar usuarios para reflejar el cambio
      loadUsers();
    } catch (error: any) {
      console.error('Error al actualizar nivel:', error);
      toast.error('Error al actualizar nivel de usuario');
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      toast.success(`Rol de usuario actualizado a ${newRole}`);
      loadUsers();
    } catch (error: any) {
      console.error('Error al actualizar rol:', error);
      toast.error('Error al actualizar rol de usuario');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
            <button className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Nuevo Usuario
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <Users className="w-10 h-10 text-resona" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-resona" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.isActive).length}
                </p>
              </div>
              <Mail className="w-10 h-10 text-green-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Usuarios VIP</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.userLevel === 'VIP' || u.userLevel === 'VIP_PLUS').length}
                </p>
              </div>
              <Crown className="w-10 h-10 text-yellow-500" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-resona mx-auto mb-4" />
            <p className="text-gray-600">Cargando usuarios...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {users.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                No hay usuarios registrados
              </div>
            ) : (
              <ResponsiveTableWrapper>
              <table className="min-w-full w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Rol
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nivel
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Fecha Registro
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-gray-400">{user.phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full w-fit ${
                            user.role === 'SUPERADMIN' 
                              ? 'bg-red-100 text-red-800' 
                              : user.role === 'ADMIN'
                              ? 'bg-resona/10 text-resona' 
                              : user.role === 'COMMERCIAL'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {user.role === 'SUPERADMIN'
                              ? 'Super Admin'
                              : user.role === 'ADMIN'
                              ? 'Admin'
                              : user.role === 'COMMERCIAL'
                              ? 'Comercial'
                              : 'Cliente'}
                          </span>

                          {(user.role === 'ADMIN' || user.role === 'SUPERADMIN') ? (
                            <span className="text-xs text-gray-400">Rol protegido</span>
                          ) : (
                            <select
                              value={user.role}
                              onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                              className="px-3 py-2 text-sm font-semibold rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer bg-gray-100 text-gray-700 border-gray-300 min-w-[180px]"
                            >
                              <option value="CLIENT" className="bg-white text-gray-900">Cliente</option>
                              <option value="COMMERCIAL" className="bg-white text-gray-900">Comercial</option>
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={user.userLevel}
                          onChange={(e) => handleUserLevelChange(user.id, e.target.value)}
                          className={`px-3 py-2 text-sm font-semibold rounded-lg border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer min-w-[180px] ${
                            user.userLevel === 'VIP_PLUS'
                              ? 'bg-gradient-to-r from-resona to-blue-500 text-white border-resona'
                              : user.userLevel === 'VIP'
                              ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-yellow-600'
                              : 'bg-gray-100 text-gray-700 border-gray-300'
                          }`}
                          style={{
                            backgroundClip: 'padding-box',
                          }}
                        >
                          <option value="STANDARD" className="bg-white text-gray-900">Standard</option>
                          <option value="VIP" className="bg-yellow-50 text-gray-900">⭐ VIP (50% dto)</option>
                          <option value="VIP_PLUS" className="bg-resona/10 text-gray-900">👑 VIP PLUS (70% dto)</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          user.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {new Date(user.createdAt).toLocaleDateString('es-ES')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </ResponsiveTableWrapper>
            )}
          </div>
        )}

        {users.length > 0 && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              ✓ Mostrando {users.length} usuarios reales de la base de datos
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManager;

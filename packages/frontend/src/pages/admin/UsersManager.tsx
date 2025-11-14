import { Link } from 'react-router-dom';
import { Users, UserPlus, Shield, Mail } from 'lucide-react';

const UsersManager = () => {
  const users = [
    { id: 1, name: 'Admin Resona', email: 'admin@resona.com', role: 'Admin', status: 'Activo', joined: '01/01/2024' },
    { id: 2, name: 'Juan Pérez', email: 'juan@example.com', role: 'Cliente', status: 'Activo', joined: '15/03/2024' },
    { id: 3, name: 'María García', email: 'maria@example.com', role: 'Cliente', status: 'Activo', joined: '20/05/2024' },
    { id: 4, name: 'Pedro López', email: 'pedro@example.com', role: 'Cliente', status: 'Inactivo', joined: '10/07/2024' },
  ];

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
        <div className="grid md:grid-cols-3 gap-6 mb-8">
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
                  {users.filter(u => u.role === 'Admin').length}
                </p>
              </div>
              <Shield className="w-10 h-10 text-purple-500" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activos</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.status === 'Activo').length}
                </p>
              </div>
              <Mail className="w-10 h-10 text-green-500" />
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Rol
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
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === 'Activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {user.joined}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta es una versión demo. Conecta con la API de usuarios para gestión completa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UsersManager;

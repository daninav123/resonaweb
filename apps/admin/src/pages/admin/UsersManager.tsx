import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, UserPlus, Shield, Mail, Crown, Loader2, Search, X, Truck, Wrench, Calculator, ShoppingCart, CheckCircle2, XCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { api } from '@resona/api-client';
import toast from 'react-hot-toast';
import { ResponsiveTableWrapper } from '../../components/admin/ResponsiveTableWrapper';
import { ROLE_CONFIGS, type UserRole } from '@resona/api-client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  additionalRoles?: string[];
  userLevel: string;
  isActive: boolean;
  createdAt: string;
  phone?: string;
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  SUPERADMIN: 'bg-red-100 text-red-800 border-red-200',
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  COMMERCIAL: 'bg-blue-100 text-blue-800 border-blue-200',
  WAREHOUSE: 'bg-orange-100 text-orange-800 border-orange-200',
  TECHNICIAN: 'bg-green-100 text-green-800 border-green-200',
  ACCOUNTANT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  CLIENT: 'bg-gray-100 text-gray-800 border-gray-200',
};

const ROLE_ICONS: Record<string, any> = {
  SUPERADMIN: Shield,
  ADMIN: Shield,
  COMMERCIAL: ShoppingCart,
  WAREHOUSE: Truck,
  TECHNICIAN: Wrench,
  ACCOUNTANT: Calculator,
  CLIENT: Users,
};

const DEFAULT_ALL_ROLES: string[] = ['CLIENT', 'COMMERCIAL', 'WAREHOUSE', 'TECHNICIAN', 'ACCOUNTANT', 'ADMIN', 'SUPERADMIN'];

const UsersManager = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [allRoles, setAllRoles] = useState<string[]>(DEFAULT_ALL_ROLES);
  const [staffRoles, setStaffRoles] = useState<string[]>(['COMMERCIAL', 'WAREHOUSE', 'TECHNICIAN', 'ACCOUNTANT']);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'CLIENT' as string, additionalRoles: [] as string[] });
  const [creating, setCreating] = useState(false);
  const [editingRolesUserId, setEditingRolesUserId] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
    loadRoleDefinitions();
  }, []);

  const loadRoleDefinitions = async () => {
    try {
      const roles: any = await api.get('/role-definitions');
      if (Array.isArray(roles) && roles.length > 0) {
        const names = roles.map((r: any) => r.name);
        setAllRoles(names);
        setStaffRoles(names.filter((n: string) => n !== 'CLIENT' && n !== 'SUPERADMIN'));
      }
    } catch {
      // Usar defaults
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response: any = await api.get('/users?limit=1000');
      setUsers(response.data || []);
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error al cargar usuarios');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = search === '' || 
        `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(search.toLowerCase());
      const allUserRoles = [u.role, ...(u.additionalRoles || [])];
      const matchesRole = filterRole === 'ALL' || allUserRoles.includes(filterRole);
      return matchesSearch && matchesRole;
    });
  }, [users, search, filterRole]);

  const staffUsers = useMemo(() => users.filter(u => u.role !== 'CLIENT'), [users]);

  const handleUserLevelChange = async (userId: string, newLevel: string) => {
    try {
      await api.patch(`/users/${userId}/level`, { userLevel: newLevel });
      toast.success(`Nivel actualizado a ${newLevel}`);
      loadUsers();
    } catch (error: any) {
      toast.error('Error al actualizar nivel');
    }
  };

  const handleUserRoleChange = async (userId: string, newRole: string) => {
    try {
      await api.put(`/users/${userId}`, { role: newRole });
      const label = ROLE_CONFIGS[newRole as UserRole]?.label || newRole;
      toast.success(`Rol principal actualizado a ${label}`);
      loadUsers();
    } catch (error: any) {
      toast.error('Error al actualizar rol');
    }
  };

  const handleToggleAdditionalRole = async (userId: string, role: string, currentAdditionalRoles: string[]) => {
    const newAdditionalRoles = currentAdditionalRoles.includes(role)
      ? currentAdditionalRoles.filter(r => r !== role)
      : [...currentAdditionalRoles, role];
    try {
      await api.put(`/users/${userId}`, { additionalRoles: newAdditionalRoles });
      const label = ROLE_CONFIGS[role as UserRole]?.label || role;
      const action = newAdditionalRoles.includes(role) ? 'añadido' : 'eliminado';
      toast.success(`Rol ${label} ${action}`);
      loadUsers();
    } catch (error: any) {
      toast.error('Error al actualizar roles');
    }
  };

  const handleToggleActive = async (userId: string, currentActive: boolean) => {
    try {
      await api.put(`/users/${userId}`, { isActive: !currentActive });
      toast.success(currentActive ? 'Usuario desactivado' : 'Usuario activado');
      loadUsers();
    } catch (error: any) {
      toast.error('Error al cambiar estado');
    }
  };

  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }
    try {
      setCreating(true);
      await api.post('/users', newUser);
      toast.success('Usuario creado correctamente');
      setShowCreateModal(false);
      setNewUser({ email: '', password: '', firstName: '', lastName: '', phone: '', role: 'CLIENT', additionalRoles: [] });
      loadUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role: string) => {
    const style = ROLE_BADGE_STYLES[role] || ROLE_BADGE_STYLES.CLIENT;
    const label = ROLE_CONFIGS[role as UserRole]?.label || role;
    const Icon = ROLE_ICONS[role] || Users;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border ${style}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion de Usuarios</h1>
          <p className="text-gray-600 text-sm">Gestiona roles, permisos y accesos al panel</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-2"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-lg border">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-xl font-bold">{users.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-red-500">
          <p className="text-xs text-gray-500">Admins</p>
          <p className="text-xl font-bold">{users.filter(u => u.role === 'ADMIN' || u.role === 'SUPERADMIN').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-blue-500">
          <p className="text-xs text-gray-500">Comerciales</p>
          <p className="text-xl font-bold">{users.filter(u => u.role === 'COMMERCIAL').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-orange-500">
          <p className="text-xs text-gray-500">Almacen</p>
          <p className="text-xl font-bold">{users.filter(u => u.role === 'WAREHOUSE').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-green-500">
          <p className="text-xs text-gray-500">Tecnicos</p>
          <p className="text-xl font-bold">{users.filter(u => u.role === 'TECHNICIAN').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-yellow-500">
          <p className="text-xs text-gray-500">Contabilidad</p>
          <p className="text-xl font-bold">{users.filter(u => u.role === 'ACCOUNTANT').length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border border-l-4 border-l-gray-400">
          <p className="text-xs text-gray-500">Clientes</p>
          <p className="text-xl font-bold">{users.filter(u => u.role === 'CLIENT').length}</p>
        </div>
      </div>

      {/* Roles Info */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Roles disponibles</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {Object.entries(ROLE_CONFIGS).filter(([key]) => key !== 'CLIENT').map(([key, config]) => {
            const Icon = ROLE_ICONS[key] || Users;
            return (
              <div key={key} className="flex items-start gap-2 p-2 rounded bg-gray-50">
                <Icon className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-600" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">{config.label}</p>
                  <p className="text-xs text-gray-500">{config.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <select
          value={filterRole}
          onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="ALL">Todos los roles</option>
          {allRoles.map(role => (
            <option key={role} value={role}>{ROLE_CONFIGS[role]?.label || role}</option>
          ))}
        </select>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-resona mx-auto mb-3" />
          <p className="text-gray-500">Cargando usuarios...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border overflow-hidden">
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <span className="text-sm text-gray-600">{filteredUsers.length} usuarios</span>
          </div>
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No se encontraron usuarios</div>
          ) : (
            <ResponsiveTableWrapper>
              <table className="min-w-full w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usuario</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nivel</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registro</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                        {user.phone && <div className="text-xs text-gray-400">{user.phone}</div>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex flex-wrap gap-1">
                            {getRoleBadge(user.role)}
                            {(user.additionalRoles || []).map(ar => (
                              <span key={ar} className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-medium rounded-full border ${ROLE_BADGE_STYLES[ar] || ROLE_BADGE_STYLES.CLIENT}`}>
                                +{ROLE_CONFIGS[ar as UserRole]?.label || ar}
                              </span>
                            ))}
                          </div>
                          {user.role !== 'SUPERADMIN' ? (
                            <div className="flex items-center gap-1">
                              <select
                                value={user.role}
                                onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                className="text-xs px-2 py-1 border rounded focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white max-w-[130px]"
                              >
                                {allRoles.map(role => (
                                  <option key={role} value={role}>{ROLE_CONFIGS[role]?.label || role}</option>
                                ))}
                              </select>
                              <button
                                onClick={() => setEditingRolesUserId(editingRolesUserId === user.id ? null : user.id)}
                                className="text-xs px-2 py-1 border rounded bg-blue-50 text-blue-600 hover:bg-blue-100 whitespace-nowrap"
                              >
                                +Roles
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Acceso total</span>
                          )}
                          {editingRolesUserId === user.id && user.role !== 'SUPERADMIN' && (
                            <div className="mt-1 p-2 bg-gray-50 border rounded-lg space-y-1">
                              <p className="text-[10px] text-gray-500 font-medium uppercase">Roles adicionales</p>
                              {staffRoles.filter(r => r !== user.role).map(role => {
                                const isChecked = (user.additionalRoles || []).includes(role);
                                const Icon = ROLE_ICONS[role] || Users;
                                return (
                                  <label key={role} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => handleToggleAdditionalRole(user.id, role, user.additionalRoles || [])}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <Icon className="w-3 h-3 text-gray-500" />
                                    <span className="text-xs text-gray-700">{ROLE_CONFIGS[role]?.label}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={user.userLevel}
                          onChange={(e) => handleUserLevelChange(user.id, e.target.value)}
                          className={`text-xs px-2 py-1 rounded border font-medium max-w-[150px] ${
                            user.userLevel === 'VIP_PLUS'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : user.userLevel === 'VIP'
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                              : 'bg-gray-50 text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="STANDARD">Standard</option>
                          <option value="VIP">VIP (50% dto)</option>
                          <option value="VIP_PLUS">VIP PLUS (70% dto)</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleActive(user.id, user.isActive)}
                          className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-colors ${
                            user.isActive 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.isActive ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {user.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-500">
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

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Nuevo Usuario</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={e => setNewUser(p => ({ ...p, firstName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Apellidos *</label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={e => setNewUser(p => ({ ...p, lastName: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Contrasena *</label>
                <input
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser(p => ({ ...p, password: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Minimo 8 caracteres"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Telefono</label>
                <input
                  type="tel"
                  value={newUser.phone}
                  onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol principal</label>
                <select
                  value={newUser.role}
                  onChange={e => setNewUser(p => ({ ...p, role: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  {allRoles.map(role => (
                    <option key={role} value={role}>{ROLE_CONFIGS[role]?.label || role} - {ROLE_CONFIGS[role]?.description || ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Roles adicionales (opcional)</label>
                <div className="space-y-1 p-2 border rounded-lg bg-gray-50">
                  {staffRoles.filter(r => r !== newUser.role).map(role => {
                    const Icon = ROLE_ICONS[role] || Users;
                    return (
                      <label key={role} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded">
                        <input
                          type="checkbox"
                          checked={newUser.additionalRoles.includes(role)}
                          onChange={() => {
                            setNewUser(p => ({
                              ...p,
                              additionalRoles: p.additionalRoles.includes(role)
                                ? p.additionalRoles.filter(r => r !== role)
                                : [...p.additionalRoles, role]
                            }));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <Icon className="w-3 h-3 text-gray-500" />
                        <span className="text-xs text-gray-700">{ROLE_CONFIGS[role]?.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateUser}
                disabled={creating}
                className="px-4 py-2 text-sm bg-resona text-white rounded-lg hover:bg-resona-dark transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Usuario
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManager;

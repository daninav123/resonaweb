import { useState, useEffect, useMemo } from 'react';
import { Shield, Plus, Save, Trash2, Loader2, X, ChevronDown, ChevronRight, Lock, Check } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface RoleDefinition {
  id: string;
  name: string;
  label: string;
  description: string;
  color: string;
  icon: string;
  allowedPaths: string[];
  defaultRedirect: string;
  isSystem: boolean;
  isActive: boolean;
}

interface AdminPath {
  path: string;
  label: string;
  section: string;
}

const COLORS = ['red', 'purple', 'blue', 'orange', 'green', 'yellow', 'gray', 'pink', 'indigo', 'teal', 'cyan'];
const ICONS = ['Shield', 'Users', 'ShoppingCart', 'Truck', 'Wrench', 'Calculator', 'Briefcase', 'Star', 'Heart', 'Zap'];

const COLOR_CLASSES: Record<string, string> = {
  red: 'bg-red-100 text-red-800 border-red-300',
  purple: 'bg-purple-100 text-purple-800 border-purple-300',
  blue: 'bg-blue-100 text-blue-800 border-blue-300',
  orange: 'bg-orange-100 text-orange-800 border-orange-300',
  green: 'bg-green-100 text-green-800 border-green-300',
  yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  gray: 'bg-gray-100 text-gray-800 border-gray-300',
  pink: 'bg-pink-100 text-pink-800 border-pink-300',
  indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  teal: 'bg-teal-100 text-teal-800 border-teal-300',
  cyan: 'bg-cyan-100 text-cyan-800 border-cyan-300',
};

const RolePermissionsManager = () => {
  const [roles, setRoles] = useState<RoleDefinition[]>([]);
  const [paths, setPaths] = useState<AdminPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleDefinition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>([]);
  const [newRole, setNewRole] = useState({ name: '', label: '', description: '', color: 'blue', icon: 'Users' });
  const [creating, setCreating] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesRes, pathsRes]: any[] = await Promise.all([
        api.get('/role-definitions/admin'),
        api.get('/role-definitions/available-paths'),
      ]);
      setRoles(rolesRes || []);
      setPaths(pathsRes || []);
      if ((rolesRes || []).length > 0 && !selectedRole) {
        setSelectedRole(rolesRes[0]);
      }
    } catch (error: any) {
      toast.error('Error cargando roles');
    } finally {
      setLoading(false);
    }
  };

  const pathsBySection = useMemo(() => {
    const sections: Record<string, AdminPath[]> = {};
    paths.forEach(p => {
      if (!sections[p.section]) sections[p.section] = [];
      sections[p.section].push(p);
    });
    return sections;
  }, [paths]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section) ? prev.filter(s => s !== section) : [...prev, section]
    );
  };

  const isWildcard = selectedRole?.allowedPaths?.includes('*');

  const togglePath = (path: string) => {
    if (!selectedRole || isWildcard) return;
    const current = selectedRole.allowedPaths || [];
    const updated = current.includes(path)
      ? current.filter(p => p !== path)
      : [...current, path];
    setSelectedRole({ ...selectedRole, allowedPaths: updated });
  };

  const toggleAllSection = (section: string) => {
    if (!selectedRole || isWildcard) return;
    const sectionPaths = pathsBySection[section]?.map(p => p.path) || [];
    const current = selectedRole.allowedPaths || [];
    const allChecked = sectionPaths.every(p => current.includes(p));
    const updated = allChecked
      ? current.filter(p => !sectionPaths.includes(p))
      : [...new Set([...current, ...sectionPaths])];
    setSelectedRole({ ...selectedRole, allowedPaths: updated });
  };

  const handleSave = async () => {
    if (!selectedRole) return;
    try {
      setSaving(selectedRole.id);
      await api.put(`/role-definitions/${selectedRole.id}`, {
        label: selectedRole.label,
        description: selectedRole.description,
        color: selectedRole.color,
        icon: selectedRole.icon,
        allowedPaths: selectedRole.allowedPaths,
        defaultRedirect: selectedRole.defaultRedirect,
        isActive: selectedRole.isActive,
      });
      toast.success(`Rol "${selectedRole.label}" guardado`);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(null);
    }
  };

  const handleCreate = async () => {
    if (!newRole.name || !newRole.label) {
      toast.error('Nombre y etiqueta son obligatorios');
      return;
    }
    try {
      setCreating(true);
      const created: any = await api.post('/role-definitions', { ...newRole, allowedPaths: ['/admin'] });
      toast.success(`Rol "${created.label}" creado`);
      setShowCreateModal(false);
      setNewRole({ name: '', label: '', description: '', color: 'blue', icon: 'Users' });
      await loadData();
      setSelectedRole(created);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al crear rol');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (role: RoleDefinition) => {
    if (role.isSystem) return;
    if (!confirm(`¿Eliminar el rol "${role.label}"? Esta acción no se puede deshacer.`)) return;
    try {
      await api.delete(`/role-definitions/${role.id}`);
      toast.success('Rol eliminado');
      if (selectedRole?.id === role.id) setSelectedRole(null);
      loadData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles y Permisos</h1>
          <p className="text-gray-600 text-sm">Crea tipos de usuario y configura que paginas puede ver cada uno</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Nuevo Tipo de Usuario
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de roles */}
        <div className="lg:col-span-4 space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Tipos de usuario ({roles.length})</h3>
          {roles.map(role => {
            const isSelected = selectedRole?.id === role.id;
            const colorClass = COLOR_CLASSES[role.color] || COLOR_CLASSES.gray;
            return (
              <div
                key={role.id}
                onClick={() => setSelectedRole(role)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-blue-500 bg-blue-50 shadow' : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${colorClass}`}>
                      {role.label}
                    </span>
                    {role.isSystem && <Lock className="w-3 h-3 text-gray-400" />}
                    {!role.isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1 rounded">Inactivo</span>}
                  </div>
                  {!role.isSystem && (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(role); }}
                      className="p-1 hover:bg-red-100 rounded text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">{role.description}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  {role.allowedPaths?.includes('*') ? 'Todas las paginas' : `${(role.allowedPaths || []).length} paginas`}
                  {' · '}Clave: {role.name}
                </p>
              </div>
            );
          })}
        </div>

        {/* Editor de permisos */}
        <div className="lg:col-span-8">
          {selectedRole ? (
            <div className="bg-white border rounded-xl shadow-sm">
              <div className="p-4 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Editar: {selectedRole.label}
                  </h3>
                  <p className="text-xs text-gray-500">Clave: {selectedRole.name}</p>
                </div>
                <button
                  onClick={handleSave}
                  disabled={saving === selectedRole.id}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm disabled:opacity-50"
                >
                  {saving === selectedRole.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Cambios
                </button>
              </div>

              {/* Propiedades del rol */}
              <div className="p-4 border-b space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Etiqueta</label>
                    <input
                      type="text"
                      value={selectedRole.label}
                      onChange={e => setSelectedRole({ ...selectedRole, label: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Descripcion</label>
                    <input
                      type="text"
                      value={selectedRole.description}
                      onChange={e => setSelectedRole({ ...selectedRole, description: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                    <div className="flex flex-wrap gap-1">
                      {COLORS.map(c => (
                        <button
                          key={c}
                          onClick={() => setSelectedRole({ ...selectedRole, color: c })}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            selectedRole.color === c ? 'border-gray-800 scale-110' : 'border-transparent'
                          }`}
                          style={{ backgroundColor: `var(--color-${c}-400, ${c})` }}
                          title={c}
                        >
                          <span className={`block w-full h-full rounded-full bg-${c}-400`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Redireccion por defecto</label>
                    <input
                      type="text"
                      value={selectedRole.defaultRedirect}
                      onChange={e => setSelectedRole({ ...selectedRole, defaultRedirect: e.target.value })}
                      className="w-full px-3 py-1.5 border rounded-lg text-sm"
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedRole.isActive}
                        onChange={e => setSelectedRole({ ...selectedRole, isActive: e.target.checked })}
                        className="rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-700">Activo</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Editor de paginas permitidas */}
              <div className="p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Paginas del panel que puede ver este rol
                  {isWildcard && <span className="ml-2 text-xs font-normal text-green-600">(Acceso total - wildcard *)</span>}
                </h4>

                {isWildcard ? (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                    Este rol tiene acceso a <strong>todas</strong> las paginas del panel (wildcard *). Para restringir, elimina el wildcard.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {Object.entries(pathsBySection).map(([section, sectionPaths]) => {
                      const allChecked = sectionPaths.every(p => (selectedRole.allowedPaths || []).includes(p.path));
                      const someChecked = sectionPaths.some(p => (selectedRole.allowedPaths || []).includes(p.path));
                      const isExpanded = expandedSections.includes(section);
                      const checkedCount = sectionPaths.filter(p => (selectedRole.allowedPaths || []).includes(p.path)).length;

                      return (
                        <div key={section} className="border rounded-lg">
                          <div
                            className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-50"
                            onClick={() => toggleSection(section)}
                          >
                            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                            <input
                              type="checkbox"
                              checked={allChecked}
                              ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                              onChange={(e) => { e.stopPropagation(); toggleAllSection(section); }}
                              className="rounded border-gray-300 text-blue-600"
                              onClick={e => e.stopPropagation()}
                            />
                            <span className="text-sm font-medium text-gray-700 flex-1">{section}</span>
                            <span className="text-xs text-gray-400">{checkedCount}/{sectionPaths.length}</span>
                          </div>
                          {isExpanded && (
                            <div className="px-4 pb-2 pt-0 grid grid-cols-2 gap-1">
                              {sectionPaths.map(p => (
                                <label key={p.path} className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-gray-50">
                                  <input
                                    type="checkbox"
                                    checked={(selectedRole.allowedPaths || []).includes(p.path)}
                                    onChange={() => togglePath(p.path)}
                                    className="rounded border-gray-300 text-blue-600"
                                  />
                                  <span className="text-xs text-gray-600">{p.label}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-12 text-center text-gray-400">
              <Shield className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Selecciona un rol para editar sus permisos</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal crear rol */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Nuevo Tipo de Usuario</h3>
              <button onClick={() => setShowCreateModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Nombre interno (clave) *</label>
                <input
                  type="text"
                  value={newRole.name}
                  onChange={e => setNewRole(p => ({ ...p, name: e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_') }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
                  placeholder="Ej: DIRECTOR, RRHH, MARKETING"
                />
                <p className="text-[10px] text-gray-400 mt-0.5">Solo letras mayusculas, numeros y guion bajo</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Etiqueta visible *</label>
                <input
                  type="text"
                  value={newRole.label}
                  onChange={e => setNewRole(p => ({ ...p, label: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Ej: Director, Recursos Humanos"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Descripcion</label>
                <input
                  type="text"
                  value={newRole.description}
                  onChange={e => setNewRole(p => ({ ...p, description: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  placeholder="Breve descripcion del rol"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewRole(p => ({ ...p, color: c }))}
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                        newRole.color === c ? 'border-gray-800' : 'border-transparent'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full bg-${c}-400`} />
                      {newRole.color === c && <Check className="w-3 h-3 absolute text-white" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newRole.name || !newRole.label}
                className="px-4 py-2 text-sm bg-resona text-white rounded-lg hover:bg-resona-dark disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin" />}
                Crear Rol
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RolePermissionsManager;

import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Package, Heart, MapPin, Shield, LogOut, Plus, Trash2, Edit2, Home, Star, Crown, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import BillingForm from '../components/BillingForm';

const AccountPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    birthDate: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'España',
  });

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Sesión cerrada correctamente');
  };

  const handleSaveProfile = async () => {
    try {
      // TODO: Implementar llamada al backend para actualizar perfil
      // const response = await api.put('/users/profile', formData);
      
      console.log('📝 Guardando perfil:', formData);
      toast.success('Perfil actualizado correctamente');
      setIsEditing(false);
      
      // Por ahora solo simula el guardado
      // En producción, descomentar la llamada al API
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast.error('Error al actualizar el perfil');
    }
  };

  // Estado para gestionar direcciones
  const [addresses, setAddresses] = useState([
    {
      id: '1',
      name: 'Casa',
      address: 'Calle Principal 123',
      city: 'Valencia',
      zipCode: '46001',
      country: 'España',
      isDefault: true,
    },
  ]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [addressForm, setAddressForm] = useState({
    name: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'España',
    isDefault: false,
  });


  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'orders', name: 'Pedidos', icon: Package },
    { id: 'favorites', name: 'Favoritos', icon: Heart },
    { id: 'billing', name: 'Facturación', icon: Building2 },
    { id: 'addresses', name: 'Direcciones', icon: MapPin },
    { id: 'security', name: 'Seguridad', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-ink py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-cream mb-8">Mi Cuenta</h1>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-ink-800 rounded-lg shadow-md p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-resona/15 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-resona-light" />
                </div>
                <h2 className="text-xl font-semibold text-cream">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-cream/65">{user?.email}</p>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                        activeTab === tab.id
                          ? 'bg-resona/10 text-resona-light'
                          : 'hover:bg-white/10 text-cream/75'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      {tab.name}
                    </button>
                  );
                })}
                
                <hr className="my-4" />
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-400 transition"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-ink-800 rounded-lg shadow-md p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-2xl font-semibold text-cream">Información Personal</h2>
                      {user?.userLevel === 'VIP' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-white text-sm rounded-full font-semibold flex items-center gap-1">
                          <Star className="w-4 h-4" />
                          VIP
                        </span>
                      )}
                      {user?.userLevel === 'VIP_PLUS' && (
                        <span className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded-full font-semibold flex items-center gap-1">
                          <Crown className="w-4 h-4" />
                          VIP PLUS
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className="px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
                    >
                      {isEditing ? 'Guardar' : 'Editar'}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-cream/75 mb-2">
                        Nombre
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cream/75 mb-2">
                        Apellidos
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cream/75 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cream/75 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                        placeholder="+34 600 000 000"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cream/75 mb-2">
                        Fecha de Nacimiento
                      </label>
                      <input
                        type="date"
                        value={formData.birthDate}
                        onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-cream/75 mb-2">
                        País
                      </label>
                      <select
                        value={formData.country}
                        onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        disabled={!isEditing}
                        className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                      >
                        <option>España</option>
                        <option>Portugal</option>
                        <option>Francia</option>
                        <option>Italia</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-cream mb-4">Dirección Principal</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-cream/75 mb-2">
                          Dirección
                        </label>
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                          placeholder="Calle, número, piso..."
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-cream/75 mb-2">
                          Ciudad
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-cream/75 mb-2">
                          Código Postal
                        </label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                          disabled={!isEditing}
                          className="w-full px-4 py-2 border rounded-lg disabled:bg-gray-50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div>
                  <h2 className="text-2xl font-semibold text-cream mb-6">Mis Pedidos</h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div key={order} className="border rounded-lg p-4 hover:bg-white/5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Pedido #2024{order}234</p>
                            <p className="text-sm text-cream/65">10 de Noviembre, 2024</p>
                            <p className="text-sm mt-2">3 productos</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">€234.50</p>
                            <span className="inline-block px-3 py-1 bg-emerald-500/15 text-emerald-300 text-sm rounded-full mt-2">
                              Entregado
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/mis-pedidos')}
                          className="mt-4 text-resona-light hover:underline text-sm"
                        >
                          Ver detalles →
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/mis-pedidos')}
                    className="mt-6 w-full py-2 border border-cream/15 rounded-lg hover:bg-white/5"
                  >
                    Ver todos los pedidos
                  </button>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div>
                  <h2 className="text-2xl font-semibold text-cream mb-6">Mis Favoritos</h2>
                  <p className="text-cream/65">Aún no has añadido productos a favoritos.</p>
                  <button
                    onClick={() => navigate('/productos')}
                    className="mt-4 px-6 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
                  >
                    Explorar Productos
                  </button>
                </div>
              )}

              {/* Billing Tab */}
              {activeTab === 'billing' && (
                <BillingForm onSaved={(data) => {
                  toast.success('Datos de facturación guardados');
                }} />
              )}


              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-semibold text-cream mb-6">Seguridad</h2>
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold mb-3">Cambiar Contraseña</h3>
                      <div className="space-y-4 max-w-md">
                        <input
                          type="password"
                          placeholder="Contraseña actual"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="password"
                          placeholder="Nueva contraseña"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        <input
                          type="password"
                          placeholder="Confirmar nueva contraseña"
                          className="w-full px-4 py-2 border rounded-lg"
                        />
                        <button className="px-6 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark">
                          Actualizar Contraseña
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Autenticación de Dos Factores</h3>
                      <p className="text-cream/65 mb-4">
                        Añade una capa extra de seguridad a tu cuenta.
                      </p>
                      <button className="px-6 py-2 border border-cream/15 rounded-lg hover:bg-white/5">
                        Configurar 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-cream">Mis Direcciones</h2>
                    {!showAddressForm && (
                      <button
                        onClick={() => {
                          setShowAddressForm(true);
                          setEditingAddress(null);
                          setAddressForm({
                            name: '',
                            address: '',
                            city: '',
                            zipCode: '',
                            country: 'España',
                            isDefault: false,
                          });
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
                      >
                        <Plus className="w-4 h-4" />
                        Nueva Dirección
                      </button>
                    )}
                  </div>

                  {showAddressForm ? (
                    <div className="bg-ink border border-cream/10 rounded-lg p-6 mb-6">
                      <h3 className="text-lg font-semibold mb-4">
                        {editingAddress ? 'Editar Dirección' : 'Nueva Dirección'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-cream/75 mb-1">
                            Nombre de la dirección *
                          </label>
                          <input
                            type="text"
                            value={addressForm.name}
                            onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Casa, Oficina, etc."
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cream/75 mb-1">
                            Dirección completa *
                          </label>
                          <input
                            type="text"
                            value={addressForm.address}
                            onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                            placeholder="Calle, número, piso..."
                            required
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-cream/75 mb-1">
                              Ciudad *
                            </label>
                            <input
                              type="text"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-cream/75 mb-1">
                              Código Postal *
                            </label>
                            <input
                              type="text"
                              value={addressForm.zipCode}
                              onChange={(e) => setAddressForm({ ...addressForm, zipCode: e.target.value })}
                              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-cream/75 mb-1">
                            País *
                          </label>
                          <select
                            value={addressForm.country}
                            onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option>España</option>
                            <option>Portugal</option>
                            <option>Francia</option>
                            <option>Italia</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="isDefault"
                            checked={addressForm.isDefault}
                            onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                            className="w-4 h-4 text-resona-light rounded"
                          />
                          <label htmlFor="isDefault" className="text-sm text-cream/75">
                            Establecer como dirección predeterminada
                          </label>
                        </div>
                      </div>
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => {
                            if (!addressForm.name || !addressForm.address || !addressForm.city || !addressForm.zipCode) {
                              toast.error('Por favor completa todos los campos obligatorios');
                              return;
                            }

                            if (editingAddress) {
                              // Editar dirección existente
                              setAddresses(addresses.map(addr => 
                                addr.id === editingAddress.id 
                                  ? { ...addressForm, id: addr.id } 
                                  : addressForm.isDefault 
                                    ? { ...addr, isDefault: false }
                                    : addr
                              ));
                              toast.success('Dirección actualizada correctamente');
                            } else {
                              // Añadir nueva dirección
                              const newAddress = {
                                ...addressForm,
                                id: Date.now().toString(),
                              };
                              if (addressForm.isDefault) {
                                setAddresses([
                                  ...addresses.map(addr => ({ ...addr, isDefault: false })),
                                  newAddress
                                ]);
                              } else {
                                setAddresses([...addresses, newAddress]);
                              }
                              toast.success('Dirección añadida correctamente');
                            }
                            
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          className="px-6 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
                        >
                          {editingAddress ? 'Actualizar' : 'Guardar'}
                        </button>
                        <button
                          onClick={() => {
                            setShowAddressForm(false);
                            setEditingAddress(null);
                          }}
                          className="px-6 py-2 border border-cream/15 rounded-lg hover:bg-white/5"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    {addresses.length === 0 ? (
                      <div className="text-center py-12">
                        <MapPin className="w-16 h-16 text-cream/70 mx-auto mb-4" />
                        <p className="text-cream/65 mb-4">No tienes direcciones guardadas</p>
                        <button
                          onClick={() => setShowAddressForm(true)}
                          className="px-6 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
                        >
                          Añadir primera dirección
                        </button>
                      </div>
                    ) : (
                      addresses.map((address) => (
                        <div
                          key={address.id}
                          className={`border rounded-lg p-4 ${
                            address.isDefault ? 'border-blue-500 bg-resona/10' : 'border-cream/10'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-resona/15 rounded-full flex items-center justify-center flex-shrink-0">
                                <Home className="w-5 h-5 text-resona-light" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-semibold text-cream">{address.name}</h3>
                                  {address.isDefault && (
                                    <span className="px-2 py-0.5 bg-resona text-white text-xs rounded-full">
                                      Predeterminada
                                    </span>
                                  )}
                                </div>
                                <p className="text-cream/75 mt-1">{address.address}</p>
                                <p className="text-cream/65 text-sm">
                                  {address.city}, {address.zipCode}
                                </p>
                                <p className="text-cream/65 text-sm">{address.country}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setEditingAddress(address);
                                  setAddressForm(address);
                                  setShowAddressForm(true);
                                }}
                                className="p-2 text-resona-light hover:bg-blue-100 rounded-lg transition"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              {!address.isDefault && (
                                <button
                                  onClick={() => {
                                    if (confirm('¿Estás seguro de que quieres eliminar esta dirección?')) {
                                      setAddresses(addresses.filter(addr => addr.id !== address.id));
                                      toast.success('Dirección eliminada correctamente');
                                    }
                                  }}
                                  className="p-2 text-red-400 hover:bg-red-100 rounded-lg transition"
                                  title="Eliminar"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          {!address.isDefault && (
                            <button
                              onClick={() => {
                                setAddresses(addresses.map(addr => ({
                                  ...addr,
                                  isDefault: addr.id === address.id
                                })));
                                toast.success('Dirección predeterminada actualizada');
                              }}
                              className="mt-3 text-sm text-resona-light hover:underline"
                            >
                              Establecer como predeterminada
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountPage;

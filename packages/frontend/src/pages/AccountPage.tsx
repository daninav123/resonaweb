import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { User, Package, Heart, MapPin, Settings, CreditCard, Bell, Shield, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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

  const handleSaveProfile = () => {
    // Aquí iría la lógica para actualizar el perfil
    toast.success('Perfil actualizado correctamente');
    setIsEditing(false);
  };

  const tabs = [
    { id: 'profile', name: 'Perfil', icon: User },
    { id: 'orders', name: 'Pedidos', icon: Package },
    { id: 'favorites', name: 'Favoritos', icon: Heart },
    { id: 'addresses', name: 'Direcciones', icon: MapPin },
    { id: 'payment', name: 'Métodos de Pago', icon: CreditCard },
    { id: 'notifications', name: 'Notificaciones', icon: Bell },
    { id: 'security', name: 'Seguridad', icon: Shield },
    { id: 'settings', name: 'Configuración', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Cuenta</h1>
        
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600">{user?.email}</p>
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full mt-2">
                  Cliente VIP
                </span>
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
                          ? 'bg-blue-50 text-blue-600'
                          : 'hover:bg-gray-100 text-gray-700'
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
                  className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 transition"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-gray-900">Información Personal</h2>
                    <button
                      onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {isEditing ? 'Guardar' : 'Editar'}
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                      <label className="block text-sm font-medium text-gray-700 mb-2">
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección Principal</h3>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis Pedidos</h2>
                  <div className="space-y-4">
                    {[1, 2, 3].map((order) => (
                      <div key={order} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-semibold">Pedido #2024{order}234</p>
                            <p className="text-sm text-gray-600">10 de Noviembre, 2024</p>
                            <p className="text-sm mt-2">3 productos</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-lg">€234.50</p>
                            <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full mt-2">
                              Entregado
                            </span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate('/mis-pedidos')}
                          className="mt-4 text-blue-600 hover:underline text-sm"
                        >
                          Ver detalles →
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => navigate('/mis-pedidos')}
                    className="mt-6 w-full py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Ver todos los pedidos
                  </button>
                </div>
              )}

              {/* Favorites Tab */}
              {activeTab === 'favorites' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Mis Favoritos</h2>
                  <p className="text-gray-600">Aún no has añadido productos a favoritos.</p>
                  <button
                    onClick={() => navigate('/productos')}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Explorar Productos
                  </button>
                </div>
              )}

              {/* Payment Methods Tab */}
              {activeTab === 'payment' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Métodos de Pago</h2>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <CreditCard className="w-8 h-8 text-gray-400" />
                          <div>
                            <p className="font-medium">**** **** **** 4242</p>
                            <p className="text-sm text-gray-600">Expira 12/26</p>
                          </div>
                        </div>
                        <button className="text-red-600 hover:underline">Eliminar</button>
                      </div>
                    </div>
                  </div>
                  <button className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400">
                    + Añadir nuevo método de pago
                  </button>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">Seguridad</h2>
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
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                          Actualizar Contraseña
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold mb-3">Autenticación de Dos Factores</h3>
                      <p className="text-gray-600 mb-4">
                        Añade una capa extra de seguridad a tu cuenta.
                      </p>
                      <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                        Configurar 2FA
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Other tabs... */}
              {(activeTab === 'addresses' || activeTab === 'notifications' || activeTab === 'settings') && (
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                    {tabs.find(t => t.id === activeTab)?.name}
                  </h2>
                  <p className="text-gray-600">Esta sección está en construcción...</p>
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

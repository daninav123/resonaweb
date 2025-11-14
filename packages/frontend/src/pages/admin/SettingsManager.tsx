import { Link } from 'react-router-dom';
import { Settings, Save, Bell, Shield, Mail, Globe } from 'lucide-react';

const SettingsManager = () => {
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Configuración</h1>
        </div>

        {/* General Settings */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 text-resona" />
              <h2 className="text-xl font-semibold text-gray-900">Configuración General</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre de la Empresa
              </label>
              <input
                type="text"
                defaultValue="ReSona Events"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email de Contacto
              </label>
              <input
                type="email"
                defaultValue="info@resona.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                defaultValue="+34 123 456 789"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Bell className="w-6 h-6 text-resona" />
              <h2 className="text-xl font-semibold text-gray-900">Notificaciones</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Nuevos Pedidos</p>
                <p className="text-sm text-gray-600">Recibir email por cada nuevo pedido</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-resona/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-resona"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Nuevos Usuarios</p>
                <p className="text-sm text-gray-600">Notificar sobre nuevos registros</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-resona/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-resona"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Stock Bajo</p>
                <p className="text-sm text-gray-600">Alertas cuando el stock sea bajo</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-resona/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-resona"></div>
              </label>
            </div>
          </div>
        </div>

        {/* SEO & Marketing */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-resona" />
              <h2 className="text-xl font-semibold text-gray-900">SEO & Marketing</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Título
              </label>
              <input
                type="text"
                defaultValue="ReSona Events - Alquiler de Material Audiovisual"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Descripción
              </label>
              <textarea
                rows={3}
                defaultValue="Alquiler profesional de material audiovisual para eventos. Sonido, iluminación, fotografía y video."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3">
              <Shield className="w-6 h-6 text-resona" />
              <h2 className="text-xl font-semibold text-gray-900">Seguridad</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Autenticación de Dos Factores</p>
                <p className="text-sm text-gray-600">Requiere código adicional al iniciar sesión</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-resona/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-resona"></div>
              </label>
            </div>
            <div>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Cambiar Contraseña
              </button>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="bg-resona text-white px-6 py-3 rounded-lg hover:bg-resona-dark transition-colors flex items-center gap-2 font-semibold">
            <Save className="w-5 h-5" />
            Guardar Cambios
          </button>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta es una versión demo. Los cambios no se guardarán hasta conectar con la API.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;

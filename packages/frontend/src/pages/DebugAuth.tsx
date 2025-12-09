import { useAuthStore } from '../stores/authStore';

const DebugAuth = () => {
  const authState = useAuthStore();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6">🔍 Debug de Autenticación</h1>
        
        <div className="space-y-6">
          {/* Estado de Autenticación */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">📊 Estado de Autenticación</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600">isAuthenticated:</p>
                <p className={`font-bold ${authState.isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                  {authState.isAuthenticated ? '✅ true' : '❌ false'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">loading:</p>
                <p className="font-bold">{authState.loading ? '⏳ true' : '✅ false'}</p>
              </div>
            </div>
          </div>

          {/* Datos del Usuario */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">👤 Datos del Usuario</h2>
            {authState.user ? (
              <div className="bg-gray-50 p-4 rounded">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(authState.user, null, 2)}
                </pre>
              </div>
            ) : (
              <p className="text-red-600">❌ No hay usuario en el estado</p>
            )}
          </div>

          {/* Permisos */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">🔐 Verificación de Permisos</h2>
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">Role actual:</p>
                <p className="font-bold text-lg">{authState.user?.role || 'N/A'}</p>
              </div>
              <div>
                <p className="text-gray-600">¿Tiene acceso admin?</p>
                <p className={`font-bold text-lg ${
                  authState.user?.role === 'ADMIN' || authState.user?.role === 'SUPERADMIN' 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {authState.user?.role === 'ADMIN' || authState.user?.role === 'SUPERADMIN' 
                    ? '✅ SÍ' 
                    : '❌ NO'}
                </p>
              </div>
            </div>
          </div>

          {/* Tokens */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">🔑 Tokens</h2>
            <div className="space-y-2">
              <div>
                <p className="text-gray-600">accessToken:</p>
                <p className="font-mono text-xs break-all">
                  {authState.accessToken || '❌ No hay token'}
                </p>
              </div>
              <div>
                <p className="text-gray-600">refreshToken:</p>
                <p className="font-mono text-xs break-all">
                  {authState.refreshToken || '❌ No hay refresh token'}
                </p>
              </div>
            </div>
          </div>

          {/* LocalStorage */}
          <div className="border-b pb-4">
            <h2 className="text-xl font-semibold mb-3">💾 LocalStorage</h2>
            <div className="bg-gray-50 p-4 rounded">
              <pre className="text-sm overflow-auto">
                {JSON.stringify({
                  'auth-storage': localStorage.getItem('auth-storage'),
                  'accessToken': localStorage.getItem('accessToken'),
                  'refreshToken': localStorage.getItem('refreshToken'),
                }, null, 2)}
              </pre>
            </div>
          </div>

          {/* Acciones */}
          <div>
            <h2 className="text-xl font-semibold mb-3">🔧 Acciones</h2>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/login';
                }}
                className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700"
              >
                🗑️ Limpiar Todo y Relogin
              </button>
              <button
                onClick={() => window.location.href = '/admin'}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
              >
                🚀 Intentar ir a /admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth;

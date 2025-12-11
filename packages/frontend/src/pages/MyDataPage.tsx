import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Download, 
  Shield, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Mail,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function MyDataPage() {
  const navigate = useNavigate();
  const { logout } = useAuthStore();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteReason, setDeleteReason] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Cargar resumen de datos
  const { data: dataSummary, isLoading: loadingSummary } = useQuery({
    queryKey: ['gdpr-data-summary'],
    queryFn: async () => {
      const response = await api.get('/gdpr/my-data/summary');
      return response.data;
    },
  });

  // Cargar historial de consentimientos
  const { data: consentHistory, isLoading: loadingHistory } = useQuery({
    queryKey: ['gdpr-consent-history'],
    queryFn: async () => {
      const response = await api.get('/gdpr/consents/history');
      return response.data;
    },
  });

  // Descargar datos
  const downloadMutation = useMutation({
    mutationFn: async () => {
      const response = await api.get('/gdpr/my-data/download', {
        responseType: 'blob',
      });
      return response;
    },
    onSuccess: (blob) => {
      // Crear URL y descargar archivo
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `mis-datos-resona-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('¡Datos descargados correctamente!');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al descargar datos');
    },
  });

  // Actualizar consentimientos
  const updateConsentsMutation = useMutation({
    mutationFn: async (marketingConsent: boolean) => {
      const response = await api.put('/gdpr/consents', { marketingConsent });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Preferencias actualizadas correctamente');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al actualizar preferencias');
    },
  });

  // Eliminar cuenta
  const deleteAccountMutation = useMutation({
    mutationFn: async () => {
      const response = await api.delete('/gdpr/my-account', {
        data: { password: deletePassword, reason: deleteReason },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Tu cuenta ha sido eliminada. ¡Adiós!', { duration: 5000 });
      setTimeout(() => {
        logout();
        navigate('/');
      }, 2000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Error al eliminar cuenta');
    },
  });

  const handleDownloadData = () => {
    downloadMutation.mutate();
  };

  const handleToggleMarketing = () => {
    const newValue = !dataSummary?.consents.marketingConsent;
    updateConsentsMutation.mutate(newValue);
  };

  const handleDeleteAccount = () => {
    if (!deletePassword) {
      toast.error('Debes introducir tu contraseña');
      return;
    }
    deleteAccountMutation.mutate();
  };

  if (loadingSummary || loadingHistory) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando tus datos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔒 Mis Datos y Privacidad
          </h1>
          <p className="text-gray-600">
            Gestiona tus datos personales y preferencias de privacidad según el RGPD
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Columna principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen de datos personales */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Shield className="w-6 h-6 text-resona" />
                Datos Personales
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{dataSummary?.personalData.firstName} {dataSummary?.personalData.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{dataSummary?.personalData.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléfono</p>
                    <p className="font-medium">{dataSummary?.personalData.phone || 'No especificado'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Miembro desde</p>
                    <p className="font-medium">
                      {new Date(dataSummary?.personalData.memberSince).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm text-gray-500 mb-2">Estadísticas</p>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-resona">{dataSummary?.statistics.totalOrders}</p>
                      <p className="text-xs text-gray-600">Pedidos</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-resona">{dataSummary?.statistics.totalReviews}</p>
                      <p className="text-xs text-gray-600">Reseñas</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-resona">{dataSummary?.statistics.totalFavorites}</p>
                      <p className="text-xs text-gray-600">Favoritos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Gestión de consentimientos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Preferencias de Privacidad
              </h2>

              <div className="space-y-4">
                {/* Consentimiento de tratamiento de datos (obligatorio) */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Tratamiento de Datos</h3>
                      <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Obligatorio
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Necesario para gestionar tu cuenta y pedidos
                    </p>
                    {dataSummary?.consents.acceptedPrivacyAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Aceptado el {new Date(dataSummary.consents.acceptedPrivacyAt).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                      Activo
                    </div>
                  </div>
                </div>

                {/* Consentimiento de marketing (opcional) */}
                <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">Comunicaciones Comerciales</h3>
                      <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded">
                        Opcional
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Recibir ofertas, promociones y novedades por email
                    </p>
                    {dataSummary?.consents.acceptedMarketingAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Aceptado el {new Date(dataSummary.consents.acceptedMarketingAt).toLocaleDateString('es-ES')}
                      </p>
                    )}
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={handleToggleMarketing}
                      disabled={updateConsentsMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        dataSummary?.consents.marketingConsent ? 'bg-green-600' : 'bg-gray-300'
                      } ${updateConsentsMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          dataSummary?.consents.marketingConsent ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Zona peligrosa */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
              <h2 className="text-xl font-bold text-red-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                Zona de Peligro
              </h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Eliminar mi cuenta</h3>
                  <p className="text-sm text-gray-700 mb-4">
                    Al eliminar tu cuenta, todos tus datos personales serán borrados permanentemente. 
                    Esta acción <strong>no se puede deshacer</strong>.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Columna lateral */}
          <div className="space-y-6">
            {/* Acciones RGPD */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Tus Derechos RGPD
              </h2>

              <div className="space-y-3">
                <button
                  onClick={handleDownloadData}
                  disabled={downloadMutation.isPending}
                  className="w-full px-4 py-3 bg-resona text-white rounded-lg hover:bg-resona/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download className="w-5 h-5" />
                  {downloadMutation.isPending ? 'Descargando...' : 'Descargar mis datos'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  Descarga todos tus datos en formato JSON (Derecho de Portabilidad)
                </p>
              </div>
            </div>

            {/* Historial de consentimientos */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-gray-600" />
                Historial
              </h2>

              <div className="space-y-3">
                {consentHistory?.history?.map((item: any, index: number) => (
                  <div key={index} className="border-l-2 border-gray-200 pl-3 py-2">
                    <p className="text-sm font-medium text-gray-900">{item.action}</p>
                    <p className="text-xs text-gray-600">{item.description}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(item.date).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Info RGPD */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Protección de Datos
              </h3>
              <p className="text-xs text-blue-800">
                Cumplimos con el RGPD y LOPDGDD. Tus datos están protegidos y nunca serán compartidos con terceros sin tu consentimiento.
              </p>
            </div>
          </div>
        </div>

        {/* Modal de confirmación de eliminación */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  ¿Eliminar tu cuenta?
                </h3>
              </div>

              <div className="space-y-4">
                <p className="text-gray-700">
                  Esta acción es <strong>permanente e irreversible</strong>. Todos tus datos personales serán eliminados.
                </p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirma tu contraseña *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={deletePassword}
                      onChange={(e) => setDeletePassword(e.target.value)}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                      placeholder="Tu contraseña"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ¿Por qué nos dejas? (opcional)
                  </label>
                  <textarea
                    value={deleteReason}
                    onChange={(e) => setDeleteReason(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    rows={3}
                    placeholder="Tu feedback nos ayuda a mejorar..."
                  />
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm text-red-800">
                    ⚠️ No podrás eliminar tu cuenta si tienes pedidos activos. Contacta con soporte.
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword('');
                      setDeleteReason('');
                    }}
                    className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={!deletePassword || deleteAccountMutation.isPending}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteAccountMutation.isPending ? 'Eliminando...' : 'Eliminar cuenta'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

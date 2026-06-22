import { useState, useEffect } from 'react';
import { Building2, Save, Trash2, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { billingService, BillingData } from '../services/billing.service';

interface BillingFormProps {
  onSaved?: (data: BillingData) => void;
}

const SPANISH_PROVINCES = [
  'Álava', 'Albacete', 'Alicante', 'Almería', 'Asturias', 'Ávila', 'Badajoz', 'Barcelona',
  'Burgos', 'Cáceres', 'Cádiz', 'Cantabria', 'Castellón', 'Ciudad Real', 'Córdoba', 'Cuenca',
  'Gerona', 'Granada', 'Guadalajara', 'Guipúzcoa', 'Huelva', 'Huesca', 'Islas Baleares', 'Jaén',
  'La Coruña', 'La Rioja', 'Las Palmas', 'León', 'Lérida', 'Lugo', 'Madrid', 'Málaga', 'Murcia',
  'Navarra', 'Orense', 'Palencia', 'Pontevedra', 'Salamanca', 'Santa Cruz de Tenerife', 'Segovia',
  'Sevilla', 'Soria', 'Tarragona', 'Teruel', 'Toledo', 'Valencia', 'Valladolid', 'Vizcaya',
  'Zamora', 'Zaragoza'
];

const BillingForm = ({ onSaved }: BillingFormProps) => {
  const [loading, setLoading] = useState(false);
  const [hasData, setHasData] = useState(false);
  const [validatingTaxId, setValidatingTaxId] = useState(false);
  const [taxIdValid, setTaxIdValid] = useState<boolean | null>(null);

  const [formData, setFormData] = useState<Partial<BillingData>>({
    companyName: '',
    taxId: '',
    taxIdType: 'NIF',
    address: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'España',
    phone: '',
    email: '',
    isDefault: true,
  });

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const data = await billingService.getBillingData();
      if (data) {
        setFormData(data);
        setHasData(true);
        setTaxIdValid(true);
      }
    } catch (error) {
      console.error('Error loading billing data:', error);
    }
  };

  const validateTaxId = async (taxId: string, type: string) => {
    if (!taxId || taxId.length < 8) {
      setTaxIdValid(null);
      return;
    }

    setValidatingTaxId(true);
    try {
      const result = await billingService.validateTaxId(taxId, type);
      setTaxIdValid(result.valid);
      if (!result.valid) {
        toast.error(`${type} inválido`);
      }
    } catch (error) {
      setTaxIdValid(false);
    } finally {
      setValidatingTaxId(false);
    }
  };

  const handleTaxIdChange = (value: string) => {
    setFormData({ ...formData, taxId: value });
    setTaxIdValid(null);
    
    // Auto-validate after user stops typing
    clearTimeout((window as any).taxIdTimeout);
    (window as any).taxIdTimeout = setTimeout(() => {
      if (value.length >= 8) {
        validateTaxId(value, formData.taxIdType || 'NIF');
      }
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!formData.taxId || formData.taxId.trim().length === 0) {
      toast.error('El NIF/CIF es obligatorio');
      return;
    }

    if (!formData.address || !formData.city || !formData.state || !formData.postalCode) {
      toast.error('Todos los campos de dirección son obligatorios');
      return;
    }

    if (taxIdValid === false) {
      toast.error('Por favor, corrija el NIF/CIF antes de guardar');
      return;
    }

    setLoading(true);
    try {
      const savedData = await billingService.saveBillingData(formData);
      setHasData(true);
      toast.success('Datos de facturación guardados');
      
      if (onSaved) {
        onSaved(savedData);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tus datos de facturación?')) {
      return;
    }

    setLoading(true);
    try {
      await billingService.deleteBillingData();
      setFormData({
        companyName: '',
        taxId: '',
        taxIdType: 'NIF',
        address: '',
        addressLine2: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'España',
        phone: '',
        email: '',
        isDefault: true,
      });
      setHasData(false);
      setTaxIdValid(null);
      toast.success('Datos de facturación eliminados');
    } catch (error) {
      toast.error('Error al eliminar los datos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="w-6 h-6 text-blue-600" />
        <h2 className="text-2xl font-bold">Datos de Facturación</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tipo de cliente */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Cliente
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['NIF', 'CIF', 'NIE', 'PASSPORT'].map((type) => (
              <label key={type} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="taxIdType"
                  value={type}
                  checked={formData.taxIdType === type}
                  onChange={(e) => {
                    setFormData({ ...formData, taxIdType: e.target.value as any });
                    if (formData.taxId) {
                      validateTaxId(formData.taxId, e.target.value);
                    }
                  }}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">{type}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Razón Social / Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Razón Social / Empresa
            <span className="text-gray-400 text-xs ml-2">(opcional para particulares)</span>
          </label>
          <input
            type="text"
            value={formData.companyName || ''}
            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nombre de la empresa (opcional)"
          />
        </div>

        {/* NIF/CIF */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {formData.taxIdType} <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => handleTaxIdChange(e.target.value.toUpperCase())}
              required
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                taxIdValid === true ? 'border-green-500' :
                taxIdValid === false ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder={`Ej: ${formData.taxIdType === 'NIF' ? '12345678A' : formData.taxIdType === 'CIF' ? 'A12345678' : 'X1234567A'}`}
            />
            {validatingTaxId && (
              <div className="absolute right-3 top-3">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              </div>
            )}
            {!validatingTaxId && taxIdValid === true && (
              <CheckCircle className="absolute right-3 top-3 w-4 h-4 text-green-500" />
            )}
            {!validatingTaxId && taxIdValid === false && (
              <AlertCircle className="absolute right-3 top-3 w-4 h-4 text-red-500" />
            )}
          </div>
          {taxIdValid === false && (
            <p className="text-xs text-red-500 mt-1">
              {formData.taxIdType} no válido. Verifica el formato.
            </p>
          )}
        </div>

        {/* Dirección */}
        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Calle, número"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirección Línea 2
              <span className="text-gray-400 text-xs ml-2">(Piso, puerta, etc.)</span>
            </label>
            <input
              type="text"
              value={formData.addressLine2 || ''}
              onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Piso 3, Puerta B (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ciudad <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Valencia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provincia <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Selecciona una provincia</option>
              {SPANISH_PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Código Postal <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.postalCode}
              onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              required
              maxLength={5}
              pattern="[0-9]{5}"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="46000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              País
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
              readOnly
            />
          </div>
        </div>

        {/* Contacto */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Teléfono de facturación
            </label>
            <input
              type="tel"
              value={formData.phone || ''}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="+34 600 000 000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email de facturación
            </label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="facturacion@empresa.com"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading || taxIdValid === false}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Guardar Datos
              </>
            )}
          </button>

          {hasData && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-3 border-2 border-red-500 text-red-500 rounded-lg font-semibold hover:bg-red-50 disabled:opacity-50 flex items-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Eliminar
            </button>
          )}
        </div>

        <p className="text-xs text-gray-500">
          * Campos obligatorios. Estos datos se usarán para la emisión de facturas.
        </p>
      </form>
    </div>
  );
};

export default BillingForm;

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Tag } from 'lucide-react';
import { couponService, Coupon } from '../../services/coupon.service';
import toast from 'react-hot-toast';
import moment from 'moment';

const CouponsManager = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'PERCENTAGE' as any,
    discountValue: 0,
    scope: 'ALL_PRODUCTS' as any,
    minimumAmount: 0,
    usageLimit: 0,
    validFrom: new Date().toISOString().split('T')[0],
    validTo: '',
    isActive: true,
  });

  useEffect(() => {
    loadCoupons();
  }, []);

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponService.listCoupons({ includeExpired: true });
      setCoupons(data.coupons);
    } catch (error) {
      toast.error('Error al cargar cupones');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await couponService.updateCoupon(editingCoupon.id, formData);
        toast.success('Cupón actualizado');
      } else {
        await couponService.createCoupon(formData);
        toast.success('Cupón creado');
      }
      setShowModal(false);
      resetForm();
      loadCoupons();
    } catch (error: any) {
      toast.error(error.message || 'Error al guardar');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar cupón?')) return;
    try {
      await couponService.deleteCoupon(id);
      toast.success('Cupón eliminado');
      loadCoupons();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: 0,
      scope: 'ALL_PRODUCTS',
      minimumAmount: 0,
      usageLimit: 0,
      validFrom: new Date().toISOString().split('T')[0],
      validTo: '',
      isActive: true,
    });
    setEditingCoupon(null);
  };

  const editCoupon = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      scope: coupon.scope,
      minimumAmount: Number(coupon.minimumAmount) || 0,
      usageLimit: coupon.usageLimit || 0,
      validFrom: coupon.validFrom.split('T')[0],
      validTo: coupon.validTo ? coupon.validTo.split('T')[0] : '',
      isActive: coupon.isActive,
    });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Gestión de Cupones</h1>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Cupón
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Código
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Descuento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Usos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Validez
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      Cargando...
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center">
                      No hay cupones
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => (
                    <tr key={coupon.id}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{coupon.code}</div>
                        <div className="text-xs text-gray-500">{coupon.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-resona">
                          {coupon.discountType === 'PERCENTAGE'
                            ? `${coupon.discountValue}%`
                            : coupon.discountType === 'FIXED_AMOUNT'
                            ? `€${coupon.discountValue}`
                            : 'Envío Gratis'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {coupon.usageCount} / {coupon.usageLimit || '∞'}
                      </td>
                      <td className="px-6 py-4 text-xs">
                        <div>{moment(coupon.validFrom).format('DD/MM/YY')}</div>
                        <div>{coupon.validTo ? moment(coupon.validTo).format('DD/MM/YY') : 'Sin límite'}</div>
                      </td>
                      <td className="px-6 py-4">
                        {coupon.isActive ? (
                          <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                            Activo
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            Inactivo
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => editCoupon(coupon)}
                          className="text-resona hover:text-resona-dark mr-3"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold">
                  {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
                </h2>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full border rounded-lg px-3 py-2"
                    required
                    disabled={!!editingCoupon}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descripción</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Tipo *</label>
                    <select
                      value={formData.discountType}
                      onChange={(e) => setFormData({ ...formData, discountType: e.target.value as any })}
                      className="w-full border rounded-lg px-3 py-2"
                    >
                      <option value="PERCENTAGE">Porcentaje</option>
                      <option value="FIXED_AMOUNT">Cantidad Fija</option>
                      <option value="FREE_SHIPPING">Envío Gratis</option>
                    </select>
                  </div>

                  {formData.discountType !== 'FREE_SHIPPING' && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Valor *</label>
                      <input
                        type="number"
                        value={formData.discountValue}
                        onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                        className="w-full border rounded-lg px-3 py-2"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Monto Mínimo</label>
                    <input
                      type="number"
                      value={formData.minimumAmount}
                      onChange={(e) => setFormData({ ...formData, minimumAmount: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Límite de Usos</label>
                    <input
                      type="number"
                      value={formData.usageLimit}
                      onChange={(e) => setFormData({ ...formData, usageLimit: Number(e.target.value) })}
                      className="w-full border rounded-lg px-3 py-2"
                      min="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Válido Desde *</label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">Válido Hasta</label>
                    <input
                      type="date"
                      value={formData.validTo}
                      onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                      className="w-full border rounded-lg px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded text-resona"
                    />
                    <span className="text-sm font-medium">Activo</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark"
                  >
                    {editingCoupon ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsManager;

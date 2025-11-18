import { useState } from 'react';
import { Tag, X, CheckCircle, AlertCircle } from 'lucide-react';
import { couponService } from '../../services/coupon.service';
import toast from 'react-hot-toast';

interface CouponInputProps {
  orderAmount: number;
  categoryIds?: string[];
  productIds?: string[];
  onCouponApplied: (discount: {
    code: string;
    discountAmount: number;
    discountType: string;
    freeShipping?: boolean;
  }) => void;
  onCouponRemoved: () => void;
  appliedCoupon?: string;
}

export const CouponInput = ({
  orderAmount,
  categoryIds,
  productIds,
  onCouponApplied,
  onCouponRemoved,
  appliedCoupon
}: CouponInputProps) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);

  const handleApply = async () => {
    if (!code.trim()) {
      toast.error('Introduce un código de cupón');
      return;
    }

    try {
      setValidating(true);
      const result = await couponService.validateCoupon(
        code.trim(),
        orderAmount,
        categoryIds,
        productIds
      );

      if (result.valid && result.finalDiscount) {
        onCouponApplied({
          code: code.trim().toUpperCase(),
          discountAmount: result.finalDiscount.discountAmount,
          discountType: result.finalDiscount.discountType,
          freeShipping: result.coupon?.freeShipping
        });
        toast.success(`¡Cupón aplicado! Descuento: €${result.finalDiscount.discountAmount.toFixed(2)}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Cupón no válido');
    } finally {
      setValidating(false);
    }
  };

  const handleRemove = () => {
    setCode('');
    onCouponRemoved();
    toast.success('Cupón eliminado');
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm font-medium text-green-900">Cupón aplicado</p>
            <p className="text-xs text-green-700">{appliedCoupon}</p>
          </div>
        </div>
        <button
          onClick={handleRemove}
          className="text-green-600 hover:text-green-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        <Tag className="w-4 h-4 inline mr-1" />
        ¿Tienes un cupón de descuento?
      </label>
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Introduce código"
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
          disabled={validating}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleApply();
            }
          }}
        />
        <button
          onClick={handleApply}
          disabled={!code.trim() || validating}
          className="px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium"
        >
          {validating ? 'Validando...' : 'Aplicar'}
        </button>
      </div>
    </div>
  );
};

export default CouponInput;

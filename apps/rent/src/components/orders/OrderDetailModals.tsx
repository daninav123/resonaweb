import { X, Smartphone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';

interface StatusModalProps {
  show: boolean;
  newStatus: string;
  setNewStatus: (s: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const StatusModal = ({ show, newStatus, setNewStatus, onClose, onConfirm, isPending }: StatusModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4">Cambiar Estado del Pedido</h3>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Nuevo Estado</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Selecciona un estado</option>
            <option value="PENDING">Pendiente</option>
            <option value="IN_PROGRESS">En Proceso</option>
            <option value="COMPLETED">Completado</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!newStatus || isPending}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Actualizando...' : 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface EditModalProps {
  show: boolean;
  editData: any;
  setEditData: (d: any) => void;
  onClose: () => void;
  onSave: () => void;
}

export const EditModal = ({ show, editData, setEditData, onClose, onSave }: EditModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">Editar Pedido</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas del Cliente</label>
            <textarea
              value={editData.notes || ''}
              onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Notas visibles para el cliente..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas Internas (Admin)</label>
            <textarea
              value={editData.internalNotes || ''}
              onChange={(e) => setEditData({ ...editData, internalNotes: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Notas internas solo para administradores..."
            />
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { onClose(); setEditData({}); }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button onClick={onSave} className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition">
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

interface CancelModalProps {
  show: boolean;
  cancelReason: string;
  setCancelReason: (r: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const CancelModal = ({ show, cancelReason, setCancelReason, onClose, onConfirm, isPending }: CancelModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-red-600">Cancelar Pedido</h3>
        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Esta acción <strong>no se puede deshacer</strong>. Por favor indica el motivo de la cancelación.
          </p>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Motivo de Cancelación <span className="text-red-500">*</span>
          </label>
          <textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            rows={4}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
            placeholder="Ej: Cliente solicitó cancelación, Error en el pedido, etc."
          />
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { onClose(); setCancelReason(''); }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Volver
          </button>
          <button
            data-testid="confirm-cancel"
            onClick={onConfirm}
            disabled={!cancelReason.trim() || isPending}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Cancelando...' : 'Confirmar Cancelación'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface ReturnModalProps {
  show: boolean;
  returnNotes: string;
  setReturnNotes: (n: string) => void;
  returnCondition: 'PERFECT' | 'GOOD' | 'DAMAGED';
  setReturnCondition: (c: 'PERFECT' | 'GOOD' | 'DAMAGED') => void;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const ReturnModal = ({ show, returnNotes, setReturnNotes, returnCondition, setReturnCondition, onClose, onConfirm, isPending }: ReturnModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-teal-600">Marcar Devolución</h3>
        <div className="mb-6 space-y-4">
          <p className="text-gray-600">
            Confirma la devolución del material. El stock se actualizará automáticamente.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado del Material <span className="text-red-500">*</span>
            </label>
            <select
              value={returnCondition}
              onChange={(e) => setReturnCondition(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
            >
              <option value="PERFECT">Perfecto Estado</option>
              <option value="GOOD">Buen Estado (normal)</option>
              <option value="DAMAGED">Dañado</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas de Devolución <span className="text-red-500">*</span>
            </label>
            <textarea
              value={returnNotes}
              onChange={(e) => setReturnNotes(e.target.value)}
              rows={4}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500"
              placeholder="Describe el estado del material, observaciones, etc..."
            />
          </div>
          {returnCondition === 'DAMAGED' && (
            <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
              <p className="text-sm text-red-800">
                ⚠️ Material dañado: La fianza podría retenerse parcial o totalmente.
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { onClose(); setReturnNotes(''); setReturnCondition('GOOD'); }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={!returnNotes.trim() || isPending}
            className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Procesando...' : 'Confirmar Devolución'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface DepositModalProps {
  show: boolean;
  depositAction: 'capture' | 'release';
  depositAmount: number;
  depositRetainedAmount: number;
  setDepositRetainedAmount: (n: number) => void;
  depositNotes: string;
  setDepositNotes: (n: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export const DepositModal = ({ show, depositAction, depositAmount, depositRetainedAmount, setDepositRetainedAmount, depositNotes, setDepositNotes, onClose, onConfirm, isPending }: DepositModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold mb-4 text-yellow-600">
          {depositAction === 'capture' ? '💰 Cobrar Fianza' : '↩️ Devolver Fianza'}
        </h3>
        <div className="mb-6 space-y-4">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
            <p className="text-sm text-blue-800">
              <strong>Importe de la fianza:</strong> €{depositAmount.toFixed(2)}
            </p>
          </div>
          {depositAction === 'release' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Importe Retenido (opcional)</label>
              <input
                type="number" min="0" max={depositAmount} step="0.01"
                value={depositRetainedAmount}
                onChange={(e) => setDepositRetainedAmount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">Dejar en 0 para devolver la fianza completa</p>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas (opcional)</label>
            <textarea
              value={depositNotes}
              onChange={(e) => setDepositNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              placeholder={depositAction === 'capture' ? 'Motivo del cobro de fianza (opcional)...' : 'Describe el estado del material, daños si aplica...'}
            />
          </div>
          {depositAction === 'release' && depositRetainedAmount > 0 && (
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
              <p className="text-sm text-yellow-800">
                <strong>⚠️ Retención parcial:</strong><br/>
                Retenido: €{depositRetainedAmount.toFixed(2)}<br/>
                A devolver: €{(depositAmount - depositRetainedAmount).toFixed(2)}
              </p>
            </div>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => { onClose(); setDepositNotes(''); setDepositRetainedAmount(0); }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 px-4 py-2 text-white rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed ${
              depositAction === 'capture' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {isPending ? 'Procesando...' : depositAction === 'capture' ? 'Generar Terminal de Cobro' : 'Confirmar Devolución'}
          </button>
        </div>
      </div>
    </div>
  );
};

interface QRModalProps {
  show: boolean;
  paymentLinkQR: string;
  onClose: () => void;
}

export const QRModal = ({ show, paymentLinkQR, onClose }: QRModalProps) => {
  if (!show) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Terminal de Cobro
            </h3>
            <p className="text-sm text-gray-600 mt-1">Escanea para usar Tap to Pay</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg border-2 border-blue-200">
          <QRCodeSVG value={paymentLinkQR} size={280} level="H" includeMargin={true} />
        </div>
        <div className="mt-6 space-y-3">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
            <p className="text-sm text-blue-800"><strong>📱 Paso 1:</strong> Escanea el QR con tu móvil</p>
          </div>
          <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
            <p className="text-sm text-green-800"><strong>🔓 Paso 2:</strong> Inicia sesión si pide</p>
          </div>
          <div className="bg-purple-50 border-l-4 border-purple-500 p-3 rounded">
            <p className="text-sm text-purple-800"><strong>💳 Paso 3:</strong> Tap en "Cobrar con Tap to Pay"</p>
          </div>
          <div className="bg-orange-50 border-l-4 border-orange-500 p-3 rounded">
            <p className="text-sm text-orange-800"><strong>👋 Paso 4:</strong> Cliente acerca su tarjeta → ✅ Cobrado</p>
          </div>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => window.open(paymentLinkQR, '_blank')}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
          >
            Abrir en Nueva Pestaña
          </button>
          <button
            onClick={() => { navigator.clipboard.writeText(paymentLinkQR); toast.success('Link copiado al portapapeles'); }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
          >
            Copiar Link
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-4 text-center">
          💡 Asegúrate de tener NFC activado en tu móvil para usar Tap to Pay
        </p>
        <button onClick={onClose} className="w-full mt-4 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition font-medium">
          Cerrar
        </button>
      </div>
    </div>
  );
};

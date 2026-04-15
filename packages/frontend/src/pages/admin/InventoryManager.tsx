import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Search, Plus, Wrench, AlertTriangle, CheckCircle, XCircle,
  History, QrCode, ChevronDown, ChevronUp, Barcode, ClipboardList,
  ArrowLeft, RefreshCw, Filter
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import moment from 'moment';
import 'moment/locale/es';
moment.locale('es');

// ============= TYPES =============

type UnitStatus = 'AVAILABLE' | 'IN_USE' | 'BROKEN' | 'UNDER_REPAIR' | 'RETIRED' | 'LOST';
type UnitCondition = 'NEW' | 'GOOD' | 'FAIR' | 'POOR';
type UnitEventType = 'CREATED' | 'CHECKED_OUT' | 'CHECKED_IN' | 'BROKEN' | 'REPAIR_START' | 'REPAIR_END' | 'MAINTENANCE' | 'LOST' | 'RETIRED' | 'NOTE' | 'CONDITION_CHANGE';

interface ProductUnit {
  id: string;
  barcode: string;
  serialNumber?: string;
  internalRef?: string;
  status: UnitStatus;
  condition: UnitCondition;
  location?: string;
  notes?: string;
  totalUses: number;
  totalRepairs: number;
  purchaseDate?: string;
  purchasePrice?: number;
  supplier?: string;
  warrantyUntil?: string;
  lastCheckedAt?: string;
  currentOrderId?: string;
  currentOrder?: { orderNumber: string; startDate: string; endDate: string; status: string };
  product: { name: string; sku: string; mainImageUrl?: string; category?: { name: string } };
  events?: UnitEvent[];
  createdAt: string;
  updatedAt: string;
}

interface UnitEvent {
  id: string;
  type: UnitEventType;
  description: string;
  notes?: string;
  orderId?: string;
  orderNumber?: string;
  repairShop?: string;
  repairCost?: number;
  conditionBefore?: UnitCondition;
  conditionAfter?: UnitCondition;
  performedByName?: string;
  createdAt: string;
}

interface InventorySummaryItem {
  id: string;
  name: string;
  sku: string;
  mainImageUrl?: string;
  category?: { name: string };
  units: { total: number; available: number; inUse: number; broken: number; underRepair: number; retired: number; lost: number };
}

// ============= HELPERS =============

const STATUS_CONFIG: Record<UnitStatus, { label: string; color: string; bg: string; icon: any }> = {
  AVAILABLE:    { label: 'Disponible',    color: 'text-green-700',  bg: 'bg-green-50 border-green-200',   icon: CheckCircle },
  IN_USE:       { label: 'En uso',        color: 'text-blue-700',   bg: 'bg-blue-50 border-blue-200',     icon: Package },
  BROKEN:       { label: 'Roto',          color: 'text-red-700',    bg: 'bg-red-50 border-red-200',       icon: XCircle },
  UNDER_REPAIR: { label: 'En reparación', color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: Wrench },
  RETIRED:      { label: 'Retirado',      color: 'text-gray-500',   bg: 'bg-gray-50 border-gray-200',     icon: XCircle },
  LOST:         { label: 'Perdido',       color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: AlertTriangle },
};

const CONDITION_CONFIG: Record<UnitCondition, { label: string; color: string }> = {
  NEW:  { label: 'Nueva',      color: 'text-green-600' },
  GOOD: { label: 'Buena',      color: 'text-blue-600' },
  FAIR: { label: 'Aceptable',  color: 'text-yellow-600' },
  POOR: { label: 'Deteriorada',color: 'text-red-600' },
};

const EVENT_ICONS: Record<UnitEventType, string> = {
  CREATED: '🆕', CHECKED_OUT: '📤', CHECKED_IN: '📥', BROKEN: '💥',
  REPAIR_START: '🔧', REPAIR_END: '✅', MAINTENANCE: '🛠️', LOST: '❓',
  RETIRED: '🗑️', NOTE: '📝', CONDITION_CHANGE: '🔄',
};

// ============= SUBCOMPONENTS =============

function StatusBadge({ status }: { status: UnitStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
}

function ConditionBadge({ condition }: { condition: UnitCondition }) {
  const cfg = CONDITION_CONFIG[condition];
  return <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>;
}

function BarcodeCard({ unit, onPrint }: { unit: ProductUnit; onPrint: (u: ProductUnit) => void }) {
  return (
    <div className="flex flex-col items-center gap-1 p-3 border rounded-lg bg-white cursor-pointer hover:shadow-md transition-shadow" onClick={() => onPrint(unit)}>
      <QRCodeSVG value={unit.barcode} size={80} />
      <p className="text-xs font-mono font-bold text-gray-700">{unit.barcode}</p>
      <p className="text-xs text-gray-500 text-center truncate max-w-[100px]">{unit.product.name}</p>
    </div>
  );
}

// ============= PRINT LABEL MODAL =============

function PrintLabelModal({ unit, onClose }: { unit: ProductUnit; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const el = printRef.current;
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`
      <html><head><title>Etiqueta ${unit.barcode}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 10px; }
        .label { border: 2px solid #000; padding: 8px; width: 200px; text-align: center; }
        .barcode { font-size: 11px; font-family: monospace; font-weight: bold; letter-spacing: 2px; margin: 4px 0; }
        .product { font-size: 10px; color: #333; margin: 2px 0; }
        @media print { @page { margin: 5mm; size: 60mm 40mm; } }
      </style></head><body>
      <div class="label">
        ${el.innerHTML}
        <div class="barcode">${unit.barcode}</div>
        <div class="product">${unit.product.name}</div>
        <div class="product">SKU: ${unit.product.sku}</div>
      </div>
      </body></html>
    `);
    w.document.close();
    w.print();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-sm w-full p-6">
        <h3 className="text-lg font-bold mb-4">Imprimir Etiqueta</h3>
        <div className="flex flex-col items-center gap-3 p-4 border-2 border-dashed rounded-lg mb-4">
          <div ref={printRef}>
            <QRCodeSVG value={unit.barcode} size={120} />
          </div>
          <p className="font-mono font-bold text-base tracking-widest">{unit.barcode}</p>
          <p className="text-sm text-center text-gray-700">{unit.product.name}</p>
          <p className="text-xs text-gray-500">SKU: {unit.product.sku}</p>
          {unit.serialNumber && <p className="text-xs text-gray-500">S/N: {unit.serialNumber}</p>}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">Cerrar</button>
          <button onClick={handlePrint} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
            <Barcode className="w-4 h-4" /> Imprimir
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= UNIT DETAIL PANEL =============

function UnitDetailPanel({ unit, onClose, onRefresh }: { unit: ProductUnit; onClose: () => void; onRefresh: () => void }) {
  const [loading, setLoading] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [note, setNote] = useState('');
  const [repairForm, setRepairForm] = useState({ description: '', repairShop: '', repairCost: '', estimatedReturn: '' });
  const [showRepairForm, setShowRepairForm] = useState(false);
  const [printUnit, setPrintUnit] = useState<ProductUnit | null>(null);

  const action = async (endpoint: string, body: any) => {
    try {
      setLoading(true);
      await api.post(`/product-units/${unit.id}/${endpoint}`, body);
      toast.success('Acción registrada');
      onRefresh();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al realizar acción');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-40 p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-lg">{unit.barcode}</h2>
            <p className="text-sm text-gray-500">{unit.product.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setPrintUnit(unit)} className="p-2 rounded-lg border hover:bg-gray-50" title="Imprimir etiqueta">
              <QrCode className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="p-2 rounded-lg border hover:bg-gray-50">✕</button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Info básica */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Estado</p>
              <StatusBadge status={unit.status} />
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Condición</p>
              <ConditionBadge condition={unit.condition} />
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Usos totales</p>
              <p className="font-bold">{unit.totalUses}</p>
            </div>
            <div className="p-3 rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500 mb-1">Reparaciones</p>
              <p className="font-bold">{unit.totalRepairs}</p>
            </div>
            {unit.location && (
              <div className="p-3 rounded-lg bg-gray-50 col-span-2">
                <p className="text-xs text-gray-500 mb-1">Ubicación</p>
                <p className="font-medium">{unit.location}</p>
              </div>
            )}
            {unit.serialNumber && (
              <div className="p-3 rounded-lg bg-gray-50">
                <p className="text-xs text-gray-500 mb-1">Nº Serie</p>
                <p className="font-mono text-sm">{unit.serialNumber}</p>
              </div>
            )}
            {unit.currentOrder && (
              <div className="p-3 rounded-lg bg-blue-50 col-span-2">
                <p className="text-xs text-blue-500 mb-1">Pedido activo</p>
                <p className="font-bold text-blue-700">{unit.currentOrder.orderNumber}</p>
                <p className="text-xs text-blue-600">
                  {moment(unit.currentOrder.startDate).format('D MMM')} — {moment(unit.currentOrder.endDate).format('D MMM YYYY')}
                </p>
              </div>
            )}
          </div>

          {/* Acciones */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2">Acciones rápidas</h3>
            <div className="flex flex-wrap gap-2">
              {unit.status !== 'AVAILABLE' && unit.status !== 'RETIRED' && (
                <button onClick={() => action('available', { description: 'Marcada manualmente como disponible' })}
                  disabled={loading} className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded-lg hover:bg-green-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Disponible
                </button>
              )}
              {unit.status === 'AVAILABLE' && (
                <button onClick={() => action('broken', { description: 'Marcada como rota' })}
                  disabled={loading} className="px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Marcar rota
                </button>
              )}
              {(unit.status === 'BROKEN' || unit.status === 'AVAILABLE') && (
                <button onClick={() => setShowRepairForm(!showRepairForm)}
                  disabled={loading} className="px-3 py-1.5 text-xs bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 flex items-center gap-1">
                  <Wrench className="w-3 h-3" /> Enviar a reparar
                </button>
              )}
              {unit.status === 'UNDER_REPAIR' && (
                <button onClick={() => action('repair-end', { description: 'Vuelve de reparación', condition: 'GOOD' })}
                  disabled={loading} className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Vuelve de reparación
                </button>
              )}
              {unit.status !== 'RETIRED' && (
                <button onClick={() => action('retire', { description: 'Dada de baja' })}
                  disabled={loading} className="px-3 py-1.5 text-xs bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Dar de baja
                </button>
              )}
              <button onClick={() => setShowNoteForm(!showNoteForm)}
                className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 flex items-center gap-1">
                <ClipboardList className="w-3 h-3" /> Añadir nota
              </button>
            </div>

            {showNoteForm && (
              <div className="mt-3 flex gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Escribe una nota..."
                  className="flex-1 border rounded-lg px-3 py-1.5 text-sm" />
                <button onClick={() => { action('note', { note }); setNote(''); setShowNoteForm(false); }}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700">
                  Guardar
                </button>
              </div>
            )}

            {showRepairForm && (
              <div className="mt-3 p-3 bg-orange-50 rounded-lg space-y-2">
                <p className="text-xs font-semibold text-orange-700">Enviar a reparar</p>
                <input value={repairForm.description} onChange={(e) => setRepairForm({ ...repairForm, description: e.target.value })}
                  placeholder="Descripción del problema *" className="w-full border rounded-lg px-3 py-1.5 text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input value={repairForm.repairShop} onChange={(e) => setRepairForm({ ...repairForm, repairShop: e.target.value })}
                    placeholder="Taller" className="border rounded-lg px-3 py-1.5 text-sm" />
                  <input type="number" value={repairForm.repairCost} onChange={(e) => setRepairForm({ ...repairForm, repairCost: e.target.value })}
                    placeholder="Coste estimado €" className="border rounded-lg px-3 py-1.5 text-sm" />
                </div>
                <input type="date" value={repairForm.estimatedReturn} onChange={(e) => setRepairForm({ ...repairForm, estimatedReturn: e.target.value })}
                  className="w-full border rounded-lg px-3 py-1.5 text-sm" />
                <button onClick={() => {
                  if (!repairForm.description) return toast.error('Escribe una descripción');
                  action('repair-start', { ...repairForm, repairCost: repairForm.repairCost ? Number(repairForm.repairCost) : undefined });
                  setShowRepairForm(false);
                }} className="w-full py-1.5 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700">
                  Confirmar envío a reparar
                </button>
              </div>
            )}
          </div>

          {/* Historial */}
          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1">
              <History className="w-4 h-4" /> Historial
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {(unit.events ?? []).map((ev) => (
                <div key={ev.id} className="flex gap-3 p-2 rounded-lg bg-gray-50 text-sm">
                  <span className="text-lg leading-none mt-0.5">{EVENT_ICONS[ev.type]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-800">{ev.description}</p>
                    {ev.notes && <p className="text-xs text-gray-500 mt-0.5">{ev.notes}</p>}
                    {ev.repairShop && <p className="text-xs text-orange-600">Taller: {ev.repairShop}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400">{moment(ev.createdAt).fromNow()}</span>
                      {ev.performedByName && <span className="text-xs text-gray-400">· {ev.performedByName}</span>}
                    </div>
                  </div>
                </div>
              ))}
              {(!unit.events || unit.events.length === 0) && (
                <p className="text-sm text-gray-400 text-center py-4">Sin historial</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {printUnit && <PrintLabelModal unit={printUnit} onClose={() => setPrintUnit(null)} />}
    </div>
  );
}

// ============= CREATE UNITS MODAL =============

function CreateUnitsModal({ productId, productName, onClose, onCreated }: {
  productId: string; productName: string; onClose: () => void; onCreated: () => void;
}) {
  const [form, setForm] = useState({
    quantity: 1, purchaseDate: '', purchasePrice: '', supplier: '', invoiceRef: '',
    warrantyUntil: '', condition: 'NEW' as UnitCondition, location: 'Almacén', notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post(`/product-units/product/${productId}`, {
        quantity: form.quantity,
        purchaseDate: form.purchaseDate || undefined,
        purchasePrice: form.purchasePrice ? Number(form.purchasePrice) : undefined,
        supplier: form.supplier || undefined,
        invoiceRef: form.invoiceRef || undefined,
        warrantyUntil: form.warrantyUntil || undefined,
        condition: form.condition,
        location: form.location,
        notes: form.notes || undefined,
      });
      toast.success(`${form.quantity} unidad(es) creada(s) correctamente`);
      onCreated();
      onClose();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Error al crear unidades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">Añadir Unidades</h2>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">✕</button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <p className="text-sm text-gray-500">{productName}</p>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad *</label>
            <input type="number" min={1} max={100} value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
              className="w-full border rounded-lg px-3 py-2 text-sm" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Fecha compra</label>
              <input type="date" value={form.purchaseDate} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Precio compra (€)</label>
              <input type="number" step="0.01" value={form.purchasePrice}
                onChange={(e) => setForm({ ...form, purchasePrice: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Proveedor</label>
              <input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Ref. factura</label>
              <input value={form.invoiceRef} onChange={(e) => setForm({ ...form, invoiceRef: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Garantía hasta</label>
              <input type="date" value={form.warrantyUntil} onChange={(e) => setForm({ ...form, warrantyUntil: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Condición inicial</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as UnitCondition })}
                className="w-full border rounded-lg px-3 py-2 text-sm">
                <option value="NEW">Nueva</option>
                <option value="GOOD">Buena</option>
                <option value="FAIR">Aceptable</option>
                <option value="POOR">Deteriorada</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Ubicación inicial</label>
            <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Notas</label>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={2} className="w-full border rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 border rounded-lg py-2 text-sm hover:bg-gray-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm hover:bg-blue-700 flex items-center justify-center gap-2 disabled:opacity-50">
              <Plus className="w-4 h-4" />
              {loading ? 'Creando...' : `Crear ${form.quantity} unidad(es)`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============= MAIN COMPONENT =============

const InventoryManager = () => {
  const [view, setView] = useState<'summary' | 'units'>('summary');
  const [summary, setSummary] = useState<InventorySummaryItem[]>([]);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedUnit, setSelectedUnit] = useState<ProductUnit | null>(null);
  const [selectedProductForCreate, setSelectedProductForCreate] = useState<{ id: string; name: string } | null>(null);
  const [barcodeSearch, setBarcodeSearch] = useState('');
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (view === 'summary') loadSummary();
    else loadUnits();
  }, [view, statusFilter]);

  const loadSummary = async () => {
    try {
      setLoading(true);
      const res: any = await api.get('/product-units/summary');
      setSummary(res.data ?? []);
    } catch { toast.error('Error al cargar inventario'); }
    finally { setLoading(false); }
  };

  const loadUnits = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 100 };
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;
      const res: any = await api.get('/product-units', { params });
      setUnits(res.units ?? []);
      setTotalUnits(res.total ?? 0);
    } catch { toast.error('Error al cargar unidades'); }
    finally { setLoading(false); }
  };

  const handleBarcodeSearch = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' || !barcodeSearch.trim()) return;
    try {
      const res: any = await api.get(`/product-units/barcode/${encodeURIComponent(barcodeSearch.trim())}`);
      setSelectedUnit(res.data);
      setBarcodeSearch('');
    } catch {
      toast.error('Código de barras no encontrado');
    }
  };

  const handleRefreshUnit = async () => {
    if (!selectedUnit) return;
    try {
      const res: any = await api.get(`/product-units/${selectedUnit.id}`);
      setSelectedUnit(res.data);
    } catch { }
    if (view === 'summary') loadSummary(); else loadUnits();
  };

  const filteredSummary = summary.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  const filteredUnits = units.filter(u =>
    u.barcode.toLowerCase().includes(search.toLowerCase()) ||
    u.product.name.toLowerCase().includes(search.toLowerCase()) ||
    (u.serialNumber ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const totalStats = {
    total: summary.reduce((a, p) => a + p.units.total, 0),
    available: summary.reduce((a, p) => a + p.units.available, 0),
    inUse: summary.reduce((a, p) => a + p.units.inUse, 0),
    broken: summary.reduce((a, p) => a + p.units.broken, 0),
    underRepair: summary.reduce((a, p) => a + p.units.underRepair, 0),
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to="/admin" className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1 mb-3">
            <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Barcode className="w-6 h-6" /> Inventario por Unidades
              </h1>
              <p className="text-gray-500 text-sm mt-1">Control de stock por unidad física con códigos QR</p>
            </div>
            {/* Búsqueda por código de barras */}
            <div className="relative w-full sm:w-72">
              <QrCode className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={barcodeInputRef}
                type="text"
                value={barcodeSearch}
                onChange={(e) => setBarcodeSearch(e.target.value)}
                onKeyDown={handleBarcodeSearch}
                placeholder="Escanear código QR... (Enter)"
                className="pl-9 pr-4 py-2 border rounded-lg w-full text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: totalStats.total, color: 'text-gray-700' },
            { label: 'Disponibles', value: totalStats.available, color: 'text-green-600' },
            { label: 'En uso', value: totalStats.inUse, color: 'text-blue-600' },
            { label: 'Rotas', value: totalStats.broken, color: 'text-red-600' },
            { label: 'En reparación', value: totalStats.underRepair, color: 'text-orange-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-lg p-4 shadow-sm text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Filters */}
        <div className="bg-white rounded-lg shadow-sm mb-4 p-3 flex flex-col sm:flex-row gap-3">
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setView('summary')}
              className={`px-4 py-2 text-sm font-medium ${view === 'summary' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Por producto
            </button>
            <button onClick={() => setView('units')}
              className={`px-4 py-2 text-sm font-medium ${view === 'units' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}>
              Todas las unidades
            </button>
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto, SKU, código..."
              className="pl-9 pr-4 py-2 border rounded-lg w-full text-sm" />
          </div>
          {view === 'units' && (
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm">
              <option value="">Todos los estados</option>
              <option value="AVAILABLE">Disponibles</option>
              <option value="IN_USE">En uso</option>
              <option value="BROKEN">Rotas</option>
              <option value="UNDER_REPAIR">En reparación</option>
              <option value="RETIRED">Retiradas</option>
              <option value="LOST">Perdidas</option>
            </select>
          )}
          <button onClick={() => view === 'summary' ? loadSummary() : loadUnits()}
            className="p-2 border rounded-lg hover:bg-gray-50" title="Refrescar">
            <RefreshCw className="w-4 h-4 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="bg-white rounded-lg p-12 text-center text-gray-400">Cargando...</div>
        ) : view === 'summary' ? (
          /* SUMMARY VIEW */
          <div className="space-y-3">
            {filteredSummary.length === 0 ? (
              <div className="bg-white rounded-lg p-12 text-center text-gray-400">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay unidades registradas todavía.</p>
                <p className="text-sm mt-1">Selecciona un producto y añade unidades para empezar.</p>
              </div>
            ) : (
              filteredSummary.map((product) => (
                <ProductSummaryRow
                  key={product.id}
                  product={product}
                  onCreateUnits={() => setSelectedProductForCreate({ id: product.id, name: product.name })}
                  onSelectUnit={setSelectedUnit}
                  onRefresh={loadSummary}
                />
              ))
            )}
            {/* Productos sin unidades */}
            {filteredSummary.length === 0 && !search && (
              <div className="bg-white rounded-lg p-6 text-center">
                <p className="text-gray-500 mb-2">Para empezar, busca un producto y añade sus unidades físicas.</p>
              </div>
            )}
          </div>
        ) : (
          /* UNITS VIEW */
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Producto</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condición</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ubicación</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Usos</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedUnit(unit)}>
                      <td className="px-4 py-3">
                        <span className="font-mono text-sm font-bold text-blue-600">{unit.barcode}</span>
                        {unit.serialNumber && <p className="text-xs text-gray-400">S/N: {unit.serialNumber}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-medium text-gray-900">{unit.product.name}</p>
                        <p className="text-xs text-gray-500">{unit.product.sku}</p>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={unit.status} /></td>
                      <td className="px-4 py-3"><ConditionBadge condition={unit.condition} /></td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.location ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{unit.totalUses}</td>
                      <td className="px-4 py-3">
                        <button onClick={(e) => { e.stopPropagation(); setSelectedUnit(unit); }}
                          className="text-blue-600 hover:text-blue-800 text-xs underline">
                          Ver detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUnits.length === 0 && (
                    <tr><td colSpan={7} className="px-4 py-8 text-center text-gray-400">No se encontraron unidades</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedUnit && (
        <UnitDetailPanel
          unit={selectedUnit}
          onClose={() => setSelectedUnit(null)}
          onRefresh={handleRefreshUnit}
        />
      )}
      {selectedProductForCreate && (
        <CreateUnitsModal
          productId={selectedProductForCreate.id}
          productName={selectedProductForCreate.name}
          onClose={() => setSelectedProductForCreate(null)}
          onCreated={loadSummary}
        />
      )}
    </div>
  );
};

// ============= PRODUCT SUMMARY ROW =============

function ProductSummaryRow({
  product, onCreateUnits, onSelectUnit, onRefresh
}: {
  product: InventorySummaryItem;
  onCreateUnits: () => void;
  onSelectUnit: (u: ProductUnit) => void;
  onRefresh: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [units, setUnits] = useState<ProductUnit[]>([]);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const loadUnits = async () => {
    if (units.length > 0) return;
    try {
      setLoadingUnits(true);
      const res: any = await api.get(`/product-units/product/${product.id}`);
      setUnits(res.data ?? []);
    } catch { toast.error('Error al cargar unidades'); }
    finally { setLoadingUnits(false); }
  };

  const handleExpand = () => {
    if (!expanded) loadUnits();
    setExpanded(!expanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 p-4 cursor-pointer hover:bg-gray-50" onClick={handleExpand}>
        {product.mainImageUrl ? (
          <img src={product.mainImageUrl} alt={product.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate">{product.name}</p>
          <p className="text-xs text-gray-500">{product.sku} · {product.category?.name}</p>
        </div>
        <div className="hidden sm:flex items-center gap-3 text-sm">
          <span className="text-green-600 font-medium">{product.units.available} disp.</span>
          {product.units.inUse > 0 && <span className="text-blue-600">{product.units.inUse} en uso</span>}
          {product.units.broken > 0 && <span className="text-red-600">{product.units.broken} rotas</span>}
          {product.units.underRepair > 0 && <span className="text-orange-600">{product.units.underRepair} reparación</span>}
          <span className="text-gray-400 text-xs">({product.units.total} total)</span>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onCreateUnits(); }}
          className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 ml-2 flex-shrink-0" title="Añadir unidades">
          <Plus className="w-4 h-4" />
        </button>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="border-t p-4 bg-gray-50">
          {loadingUnits ? (
            <p className="text-sm text-gray-400 text-center py-2">Cargando unidades...</p>
          ) : units.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-sm text-gray-400 mb-2">Sin unidades registradas</p>
              <button onClick={onCreateUnits} className="text-sm text-blue-600 hover:underline flex items-center gap-1 mx-auto">
                <Plus className="w-3 h-3" /> Añadir la primera unidad
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {units.map((unit) => (
                <button
                  key={unit.id}
                  onClick={() => onSelectUnit(unit)}
                  className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 text-left hover:shadow-md transition-all ${
                    unit.status === 'AVAILABLE' ? 'border-green-200 bg-green-50' :
                    unit.status === 'IN_USE' ? 'border-blue-200 bg-blue-50' :
                    unit.status === 'BROKEN' ? 'border-red-200 bg-red-50' :
                    unit.status === 'UNDER_REPAIR' ? 'border-orange-200 bg-orange-50' :
                    'border-gray-200 bg-gray-50'
                  }`}
                >
                  <QRCodeSVG value={unit.barcode} size={56} />
                  <span className="text-xs font-mono font-bold">{unit.barcode}</span>
                  <StatusBadge status={unit.status} />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default InventoryManager;

import { useState, useEffect, useMemo } from 'react';
import { Package, Truck, CheckCircle, AlertTriangle, ArrowLeftRight, ChevronDown, ChevronUp, Search, Filter, Clock } from 'lucide-react';
import { api } from '@resona/api-client';

interface OrderForCheck {
  id: string;
  orderNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  contactPerson: string;
  contactPhone: string;
  eventType: string | null;
  returnedAt: string | null;
  returnCondition: string | null;
  returnNotes: string | null;
  items: {
    id: string;
    productId: string;
    quantity: number;
    product: { id: string; name: string; stock: number; category?: { name: string } };
  }[];
}

type ViewMode = 'checkout' | 'checkin';
type ItemCondition = 'PERFECT' | 'GOOD' | 'DAMAGED' | 'MISSING';

interface CheckState {
  [itemId: string]: {
    checked: boolean;
    condition: ItemCondition;
    notes: string;
    quantityOk: number;
  };
}

const MaterialCheckPage = () => {
  const [orders, setOrders] = useState<OrderForCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('checkout');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [checkStates, setCheckStates] = useState<{ [orderId: string]: CheckState }>({});
  const [search, setSearch] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, [viewMode]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      let statusFilter: string[];
      let dateField: string;
      let startRange: string;
      let endRange: string;

      if (viewMode === 'checkout') {
        statusFilter = ['CONFIRMED', 'PENDING'];
        dateField = 'startDate';
        startRange = weekAgo.toISOString();
        endRange = weekAhead.toISOString();
      } else {
        statusFilter = ['CONFIRMED', 'DELIVERED', 'COMPLETED'];
        dateField = 'endDate';
        startRange = weekAgo.toISOString();
        endRange = weekAhead.toISOString();
      }

      const res: any = await api.get('/orders', {
        params: { limit: 50, status: statusFilter.join(',') },
      });

      const allOrders: OrderForCheck[] = (res.data?.orders || res.orders || res.data || []).filter(
        (o: any) => {
          const date = new Date(viewMode === 'checkout' ? o.startDate : o.endDate);
          return date >= new Date(startRange) && date <= new Date(endRange);
        }
      );

      setOrders(allOrders);

      const states: { [orderId: string]: CheckState } = {};
      allOrders.forEach((order) => {
        const orderState: CheckState = {};
        (order.items || []).forEach((item) => {
          orderState[item.id] = {
            checked: false,
            condition: 'PERFECT',
            notes: '',
            quantityOk: item.quantity,
          };
        });
        states[order.id] = orderState;
      });
      setCheckStates(states);
    } catch (err) {
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const s = search.toLowerCase();
    return orders.filter(
      (o) =>
        o.orderNumber.toLowerCase().includes(s) ||
        o.contactPerson.toLowerCase().includes(s) ||
        (o.eventType || '').toLowerCase().includes(s)
    );
  }, [orders, search]);

  const toggleItem = (orderId: string, itemId: string) => {
    setCheckStates((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [itemId]: {
          ...prev[orderId][itemId],
          checked: !prev[orderId][itemId].checked,
        },
      },
    }));
  };

  const updateItemCondition = (orderId: string, itemId: string, condition: ItemCondition) => {
    setCheckStates((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [itemId]: { ...prev[orderId][itemId], condition },
      },
    }));
  };

  const updateItemNotes = (orderId: string, itemId: string, notes: string) => {
    setCheckStates((prev) => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [itemId]: { ...prev[orderId][itemId], notes },
      },
    }));
  };

  const checkAllItems = (orderId: string) => {
    setCheckStates((prev) => {
      const orderState = { ...prev[orderId] };
      const allChecked = Object.values(orderState).every((s) => s.checked);
      Object.keys(orderState).forEach((key) => {
        orderState[key] = { ...orderState[key], checked: !allChecked };
      });
      return { ...prev, [orderId]: orderState };
    });
  };

  const saveCheckin = async (order: OrderForCheck) => {
    setSaving(order.id);
    try {
      const state = checkStates[order.id];
      const checkedItems = Object.entries(state).filter(([_, s]) => s.checked);

      if (checkedItems.length === 0) {
        alert('Selecciona al menos un item');
        setSaving(null);
        return;
      }

      const hasDamage = checkedItems.some(([_, s]) => s.condition === 'DAMAGED' || s.condition === 'MISSING');
      const conditions = checkedItems.map(([_, s]) => s.condition);
      const worstCondition = conditions.includes('DAMAGED')
        ? 'DAMAGED'
        : conditions.includes('GOOD')
        ? 'GOOD'
        : 'PERFECT';

      const notes = checkedItems
        .filter(([_, s]) => s.notes)
        .map(([id, s]) => {
          const item = order.items.find((i) => i.id === id);
          return `${item?.product.name}: ${s.notes} [${s.condition}]`;
        })
        .join('; ');

      if (viewMode === 'checkin') {
        await api.post(`/orders/${order.id}/returned`, {
          condition: worstCondition,
          notes: notes || `Material devuelto - ${worstCondition}`,
        });
      } else {
        await api.patch(`/orders/${order.id}/status`, {
          status: 'DELIVERED',
        });
      }

      alert(`✅ ${viewMode === 'checkout' ? 'Salida' : 'Devolución'} registrada correctamente`);
      await loadOrders();
    } catch (err) {
      console.error('Error saving check:', err);
      alert('❌ Error al guardar');
    } finally {
      setSaving(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      DELIVERED: 'bg-blue-100 text-blue-800',
      COMPLETED: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getConditionColor = (condition: ItemCondition) => {
    switch (condition) {
      case 'PERFECT': return 'bg-green-100 text-green-800 border-green-300';
      case 'GOOD': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'DAMAGED': return 'bg-red-100 text-red-800 border-red-300';
      case 'MISSING': return 'bg-gray-800 text-white border-gray-900';
    }
  };

  const getDaysUntil = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    if (diff === -1) return 'Ayer';
    if (diff < 0) return `Hace ${Math.abs(diff)} días`;
    return `En ${diff} días`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <ArrowLeftRight className="w-8 h-8 text-blue-600" />
            Check-in / Check-out Material
          </h1>
          <p className="text-gray-600 mt-1">Registra la salida y devolución de equipos por pedido</p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="bg-white rounded-lg shadow p-2 flex gap-2">
        <button
          onClick={() => setViewMode('checkout')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            viewMode === 'checkout'
              ? 'bg-orange-500 text-white shadow-md'
              : 'bg-white text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Truck className="w-5 h-5" />
          Salida de Material (Check-out)
        </button>
        <button
          onClick={() => setViewMode('checkin')}
          className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
            viewMode === 'checkin'
              ? 'bg-green-600 text-white shadow-md'
              : 'bg-white text-green-600 hover:bg-green-50'
          }`}
        >
          <Package className="w-5 h-5" />
          Devolución de Material (Check-in)
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por pedido, cliente o tipo de evento..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay pedidos pendientes de {viewMode === 'checkout' ? 'salida' : 'devolución'} esta semana</p>
          </div>
        )}

        {filteredOrders.map((order) => {
          const isExpanded = expandedOrder === order.id;
          const orderState = checkStates[order.id] || {};
          const checkedCount = Object.values(orderState).filter((s) => s.checked).length;
          const totalItems = order.items?.length || 0;
          const relevantDate = viewMode === 'checkout' ? order.startDate : order.endDate;

          return (
            <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
              {/* Order header */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-12 rounded-full ${viewMode === 'checkout' ? 'bg-orange-400' : 'bg-green-400'}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">{order.orderNumber}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {order.contactPerson} · {order.eventType || 'Evento'} · {order.contactPhone}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {new Date(relevantDate).toLocaleDateString('es-ES', {
                        weekday: 'short', day: '2-digit', month: 'short',
                      })}
                    </div>
                    <div className={`text-xs font-medium ${
                      getDaysUntil(relevantDate) === 'Hoy' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                      {getDaysUntil(relevantDate)}
                    </div>
                  </div>
                  <div className="text-center min-w-[50px]">
                    <div className="text-lg font-bold text-blue-600">{totalItems}</div>
                    <div className="text-[10px] text-gray-400">items</div>
                  </div>
                  {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="border-t p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {checkedCount} / {totalItems} items marcados
                    </span>
                    <button
                      onClick={() => checkAllItems(order.id)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {checkedCount === totalItems ? 'Desmarcar todos' : 'Marcar todos'}
                    </button>
                  </div>

                  {/* Items */}
                  <div className="space-y-2">
                    {(order.items || []).map((item) => {
                      const itemState = orderState[item.id] || {
                        checked: false, condition: 'PERFECT' as ItemCondition, notes: '', quantityOk: item.quantity,
                      };
                      return (
                        <div
                          key={item.id}
                          className={`border rounded-lg p-3 transition-all ${
                            itemState.checked ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={itemState.checked}
                              onChange={() => toggleItem(order.id, item.id)}
                              className="w-5 h-5 rounded"
                            />
                            <div className="flex-1">
                              <div className="font-medium">{item.product?.name || 'Producto'}</div>
                              <div className="text-xs text-gray-500">
                                {item.product?.category?.name || ''} · Cantidad: {item.quantity}
                              </div>
                            </div>
                            <div className="text-lg font-bold text-gray-700">x{item.quantity}</div>
                          </div>

                          {/* Condition selector (only for check-in) */}
                          {itemState.checked && viewMode === 'checkin' && (
                            <div className="mt-2 pl-8 space-y-2">
                              <div className="flex gap-2">
                                {(['PERFECT', 'GOOD', 'DAMAGED', 'MISSING'] as ItemCondition[]).map((cond) => (
                                  <button
                                    key={cond}
                                    onClick={() => updateItemCondition(order.id, item.id, cond)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                                      itemState.condition === cond
                                        ? getConditionColor(cond)
                                        : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                                    }`}
                                  >
                                    {cond === 'PERFECT' && '✓ Perfecto'}
                                    {cond === 'GOOD' && '○ Aceptable'}
                                    {cond === 'DAMAGED' && '✗ Dañado'}
                                    {cond === 'MISSING' && '? Falta'}
                                  </button>
                                ))}
                              </div>
                              {(itemState.condition === 'DAMAGED' || itemState.condition === 'MISSING') && (
                                <input
                                  type="text"
                                  value={itemState.notes}
                                  onChange={(e) => updateItemNotes(order.id, item.id, e.target.value)}
                                  placeholder="Describe el daño o incidencia..."
                                  className="w-full px-3 py-1.5 border rounded text-sm"
                                />
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => saveCheckin(order)}
                      disabled={saving === order.id || checkedCount === 0}
                      className={`px-6 py-2.5 rounded-lg font-medium text-white transition-all ${
                        viewMode === 'checkout'
                          ? 'bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300'
                          : 'bg-green-600 hover:bg-green-700 disabled:bg-green-300'
                      }`}
                    >
                      {saving === order.id
                        ? 'Guardando...'
                        : viewMode === 'checkout'
                        ? `Registrar salida (${checkedCount} items)`
                        : `Registrar devolución (${checkedCount} items)`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MaterialCheckPage;

import { useState, useEffect, useMemo } from 'react';
import { ClipboardList, Printer, CheckSquare, Square, Package, Calendar, Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

interface OrderForPicking {
  id: string;
  orderNumber: string;
  status: string;
  startDate: string;
  endDate: string;
  contactPerson: string;
  eventType: string | null;
  deliveryType: string;
  items: {
    id: string;
    quantity: number;
    product: { id: string; name: string; stock: number; category?: { name: string } };
  }[];
}

const PickingListPage = () => {
  const [daysAhead, setDaysAhead] = useState(3);
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('picking-checked');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch { return new Set(); }
  });
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    localStorage.setItem('picking-checked', JSON.stringify([...checkedItems]));
  }, [checkedItems]);

  const { data: orders = [], isLoading: loading } = useQuery<OrderForPicking[]>({
    queryKey: ['admin-picking-list', daysAhead],
    queryFn: async () => {
      const res: any = await api.get('/orders', { params: { limit: 50, status: 'CONFIRMED,PENDING' } });
      const now = new Date();
      const ahead = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
      return (res.data?.orders || res.orders || res.data || []).filter(
        (o: any) => new Date(o.startDate) >= now && new Date(o.startDate) <= ahead
      );
    },
    staleTime: 30_000,
  });

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const s = search.toLowerCase();
    return orders.filter(
      (o) => o.orderNumber.toLowerCase().includes(s) || o.contactPerson.toLowerCase().includes(s)
    );
  }, [orders, search]);

  const allItems = useMemo(() => {
    const map = new Map<string, { productId: string; name: string; category: string; totalQty: number; stock: number; orders: string[] }>();
    filteredOrders.forEach((o) => {
      (o.items || []).forEach((item) => {
        const key = item.product?.id || item.id;
        const existing = map.get(key);
        if (existing) {
          existing.totalQty += item.quantity;
          existing.orders.push(o.orderNumber);
        } else {
          map.set(key, {
            productId: key,
            name: item.product?.name || 'Producto',
            category: item.product?.category?.name || '-',
            totalQty: item.quantity,
            stock: item.product?.stock || 0,
            orders: [o.orderNumber],
          });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [filteredOrders]);

  const toggleItem = (productId: string) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const toggleAll = () => {
    if (checkedItems.size === allItems.length) {
      setCheckedItems(new Set());
    } else {
      setCheckedItems(new Set(allItems.map((i) => i.productId)));
    }
  };

  const printPickingList = () => {
    const el = document.getElementById('picking-list-print');
    if (!el) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Picking List</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        h1 { font-size: 18px; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background: #f0f0f0; }
        .checkbox { width: 14px; height: 14px; border: 1px solid #999; display: inline-block; }
        @media print { body { margin: 10mm; } }
      </style></head><body>
      ${el.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const progress = allItems.length > 0 ? Math.round((checkedItems.size / allItems.length) * 100) : 0;

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
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ClipboardList className="w-7 h-7 text-blue-600" />
            Picking List
          </h1>
          <p className="text-gray-500 mt-1">Lista de preparación de material por pedidos próximos</p>
        </div>
        <div className="flex gap-2">
          <select
            value={daysAhead}
            onChange={(e) => setDaysAhead(parseInt(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            <option value={1}>Mañana</option>
            <option value={3}>Próximos 3 días</option>
            <option value={7}>Próximos 7 días</option>
          </select>
          <button
            onClick={printPickingList}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700"
          >
            <Printer className="w-4 h-4" /> Imprimir
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pedidos</div>
          <div className="text-2xl font-bold text-blue-600">{filteredOrders.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Productos distintos</div>
          <div className="text-2xl font-bold text-gray-900">{allItems.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Preparados</div>
          <div className="text-2xl font-bold text-green-600">{checkedItems.size}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Progreso</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-3 bg-gray-200 rounded-full">
              <div
                className="h-3 bg-green-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-bold">{progress}%</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text" value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar pedido o cliente..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>

      {/* Consolidated picking list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-gray-900">Lista consolidada de material</h3>
          <button onClick={toggleAll} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            {checkedItems.size === allItems.length ? 'Desmarcar todo' : 'Marcar todo'}
          </button>
        </div>

        <div id="picking-list-print">
          <div className="p-4 border-b bg-gray-50 text-sm text-gray-500" style={{ display: 'none' }}>
            <h2 style={{ display: 'block', fontSize: '16px', fontWeight: 'bold' }}>PICKING LIST - RESONA EVENTS</h2>
            <p>Fecha: {new Date().toLocaleDateString('es-ES')} · Pedidos: {filteredOrders.length} · Productos: {allItems.length}</p>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 w-10 text-center">✓</th>
                <th className="p-3 text-left">Producto</th>
                <th className="p-3 text-left">Categoría</th>
                <th className="p-3 text-center">Cantidad</th>
                <th className="p-3 text-center">Stock</th>
                <th className="p-3 text-left">Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {allItems.map((item) => {
                const isChecked = checkedItems.has(item.productId);
                const lowStock = item.totalQty > item.stock;
                return (
                  <tr
                    key={item.productId}
                    className={`border-t cursor-pointer transition-colors ${
                      isChecked ? 'bg-green-50' : lowStock ? 'bg-red-50' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => toggleItem(item.productId)}
                  >
                    <td className="p-3 text-center">
                      {isChecked ? (
                        <CheckSquare className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                    <td className={`p-3 font-medium ${isChecked ? 'line-through text-gray-400' : ''}`}>
                      {item.name}
                    </td>
                    <td className="p-3 text-gray-500">{item.category}</td>
                    <td className="p-3 text-center font-bold text-lg">{item.totalQty}</td>
                    <td className={`p-3 text-center ${lowStock ? 'text-red-600 font-bold' : 'text-gray-500'}`}>
                      {item.stock}
                      {lowStock && ' ⚠️'}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 flex-wrap">
                        {item.orders.map((o, i) => (
                          <span key={i} className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">{o}</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {allItems.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay material pendiente de preparar</p>
          </div>
        )}
      </div>

      {/* Per-order breakdown */}
      {filteredOrders.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-700">Desglose por pedido</h3>
          {filteredOrders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            return (
              <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div
                  className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">{order.orderNumber}</span>
                    <span className="text-xs text-gray-500">{order.contactPerson}</span>
                    <span className="text-xs text-gray-400">·</span>
                    <span className="text-xs text-gray-400">
                      {new Date(order.startDate).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{order.items?.length || 0} items</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t p-3">
                    <div className="space-y-1">
                      {(order.items || []).map((item) => (
                        <div key={item.id} className="flex items-center justify-between text-sm py-1">
                          <span>{item.product?.name || 'Producto'}</span>
                          <span className="font-bold">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PickingListPage;

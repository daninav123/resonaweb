import { useState } from 'react';
import { FileText, Truck, Users, Package, MapPin, Calendar, Clock, Printer, ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';

interface EventData {
  id: string;
  title: string;
  eventType: string;
  eventDate: string;
  eventEndDate: string | null;
  venue: string;
  clientName: string;
  clientPhone: string | null;
  phase: string;
  staff: { id: string; staffName: string; role: string; confirmed: boolean }[];
  equipment: { id: string; productName: string; quantity: number; pickedUp: boolean; returned: boolean; notes: string | null }[];
  orderId: string | null;
  technicalNotes: string | null;
}

interface VehicleData {
  id: string;
  plate: string;
  brand: string;
  model: string;
  type: string;
  capacity: string | null;
  status: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  startDate: string;
  endDate: string;
  contactPerson: string;
  contactPhone: string;
  eventType: string | null;
  deliveryType: string;
  deliveryAddress: any;
  deliveryNotes: string | null;
  items: {
    id: string;
    quantity: number;
    product: { id: string; name: string; category?: { name: string } };
  }[];
}

const LoadingSheetPage = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<{ [key: string]: string }>({});
  const [daysAhead, setDaysAhead] = useState(7);

  const { data: sheetData, isLoading: loading } = useQuery({
    queryKey: ['admin-loading-sheets', daysAhead],
    queryFn: async () => {
      const [eventsRes, ordersRes, vehiclesRes]: any[] = await Promise.all([
        api.get('/events', { params: { limit: 50 } }).catch(() => ({ data: { events: [] } })),
        api.get('/orders', { params: { limit: 50, status: 'CONFIRMED,PENDING' } }).catch(() => ({ data: { orders: [] } })),
        api.get('/vehicles').catch(() => ({ data: [] })),
      ]);

      const now = new Date();
      const ahead = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

      const allEvents = (eventsRes.data?.events || eventsRes.data || []).filter((e: any) => {
        const d = new Date(e.eventDate);
        return d >= now && d <= ahead;
      });

      const allOrders = (ordersRes.data?.orders || ordersRes.data || []).filter((o: any) => {
        const d = new Date(o.startDate);
        return d >= now && d <= ahead;
      });

      const allVehicles = vehiclesRes.data?.vehicles || vehiclesRes.data || [];
      return { events: allEvents as EventData[], orders: allOrders as OrderData[], vehicles: allVehicles as VehicleData[] };
    },
    staleTime: 30_000,
  });

  const events = sheetData?.events ?? [];
  const orders = sheetData?.orders ?? [];
  const vehicles = sheetData?.vehicles ?? [];

  const availableVehicles = vehicles.filter((v) => v.status === 'available');

  const printSheet = (id: string) => {
    const el = document.getElementById(`sheet-${id}`);
    if (!el) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Hoja de Carga</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; font-size: 12px; }
        h1 { font-size: 18px; color: #333; }
        h2 { font-size: 14px; color: #555; border-bottom: 1px solid #ddd; padding-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 8px 0; }
        th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: bold; }
        .header { display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 10px; }
        .checkbox { width: 14px; height: 14px; border: 1px solid #999; display: inline-block; margin-right: 6px; }
        @media print { body { margin: 10mm; } }
      </style></head><body>
      ${el.innerHTML}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const renderOrderSheet = (order: OrderData) => {
    const vehicle = selectedVehicle[order.id]
      ? vehicles.find((v) => v.id === selectedVehicle[order.id])
      : null;
    const isExpanded = expandedId === `order-${order.id}`;

    return (
      <div key={order.id} className="bg-white rounded-lg shadow overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setExpandedId(isExpanded ? null : `order-${order.id}`)}
        >
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 rounded-full bg-blue-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{order.orderNumber}</span>
                <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">Pedido</span>
              </div>
              <div className="text-sm text-gray-500">
                {order.contactPerson} · {order.eventType || 'Evento'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium">
                {new Date(order.startDate).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
              </div>
              <div className="text-gray-400">{order.items?.length || 0} productos</div>
            </div>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t p-4 space-y-4">
            {/* Vehicle selector */}
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-gray-400" />
              <select
                value={selectedVehicle[order.id] || ''}
                onChange={(e) => setSelectedVehicle((prev) => ({ ...prev, [order.id]: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm flex-1"
              >
                <option value="">Sin vehículo asignado</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.plate}) - {v.type} {v.capacity ? `· ${v.capacity}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Printable sheet */}
            <div id={`sheet-order-${order.id}`} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold">HOJA DE CARGA</h2>
                  <p className="text-sm text-gray-600">Pedido: {order.orderNumber}</p>
                </div>
                <div className="text-right text-sm">
                  <p><strong>Fecha evento:</strong> {new Date(order.startDate).toLocaleDateString('es-ES')}</p>
                  <p><strong>Devolución:</strong> {new Date(order.endDate).toLocaleDateString('es-ES')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p><strong>Cliente:</strong> {order.contactPerson}</p>
                  <p><strong>Teléfono:</strong> {order.contactPhone}</p>
                  <p><strong>Entrega:</strong> {order.deliveryType}</p>
                </div>
                <div>
                  {vehicle && (
                    <p><strong>Vehículo:</strong> {vehicle.brand} {vehicle.model} ({vehicle.plate})</p>
                  )}
                  {order.deliveryNotes && <p><strong>Notas:</strong> {order.deliveryNotes}</p>}
                </div>
              </div>

              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2 w-8 text-center">✓</th>
                    <th className="border p-2 text-left">Producto</th>
                    <th className="border p-2 text-left">Categoría</th>
                    <th className="border p-2 text-center w-20">Cantidad</th>
                    <th className="border p-2 text-left">Notas</th>
                  </tr>
                </thead>
                <tbody>
                  {(order.items || []).map((item, i) => (
                    <tr key={item.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border p-2 text-center">
                        <div className="w-4 h-4 border border-gray-400 rounded mx-auto" />
                      </td>
                      <td className="border p-2 font-medium">{item.product?.name || 'Producto'}</td>
                      <td className="border p-2 text-gray-500">{item.product?.category?.name || '-'}</td>
                      <td className="border p-2 text-center font-bold">{item.quantity}</td>
                      <td className="border p-2" />
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="font-semibold mb-1">Preparado por:</p>
                  <div className="border-b border-gray-400 h-6" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Fecha/Hora:</p>
                  <div className="border-b border-gray-400 h-6" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => printSheet(`order-${order.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Printer className="w-4 h-4" />
                Imprimir hoja de carga
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderEventSheet = (event: EventData) => {
    const vehicle = selectedVehicle[event.id]
      ? vehicles.find((v) => v.id === selectedVehicle[event.id])
      : null;
    const isExpanded = expandedId === `event-${event.id}`;

    return (
      <div key={event.id} className="bg-white rounded-lg shadow overflow-hidden">
        <div
          className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
          onClick={() => setExpandedId(isExpanded ? null : `event-${event.id}`)}
        >
          <div className="flex items-center gap-4">
            <div className="w-2 h-12 rounded-full bg-purple-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold">{event.title}</span>
                <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs">Evento</span>
              </div>
              <div className="text-sm text-gray-500">
                {event.clientName} · {event.eventType}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm">
              <div className="font-medium">
                {new Date(event.eventDate).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })}
              </div>
              <div className="text-gray-400">
                {event.equipment?.length || 0} equipos · {event.staff?.length || 0} personal
              </div>
            </div>
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>

        {isExpanded && (
          <div className="border-t p-4 space-y-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-gray-400" />
              <select
                value={selectedVehicle[event.id] || ''}
                onChange={(e) => setSelectedVehicle((prev) => ({ ...prev, [event.id]: e.target.value }))}
                className="border rounded-lg px-3 py-2 text-sm flex-1"
              >
                <option value="">Sin vehículo asignado</option>
                {availableVehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.brand} {v.model} ({v.plate}) - {v.type} {v.capacity ? `· ${v.capacity}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div id={`sheet-event-${event.id}`} className="border rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-bold">HOJA DE CARGA</h2>
                  <p className="text-sm text-gray-600">Evento: {event.title}</p>
                </div>
                <div className="text-right text-sm">
                  <p><strong>Fecha:</strong> {new Date(event.eventDate).toLocaleDateString('es-ES')}</p>
                  <p><strong>Lugar:</strong> {event.venue}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p><strong>Cliente:</strong> {event.clientName}</p>
                  <p><strong>Teléfono:</strong> {event.clientPhone || '-'}</p>
                  <p><strong>Tipo:</strong> {event.eventType}</p>
                </div>
                <div>
                  {vehicle && (
                    <p><strong>Vehículo:</strong> {vehicle.brand} {vehicle.model} ({vehicle.plate})</p>
                  )}
                  {event.technicalNotes && <p><strong>Notas técnicas:</strong> {event.technicalNotes}</p>}
                </div>
              </div>

              {/* Equipment table */}
              {event.equipment && event.equipment.length > 0 && (
                <>
                  <h3 className="font-semibold text-sm mb-1 flex items-center gap-1">
                    <Package className="w-4 h-4" /> Equipos
                  </h3>
                  <table className="w-full text-sm border-collapse mb-4">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2 w-8 text-center">✓</th>
                        <th className="border p-2 text-left">Equipo</th>
                        <th className="border p-2 text-center w-20">Cantidad</th>
                        <th className="border p-2 text-left">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.equipment.map((eq, i) => (
                        <tr key={eq.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border p-2 text-center">
                            {eq.pickedUp ? '✓' : <div className="w-4 h-4 border border-gray-400 rounded mx-auto" />}
                          </td>
                          <td className="border p-2 font-medium">{eq.productName}</td>
                          <td className="border p-2 text-center font-bold">{eq.quantity}</td>
                          <td className="border p-2 text-gray-500">{eq.notes || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Staff table */}
              {event.staff && event.staff.length > 0 && (
                <>
                  <h3 className="font-semibold text-sm mb-1 flex items-center gap-1">
                    <Users className="w-4 h-4" /> Personal asignado
                  </h3>
                  <table className="w-full text-sm border-collapse mb-4">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2 text-left">Nombre</th>
                        <th className="border p-2 text-left">Rol</th>
                        <th className="border p-2 text-center">Confirmado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {event.staff.map((s, i) => (
                        <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="border p-2 font-medium">{s.staffName}</td>
                          <td className="border p-2">{s.role}</td>
                          <td className="border p-2 text-center">{s.confirmed ? '✓' : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              <div className="mt-4 grid grid-cols-2 gap-8 text-sm">
                <div>
                  <p className="font-semibold mb-1">Preparado por:</p>
                  <div className="border-b border-gray-400 h-6" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Fecha/Hora:</p>
                  <div className="border-b border-gray-400 h-6" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => printSheet(`event-${event.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Printer className="w-4 h-4" />
                Imprimir hoja de carga
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const allItems = [
    ...events.map((e) => ({ type: 'event' as const, data: e, date: new Date(e.eventDate) })),
    ...orders.map((o) => ({ type: 'order' as const, data: o, date: new Date(o.startDate) })),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-8 h-8 text-blue-600" />
            Hojas de Carga
          </h1>
          <p className="text-gray-600 mt-1">
            Genera hojas de carga para eventos y pedidos próximos
          </p>
        </div>
        <select
          value={daysAhead}
          onChange={(e) => setDaysAhead(parseInt(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value={3}>Próximos 3 días</option>
          <option value={7}>Próximos 7 días</option>
          <option value={14}>Próximos 14 días</option>
          <option value={30}>Próximos 30 días</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Eventos próximos</div>
          <div className="text-2xl font-bold text-purple-600">{events.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Pedidos próximos</div>
          <div className="text-2xl font-bold text-blue-600">{orders.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500">Vehículos disponibles</div>
          <div className="text-2xl font-bold text-green-600">{availableVehicles.length}</div>
        </div>
      </div>

      {/* Items list */}
      <div className="space-y-3">
        {allItems.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No hay eventos ni pedidos próximos</p>
          </div>
        )}

        {allItems.map((item) =>
          item.type === 'event'
            ? renderEventSheet(item.data as EventData)
            : renderOrderSheet(item.data as OrderData)
        )}
      </div>
    </div>
  );
};

export default LoadingSheetPage;

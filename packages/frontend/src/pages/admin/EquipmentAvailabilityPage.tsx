import { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Package, AlertTriangle, CheckCircle, Filter, Search } from 'lucide-react';
import { api } from '../../services/api';

interface Booking {
  orderNumber: string;
  orderId: string;
  status: string;
  contactPerson: string;
  eventType: string | null;
  quantity: number;
  startDate: string;
  endDate: string;
}

interface ProductAvailability {
  id: string;
  name: string;
  stock: number;
  category: string;
  categoryId: string | null;
  minAvailable: number;
  bookings: Booking[];
}

interface AvailabilityData {
  products: ProductAvailability[];
  totalProducts: number;
  period: { startDate: string; endDate: string };
}

const EquipmentAvailabilityPage = () => {
  const [data, setData] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showOnlyBooked, setShowOnlyBooked] = useState(false);

  const startDate = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    return d;
  }, [currentDate]);

  const endDate = useMemo(() => {
    const d = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    return d;
  }, [currentDate]);

  const daysInMonth = useMemo(() => {
    const days: Date[] = [];
    const d = new Date(startDate);
    while (d <= endDate) {
      days.push(new Date(d));
      d.setDate(d.getDate() + 1);
    }
    return days;
  }, [startDate, endDate]);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });
      const res: any = await api.get(`/availability/global?${params}`);
      setData(res.data || res);
    } catch (err) {
      console.error('Error loading availability:', err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    if (!data) return [];
    const cats = new Set(data.products.map((p) => p.category));
    return Array.from(cats).sort();
  }, [data]);

  const filteredProducts = useMemo(() => {
    if (!data) return [];
    return data.products.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categoryFilter && p.category !== categoryFilter) return false;
      if (showOnlyBooked && p.bookings.length === 0) return false;
      return true;
    });
  }, [data, search, categoryFilter, showOnlyBooked]);

  const getBookingsForDay = (product: ProductAvailability, day: Date) => {
    return product.bookings.filter((b) => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      bStart.setHours(0, 0, 0, 0);
      bEnd.setHours(0, 0, 0, 0);
      return day >= bStart && day <= bEnd;
    });
  };

  const getReservedOnDay = (product: ProductAvailability, day: Date) => {
    return getBookingsForDay(product, day).reduce((sum, b) => sum + b.quantity, 0);
  };

  const getCellColor = (stock: number, reserved: number) => {
    if (reserved === 0) return 'bg-green-50';
    const available = stock - reserved;
    if (available <= 0) return 'bg-red-200';
    if (available <= stock * 0.3) return 'bg-orange-100';
    return 'bg-yellow-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'bg-green-500';
      case 'PENDING': return 'bg-yellow-500';
      case 'DELIVERED': return 'bg-blue-500';
      case 'COMPLETED': return 'bg-gray-500';
      default: return 'bg-purple-500';
    }
  };

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  const stats = useMemo(() => {
    if (!data) return { total: 0, withBookings: 0, fullyBooked: 0, available: 0 };
    const withBookings = data.products.filter((p) => p.bookings.length > 0).length;
    const fullyBooked = data.products.filter((p) => p.minAvailable <= 0).length;
    return {
      total: data.totalProducts,
      withBookings,
      fullyBooked,
      available: data.totalProducts - fullyBooked,
    };
  }, [data]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            Disponibilidad de Equipos
          </h1>
          <p className="text-gray-600 mt-1">Vista global de reservas por producto y fecha</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Package className="w-4 h-4" />
            Total productos
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            Con reservas
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.withBookings}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <AlertTriangle className="w-4 h-4" />
            Sin stock libre
          </div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.fullyBooked}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <CheckCircle className="w-4 h-4" />
            Disponibles
          </div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.available}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 font-medium"
          >
            Hoy
          </button>
          <h2 className="text-lg font-semibold capitalize min-w-[180px] text-center">{monthName}</h2>
          <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar producto..."
              className="pl-9 pr-3 py-2 border rounded-lg text-sm w-48"
            />
          </div>
          <div className="relative">
            <Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-9 pr-3 py-2 border rounded-lg text-sm appearance-none bg-white"
            >
              <option value="">Todas las categorías</option>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={showOnlyBooked}
              onChange={(e) => setShowOnlyBooked(e.target.checked)}
              className="rounded"
            />
            Solo con reservas
          </label>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-50 border rounded" /> Libre</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-50 border rounded" /> Parcial</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-orange-100 border rounded" /> Bajo</span>
        <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-200 border rounded" /> Agotado</span>
        <span className="ml-4 text-gray-400">Número = unidades reservadas</span>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 p-2 text-left min-w-[200px] border-b border-r">
                Producto ({filteredProducts.length})
              </th>
              {daysInMonth.map((day) => {
                const isToday = day.getTime() === today.getTime();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <th
                    key={day.toISOString()}
                    className={`p-1 text-center border-b min-w-[32px] ${isToday ? 'bg-blue-100 font-bold' : ''} ${isWeekend ? 'bg-gray-100' : ''}`}
                  >
                    <div className="text-[10px] text-gray-400">
                      {day.toLocaleDateString('es-ES', { weekday: 'narrow' })}
                    </div>
                    <div className={isToday ? 'text-blue-700' : ''}>{day.getDate()}</div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50/50 group">
                <td className="sticky left-0 z-10 bg-white group-hover:bg-gray-50 p-2 border-b border-r">
                  <div className="font-medium text-gray-900 truncate max-w-[200px]" title={product.name}>
                    {product.name}
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1">
                    <span>{product.category}</span>
                    <span>·</span>
                    <span>Stock: {product.stock}</span>
                  </div>
                </td>
                {daysInMonth.map((day) => {
                  const reserved = getReservedOnDay(product, day);
                  const dayBookings = getBookingsForDay(product, day);
                  const isToday = day.getTime() === today.getTime();
                  const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                  return (
                    <td
                      key={day.toISOString()}
                      className={`p-0 border-b text-center relative ${getCellColor(product.stock, reserved)} ${isToday ? 'ring-2 ring-blue-400 ring-inset' : ''} ${isWeekend && reserved === 0 ? 'bg-gray-50' : ''}`}
                      title={
                        dayBookings.length > 0
                          ? dayBookings
                              .map(
                                (b) =>
                                  `${b.orderNumber} - ${b.contactPerson} (${b.quantity}u) [${b.status}]`
                              )
                              .join('\n')
                          : `${product.name}: ${product.stock} disponibles`
                      }
                    >
                      {reserved > 0 && (
                        <div className="flex flex-col items-center py-0.5">
                          <span className="font-bold text-[10px]">{reserved}</span>
                          <div className="flex gap-px mt-px">
                            {dayBookings.slice(0, 3).map((b, i) => (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full ${getStatusColor(b.status)}`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            No hay productos que coincidan con los filtros
          </div>
        )}
      </div>

      {/* Bookings detail for current month */}
      {data && data.products.some((p) => p.bookings.length > 0) && (
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Reservas este mes</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {data.products
              .flatMap((p) =>
                p.bookings.map((b) => ({
                  ...b,
                  productName: p.name,
                  productStock: p.stock,
                }))
              )
              .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
              .filter((b, i, arr) => arr.findIndex((x) => x.orderNumber === b.orderNumber && x.productName === b.productName) === i)
              .map((b, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 border"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 rounded-full ${getStatusColor(b.status)}`} />
                    <div>
                      <div className="font-medium text-sm">{b.productName}</div>
                      <div className="text-xs text-gray-500">
                        {b.contactPerson} · {b.eventType || 'Evento'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-mono">{b.orderNumber}</div>
                    <div className="text-xs text-gray-500">
                      {new Date(b.startDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                      {' → '}
                      {new Date(b.endDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                  <div className="text-center min-w-[60px]">
                    <div className="text-lg font-bold text-blue-600">{b.quantity}</div>
                    <div className="text-[10px] text-gray-400">uds</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentAvailabilityPage;

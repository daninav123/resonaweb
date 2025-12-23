import { useState, useEffect } from 'react';
import { ShoppingCart, Eye, Download, Filter, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { ResponsiveTableWrapper } from '../../components/admin/ResponsiveTableWrapper';

const OrdersManager = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState('all');

  // Obtener órdenes reales de la API
  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const response: any = await api.get('/orders?includeInstallments=true');
      return response.data;
    },
    refetchInterval: 30000, // Refrescar cada 30 segundos
  });

  const deleteOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar el pedido ${orderNumber}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await api.delete(`/orders/${orderId}`);
      toast.success('Pedido eliminado correctamente');
      refetch();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Error al eliminar el pedido');
    }
  };

  // Mapear las órdenes del backend al formato esperado
  const ordersData = (orders?.data || orders || []).map((order: any) => ({
    id: order.id, // UUID real para navegación
    orderNumber: order.orderNumber, // Número de orden para mostrar
    customer: order.user ? `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() : 'Cliente',
    email: order.user?.email || 'N/A',
    date: new Date(order.createdAt).toLocaleDateString('es-ES'),
    total: Number(order.totalAmount || order.total || 0),
    status: order.status?.toLowerCase() || 'pending',
    items: order.items?.length || 0,
    installments: order.installments || [],
    eligibleForInstallments: order.eligibleForInstallments || false,
  }));

  const getStatusBadge = (status: string) => {
    const badges = {
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    const labels = {
      completed: 'Completado',
      processing: 'En proceso',
      pending: 'Pendiente',
      cancelled: 'Cancelado',
    };
    return { class: badges[status as keyof typeof badges], label: labels[status as keyof typeof labels] };
  };

  const getPaymentStatus = (order: any) => {
    if (!order.eligibleForInstallments || !order.installments || order.installments.length === 0) {
      // Sin plazos, asumimos pago completo
      return {
        paid: order.total,
        total: order.total,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'Pagado'
      };
    }

    // Calcular pagado y pendiente
    const paid = order.installments
      .filter((i: any) => i.status === 'COMPLETED')
      .reduce((sum: number, i: any) => sum + Number(i.amount), 0);
    const total = order.installments
      .reduce((sum: number, i: any) => sum + Number(i.amount), 0);

    // Verificar si hay plazos vencidos
    const now = new Date();
    const hasOverdue = order.installments.some((i: any) => {
      if (i.status !== 'PENDING') return false;
      const dueDate = new Date(i.dueDate);
      return dueDate < now;
    });

    // Todo pagado
    if (paid >= total) {
      return {
        paid,
        total,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        label: 'Completo'
      };
    }

    // Plazos vencidos
    if (hasOverdue) {
      return {
        paid,
        total,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        label: 'Vencido'
      };
    }

    // Pendiente en plazo
    return {
      paid,
      total,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      label: 'Pendiente'
    };
  };

  const filteredOrders = statusFilter === 'all'
    ? ordersData
    : ordersData.filter(o => o.status === statusFilter);

  // Mostrar estado de carga
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si hay
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-red-800 font-semibold mb-2">Error al cargar órdenes</h3>
          <p className="text-red-600">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
            <span className="text-sm text-gray-500">
              {ordersData.length} pedido{ordersData.length !== 1 ? 's' : ''} total{ordersData.length !== 1 ? 'es' : ''}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{ordersData.length}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-resona" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                €{ordersData.reduce((acc, o) => acc + Number(o.total || 0), 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Promedio/Pedido</p>
              <p className="text-2xl font-bold text-gray-900">
                €{ordersData.length > 0 
                  ? (ordersData.reduce((acc, o) => acc + Number(o.total || 0), 0) / ordersData.length).toFixed(2)
                  : '0.00'
                }
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {ordersData.filter(o => o.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrar por estado:</span>
            <div className="flex gap-2">
              {['all', 'pending', 'processing', 'completed', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-resona text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status === 'all' ? 'Todos' : getStatusBadge(status).label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <ResponsiveTableWrapper className="bg-white rounded-lg shadow">
          <table className="min-w-full w-full" style={{ minWidth: '800px' }}>
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID Pedido
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Items
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pagado/Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const paymentStatus = getPaymentStatus(order);
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customer}</div>
                      <div className="text-sm text-gray-500">{order.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {order.items} productos
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      €{order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`px-3 py-1 rounded-full text-xs font-semibold ${paymentStatus.bgColor} ${paymentStatus.color}`}>
                        €{paymentStatus.paid.toFixed(2)} / €{paymentStatus.total.toFixed(2)}
                      </div>
                      <div className={`text-xs mt-1 ${paymentStatus.color} font-medium`}>
                        {paymentStatus.label}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => navigate(`/admin/orders/${order.id}`)}
                        className="text-resona hover:text-resona-dark mr-3" 
                        title="Ver detalles"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => deleteOrder(order.id, order.orderNumber)}
                        className="text-red-600 hover:text-red-900 mr-3" 
                        title="Eliminar pedido"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={async () => {
                          try {
                            const { invoiceService } = await import('../../services/invoice.service');
                            toast.loading('Generando factura...');
                            
                            const response: any = await invoiceService.generateInvoice(order.id);
                            const invoice = response?.invoice || response;
                            
                            if (invoice?.id) {
                              const blob = await invoiceService.downloadInvoice(invoice.id);
                              const url = window.URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = `factura-${invoice.invoiceNumber || order.orderNumber}.pdf`;
                              document.body.appendChild(link);
                              link.click();
                              document.body.removeChild(link);
                              window.URL.revokeObjectURL(url);
                              
                              toast.dismiss();
                              toast.success('Factura descargada');
                            } else {
                              throw new Error('No se pudo generar la factura');
                            }
                          } catch (error: any) {
                            toast.dismiss();
                            toast.error(error?.message || 'Error al descargar factura');
                          }
                        }}
                        className="text-gray-600 hover:text-gray-900" 
                        title="Descargar factura"
                      >
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </ResponsiveTableWrapper>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow mt-6">
            <p className="text-gray-500">No hay pedidos con este estado</p>
          </div>
        )}

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Esta es una versión demo. Conecta con la API de pedidos para gestión completa.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrdersManager;

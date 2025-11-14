import { useState } from 'react';
import { ShoppingCart, Eye, Download, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

const OrdersManager = () => {
  const [statusFilter, setStatusFilter] = useState('all');

  const orders = [
    { id: '#ORD-12345', customer: 'Juan Pérez', email: 'juan@example.com', date: '13/11/2024', total: 234.50, status: 'completed', items: 3 },
    { id: '#ORD-12344', customer: 'María García', email: 'maria@example.com', date: '12/11/2024', total: 456.80, status: 'processing', items: 5 },
    { id: '#ORD-12343', customer: 'Pedro López', email: 'pedro@example.com', date: '11/11/2024', total: 789.00, status: 'pending', items: 2 },
    { id: '#ORD-12342', customer: 'Ana Martínez', email: 'ana@example.com', date: '10/11/2024', total: 345.60, status: 'completed', items: 4 },
    { id: '#ORD-12341', customer: 'Carlos Ruiz', email: 'carlos@example.com', date: '09/11/2024', total: 567.90, status: 'cancelled', items: 1 },
  ];

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

  const filteredOrders = statusFilter === 'all'
    ? orders
    : orders.filter(o => o.status === statusFilter);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin" className="text-resona hover:text-resona-dark mb-4 inline-block">
            ← Volver al Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Pedidos</h1>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <ShoppingCart className="w-10 h-10 text-resona" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">
                €{orders.reduce((acc, o) => acc + o.total, 0).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Promedio/Pedido</p>
              <p className="text-2xl font-bold text-gray-900">
                €{(orders.reduce((acc, o) => acc + o.total, 0) / orders.length).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div>
              <p className="text-sm text-gray-600">Completados</p>
              <p className="text-2xl font-bold text-gray-900">
                {orders.filter(o => o.status === 'completed').length}
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
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
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
                return (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id}
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
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusBadge.class}`}>
                        {statusBadge.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-resona hover:text-resona-dark mr-3" title="Ver detalles">
                        <Eye className="w-5 h-5" />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Descargar factura">
                        <Download className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

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

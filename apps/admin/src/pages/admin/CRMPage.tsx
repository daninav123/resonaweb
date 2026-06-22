import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Search, Star, Phone, Mail, Calendar, Tag, TrendingUp,
  ChevronRight, Loader2, Filter, ArrowUpDown, Building2, Clock,
  MessageSquare, CheckCircle2, AlertTriangle, BarChart3, RefreshCw,
} from 'lucide-react';
import { crmService } from '../../services/crm.service';
import toast from 'react-hot-toast';

// ============= TYPES =============
interface Customer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  customerType: string | null;
  tags: string[];
  scoring: number;
  source: string | null;
  lastContactDate: string | null;
  nextFollowUp: string | null;
  assignedTo: string | null;
  crmNotes: string | null;
  createdAt: string;
  lastLoginAt: string | null;
  billingData: { companyName: string | null; taxId: string | null; city: string | null } | null;
  _count: { orders: number; customerCommunications: number; customerTasks: number };
  totalSpent: number;
  orderCount: number;
  avgTicket: number;
}

// ============= HELPERS =============
const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

const SCORING_COLORS = (score: number) => {
  if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700', label: 'Top' };
  if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Alto' };
  if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medio' };
  if (score >= 20) return { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bajo' };
  return { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Nuevo' };
};

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  particular: { label: 'Particular', icon: Users, color: 'text-blue-600' },
  empresa: { label: 'Empresa', icon: Building2, color: 'text-purple-600' },
  agencia: { label: 'Agencia', icon: Building2, color: 'text-indigo-600' },
  venue: { label: 'Venue', icon: Building2, color: 'text-teal-600' },
};

// ============= MAIN COMPONENT =============
const CRMPage = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [sortBy, setSortBy] = useState('');

  const loadCustomers = async (page = 1) => {
    try {
      setLoading(true);
      const result: any = await crmService.listCustomers({
        page, limit: 20,
        search: search || undefined,
        customerType: typeFilter || undefined,
        sortBy: sortBy || undefined,
      });
      setCustomers(result.data || []);
      setPagination(result.pagination || { page: 1, limit: 20, total: 0, totalPages: 0 });
    } catch (error) {
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try { const s = await crmService.getStats(); setStats(s); } catch { /* ignore */ }
  };

  useEffect(() => { loadCustomers(); loadStats(); }, []);
  useEffect(() => { const t = setTimeout(() => loadCustomers(), 300); return () => clearTimeout(t); }, [search, typeFilter, sortBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">CRM de Clientes</h1>
          <p className="text-gray-500 mt-1">{pagination.total} clientes registrados</p>
        </div>
        <button onClick={() => { loadCustomers(); loadStats(); }} className="inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-600 bg-white border rounded-lg hover:bg-gray-50">
          <RefreshCw className="w-4 h-4" /> Actualizar
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Users} label="Total clientes" value={stats.totalClients} color="blue" />
          <StatCard icon={Calendar} label="Follow-ups hoy" value={stats.followUpsToday} color="orange" />
          <StatCard icon={CheckCircle2} label="Tareas pendientes" value={stats.pendingTasks} color="red" />
          <StatCard icon={Star} label="Top clientes" value={stats.topCustomers?.length || 0} color="green" />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, email, teléfono..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-resona/20 focus:border-resona" />
          </div>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">Todos los tipos</option>
            <option value="particular">Particular</option>
            <option value="empresa">Empresa</option>
            <option value="agencia">Agencia</option>
            <option value="venue">Venue</option>
          </select>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
            <option value="">Más recientes</option>
            <option value="scoring">Mayor scoring</option>
            <option value="name">Nombre A-Z</option>
            <option value="lastContact">Último contacto</option>
          </select>
        </div>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-resona" />
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay clientes</p>
        </div>
      ) : (
        <div className="space-y-2">
          {customers.map(customer => {
            const sc = SCORING_COLORS(customer.scoring);
            const typeConf = TYPE_CONFIG[customer.customerType || ''];
            const needsFollowUp = customer.nextFollowUp && new Date(customer.nextFollowUp) <= new Date();
            return (
              <div key={customer.id}
                onClick={() => navigate(`/admin/crm/${customer.id}`)}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:border-resona/30 hover:shadow-sm transition-all cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${sc.bg} ${sc.text} flex-shrink-0`}>
                      {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <h3 className="font-semibold text-gray-900">{customer.firstName} {customer.lastName}</h3>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${sc.bg} ${sc.text}`}>{customer.scoring}pts</span>
                        {typeConf && <span className={`text-xs ${typeConf.color}`}>{typeConf.label}</span>}
                        {needsFollowUp && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-orange-100 text-orange-700 rounded text-xs">
                            <Clock className="w-3 h-3" /> Follow-up
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {customer.email}</span>
                        {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {customer.phone}</span>}
                        {customer.billingData?.city && <span>{customer.billingData.city}</span>}
                        {customer.billingData?.companyName && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {customer.billingData.companyName}</span>}
                      </div>
                      {customer.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {customer.tags.map(tag => (
                            <span key={tag} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 space-y-1">
                    <p className="font-semibold text-gray-900">{formatCurrency(customer.totalSpent)}</p>
                    <p className="text-xs text-gray-400">{customer.orderCount} pedidos · Ø {formatCurrency(customer.avgTicket)}</p>
                    {customer.lastContactDate && (
                      <p className="text-xs text-gray-400">Último contacto: {formatDate(customer.lastContactDate)}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(pagination.totalPages, 10) }, (_, i) => i + 1).map(page => (
            <button key={page} onClick={() => loadCustomers(page)}
              className={`px-3 py-1.5 rounded-lg text-sm ${page === pagination.page ? 'bg-resona text-white' : 'bg-white text-gray-600 border hover:bg-gray-50'}`}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ============= STAT CARD =============
const StatCard = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) => {
  const colors: Record<string, string> = {
    blue: 'text-blue-600', green: 'text-green-600', orange: 'text-orange-600', red: 'text-red-600',
  };
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`w-4 h-4 ${colors[color] || 'text-gray-500'}`} />
        <p className="text-sm text-gray-500">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${colors[color] || 'text-gray-900'}`}>{value}</p>
    </div>
  );
};

export default CRMPage;

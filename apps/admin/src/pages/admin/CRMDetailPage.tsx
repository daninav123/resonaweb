import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, Calendar, Star, Tag, Clock,
  MessageSquare, CheckCircle2, Circle, Plus, Trash2, Loader2,
  DollarSign, ShoppingCart, FileText, Users, Edit, Save, X, RefreshCw,
  PhoneCall, MessageCircle, Video, StickyNote,
} from 'lucide-react';
import { crmService } from '../../services/crm.service';
import toast from 'react-hot-toast';

const formatCurrency = (n: number) => `${n.toLocaleString('es-ES', { minimumFractionDigits: 2 })} €`;
const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
const formatDateTime = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });

const SCORING_COLORS = (score: number) => {
  if (score >= 80) return { bg: 'bg-green-100', text: 'text-green-700' };
  if (score >= 60) return { bg: 'bg-blue-100', text: 'text-blue-700' };
  if (score >= 40) return { bg: 'bg-yellow-100', text: 'text-yellow-700' };
  if (score >= 20) return { bg: 'bg-orange-100', text: 'text-orange-700' };
  return { bg: 'bg-gray-100', text: 'text-gray-500' };
};

const COMM_ICONS: Record<string, any> = {
  llamada: PhoneCall, email: Mail, whatsapp: MessageCircle,
  reunion: Video, nota: StickyNote,
};

const TABS = [
  { id: 'resumen', label: 'Resumen' },
  { id: 'historial', label: 'Historial' },
  { id: 'comunicaciones', label: 'Comunicaciones' },
  { id: 'tareas', label: 'Tareas' },
];

const CRMDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resumen');
  const [editingCRM, setEditingCRM] = useState(false);
  const [crmForm, setCrmForm] = useState({ customerType: '', tags: '', source: '', nextFollowUp: '', assignedTo: '', crmNotes: '' });

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await crmService.getCustomerProfile(id);
      setCustomer(data);
      setCrmForm({
        customerType: (data as any).customerType || '',
        tags: (data as any).tags?.join(', ') || '',
        source: (data as any).source || '',
        nextFollowUp: (data as any).nextFollowUp ? new Date((data as any).nextFollowUp).toISOString().slice(0, 16) : '',
        assignedTo: (data as any).assignedTo || '',
        crmNotes: (data as any).crmNotes || '',
      });
    } catch { toast.error('Error al cargar cliente'); navigate('/admin/crm'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  const handleSaveCRM = async () => {
    if (!id) return;
    try {
      await crmService.updateCRM(id, {
        customerType: crmForm.customerType || null,
        tags: crmForm.tags ? crmForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        source: crmForm.source || null,
        nextFollowUp: crmForm.nextFollowUp || null,
        assignedTo: crmForm.assignedTo || null,
        crmNotes: crmForm.crmNotes || null,
      });
      toast.success('Datos CRM actualizados');
      setEditingCRM(false);
      load();
    } catch { toast.error('Error al actualizar'); }
  };

  const handleRecalculate = async () => {
    if (!id) return;
    try {
      await crmService.recalculateScoring(id);
      toast.success('Scoring recalculado');
      load();
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="w-8 h-8 animate-spin text-resona" /></div>;
  if (!customer) return null;

  const sc = SCORING_COLORS(customer.scoring);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link to="/admin/crm" className="p-2 rounded-lg hover:bg-gray-100 mt-1"><ArrowLeft className="w-5 h-5 text-gray-500" /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${sc.bg} ${sc.text}`}>
              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{customer.firstName} {customer.lastName}</h1>
              <div className="flex items-center gap-3 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {customer.email}</span>
                {customer.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {customer.phone}</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${sc.bg} ${sc.text}`}>
            <Star className="w-4 h-4 inline mr-1" />{customer.scoring} pts
          </span>
          <button onClick={handleRecalculate} className="p-2 rounded-lg hover:bg-gray-100" title="Recalcular scoring">
            <RefreshCw className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <MiniStat label="Total gastado" value={formatCurrency(customer.stats.totalSpent)} />
        <MiniStat label="Pedidos" value={String(customer.stats.orderCount)} />
        <MiniStat label="Ticket medio" value={formatCurrency(customer.stats.avgTicket)} />
        <MiniStat label="Cliente desde" value={`${customer.stats.daysSinceRegistration}d`} />
        <MiniStat label="Tareas pend." value={String(customer.stats.pendingTasks)} highlight={customer.stats.pendingTasks > 0} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-100 flex overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors
                ${activeTab === tab.id ? 'border-resona text-resona' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {activeTab === 'resumen' && (
            <TabResumen customer={customer} editingCRM={editingCRM} setEditingCRM={setEditingCRM}
              crmForm={crmForm} setCrmForm={setCrmForm} onSave={handleSaveCRM} />
          )}
          {activeTab === 'historial' && <TabHistorial customer={customer} />}
          {activeTab === 'comunicaciones' && <TabCommunications customer={customer} onRefresh={load} />}
          {activeTab === 'tareas' && <TabTasks customer={customer} onRefresh={load} />}
        </div>
      </div>
    </div>
  );
};

// ============= TAB RESUMEN =============
const TabResumen = ({ customer, editingCRM, setEditingCRM, crmForm, setCrmForm, onSave }: any) => (
  <div className="grid md:grid-cols-2 gap-6">
    <div className="space-y-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold text-gray-700">Datos CRM</h4>
          <button onClick={() => editingCRM ? onSave() : setEditingCRM(true)}
            className="text-xs text-resona hover:underline flex items-center gap-1">
            {editingCRM ? <><Save className="w-3 h-3" /> Guardar</> : <><Edit className="w-3 h-3" /> Editar</>}
          </button>
        </div>
        {editingCRM ? (
          <div className="space-y-2">
            <select value={crmForm.customerType} onChange={e => setCrmForm((p: any) => ({ ...p, customerType: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Tipo de cliente</option>
              <option value="particular">Particular</option>
              <option value="empresa">Empresa</option>
              <option value="agencia">Agencia</option>
              <option value="venue">Venue</option>
            </select>
            <input type="text" value={crmForm.tags} onChange={e => setCrmForm((p: any) => ({ ...p, tags: e.target.value }))} placeholder="Tags (separados por coma)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={crmForm.source} onChange={e => setCrmForm((p: any) => ({ ...p, source: e.target.value }))} placeholder="Origen (web, referido, redes...)" className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="datetime-local" value={crmForm.nextFollowUp} onChange={e => setCrmForm((p: any) => ({ ...p, nextFollowUp: e.target.value }))} className="w-full px-3 py-2 border rounded-lg text-sm" />
            <input type="text" value={crmForm.assignedTo} onChange={e => setCrmForm((p: any) => ({ ...p, assignedTo: e.target.value }))} placeholder="Asignado a..." className="w-full px-3 py-2 border rounded-lg text-sm" />
            <textarea value={crmForm.crmNotes} onChange={e => setCrmForm((p: any) => ({ ...p, crmNotes: e.target.value }))} rows={3} placeholder="Notas CRM internas..." className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
            <button onClick={() => setEditingCRM(false)} className="text-xs text-gray-500 hover:underline">Cancelar</button>
          </div>
        ) : (
          <div className="space-y-1.5 text-sm">
            <p><span className="text-gray-500 w-28 inline-block">Tipo:</span> {customer.customerType || '—'}</p>
            <p><span className="text-gray-500 w-28 inline-block">Origen:</span> {customer.source || '—'}</p>
            <p><span className="text-gray-500 w-28 inline-block">Asignado:</span> {customer.assignedTo || '—'}</p>
            <p><span className="text-gray-500 w-28 inline-block">Follow-up:</span> {customer.nextFollowUp ? formatDateTime(customer.nextFollowUp) : '—'}</p>
            {customer.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {customer.tags.map((t: string) => <span key={t} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">{t}</span>)}
              </div>
            )}
            {customer.crmNotes && <p className="text-gray-600 mt-2 p-2 bg-yellow-50 rounded text-xs">{customer.crmNotes}</p>}
          </div>
        )}
      </div>
      {customer.billingData && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Datos fiscales</h4>
          <div className="text-sm space-y-1">
            {customer.billingData.companyName && <p><span className="text-gray-500 w-28 inline-block">Empresa:</span> {customer.billingData.companyName}</p>}
            <p><span className="text-gray-500 w-28 inline-block">NIF/CIF:</span> {customer.billingData.taxId}</p>
            <p><span className="text-gray-500 w-28 inline-block">Ciudad:</span> {customer.billingData.city}</p>
          </div>
        </div>
      )}
    </div>
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Últimos pedidos</h4>
        {customer.orders?.length > 0 ? (
          <div className="space-y-1.5">
            {customer.orders.slice(0, 5).map((o: any) => (
              <Link key={o.id} to={`/admin/orders/${o.id}`} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-sm">
                <div>
                  <span className="font-mono text-xs text-gray-400">{o.orderNumber}</span>
                  <span className={`ml-2 px-1.5 py-0.5 rounded text-xs ${o.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : o.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {o.status}
                  </span>
                </div>
                <span className="font-medium">{formatCurrency(Number(o.total))}</span>
              </Link>
            ))}
          </div>
        ) : <p className="text-sm text-gray-400">Sin pedidos</p>}
      </div>
      {customer.budgets?.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Presupuestos</h4>
          <div className="space-y-1.5">
            {customer.budgets.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 text-sm">
                <span className="font-mono text-xs text-gray-400">{b.budgetNumber}</span>
                <span className="font-medium">{formatCurrency(Number(b.total))}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

// ============= TAB HISTORIAL =============
const TabHistorial = ({ customer }: { customer: any }) => {
  const allItems: any[] = [
    ...(customer.orders || []).map((o: any) => ({ ...o, _type: 'order', _date: o.createdAt })),
    ...(customer.customerCommunications || []).map((c: any) => ({ ...c, _type: 'comm', _date: c.createdAt })),
    ...(customer.customerNotes || []).map((n: any) => ({ ...n, _type: 'note', _date: n.createdAt })),
  ].sort((a, b) => new Date(b._date).getTime() - new Date(a._date).getTime());

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-gray-900">Timeline unificado</h3>
      {allItems.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">Sin actividad</p> : (
        <div className="space-y-2">
          {allItems.map((item, i) => (
            <div key={`${item._type}-${item.id || i}`} className="flex gap-3 p-3 bg-white border border-gray-100 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                ${item._type === 'order' ? 'bg-blue-100' : item._type === 'comm' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                {item._type === 'order' ? <ShoppingCart className="w-4 h-4 text-blue-600" /> :
                 item._type === 'comm' ? <MessageSquare className="w-4 h-4 text-green-600" /> :
                 <StickyNote className="w-4 h-4 text-yellow-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    {item._type === 'order' ? `Pedido ${item.orderNumber}` :
                     item._type === 'comm' ? `${item.type} - ${item.subject || 'Sin asunto'}` :
                     'Nota'}
                  </p>
                  <span className="text-xs text-gray-400">{formatDateTime(item._date)}</span>
                </div>
                {item._type === 'order' && <p className="text-xs text-gray-500">{formatCurrency(Number(item.total))} · {item.status}</p>}
                {item._type === 'comm' && <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>}
                {item._type === 'note' && <p className="text-xs text-gray-500 line-clamp-2">{item.content}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============= TAB COMUNICACIONES =============
const TabCommunications = ({ customer, onRefresh }: { customer: any; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'llamada', direction: 'saliente', subject: '', content: '', outcome: '', duration: '' });

  const handleAdd = async () => {
    if (!form.content) { toast.error('El contenido es obligatorio'); return; }
    try {
      await crmService.addCommunication(customer.id, {
        ...form, duration: form.duration ? parseInt(form.duration) : undefined,
      });
      toast.success('Comunicación registrada');
      setShowForm(false);
      setForm({ type: 'llamada', direction: 'saliente', subject: '', content: '', outcome: '', duration: '' });
      onRefresh();
    } catch { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Comunicaciones</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-resona hover:underline flex items-center gap-1">
          <Plus className="w-4 h-4" /> Registrar
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="llamada">Llamada</option>
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="reunion">Reunión</option>
              <option value="nota">Nota</option>
            </select>
            <select value={form.direction} onChange={e => setForm(p => ({ ...p, direction: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="saliente">Saliente</option>
              <option value="entrante">Entrante</option>
            </select>
            <select value={form.outcome} onChange={e => setForm(p => ({ ...p, outcome: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="">Resultado</option>
              <option value="contactado">Contactado</option>
              <option value="buzon">Buzón</option>
              <option value="no_contesta">No contesta</option>
              <option value="reunido">Reunido</option>
              <option value="cerrado">Cerrado</option>
            </select>
            <input type="number" value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="Min." className="px-3 py-2 border rounded-lg text-sm" />
          </div>
          <input type="text" value={form.subject} onChange={e => setForm(p => ({ ...p, subject: e.target.value }))} placeholder="Asunto" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={3} placeholder="Contenido de la comunicación..." className="w-full px-3 py-2 border rounded-lg text-sm resize-none" />
          <div className="flex gap-2">
            <button onClick={handleAdd} className="px-3 py-1.5 text-sm bg-resona text-white rounded-lg">Guardar</button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 text-sm text-gray-500">Cancelar</button>
          </div>
        </div>
      )}
      <div className="space-y-2">
        {(customer.customerCommunications || []).map((comm: any) => {
          const Icon = COMM_ICONS[comm.type] || MessageSquare;
          return (
            <div key={comm.id} className="p-3 bg-white border border-gray-100 rounded-lg">
              <div className="flex items-start gap-2">
                <Icon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-medium text-gray-900">{comm.type} {comm.direction === 'entrante' ? '←' : '→'} {comm.subject || ''}</span>
                    <span className="text-xs text-gray-400">{formatDateTime(comm.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-600">{comm.content}</p>
                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                    {comm.outcome && <span>Resultado: {comm.outcome}</span>}
                    {comm.duration && <span>· {comm.duration} min</span>}
                    <span>· {comm.authorName}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {(customer.customerCommunications || []).length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin comunicaciones</p>}
      </div>
    </div>
  );
};

// ============= TAB TAREAS =============
const TabTasks = ({ customer, onRefresh }: { customer: any; onRefresh: () => void }) => {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', dueDate: '', priority: 'medium' });

  const handleAdd = async () => {
    if (!form.title) return;
    try {
      await crmService.addTask(customer.id, form);
      toast.success('Tarea creada');
      setShowForm(false);
      setForm({ title: '', description: '', dueDate: '', priority: 'medium' });
      onRefresh();
    } catch { toast.error('Error'); }
  };

  const handleToggle = async (taskId: string) => {
    try { await crmService.toggleTask(customer.id, taskId); onRefresh(); } catch { toast.error('Error'); }
  };

  const handleDelete = async (taskId: string) => {
    try { await crmService.deleteTask(customer.id, taskId); onRefresh(); } catch { toast.error('Error'); }
  };

  const pending = (customer.customerTasks || []).filter((t: any) => !t.completed);
  const completed = (customer.customerTasks || []).filter((t: any) => t.completed);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Tareas ({pending.length} pendientes)</h3>
        <button onClick={() => setShowForm(!showForm)} className="text-sm text-resona hover:underline flex items-center gap-1">
          <Plus className="w-4 h-4" /> Nueva tarea
        </button>
      </div>
      {showForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="Título de la tarea" className="w-full px-3 py-2 border rounded-lg text-sm" />
          <div className="grid grid-cols-2 gap-3">
            <input type="datetime-local" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm" />
            <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="px-3 py-2 border rounded-lg text-sm bg-white">
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>
          <button onClick={handleAdd} className="px-3 py-1.5 text-sm bg-resona text-white rounded-lg">Crear</button>
        </div>
      )}
      {pending.length > 0 && (
        <div className="space-y-1.5 mb-4">
          {pending.map((task: any) => (
            <div key={task.id} className="flex items-center gap-2 p-2 bg-white border border-gray-100 rounded-lg">
              <button onClick={() => handleToggle(task.id)}><Circle className="w-5 h-5 text-gray-300" /></button>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{task.title}</p>
                <div className="text-xs text-gray-400">
                  {task.dueDate && <span>Vence: {formatDate(task.dueDate)}</span>}
                  <span className={`ml-2 ${task.priority === 'high' ? 'text-red-500' : task.priority === 'medium' ? 'text-yellow-600' : 'text-gray-400'}`}>{task.priority}</span>
                </div>
              </div>
              <button onClick={() => handleDelete(task.id)} className="p-1 text-gray-300 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          ))}
        </div>
      )}
      {completed.length > 0 && (
        <div>
          <p className="text-xs text-gray-400 mb-2">Completadas ({completed.length})</p>
          <div className="space-y-1">
            {completed.slice(0, 5).map((task: any) => (
              <div key={task.id} className="flex items-center gap-2 p-2 opacity-60">
                <button onClick={() => handleToggle(task.id)}><CheckCircle2 className="w-5 h-5 text-green-500" /></button>
                <span className="text-sm text-gray-400 line-through">{task.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {pending.length === 0 && completed.length === 0 && <p className="text-sm text-gray-400 text-center py-4">Sin tareas</p>}
    </div>
  );
};

// ============= HELPERS =============
const MiniStat = ({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) => (
  <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-lg font-bold ${highlight ? 'text-red-600' : 'text-gray-900'}`}>{value}</p>
  </div>
);

export default CRMDetailPage;

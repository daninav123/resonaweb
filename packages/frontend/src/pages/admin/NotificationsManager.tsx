import { useState, useEffect } from 'react';
import { Bell, Send, Clock, CheckCircle, Mail, AlertTriangle, RefreshCw, Search, Filter, ChevronDown, ChevronUp, Users } from 'lucide-react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';

const formatDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

const TYPE_CONFIG: Record<string, { label: string; icon: string; color: string }> = {
  order_confirmation: { label: 'Confirmación pedido', icon: '📦', color: 'bg-blue-100 text-blue-700' },
  payment_received: { label: 'Pago recibido', icon: '💰', color: 'bg-green-100 text-green-700' },
  order_ready: { label: 'Pedido listo', icon: '✅', color: 'bg-emerald-100 text-emerald-700' },
  order_delivered: { label: 'Pedido entregado', icon: '🚚', color: 'bg-purple-100 text-purple-700' },
  event_reminder: { label: 'Recordatorio evento', icon: '⏰', color: 'bg-orange-100 text-orange-700' },
  invoice_sent: { label: 'Factura enviada', icon: '📄', color: 'bg-indigo-100 text-indigo-700' },
  welcome: { label: 'Bienvenida', icon: '👋', color: 'bg-pink-100 text-pink-700' },
  custom: { label: 'Personalizado', icon: '✉️', color: 'bg-gray-100 text-gray-700' },
};

const NotificationsManager = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [showSendForm, setShowSendForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, read: 0, unread: 0, emailSent: 0 });
  const [sendForm, setSendForm] = useState({ to: '', subject: '', message: '', type: 'custom' });
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const res: any = await api.get('/notifications/admin', { params: { limit: 100, search: search || undefined, type: typeFilter || undefined } });
      const data = res.data || res;
      const notifs = data.notifications || data.data || data || [];
      setNotifications(Array.isArray(notifs) ? notifs : []);

      const total = notifs.length;
      const read = notifs.filter((n: any) => n.read).length;
      setStats({ total, read, unread: total - read, emailSent: notifs.filter((n: any) => n.emailSent).length });
    } catch {
      // Si no hay endpoint admin, intentar cargar desde otro endpoint
      try {
        const res: any = await api.get('/notifications');
        const data = res.data || res;
        const notifs = data.notifications || data.data || data || [];
        setNotifications(Array.isArray(notifs) ? notifs : []);
      } catch {
        setNotifications([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmail = async () => {
    if (!sendForm.to || !sendForm.subject || !sendForm.message) {
      toast.error('Completa todos los campos');
      return;
    }
    setSending(true);
    try {
      await api.post('/notifications/send-email', {
        to: sendForm.to,
        subject: sendForm.subject,
        html: sendForm.message,
      });
      toast.success('Email enviado');
      setShowSendForm(false);
      setSendForm({ to: '', subject: '', message: '', type: 'custom' });
      loadData();
    } catch {
      toast.error('Error al enviar email');
    } finally {
      setSending(false);
    }
  };

  const EMAIL_TEMPLATES = [
    {
      name: 'Recordatorio de evento',
      subject: 'Recordatorio: Tu evento con Resona Events',
      message: `<h2>Recordatorio de evento</h2>
<p>Hola [NOMBRE],</p>
<p>Te recordamos que tu evento está programado para <strong>[FECHA]</strong> en <strong>[LUGAR]</strong>.</p>
<p><strong>Detalles importantes:</strong></p>
<ul>
<li>Hora de montaje: [HORA_MONTAJE]</li>
<li>Hora de inicio del evento: [HORA_INICIO]</li>
<li>Contacto técnico: [TELEFONO]</li>
</ul>
<p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
<p>Un saludo,<br/>Equipo Resona Events</p>`,
    },
    {
      name: 'Confirmación de reserva',
      subject: 'Confirmación de reserva - Resona Events',
      message: `<h2>Reserva confirmada</h2>
<p>Hola [NOMBRE],</p>
<p>Confirmamos tu reserva con el número <strong>[NUMERO_PEDIDO]</strong>.</p>
<p><strong>Resumen:</strong></p>
<ul>
<li>Fecha: [FECHA]</li>
<li>Equipos: [EQUIPOS]</li>
<li>Total: [TOTAL]€</li>
</ul>
<p>Gracias por confiar en Resona Events.</p>`,
    },
    {
      name: 'Agradecimiento post-evento',
      subject: 'Gracias por confiar en Resona Events',
      message: `<h2>¡Gracias!</h2>
<p>Hola [NOMBRE],</p>
<p>Esperamos que tu evento haya sido todo un éxito.</p>
<p>Nos encantaría conocer tu opinión. ¿Podrías dedicarnos un minuto para valorar nuestro servicio?</p>
<p>Si necesitas nuestros servicios en el futuro, estaremos encantados de ayudarte.</p>
<p>Un saludo,<br/>Equipo Resona Events</p>`,
    },
  ];

  const applyEmailTemplate = (template: typeof EMAIL_TEMPLATES[0]) => {
    setSendForm((p) => ({ ...p, subject: template.subject, message: template.message }));
    toast.success(`Plantilla "${template.name}" aplicada`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-blue-600" />
            Notificaciones y Emails
          </h1>
          <p className="text-gray-500 mt-1">Historial y envío de comunicaciones</p>
        </div>
        <div className="flex gap-2">
          <button onClick={loadData} className="p-2 rounded-lg border hover:bg-gray-50">
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowSendForm(!showSendForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" /> Enviar email
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1"><Bell className="w-4 h-4" /> Total</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Leídas</div>
          <div className="text-2xl font-bold text-green-600">{stats.read}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1"><Clock className="w-4 h-4" /> Sin leer</div>
          <div className="text-2xl font-bold text-orange-600">{stats.unread}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-500 flex items-center gap-1"><Mail className="w-4 h-4" /> Emails enviados</div>
          <div className="text-2xl font-bold text-blue-600">{stats.emailSent}</div>
        </div>
      </div>

      {/* Send form */}
      {showSendForm && (
        <div className="bg-white rounded-lg shadow p-5 space-y-3">
          <h3 className="font-semibold text-gray-900">Enviar email</h3>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-gray-500 self-center">Plantillas:</span>
            {EMAIL_TEMPLATES.map((t, i) => (
              <button
                key={i}
                onClick={() => applyEmailTemplate(t)}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs hover:bg-blue-100"
              >
                {t.name}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              type="email"
              value={sendForm.to}
              onChange={(e) => setSendForm((p) => ({ ...p, to: e.target.value }))}
              placeholder="Email destinatario *"
              className="px-3 py-2 border rounded-lg text-sm"
            />
            <input
              type="text"
              value={sendForm.subject}
              onChange={(e) => setSendForm((p) => ({ ...p, subject: e.target.value }))}
              placeholder="Asunto *"
              className="px-3 py-2 border rounded-lg text-sm"
            />
          </div>
          <textarea
            value={sendForm.message}
            onChange={(e) => setSendForm((p) => ({ ...p, message: e.target.value }))}
            rows={8}
            placeholder="Mensaje (HTML)..."
            className="w-full px-3 py-2 border rounded-lg text-sm resize-none font-mono"
          />
          <div className="flex gap-2">
            <button
              onClick={handleSendEmail}
              disabled={sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:bg-blue-300"
            >
              {sending ? 'Enviando...' : 'Enviar'}
            </button>
            <button onClick={() => setShowSendForm(false)} className="px-4 py-2 text-gray-500 text-sm">
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        >
          <option value="">Todos los tipos</option>
          {Object.entries(TYPE_CONFIG).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <button onClick={loadData} className="px-4 py-2 bg-gray-100 rounded-lg text-sm hover:bg-gray-200">
          Filtrar
        </button>
      </div>

      {/* Notifications list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
          <Bell className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No hay notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n: any) => {
            const typeInfo = TYPE_CONFIG[n.type] || TYPE_CONFIG.custom;
            const isExpanded = expandedId === n.id;
            return (
              <div key={n.id} className="bg-white rounded-lg shadow overflow-hidden">
                <div
                  className={`flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 ${!n.read ? 'border-l-4 border-blue-500' : ''}`}
                  onClick={() => setExpandedId(isExpanded ? null : n.id)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{typeInfo.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{n.title}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {n.user ? `${n.user.firstName || ''} ${n.user.lastName || ''}`.trim() || n.user.email : 'Sistema'} · {formatDate(n.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {n.emailSent && <span title="Email enviado"><Mail className="w-3.5 h-3.5 text-green-500" /></span>}
                    {n.read ? (
                      <CheckCircle className="w-3.5 h-3.5 text-gray-400" />
                    ) : (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
                {isExpanded && (
                  <div className="border-t p-4 bg-gray-50">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{n.message}</p>
                    {n.data && (
                      <pre className="mt-2 text-xs text-gray-500 bg-white p-2 rounded border overflow-x-auto">
                        {JSON.stringify(n.data, null, 2)}
                      </pre>
                    )}
                    <div className="flex gap-4 mt-2 text-xs text-gray-400">
                      {n.readAt && <span>Leída: {formatDate(n.readAt)}</span>}
                      {n.emailSent && <span>Email enviado ✓</span>}
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

export default NotificationsManager;

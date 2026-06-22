import { useState, useEffect } from 'react';
import { api } from '@resona/api-client';
import { Mail, Send, Plus, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface Campaign { id: string; name: string; subject: string; body: string; status: string; recipients: number; sentAt?: string; createdAt: string; }

const TEMPLATES = [
  { name: 'Nuevo catálogo', subject: 'Descubre nuestro nuevo catálogo de equipos', body: '<h2>Nuevo catálogo disponible</h2><p>Hola {{nombre}},</p><p>Hemos actualizado nuestro catálogo con los últimos equipos de sonido e iluminación. Visita nuestra web para descubrir todas las novedades.</p><p>¡No dudes en contactarnos para cualquier consulta!</p><p>Un saludo,<br/>Equipo Resona</p>' },
  { name: 'Promoción temporada', subject: '¡Ofertas especiales de temporada!', body: '<h2>Ofertas especiales</h2><p>Hola {{nombre}},</p><p>Aprovecha nuestras ofertas de temporada con hasta un 20% de descuento en alquiler de equipos para tu próximo evento.</p><p>Oferta válida hasta fin de mes.</p><p>Un saludo,<br/>Equipo Resona</p>' },
  { name: 'Post-evento', subject: 'Gracias por confiar en nosotros', body: '<h2>¡Gracias!</h2><p>Hola {{nombre}},</p><p>Esperamos que tu evento haya sido un éxito. Nos encantaría saber tu opinión para seguir mejorando.</p><p>Si necesitas algo más, no dudes en contactarnos.</p><p>Un saludo,<br/>Equipo Resona</p>' },
  { name: 'Newsletter mensual', subject: 'Newsletter Resona - Novedades del mes', body: '<h2>Novedades del mes</h2><p>Hola {{nombre}},</p><p>Te traemos las novedades más destacadas de este mes:</p><ul><li>Nuevos equipos disponibles</li><li>Eventos realizados</li><li>Tips para tu evento</li></ul><p>Un saludo,<br/>Equipo Resona</p>' },
];

const EmailMarketingPage = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', subject: '', body: '', targetAudience: 'all' });
  const [preview, setPreview] = useState(false);
  const [contactCount, setContactCount] = useState(0);

  const loadCampaigns = async () => {
    try {
      const [campRes, crmRes]: any[] = await Promise.all([
        api.get('/email-campaigns'),
        api.get('/crm/customers?limit=1'),
      ]);
      setCampaigns(campRes?.data || []);
      setContactCount(crmRes?.pagination?.total || crmRes?.total || 0);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadCampaigns(); }, []);

  const handleSave = async () => {
    if (!form.subject || !form.body) { toast.error('Asunto y contenido obligatorios'); return; }
    try {
      if (editingId) {
        await api.patch(`/email-campaigns/${editingId}`, form);
        toast.success('Campaña actualizada');
      } else {
        await api.post('/email-campaigns', form);
        toast.success('Campaña creada como borrador');
      }
      setShowForm(false); setEditingId(null); loadCampaigns();
    } catch { toast.error('Error al guardar'); }
  };

  const handleSendCampaign = async () => {
    if (!form.subject || !form.body) { toast.error('Asunto y contenido obligatorios'); return; }
    if (!confirm(`¿Enviar campaña "${form.name}" a ${contactCount} contactos?`)) return;
    try {
      // Crear si no existe, luego enviar
      let campaignId = editingId;
      if (!campaignId) {
        const created: any = await api.post('/email-campaigns', form);
        campaignId = created?.id;
      }
      if (campaignId) {
        await api.post(`/email-campaigns/${campaignId}/send`);
        toast.success('Campaña enviada');
      }
      setShowForm(false); setEditingId(null); loadCampaigns();
    } catch { toast.error('Error al enviar'); }
  };

  const loadTemplate = (tpl: typeof TEMPLATES[0]) => {
    setForm({ ...form, name: tpl.name, subject: tpl.subject, body: tpl.body });
  };

  const STATUS_COLORS: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600', sent: 'bg-green-100 text-green-700', scheduled: 'bg-blue-100 text-blue-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Email Marketing</h1>
          <p className="text-gray-600">Gestiona campañas de email para tus clientes</p>
        </div>
        <button onClick={() => { setEditingId(null); setForm({ name: '', subject: '', body: '', targetAudience: 'all' }); setShowForm(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nueva Campaña
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Contactos disponibles</p>
          <p className="text-2xl font-bold text-blue-600">{contactCount}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Campañas enviadas</p>
          <p className="text-2xl font-bold text-green-600">{campaigns.filter(c => c.status === 'sent').length}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <p className="text-xs text-gray-500">Plantillas</p>
          <p className="text-2xl font-bold">{TEMPLATES.length}</p>
        </div>
      </div>

      {/* Campañas pasadas */}
      {campaigns.length > 0 && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Campaña</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Asunto</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Destinatarios</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Enviado</th>
            </tr></thead>
            <tbody className="divide-y">
              {campaigns.map(c => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-medium">{c.name}</td>
                  <td className="px-4 py-2 text-gray-600">{c.subject}</td>
                  <td className="px-4 py-2 text-right">{c.recipients}</td>
                  <td className="px-4 py-2 text-center"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status] || ''}`}>{c.status}</span></td>
                  <td className="px-4 py-2 text-xs text-gray-500">{c.sentAt ? new Date(c.sentAt).toLocaleString('es-ES') : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Plantillas rápidas */}
      <div>
        <h2 className="font-bold text-gray-800 mb-3">Plantillas disponibles</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {TEMPLATES.map((t, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium">{t.name}</p>
                <button onClick={() => { loadTemplate(t); setShowForm(true); }}
                  className="text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100">
                  Usar plantilla
                </button>
              </div>
              <p className="text-sm text-gray-500">{t.subject}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Modal crear campaña */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">{editingId ? 'Editar' : 'Nueva'} Campaña</h2>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500">Nombre de la campaña</label><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-3 py-2 border rounded" placeholder="Ej: Newsletter Julio 2025" /></div>
              <div><label className="text-xs text-gray-500">Asunto del email*</label><input value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs text-gray-500">Contenido (HTML)*</label>
                  <button onClick={() => setPreview(!preview)} className="text-xs text-blue-600 flex items-center gap-1"><Eye className="w-3 h-3" /> {preview ? 'Editar' : 'Vista previa'}</button>
                </div>
                {preview ? (
                  <div className="border rounded p-4 mt-1 prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: form.body.replace(/\{\{nombre\}\}/g, 'Cliente Demo') }} />
                ) : (
                  <textarea value={form.body} onChange={e => setForm({...form, body: e.target.value})} className="w-full px-3 py-2 border rounded font-mono text-sm" rows={10} />
                )}
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p className="font-medium mb-1">Variables disponibles:</p>
                <p className="text-xs"><code>{'{{nombre}}'}</code> - Nombre del contacto | <code>{'{{email}}'}</code> - Email | <code>{'{{empresa}}'}</code> - Empresa</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSendCampaign} className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Enviar a {contactCount} contactos</button>
              <button onClick={handleSave} className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 flex items-center gap-2"><Mail className="w-4 h-4" /> Guardar borrador</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailMarketingPage;

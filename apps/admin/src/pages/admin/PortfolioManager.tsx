import { useState, useEffect } from 'react';
import { api } from '@resona/api-client';
import { Plus, Edit, Trash2, Image, Eye, EyeOff, Calendar, MapPin, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface PortfolioItem {
  id: string; title: string; description: string; eventType: string; eventDate: string;
  venue?: string; images: string[]; featured: boolean; published: boolean; createdAt: string;
}

const EVENT_TYPES = ['Boda', 'Concierto', 'Corporativo', 'Festival', 'Conferencia', 'Feria', 'Fiesta privada', 'Otro'];

const PortfolioManager = () => {
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', description: '', eventType: '', eventDate: '', venue: '',
    images: '' as string, featured: false, published: false,
  });
  const [filter, setFilter] = useState('all');

  const loadItems = async () => {
    try {
      const res: any = await api.get('/portfolio?limit=100');
      setItems(res?.data || []);
    } catch { /* ignore */ }
  };

  useEffect(() => { loadItems(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.eventType) { toast.error('Título y tipo obligatorios'); return; }
    const images = form.images.split('\n').map(s => s.trim()).filter(Boolean);
    try {
      const payload = { ...form, images };
      if (editingId) {
        await api.patch(`/portfolio/${editingId}`, payload);
        toast.success('Actualizado');
      } else {
        await api.post('/portfolio', payload);
        toast.success('Añadido al portfolio');
      }
      setShowForm(false); setEditingId(null); loadItems();
    } catch { toast.error('Error al guardar'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar del portfolio?')) return;
    try { await api.delete(`/portfolio/${id}`); toast.success('Eliminado'); loadItems(); } catch { toast.error('Error'); }
  };

  const togglePublished = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    try { await api.patch(`/portfolio/${id}`, { published: !item.published }); loadItems(); } catch { toast.error('Error'); }
  };

  const toggleFeatured = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;
    try { await api.patch(`/portfolio/${id}`, { featured: !item.featured }); loadItems(); } catch { toast.error('Error'); }
  };

  const handleEdit = (item: PortfolioItem) => {
    setEditingId(item.id);
    setForm({
      title: item.title, description: item.description, eventType: item.eventType,
      eventDate: item.eventDate ? new Date(item.eventDate).toISOString().split('T')[0] : '',
      venue: item.venue || '', images: item.images.join('\n'),
      featured: item.featured, published: item.published,
    });
    setShowForm(true);
  };

  // Importar desde eventos completados
  const importFromEvents = async () => {
    try {
      const res: any = await api.get('/events?phase=CLOSED&limit=20');
      const events = Array.isArray(res) ? res : res?.data || res?.events || [];
      if (events.length === 0) { toast.error('No hay eventos completados'); return; }

      let imported = 0;
      for (const e of events) {
        if (items.some(i => i.title === e.name)) continue;
        try {
          await api.post('/portfolio', {
            title: e.name, description: e.briefing || '', eventType: e.eventType || 'Otro',
            eventDate: e.eventDate, venue: e.venueName || '', images: [],
            featured: false, published: false,
          });
          imported++;
        } catch { /* skip */ }
      }
      if (imported > 0) { loadItems(); toast.success(`${imported} eventos importados`); }
      else toast('Todos los eventos ya están en el portfolio');
    } catch { toast.error('Error importando eventos'); }
  };

  const filtered = filter === 'all' ? items : filter === 'published' ? items.filter(i => i.published) :
    filter === 'draft' ? items.filter(i => !i.published) : filter === 'featured' ? items.filter(i => i.featured) : items;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-gray-600">Galería de eventos realizados</p>
        </div>
        <div className="flex gap-2">
          <button onClick={importFromEvents} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
            <ExternalLink className="w-4 h-4" /> Importar eventos
          </button>
          <button onClick={() => { setEditingId(null); setForm({ title: '', description: '', eventType: '', eventDate: '', venue: '', images: '', featured: false, published: false }); setShowForm(true); }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="w-4 h-4" /> Añadir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Total</p><p className="text-2xl font-bold">{items.length}</p></div>
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Publicados</p><p className="text-2xl font-bold text-green-600">{items.filter(i => i.published).length}</p></div>
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Destacados</p><p className="text-2xl font-bold text-yellow-600">{items.filter(i => i.featured).length}</p></div>
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Con fotos</p><p className="text-2xl font-bold text-blue-600">{items.filter(i => i.images.length > 0).length}</p></div>
      </div>

      <div className="flex gap-2">
        {['all', 'published', 'draft', 'featured'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-sm rounded-lg ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {f === 'all' ? 'Todos' : f === 'published' ? 'Publicados' : f === 'draft' ? 'Borradores' : 'Destacados'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>Sin elementos en el portfolio</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(item => (
            <div key={item.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
              {item.images.length > 0 ? (
                <div className="h-48 bg-gray-200 relative">
                  <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover" onError={e => (e.target as any).style.display = 'none'} />
                  {item.images.length > 1 && <span className="absolute bottom-2 right-2 bg-black bg-opacity-60 text-white text-xs px-2 py-0.5 rounded">+{item.images.length - 1} fotos</span>}
                </div>
              ) : (
                <div className="h-48 bg-gray-100 flex items-center justify-center"><Image className="w-12 h-12 text-gray-300" /></div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-900 line-clamp-1">{item.title}</h3>
                  <div className="flex gap-1">
                    {item.featured && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">★</span>}
                    <span className={`text-xs px-1.5 py-0.5 rounded ${item.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {item.published ? 'Público' : 'Borrador'}
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description || 'Sin descripción'}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.eventDate ? new Date(item.eventDate).toLocaleDateString('es-ES') : '-'}</span>
                  {item.venue && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {item.venue}</span>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => togglePublished(item.id)} className="p-1.5 text-gray-400 hover:text-blue-600" title={item.published ? 'Ocultar' : 'Publicar'}>
                    {item.published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button onClick={() => toggleFeatured(item.id)} className={`p-1.5 ${item.featured ? 'text-yellow-500' : 'text-gray-400'} hover:text-yellow-600`} title="Destacar">★</button>
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(item.id)} className="p-1.5 text-gray-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold">{editingId ? 'Editar' : 'Nuevo'} elemento</h2>
            <div className="space-y-3">
              <div><label className="text-xs text-gray-500">Título*</label><input value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-gray-500">Tipo*</label><select value={form.eventType} onChange={e => setForm({...form, eventType: e.target.value})} className="w-full px-3 py-2 border rounded"><option value="">-</option>{EVENT_TYPES.map(t => <option key={t}>{t}</option>)}</select></div>
                <div><label className="text-xs text-gray-500">Fecha</label><input type="date" value={form.eventDate} onChange={e => setForm({...form, eventDate: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              </div>
              <div><label className="text-xs text-gray-500">Lugar</label><input value={form.venue} onChange={e => setForm({...form, venue: e.target.value})} className="w-full px-3 py-2 border rounded" /></div>
              <div><label className="text-xs text-gray-500">Descripción</label><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-3 py-2 border rounded" rows={3} /></div>
              <div><label className="text-xs text-gray-500">URLs de imágenes (una por línea)</label><textarea value={form.images} onChange={e => setForm({...form, images: e.target.value})} className="w-full px-3 py-2 border rounded font-mono text-xs" rows={4} placeholder="https://ejemplo.com/foto1.jpg" /></div>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.published} onChange={e => setForm({...form, published: e.target.checked})} /> Publicado</label>
                <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={e => setForm({...form, featured: e.target.checked})} /> Destacado</label>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSave} className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">Guardar</button>
              <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioManager;

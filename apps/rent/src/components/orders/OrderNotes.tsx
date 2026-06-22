import { useState, useEffect } from 'react';
import { MessageSquare, Send, Trash2, Edit2, Lock, User } from 'lucide-react';
import { orderNoteService, OrderNote } from '../../services/orderNote.service';
import toast from 'react-hot-toast';
import moment from 'moment';

interface OrderNotesProps {
  orderId: string;
  userRole: string;
}

export const OrderNotes = ({ orderId, userRole }: OrderNotesProps) => {
  const [notes, setNotes] = useState<OrderNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPERADMIN';

  useEffect(() => {
    loadNotes();
  }, [orderId]);

  const loadNotes = async () => {
    try {
      setLoading(true);
      const data = await orderNoteService.getNotesByOrder(orderId);
      setNotes(data.notes);
    } catch (error: any) {
      console.error('Error loading notes:', error);
      toast.error('Error al cargar notas');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newNote.trim()) {
      toast.error('Escribe un mensaje');
      return;
    }

    try {
      setSending(true);
      await orderNoteService.createNote(orderId, newNote, isInternal);
      setNewNote('');
      setIsInternal(false);
      toast.success('Nota añadida');
      loadNotes();
    } catch (error: any) {
      toast.error(error.message || 'Error al añadir nota');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!confirm('¿Eliminar esta nota?')) return;

    try {
      await orderNoteService.deleteNote(noteId);
      toast.success('Nota eliminada');
      loadNotes();
    } catch (error: any) {
      toast.error('Error al eliminar nota');
    }
  };

  const handleEdit = async (noteId: string) => {
    if (!editContent.trim()) return;

    try {
      await orderNoteService.updateNote(noteId, editContent);
      setEditingId(null);
      setEditContent('');
      toast.success('Nota actualizada');
      loadNotes();
    } catch (error: any) {
      toast.error('Error al actualizar nota');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-resona" />
        <h3 className="text-lg font-semibold">Notas y Comentarios</h3>
        <span className="text-sm text-gray-500">({notes.length})</span>
      </div>

      {/* Form para nueva nota */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Escribe una nota o comentario..."
          className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-resona focus:border-transparent"
          rows={3}
        />
        
        <div className="flex items-center justify-between mt-2">
          {isAdmin && (
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(e) => setIsInternal(e.target.checked)}
                className="rounded text-resona focus:ring-resona"
              />
              <Lock className="w-4 h-4" />
              Nota interna (solo admin)
            </label>
          )}
          
          <button
            type="submit"
            disabled={sending || !newNote.trim()}
            className="bg-resona text-white px-4 py-2 rounded-lg hover:bg-resona-dark transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Enviando...' : 'Añadir Nota'}
          </button>
        </div>
      </form>

      {/* Lista de notas */}
      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Cargando notas...</p>
        ) : notes.length === 0 ? (
          <p className="text-center text-gray-500">No hay notas todavía</p>
        ) : (
          notes.map((note) => (
            <div
              key={note.id}
              className={`border rounded-lg p-4 ${
                note.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">
                    {note.user.firstName} {note.user.lastName}
                  </span>
                  {note.user.role === 'ADMIN' || note.user.role === 'SUPERADMIN' ? (
                    <span className="text-xs bg-resona text-white px-2 py-0.5 rounded">Admin</span>
                  ) : null}
                  {note.isInternal && (
                    <span className="text-xs bg-yellow-500 text-white px-2 py-0.5 rounded flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Interna
                    </span>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">
                    {moment(note.createdAt).fromNow()}
                  </span>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(note.id);
                          setEditContent(note.content);
                        }}
                        className="text-gray-400 hover:text-resona"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              {editingId === note.id ? (
                <div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border border-gray-300 rounded p-2 mb-2"
                    rows={3}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(note.id)}
                      className="bg-resona text-white px-3 py-1 rounded text-sm"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditContent('');
                      }}
                      className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Save, ArrowLeft, Plus, Trash2, Edit, Package, FileText,
  Calendar, MapPin, Users, Mail, Phone, User, ChevronDown,
  ChevronUp, Calculator
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

interface BudgetSection {
  id?: string;
  name: string;
  description: string;
  order: number;
  items: BudgetItem[];
  subtotal: string;
}

interface BudgetItem {
  id?: string;
  productId?: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: string;
  total: string;
  isInternal: boolean;
}

interface BudgetFormData {
  title: string;
  description: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  eventType: string;
  eventDate: string;
  eventLocation: string;
  attendees: string;
  discount: string;
  validUntil: string;
  notes: string;
  termsAndConditions: string;
}

const BudgetEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === 'new';

  const [formData, setFormData] = useState<BudgetFormData>({
    title: '',
    description: '',
    clientName: '',
    clientEmail: '',
    clientPhone: '',
    eventType: '',
    eventDate: '',
    eventLocation: '',
    attendees: '',
    discount: '0',
    validUntil: '',
    notes: '',
    termsAndConditions: '',
  });

  const [sections, setSections] = useState<BudgetSection[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState<number | null>(null);

  // Cargar presupuesto existente
  const { data: budget, isLoading } = useQuery({
    queryKey: ['budget', id],
    queryFn: async () => {
      if (isNew) return null;
      const response: any = await api.get(`/budgets/${id}`);
      return response.data;
    },
    enabled: !isNew,
  });

  // Cargar productos
  const { data: products } = useQuery({
    queryKey: ['products-for-budget'],
    queryFn: async () => {
      const response: any = await api.get('/products?includeInactive=false');
      return response.products || [];
    },
  });

  useEffect(() => {
    if (budget) {
      setFormData({
        title: budget.title || '',
        description: budget.description || '',
        clientName: budget.clientName || '',
        clientEmail: budget.clientEmail || '',
        clientPhone: budget.clientPhone || '',
        eventType: budget.eventType || '',
        eventDate: budget.eventDate ? budget.eventDate.split('T')[0] : '',
        eventLocation: budget.eventLocation || '',
        attendees: budget.attendees?.toString() || '',
        discount: budget.discount || '0',
        validUntil: budget.validUntil ? budget.validUntil.split('T')[0] : '',
        notes: budget.notes || '',
        termsAndConditions: budget.termsAndConditions || '',
      });

      if (budget.sections) {
        setSections(budget.sections.map((s: any) => ({
          id: s.id,
          name: s.name,
          description: s.description || '',
          order: s.order,
          items: s.items || [],
          subtotal: s.subtotal,
        })));
      }
    }
  }, [budget]);

  // Guardar presupuesto
  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      if (isNew) {
        const response: any = await api.post('/budgets', data);
        return response.data;
      } else {
        const response: any = await api.put(`/budgets/${id}`, data);
        return response.data;
      }
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      toast.success(isNew ? 'Presupuesto creado' : 'Presupuesto guardado');
      
      if (isNew && response.id) {
        navigate(`/admin/budgets/${response.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'Error al guardar');
    },
  });

  // Agregar sección
  const addSectionMutation = useMutation({
    mutationFn: async (sectionData: any) => {
      const response = await api.post(`/budgets/${id}/sections`, sectionData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      toast.success('Sección agregada');
    },
  });

  // Agregar item
  const addItemMutation = useMutation({
    mutationFn: async ({ sectionId, itemData }: any) => {
      const response = await api.post(`/budgets/sections/${sectionId}/items`, itemData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      toast.success('Item agregado');
    },
  });

  // Eliminar item
  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      await api.delete(`/budgets/items/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budget', id] });
      toast.success('Item eliminado');
    },
  });

  const handleSave = () => {
    if (!formData.title || !formData.clientName || !formData.clientEmail) {
      toast.error('Completa los campos requeridos');
      return;
    }

    saveMutation.mutate(formData);
  };

  const handleAddSection = () => {
    const name = prompt('Nombre de la sección (ej: Sonorización, Iluminación):');
    if (!name) return;

    const description = prompt('Descripción para el cliente (opcional):') || '';

    if (isNew) {
      // Si es nuevo, agregar localmente
      setSections([
        ...sections,
        {
          name,
          description,
          order: sections.length,
          items: [],
          subtotal: '0',
        },
      ]);
    } else {
      // Si existe, guardar en BD
      addSectionMutation.mutate({ name, description, order: sections.length });
    }
  };

  const handleAddItem = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setShowProductModal(true);
  };

  const handleAddCustomItem = (sectionIndex: number) => {
    setCurrentSectionIndex(sectionIndex);
    setShowCustomItemModal(true);
  };

  const handleSaveCustomItem = (itemData: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    isInternal: boolean;
  }) => {
    const sectionIndex = currentSectionIndex;
    if (sectionIndex === null) return;

    const section = sections[sectionIndex];
    const total = (itemData.quantity * itemData.unitPrice).toFixed(2);

    const newItem = {
      name: itemData.name,
      description: itemData.description,
      quantity: itemData.quantity,
      unitPrice: itemData.unitPrice.toString(),
      total,
      isInternal: itemData.isInternal,
    };

    if (section.id) {
      // Si la sección existe en BD, guardar el item
      addItemMutation.mutate({ sectionId: section.id, itemData: newItem });
    } else {
      // Si es local, agregar al estado
      const newSections = [...sections];
      newSections[sectionIndex].items.push(newItem);
      setSections(newSections);
    }

    setShowCustomItemModal(false);
    setCurrentSectionIndex(null);
  };

  const handleSelectProduct = (product: any) => {
    const sectionIndex = currentSectionIndex;
    if (sectionIndex === null) return;

    const section = sections[sectionIndex];
    const quantity = parseInt(prompt('Cantidad:', '1') || '1');
    if (!quantity || quantity <= 0) return;

    const itemData = {
      productId: product.id,
      name: product.name,
      description: product.description || '',
      quantity,
      unitPrice: product.pricePerDay,
      isInternal: true, // Por defecto los items son internos
    };

    if (section.id) {
      // Si la sección existe en BD, guardar el item
      addItemMutation.mutate({ sectionId: section.id, itemData });
    } else {
      // Si es local, agregar al estado
      const newSections = [...sections];
      const total = (parseFloat(itemData.unitPrice) * quantity).toFixed(2);
      newSections[sectionIndex].items.push({
        ...itemData,
        total,
      });
      setSections(newSections);
    }

    setShowProductModal(false);
    setCurrentSectionIndex(null);
  };

  const handleDeleteItem = (sectionIndex: number, itemIndex: number) => {
    const section = sections[sectionIndex];
    const item = section.items[itemIndex];

    if (item.id) {
      // Si el item existe en BD, eliminarlo
      deleteItemMutation.mutate(item.id);
    } else {
      // Si es local, eliminar del estado
      const newSections = [...sections];
      newSections[sectionIndex].items.splice(itemIndex, 1);
      setSections(newSections);
    }
  };

  const toggleSection = (index: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedSections(newExpanded);
  };

  // Calcular totales
  const subtotal = sections.reduce(
    (sum, section) =>
      sum + section.items.reduce((s, item) => s + parseFloat(item.total || '0'), 0),
    0
  );
  const discount = parseFloat(formData.discount || '0');
  const subtotalAfterDiscount = subtotal - discount;
  const tax = subtotalAfterDiscount * 0.21;
  const total = subtotalAfterDiscount + tax;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-600">Cargando presupuesto...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/budgets')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isNew ? 'Nuevo Presupuesto' : `Editar: ${budget?.budgetNumber}`}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {isNew ? 'Crea un presupuesto profesional' : 'Modifica el presupuesto'}
              </p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={20} />
            {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulario Principal */}
          <div className="lg:col-span-2 space-y-6">
            {/* Información Básica */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FileText size={20} />
                Información Básica
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Título del Presupuesto *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ej: Boda Maria - 15 Junio"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descripción general del evento"
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <User size={20} />
                Información del Cliente
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del Cliente *
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Información del Evento */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar size={20} />
                Información del Evento
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Evento
                  </label>
                  <select
                    value={formData.eventType}
                    onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Boda">Boda</option>
                    <option value="Concierto">Concierto</option>
                    <option value="Evento Corporativo">Evento Corporativo</option>
                    <option value="Fiesta Privada">Fiesta Privada</option>
                    <option value="Conferencia">Conferencia</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha del Evento
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ubicación
                  </label>
                  <input
                    type="text"
                    value={formData.eventLocation}
                    onChange={(e) => setFormData({ ...formData, eventLocation: e.target.value })}
                    placeholder="Dirección completa del evento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Asistentes
                  </label>
                  <input
                    type="number"
                    value={formData.attendees}
                    onChange={(e) => setFormData({ ...formData, attendees: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Válido Hasta
                  </label>
                  <input
                    type="date"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Secciones del Presupuesto */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Package size={20} />
                  Secciones del Presupuesto
                </h2>
                <button
                  onClick={handleAddSection}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  <Plus size={16} />
                  Agregar Sección
                </button>
              </div>

              {sections.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package size={48} className="mx-auto mb-2 text-gray-400" />
                  <p>No hay secciones. Agrega una sección para empezar.</p>
                  <p className="text-sm mt-1">
                    Ej: Sonorización, Iluminación, Montaje
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sections.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border border-gray-200 rounded-lg">
                      <div
                        onClick={() => toggleSection(sectionIndex)}
                        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{section.name}</h3>
                          {section.description && (
                            <p className="text-sm text-gray-600 mt-0.5">{section.description}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {section.items.length} items • €
                            {section.items
                              .reduce((sum, item) => sum + parseFloat(item.total || '0'), 0)
                              .toFixed(2)}
                          </p>
                        </div>
                        {expandedSections.has(sectionIndex) ? (
                          <ChevronUp size={20} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-400" />
                        )}
                      </div>

                      {expandedSections.has(sectionIndex) && (
                        <div className="border-t border-gray-200 p-4 bg-gray-50">
                          <div className="flex gap-2 mb-3">
                            <button
                              onClick={() => handleAddItem(sectionIndex)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                              <Package size={16} />
                              Del Catálogo
                            </button>
                            <button
                              onClick={() => handleAddCustomItem(sectionIndex)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                            >
                              <Plus size={16} />
                              Item Personalizado
                            </button>
                          </div>

                          {section.items.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                              No hay items. Agrega productos o servicios.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {section.items.map((item, itemIndex) => (
                                <div
                                  key={itemIndex}
                                  className="flex items-center justify-between bg-white p-3 rounded border border-gray-200"
                                >
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium text-gray-900">{item.name}</span>
                                      {item.isInternal && (
                                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                                          Interno
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-sm text-gray-600">
                                      {item.quantity}x €{parseFloat(item.unitPrice).toFixed(2)} = €
                                      {parseFloat(item.total).toFixed(2)}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => handleDeleteItem(sectionIndex, itemIndex)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Notas y Condiciones */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Notas y Condiciones</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notas Internas (no se mostrarán al cliente)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Términos y Condiciones (se mostrarán en el PDF)
                  </label>
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) =>
                      setFormData({ ...formData, termsAndConditions: e.target.value })
                    }
                    placeholder="Condiciones de pago, cancelación, etc."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Panel Lateral - Resumen */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calculator size={20} />
                Resumen del Presupuesto
              </h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">€{subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Descuento:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-20 px-2 py-1 text-right border border-gray-300 rounded text-sm"
                      step="0.01"
                    />
                    <span className="text-red-600">-€{discount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-3 flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal con descuento:</span>
                  <span className="font-medium">€{subtotalAfterDiscount.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">IVA (21%):</span>
                  <span className="font-medium">€{tax.toFixed(2)}</span>
                </div>

                <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900">TOTAL:</span>
                  <span className="text-xl font-bold text-blue-600">€{total.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <button
                  onClick={handleSave}
                  disabled={saveMutation.isPending}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save size={20} />
                  {saveMutation.isPending ? 'Guardando...' : 'Guardar Presupuesto'}
                </button>

                {!isNew && (
                  <>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      <FileText size={20} />
                      Generar PDF
                    </button>
                    <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                      <Mail size={20} />
                      Enviar por Email
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Seleccionar Producto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Seleccionar Producto</h2>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setCurrentSectionIndex(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {products?.map((product: any) => (
                <button
                  key={product.id}
                  onClick={() => handleSelectProduct(product)}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-600">{product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-blue-600">
                        €{parseFloat(product.pricePerDay).toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">por día</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal Item Personalizado */}
      {showCustomItemModal && (
        <CustomItemModal
          onSave={handleSaveCustomItem}
          onClose={() => {
            setShowCustomItemModal(false);
            setCurrentSectionIndex(null);
          }}
        />
      )}
    </div>
  );
};

// Modal para agregar item personalizado
const CustomItemModal: React.FC<{
  onSave: (data: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    isInternal: boolean;
  }) => void;
  onClose: () => void;
}> = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    quantity: '1',
    unitPrice: '',
    isInternal: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.unitPrice) {
      toast.error('Completa nombre y precio');
      return;
    }

    onSave({
      name: formData.name,
      description: formData.description,
      quantity: parseInt(formData.quantity),
      unitPrice: parseFloat(formData.unitPrice),
      isInternal: formData.isInternal,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Agregar Item Personalizado</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Item *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: Transporte, Alquiler externo, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripción del servicio o producto"
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cantidad *
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio Unitario (€) *
              </label>
              <input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                step="0.01"
                min="0"
                placeholder="0.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isInternal}
                onChange={(e) => setFormData({ ...formData, isInternal: e.target.checked })}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">
                Marcar como interno (no se muestra al cliente en el PDF)
              </span>
            </label>
          </div>

          {formData.quantity && formData.unitPrice && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Total:</span>
                <span className="text-lg font-bold text-blue-600">
                  €{(parseInt(formData.quantity || '0') * parseFloat(formData.unitPrice || '0')).toFixed(2)}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Agregar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetEditor;

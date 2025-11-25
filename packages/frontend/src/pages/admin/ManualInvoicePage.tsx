import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, FileText, Download } from 'lucide-react';
import toast from 'react-hot-toast';

interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  tax: number;
}

const ManualInvoicePage = () => {
  const navigate = useNavigate();
  
  // Customer data
  const [customer, setCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    taxId: '',
  });

  // Invoice items
  const [items, setItems] = useState<InvoiceItem[]>([
    { description: '', quantity: 1, unitPrice: 0, tax: 0.21 }
  ]);

  // Other fields
  const [eventDate, setEventDate] = useState('');
  const [notes, setNotes] = useState('');
  const [irpf, setIrpf] = useState(0); // IRPF percentage (0, 7, 15, etc.)

  // Created invoice
  const [createdInvoice, setCreatedInvoice] = useState<any>(null);

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice * item.tax), 0);
  const irpfAmount = subtotal * (irpf / 100); // IRPF se aplica sobre subtotal
  const total = subtotal + taxAmount - irpfAmount; // IRPF se resta

  // Add item
  const addItem = () => {
    setItems([...items, { description: '', quantity: 1, unitPrice: 0, tax: 0.21 }]);
  };

  // Remove item
  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Update item
  const updateItem = (index: number, field: keyof InvoiceItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  // Create invoice mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return await api.post('/invoices/manual', data);
    },
    onSuccess: (data: any) => {
      toast.success('Factura manual creada exitosamente');
      setCreatedInvoice(data.invoice);
    },
    onError: (error: any) => {
      console.error('❌ Error al crear factura:');
      console.error('Full error:', error);
      console.error('Response data:', error.response?.data);
      console.error('Error object:', JSON.stringify(error.response?.data, null, 2));
      
      const errorMessage = error.response?.data?.error?.message 
        || error.response?.data?.message 
        || error.response?.data?.error
        || 'Error al crear factura';
      toast.error(errorMessage);
    },
  });

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    if (!customer.name || !customer.email) {
      toast.error('Nombre y email del cliente son obligatorios');
      return;
    }

    if (items.length === 0 || items.some(item => !item.description || item.quantity <= 0 || item.unitPrice <= 0)) {
      toast.error('Todos los items deben tener descripción, cantidad y precio válidos');
      return;
    }

    const invoiceData = {
      customer,
      items,
      total, // Campo requerido por el backend
      subtotal,
      taxAmount,
      irpfAmount,
      eventDate: eventDate ? new Date(eventDate).toISOString() : null,
      notes: notes || null,
      irpf: irpf > 0 ? irpf : null,
    };

    console.log('📄 Enviando datos de factura:', invoiceData);
    createMutation.mutate(invoiceData);
  };

  // Download invoice PDF
  const handleDownloadPDF = async () => {
    if (!createdInvoice) return;
    
    try {
      toast.loading('Descargando factura PDF...');
      const blob = await api.get(`/invoices/download/${createdInvoice.id}`, {
        responseType: 'blob'
      }) as any;
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${createdInvoice.invoiceNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss();
      toast.success('PDF descargado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al descargar PDF');
    }
  };

  // Generate Facturae XML
  const handleGenerateFacturae = async () => {
    if (!createdInvoice) return;
    
    try {
      toast.loading('Generando Facturae XML...');
      await api.post(`/invoices/${createdInvoice.id}/facturae`);
      toast.dismiss();
      toast.success('Facturae XML generado correctamente');
    } catch (error) {
      toast.dismiss();
      toast.error('Error al generar Facturae XML');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin')}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Crear Factura Manual</h1>
              <p className="text-gray-600 mt-1">Para eventos externos (no desde la web)</p>
            </div>
          </div>
        </div>

        {createdInvoice ? (
          /* Success View */
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Factura Creada!
              </h2>
              <p className="text-gray-600 mb-1">
                Número de factura: <span className="font-semibold">{createdInvoice.invoiceNumber}</span>
              </p>
              <p className="text-gray-600">
                Total: <span className="font-semibold">{total.toFixed(2)} €</span>
              </p>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 px-6 py-3 bg-resona text-white rounded-lg hover:bg-resona-dark transition"
              >
                <Download className="w-5 h-5" />
                Descargar PDF
              </button>
              
              <button
                onClick={handleGenerateFacturae}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <FileText className="w-5 h-5" />
                Generar Facturae XML
              </button>

              <button
                onClick={() => {
                  setCreatedInvoice(null);
                  setCustomer({ name: '', email: '', phone: '', address: '', taxId: '' });
                  setItems([{ description: '', quantity: 1, unitPrice: 0, tax: 0.21 }]);
                  setEventDate('');
                  setNotes('');
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Crear Otra Factura
              </button>
            </div>
          </div>
        ) : (
          /* Form View */
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Datos del Cliente</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre / Empresa *
                  </label>
                  <input
                    type="text"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    NIF / CIF
                  </label>
                  <input
                    type="text"
                    value={customer.taxId}
                    onChange={(e) => setCustomer({ ...customer, taxId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección
                  </label>
                  <textarea
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Conceptos</h2>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-2 px-4 py-2 bg-resona text-white rounded-lg hover:bg-resona-dark transition"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Concepto
                </button>
              </div>

              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-3 items-start border-b border-gray-200 pb-4">
                    <div className="col-span-12 md:col-span-5">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Descripción *
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        placeholder="Ej: Alquiler equipo sonido..."
                        required
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                        min="0.01"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>

                    <div className="col-span-4 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Precio Unit. *
                      </label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />
                    </div>

                    <div className="col-span-3 md:col-span-2">
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        IVA (%)
                      </label>
                      <select
                        value={item.tax}
                        onChange={(e) => updateItem(index, 'tax', parseFloat(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="0">0%</option>
                        <option value="0.04">4%</option>
                        <option value="0.10">10%</option>
                        <option value="0.21">21%</option>
                      </select>
                    </div>

                    <div className="col-span-1 flex items-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <div className="col-span-12 text-right text-sm text-gray-600">
                      Subtotal: <span className="font-semibold">{(item.quantity * item.unitPrice).toFixed(2)} €</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Información Adicional</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha del Evento
                  </label>
                  <input
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IRPF (Retención) %
                  </label>
                  <select
                    value={irpf}
                    onChange={(e) => setIrpf(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                  >
                    <option value="0">Sin retención (0%)</option>
                    <option value="7">Profesionales (7%)</option>
                    <option value="15">Actividades profesionales (15%)</option>
                    <option value="19">Actividades agrícolas (19%)</option>
                    <option value="21">Actividades ganaderas (21%)</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    El IRPF se resta del total (retención a cuenta)
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas / Observaciones
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-resona focus:border-transparent"
                    placeholder="Información adicional sobre el evento o servicio..."
                  />
                </div>
              </div>
            </div>

            {/* Totals and Submit */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="max-w-md ml-auto space-y-2">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal:</span>
                  <span className="font-semibold">{subtotal.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>IVA:</span>
                  <span className="font-semibold">{taxAmount.toFixed(2)} €</span>
                </div>
                {irpf > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>IRPF (-{irpf}%):</span>
                    <span className="font-semibold">-{irpfAmount.toFixed(2)} €</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2 flex justify-between text-xl font-bold text-gray-900">
                  <span>TOTAL:</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
              </div>

              <div className="mt-6 flex gap-4 justify-end">
                <button
                  type="button"
                  onClick={() => navigate('/admin')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-6 py-3 bg-resona text-white rounded-lg hover:bg-resona-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear Factura'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ManualInvoicePage;

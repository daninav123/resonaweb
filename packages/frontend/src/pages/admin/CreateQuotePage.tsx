import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, Check, User, Calendar, Package, FileText,
  Plus, Minus, Search, Trash2, Calculator, X, Loader2, Truck, Home, CalendarRange
} from 'lucide-react';
import { api } from '../../services/api';
import { generateQuotePDF } from '../../utils/quotePdfGenerator';
import toast from 'react-hot-toast';
import LocationAutocomplete, { LocationData } from '../../components/admin/LocationAutocomplete';

// ========== TYPES ==========
interface QuoteItem {
  id: string;
  productId: string;
  type: 'product' | 'pack' | 'montaje' | 'extra' | 'custom';
  name: string;
  quantity: number;
  numberOfPeople?: number;
  hoursPerPerson?: number;
  pricePerDay: number;
  purchasePrice: number;
  totalPrice: number;
  isPersonal?: boolean;
  isConsumable?: boolean;
  category?: string;
}

type QuoteMode = 'event' | 'rental';

// ========== STEPS CONFIG ==========
const STEPS_EVENT = [
  { id: 1, label: 'Cliente y Evento', icon: User },
  { id: 2, label: 'Productos', icon: Package },
  { id: 3, label: 'Resumen y PDF', icon: FileText },
];

const STEPS_RENTAL = [
  { id: 1, label: 'Cliente y Alquiler', icon: User },
  { id: 2, label: 'Equipos', icon: Package },
  { id: 3, label: 'Resumen y PDF', icon: FileText },
];

const EVENT_TYPES = [
  'Boda', 'Cumpleaños', 'Corporativo', 'Concierto', 'Festival',
  'Presentación', 'Conferencia', 'Fiesta Privada', 'Otro',
];

// ========== COMPONENT ==========
const CreateQuotePage = () => {
  const navigate = useNavigate();
  const [quoteMode, setQuoteMode] = useState<QuoteMode | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const STEPS = quoteMode === 'rental' ? STEPS_RENTAL : STEPS_EVENT;

  // Step 1: Client & Event/Rental
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: '',
    attendees: 1,
    duration: 1,
    durationType: 'hours' as 'hours' | 'days',
    eventDate: '',
    eventLocation: '',
    eventLat: null as number | null,
    eventLng: null as number | null,
    eventCity: '',
    eventProvince: '',
    eventPostalCode: '',
    notes: '',
    // Rental-specific fields
    rentalStartDate: '',
    rentalEndDate: '',
    deliveryType: 'DELIVERY' as 'DELIVERY' | 'PICKUP',
    deliveryAddress: '',
    deliveryLat: null as number | null,
    deliveryLng: null as number | null,
    deliveryCity: '',
    deliveryProvince: '',
    deliveryPostalCode: '',
  });

  // Rental days calculation
  const rentalDays = useMemo(() => {
    if (!form.rentalStartDate || !form.rentalEndDate) return 1;
    const start = new Date(form.rentalStartDate);
    const end = new Date(form.rentalEndDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(1, diff);
  }, [form.rentalStartDate, form.rentalEndDate]);

  // Step 2: Products
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Step 3: Pricing & PDF
  const [pricing, setPricing] = useState({
    transportCost: 0,
    rentalCost: 0,
    finalPrice: 0,
    includeShipping: true,
    includeInstallation: true,
  });
  const [pdfData, setPdfData] = useState({
    title: 'Presupuesto',
    showItemDetails: false,
    concepts: [] as Array<{ id: string; name: string; price: number }>,
    footer: 'Gracias por confiar en nosotros',
  });
  const [newConceptName, setNewConceptName] = useState('');
  const [newConceptPrice, setNewConceptPrice] = useState(0);

  // ========== DATA LOADING ==========
  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const res: any = await api.get('/products/categories');
      const cats = Array.isArray(res) ? res : res?.categories || res?.data || [];
      setCategories(cats);
    } catch (e) {
      console.error('Error cargando categorías:', e);
    }
  };

  const loadProducts = async () => {
    try {
      const res: any = await api.get('/products?limit=1000&includeHidden=true');
      const prods = Array.isArray(res) ? res : res?.products || res?.data || [];
      setProducts(prods);
    } catch (e) {
      console.error('Error cargando productos:', e);
    }
  };

  // ========== PRODUCT HELPERS ==========
  const isPersonalProduct = (p: any) => p.category?.name?.toLowerCase() === 'personal';

  const filteredProducts = useMemo(() => {
    const montajeCat = categories.find((c: any) => c.name?.toLowerCase() === 'montaje');
    let filtered = products.filter(p => !p.isPack && p.categoryId !== montajeCat?.id);
    if (selectedCategory) filtered = filtered.filter(p => p.categoryId === selectedCategory);
    if (productSearch) {
      const q = productSearch.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [products, categories, selectedCategory, productSearch]);

  const addProduct = (product: any) => {
    const existing = quoteItems.find(i => i.productId === product.id);
    if (existing) {
      updateQuantity(existing.id, existing.quantity + 1);
      return;
    }
    const personal = isPersonalProduct(product);
    const price = product.isConsumable ? (product.pricePerUnit || 0) : (product.pricePerDay || 0);
    setQuoteItems(prev => [...prev, {
      id: `item-${Date.now()}`,
      productId: product.id,
      type: 'product',
      name: product.name,
      quantity: 1,
      numberOfPeople: personal ? 1 : undefined,
      hoursPerPerson: personal ? 1 : undefined,
      pricePerDay: price,
      purchasePrice: product.purchasePrice || 0,
      totalPrice: price,
      isPersonal: personal,
      isConsumable: product.isConsumable,
      category: product.category?.name,
    }]);
  };

  const updateQuantity = (id: string, qty: number) => {
    if (qty < 1) return;
    setQuoteItems(prev => prev.map(item =>
      item.id === id ? { ...item, quantity: qty, totalPrice: item.pricePerDay * qty } : item
    ));
  };

  const updatePersonal = (id: string, people: number, hours: number) => {
    setQuoteItems(prev => prev.map(item =>
      item.id === id ? {
        ...item,
        numberOfPeople: people,
        hoursPerPerson: hours,
        quantity: people * hours,
        totalPrice: item.pricePerDay * people * hours,
      } : item
    ));
  };

  const removeItem = (id: string) => {
    setQuoteItems(prev => prev.filter(i => i.id !== id));
  };

  // ========== CALCULATIONS ==========
  const itemsSubtotal = useMemo(() => {
    const base = quoteItems.reduce((sum, i) => sum + i.totalPrice, 0);
    return quoteMode === 'rental' ? base * rentalDays : base;
  }, [quoteItems, quoteMode, rentalDays]);

  const calculatedTotal = useMemo(() =>
    itemsSubtotal + (pricing.transportCost || 0) + (pricing.rentalCost || 0),
    [itemsSubtotal, pricing.transportCost, pricing.rentalCost]);

  const effectiveTotal = pricing.finalPrice || calculatedTotal;

  const profitAnalysis = useMemo(() => {
    let costPersonal = 0, costDepreciation = 0, costShipping = 0;
    quoteItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (!product) return;
      const qty = item.isPersonal ? (item.numberOfPeople || 1) * (item.hoursPerPerson || 1) : item.quantity;
      if (item.isPersonal) {
        costPersonal += (product.purchasePrice || 0) * qty;
      } else if (item.isConsumable) {
        costDepreciation += (product.purchasePrice || 0) * qty;
      } else {
        costDepreciation += (product.purchasePrice || 0) * qty * 0.05;
      }
      if (pricing.includeShipping) costShipping += (product.shippingCost || 0) * qty;
      if (pricing.includeInstallation) costShipping += (product.installationCost || 0) * qty;
    });
    costShipping /= 2;
    const totalCost = costPersonal + costDepreciation + costShipping + (pricing.transportCost || 0) + (pricing.rentalCost || 0);
    const profit = effectiveTotal - totalCost;
    const margin = effectiveTotal > 0 ? (profit / effectiveTotal) * 100 : 0;
    return { costPersonal, costDepreciation, costShipping, totalCost, profit, margin };
  }, [quoteItems, products, pricing, effectiveTotal]);

  // ========== STEP VALIDATION ==========
  const canProceed = (s: number) => {
    if (s === 1) {
      if (quoteMode === 'rental') {
        return form.customerName.trim() && form.rentalStartDate && form.rentalEndDate;
      }
      return form.customerName.trim() && form.eventType.trim();
    }
    if (s === 2) return true;
    return true;
  };

  // ========== SAVE ==========
  const handleSave = async () => {
    if (!form.customerName) {
      toast.error('El nombre del cliente es obligatorio');
      return;
    }
    if (quoteMode === 'event' && !form.eventType) {
      toast.error('El tipo de evento es obligatorio');
      return;
    }
    if (quoteMode === 'rental' && (!form.rentalStartDate || !form.rentalEndDate)) {
      toast.error('Las fechas del alquiler son obligatorias');
      return;
    }
    setSaving(true);
    const subtotalPdf = pdfData.concepts.reduce((sum, c) => sum + c.price, 0);
    const totalWithIVA = subtotalPdf * 1.21;
    try {
      await api.post('/quote-requests', {
        ...form,
        eventType: quoteMode === 'rental' ? `Alquiler (${rentalDays} días)` : form.eventType,
        eventDate: quoteMode === 'rental' ? form.rentalStartDate : form.eventDate,
        eventLocation: quoteMode === 'rental' && form.deliveryType === 'DELIVERY' ? form.deliveryAddress : form.eventLocation,
        status: 'PENDING',
        estimatedTotal: totalWithIVA || effectiveTotal,
        transportCost: pricing.transportCost,
        rentalCost: pricing.rentalCost,
        finalPrice: pricing.finalPrice,
        includeShipping: pricing.includeShipping,
        includeInstallation: pricing.includeInstallation,
        selectedExtras: JSON.stringify({
          quoteMode,
          rentalDays: quoteMode === 'rental' ? rentalDays : undefined,
          rentalStartDate: form.rentalStartDate || undefined,
          rentalEndDate: form.rentalEndDate || undefined,
          deliveryType: form.deliveryType,
          products: quoteItems,
          pdfConcepts: pdfData.concepts,
          pdfTitle: pdfData.title,
          pdfFooter: pdfData.footer,
        }),
      });
      toast.success('Presupuesto creado correctamente');
      navigate('/admin/quote-requests');
    } catch (err: any) {
      toast.error(err?.message || 'Error al crear presupuesto');
    } finally {
      setSaving(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // ========== RENDER ==========
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate('/admin/quote-requests')} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm">
              <ArrowLeft className="w-4 h-4" /> Volver a presupuestos
            </button>
            <h1 className="text-lg font-bold text-gray-900">
              {quoteMode === 'rental' ? 'Presupuesto de Alquiler' : quoteMode === 'event' ? 'Presupuesto de Evento' : 'Nuevo Presupuesto'}
            </h1>
            <div className="w-40" />
          </div>
        </div>
      </div>

      {/* Mode selector OR Stepper */}
      {!quoteMode ? (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <p className="text-center text-sm text-gray-500">Selecciona el tipo de presupuesto</p>
          </div>
        </div>
      ) : (
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-center gap-2 sm:gap-4">
              {STEPS.map((s, idx) => (
                <div key={s.id} className="flex items-center gap-2 sm:gap-4">
                  <button
                    onClick={() => { if (s.id < step || canProceed(step)) setStep(s.id); }}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      step === s.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : step > s.id
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      step > s.id ? 'bg-green-500 text-white' : ''
                    }`}>
                      {step > s.id ? <Check className="w-3.5 h-3.5" /> : s.id}
                    </div>
                    <span className="hidden sm:inline">{s.label}</span>
                  </button>
                  {idx < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-16 h-0.5 ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Mode selector */}
        {!quoteMode && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 text-center mb-2">¿Qué tipo de presupuesto necesitas?</h2>
            <p className="text-sm text-gray-500 text-center mb-8">Elige el tipo para adaptar el formulario a tu necesidad</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <button
                onClick={() => setQuoteMode('event')}
                className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-blue-500 p-8 text-center transition-all hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-50 group-hover:bg-blue-100 flex items-center justify-center mx-auto mb-4 transition">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Evento</h3>
                <p className="text-sm text-gray-500">Bodas, conciertos, corporativos, fiestas... Con fecha, ubicación y asistentes.</p>
                <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                  {['Boda', 'Concierto', 'Corporativo', 'Festival'].map(t => (
                    <span key={t} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </button>
              <button
                onClick={() => setQuoteMode('rental')}
                className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-green-500 p-8 text-center transition-all hover:shadow-lg"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-50 group-hover:bg-green-100 flex items-center justify-center mx-auto mb-4 transition">
                  <Truck className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Alquiler</h3>
                <p className="text-sm text-gray-500">Alquiler de equipos con fechas de inicio/fin, entrega o recogida.</p>
                <div className="mt-4 flex flex-wrap gap-1.5 justify-center">
                  {['Sonido', 'Iluminación', 'Escenario', 'Varios días'].map(t => (
                    <span key={t} className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full">{t}</span>
                  ))}
                </div>
              </button>
            </div>
          </div>
        )}

        {quoteMode && (
        <div className="flex gap-6">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {step === 1 && quoteMode === 'event' && <Step1Client form={form} setForm={setForm} />}
            {step === 1 && quoteMode === 'rental' && <Step1Rental form={form} setForm={setForm} />}
            {step === 2 && (
              <Step2Products
                categories={categories}
                filteredProducts={filteredProducts}
                quoteItems={quoteItems}
                productSearch={productSearch}
                setProductSearch={setProductSearch}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                addProduct={addProduct}
                updateQuantity={updateQuantity}
                updatePersonal={updatePersonal}
                removeItem={removeItem}
              />
            )}
            {step === 3 && (
              <Step3Summary
                pricing={pricing}
                setPricing={setPricing}
                pdfData={pdfData}
                setPdfData={setPdfData}
                newConceptName={newConceptName}
                setNewConceptName={setNewConceptName}
                newConceptPrice={newConceptPrice}
                setNewConceptPrice={setNewConceptPrice}
                profitAnalysis={profitAnalysis}
                effectiveTotal={effectiveTotal}
                calculatedTotal={calculatedTotal}
                itemsSubtotal={itemsSubtotal}
                form={form}
                fmt={fmt}
              />
            )}
          </div>

          {/* Sidebar - Quote summary */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              {/* Mode badge */}
              <div className={`rounded-xl p-3 flex items-center gap-2 ${quoteMode === 'rental' ? 'bg-green-50 border border-green-200' : 'bg-blue-50 border border-blue-200'}`}>
                {quoteMode === 'rental' ? <Truck className="w-4 h-4 text-green-600" /> : <Calendar className="w-4 h-4 text-blue-600" />}
                <span className={`text-sm font-semibold ${quoteMode === 'rental' ? 'text-green-700' : 'text-blue-700'}`}>
                  {quoteMode === 'rental' ? 'Alquiler' : 'Evento'}
                </span>
                <button onClick={() => { setQuoteMode(null); setStep(1); }} className="ml-auto text-xs text-gray-400 hover:text-gray-600 underline">Cambiar</button>
              </div>

              {/* Client summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-500" /> Cliente
                </h3>
                {form.customerName ? (
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">{form.customerName}</p>
                    {form.customerEmail && <p className="text-gray-500 text-xs">{form.customerEmail}</p>}
                    {quoteMode === 'rental' ? (
                      <>
                        {form.rentalStartDate && (
                          <p className="text-xs text-green-600 mt-1">
                            {form.rentalStartDate} → {form.rentalEndDate} ({rentalDays}d)
                          </p>
                        )}
                        <p className="text-xs text-gray-500 mt-0.5">
                          {form.deliveryType === 'DELIVERY' ? '🚚 Entrega' : '🏪 Recogida'}
                          {form.deliveryAddress && ` · ${form.deliveryAddress.split(',')[0]}`}
                        </p>
                      </>
                    ) : (
                      form.eventType && <p className="text-xs text-blue-600 mt-1">{form.eventType} · {form.eventDate || 'Sin fecha'}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Sin datos de cliente</p>
                )}
              </div>

              {/* Items summary */}
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4 text-green-500" /> Productos ({quoteItems.length})
                </h3>
                {quoteItems.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {quoteItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700 truncate max-w-[160px]">
                          {item.isPersonal
                            ? `${item.name} (${item.numberOfPeople}p×${item.hoursPerPerson}h)`
                            : `${item.name} ×${item.quantity}`
                          }
                        </span>
                        <span className="font-medium text-gray-900 shrink-0">{fmt(item.totalPrice)}€</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Sin productos</p>
                )}
              </div>

              {/* Total */}
              <div className={`bg-gradient-to-br ${quoteMode === 'rental' ? 'from-green-600 to-green-700' : 'from-blue-600 to-blue-700'} rounded-xl p-4 text-white`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm opacity-80">
                    {quoteMode === 'rental' ? `Equipos × ${rentalDays} día${rentalDays > 1 ? 's' : ''}` : 'Subtotal productos'}
                  </span>
                  <span className="text-sm font-medium">{fmt(itemsSubtotal)}€</span>
                </div>
                {(pricing.transportCost > 0 || pricing.rentalCost > 0) && (
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm opacity-80">Extras</span>
                    <span className="text-sm font-medium">
                      {fmt((pricing.transportCost || 0) + (pricing.rentalCost || 0))}€
                    </span>
                  </div>
                )}
                <div className="border-t border-white/30 pt-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Total</span>
                    <span className="text-2xl font-bold">{fmt(effectiveTotal)}€</span>
                  </div>
                </div>
                {profitAnalysis.totalCost > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/30">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-200">Beneficio</span>
                      <span className={`font-bold ${profitAnalysis.profit >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {fmt(profitAnalysis.profit)}€ ({profitAnalysis.margin.toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      {/* Bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <button
            onClick={() => {
              if (step > 1) setStep(step - 1);
              else if (quoteMode) setQuoteMode(null);
              else navigate('/admin/quote-requests');
            }}
            className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center gap-2 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            {step > 1 ? 'Anterior' : quoteMode ? 'Cambiar tipo' : 'Cancelar'}
          </button>

          {/* Mobile total */}
          <div className="lg:hidden text-center">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-gray-900">{fmt(effectiveTotal)}€</p>
          </div>

          {!quoteMode ? (
            <div />
          ) : step < 3 ? (
            <button
              onClick={() => { if (canProceed(step)) setStep(step + 1); }}
              disabled={!canProceed(step)}
              className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg flex items-center gap-2 transition"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-300 rounded-lg flex items-center gap-2 transition"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Crear Presupuesto
            </button>
          )}
        </div>
      </div>

      {/* Bottom spacer for fixed bar */}
      <div className="h-20" />
    </div>
  );
};

// ========================================================
// STEP 1: CLIENT & EVENT
// ========================================================
const Step1Client = ({ form, setForm }: { form: any; setForm: (f: any) => void }) => {
  const update = (field: string, value: any) => setForm({ ...form, [field]: value });

  return (
    <div className="space-y-6">
      {/* Client */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" /> Datos del Cliente
        </h2>
        <p className="text-sm text-gray-500 mb-5">Introduce los datos de contacto del cliente</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.customerName}
              onChange={e => update('customerName', e.target.value)}
              placeholder="Nombre completo"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={e => update('customerEmail', e.target.value)}
              placeholder="email@ejemplo.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={e => update('customerPhone', e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Event */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-orange-500" /> Información del Evento
        </h2>
        <p className="text-sm text-gray-500 mb-5">Detalles sobre el evento para el que se solicita presupuesto</p>

        {/* Quick event type buttons */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Evento *</label>
          <div className="flex flex-wrap gap-2">
            {EVENT_TYPES.map(t => (
              <button
                key={t}
                onClick={() => update('eventType', t)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium border transition ${
                  form.eventType === t
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          {!EVENT_TYPES.includes(form.eventType) && form.eventType && (
            <input
              type="text"
              value={form.eventType}
              onChange={e => update('eventType', e.target.value)}
              className="mt-2 w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
              placeholder="Tipo personalizado..."
            />
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Evento</label>
            <input
              type="date"
              value={form.eventDate}
              onChange={e => update('eventDate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Asistentes</label>
            <input
              type="number"
              min={1}
              value={form.attendees}
              onChange={e => update('attendees', parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
            <div className="flex">
              <input
                type="number"
                min={1}
                value={form.duration}
                onChange={e => update('duration', parseInt(e.target.value) || 1)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <select
                value={form.durationType}
                onChange={e => update('durationType', e.target.value)}
                className="px-3 py-2.5 border border-l-0 border-gray-300 rounded-r-lg bg-gray-50 text-sm"
              >
                <option value="hours">Horas</option>
                <option value="days">Días</option>
              </select>
            </div>
          </div>
        </div>

        {/* Ubicación con autocompletado */}
        <div className="mt-4">
          <LocationAutocomplete
            value={form.eventLocation}
            onChange={(loc: LocationData) => setForm({
              ...form,
              eventLocation: loc.address,
              eventLat: loc.lat,
              eventLng: loc.lng,
              eventCity: loc.city || '',
              eventProvince: loc.province || '',
              eventPostalCode: loc.postalCode || '',
            })}
            placeholder="Escribe una dirección, local o ciudad..."
          />
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            rows={2}
            placeholder="Detalles adicionales sobre el evento..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ========================================================
// STEP 1B: CLIENT & RENTAL
// ========================================================
const Step1Rental = ({ form, setForm }: { form: any; setForm: (f: any) => void }) => {
  const update = (field: string, value: any) => setForm({ ...form, [field]: value });

  const rentalDays = (() => {
    if (!form.rentalStartDate || !form.rentalEndDate) return 0;
    const start = new Date(form.rentalStartDate);
    const end = new Date(form.rentalEndDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  })();

  return (
    <div className="space-y-6">
      {/* Client */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-500" /> Datos del Cliente
        </h2>
        <p className="text-sm text-gray-500 mb-5">Introduce los datos de contacto del cliente</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
            <input
              type="text"
              value={form.customerName}
              onChange={e => update('customerName', e.target.value)}
              placeholder="Nombre completo o empresa"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={form.customerEmail}
              onChange={e => update('customerEmail', e.target.value)}
              placeholder="email@ejemplo.com"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              type="tel"
              value={form.customerPhone}
              onChange={e => update('customerPhone', e.target.value)}
              placeholder="+34 600 000 000"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Rental dates */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <CalendarRange className="w-5 h-5 text-green-500" /> Período de Alquiler
        </h2>
        <p className="text-sm text-gray-500 mb-5">Fechas de inicio y fin del alquiler</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha inicio *</label>
            <input
              type="date"
              value={form.rentalStartDate}
              onChange={e => update('rentalStartDate', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin *</label>
            <input
              type="date"
              value={form.rentalEndDate}
              onChange={e => update('rentalEndDate', e.target.value)}
              min={form.rentalStartDate || undefined}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
            />
          </div>
        </div>

        {rentalDays > 0 && (
          <div className="bg-green-50 rounded-lg p-3 flex items-center gap-3">
            <CalendarRange className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-semibold text-green-800">{rentalDays} día{rentalDays !== 1 ? 's' : ''} de alquiler</p>
              <p className="text-xs text-green-600">Los precios se multiplicarán por {rentalDays}</p>
            </div>
          </div>
        )}
      </div>

      {/* Delivery type */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Truck className="w-5 h-5 text-orange-500" /> Entrega / Recogida
        </h2>
        <p className="text-sm text-gray-500 mb-5">¿Cómo se entregará el material?</p>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => update('deliveryType', 'DELIVERY')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              form.deliveryType === 'DELIVERY'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 bg-white'
            }`}
          >
            <Truck className={`w-6 h-6 mx-auto mb-2 ${form.deliveryType === 'DELIVERY' ? 'text-green-600' : 'text-gray-400'}`} />
            <p className={`text-sm font-semibold ${form.deliveryType === 'DELIVERY' ? 'text-green-700' : 'text-gray-700'}`}>Entrega a domicilio</p>
            <p className="text-xs text-gray-500 mt-0.5">Llevamos el material</p>
          </button>
          <button
            onClick={() => update('deliveryType', 'PICKUP')}
            className={`p-4 rounded-xl border-2 text-center transition-all ${
              form.deliveryType === 'PICKUP'
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 hover:border-green-300 bg-white'
            }`}
          >
            <Home className={`w-6 h-6 mx-auto mb-2 ${form.deliveryType === 'PICKUP' ? 'text-green-600' : 'text-gray-400'}`} />
            <p className={`text-sm font-semibold ${form.deliveryType === 'PICKUP' ? 'text-green-700' : 'text-gray-700'}`}>Recogida en almacén</p>
            <p className="text-xs text-gray-500 mt-0.5">El cliente lo recoge</p>
          </button>
        </div>

        {form.deliveryType === 'DELIVERY' && (
          <LocationAutocomplete
            value={form.deliveryAddress}
            onChange={(loc: LocationData) => setForm({
              ...form,
              deliveryAddress: loc.address,
              deliveryLat: loc.lat,
              deliveryLng: loc.lng,
              deliveryCity: loc.city || '',
              deliveryProvince: loc.province || '',
              deliveryPostalCode: loc.postalCode || '',
            })}
            placeholder="Dirección de entrega del material..."
          />
        )}

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
          <textarea
            value={form.notes}
            onChange={e => update('notes', e.target.value)}
            rows={2}
            placeholder="Horario de entrega, acceso al local, instrucciones especiales..."
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm resize-none"
          />
        </div>
      </div>
    </div>
  );
};

// ========================================================
// STEP 2: PRODUCTS
// ========================================================
const Step2Products = ({
  categories, filteredProducts, quoteItems, productSearch, setProductSearch,
  selectedCategory, setSelectedCategory, addProduct, updateQuantity, updatePersonal, removeItem,
}: any) => {
  const getItemForProduct = (productId: string) => quoteItems.find((i: QuoteItem) => i.productId === productId);

  return (
    <div className="space-y-4">
      {/* Search & filter bar */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={productSearch}
              onChange={e => setProductSearch(e.target.value)}
              placeholder="Buscar productos por nombre o SKU..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-4 py-2.5 border border-gray-300 rounded-lg text-sm bg-white min-w-[180px]"
          >
            <option value="">Todas las categorías</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Product catalog */}
        <div className="xl:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-700">
                {filteredProducts.length} productos disponibles
              </p>
            </div>
            <div className="max-h-[60vh] overflow-y-auto divide-y divide-gray-50">
              {filteredProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron productos</p>
                </div>
              ) : (
                filteredProducts.map((p: any) => {
                  const inQuote = getItemForProduct(p.id);
                  const price = p.isConsumable ? (p.pricePerUnit || 0) : (p.pricePerDay || 0);
                  return (
                    <div
                      key={p.id}
                      className={`flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition ${inQuote ? 'bg-blue-50/50' : ''}`}
                    >
                      {/* Product image */}
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500">
                          {p.category?.name || 'Sin categoría'}
                          {p.sku && ` · ${p.sku}`}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="text-right shrink-0 mr-2">
                        <p className="text-sm font-bold text-gray-900">{price.toFixed(2)}€</p>
                        <p className="text-xs text-gray-400">{p.isConsumable ? '/ud' : '/día'}</p>
                      </div>

                      {/* Add/qty button */}
                      {inQuote ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => updateQuantity(inQuote.id, inQuote.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center bg-gray-200 hover:bg-gray-300 rounded text-sm"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-blue-600">{inQuote.quantity}</span>
                          <button
                            onClick={() => updateQuantity(inQuote.id, inQuote.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addProduct(p)}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition shrink-0"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Quote items (right panel) */}
        <div className="xl:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 sticky top-24">
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-700">En el presupuesto</h3>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                {quoteItems.length} items
              </span>
            </div>
            <div className="max-h-[55vh] overflow-y-auto">
              {quoteItems.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <Package className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-xs">Añade productos del catálogo</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {quoteItems.map((item: QuoteItem) => (
                    <div key={item.id} className="px-3 py-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          {item.category && <p className="text-xs text-gray-400">{item.category}</p>}
                        </div>
                        <button onClick={() => removeItem(item.id)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600 shrink-0">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {item.isPersonal ? (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="text-gray-500">Pers:</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updatePersonal(item.id, Math.max(1, (item.numberOfPeople || 1) - 1), item.hoursPerPerson || 1)} className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px]">-</button>
                            <span className="w-5 text-center font-bold">{item.numberOfPeople}</span>
                            <button onClick={() => updatePersonal(item.id, (item.numberOfPeople || 1) + 1, item.hoursPerPerson || 1)} className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px]">+</button>
                          </div>
                          <span className="text-gray-500">Horas:</span>
                          <div className="flex items-center gap-1">
                            <button onClick={() => updatePersonal(item.id, item.numberOfPeople || 1, Math.max(0.5, (item.hoursPerPerson || 1) - 0.5))} className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px]">-</button>
                            <span className="w-5 text-center font-bold">{item.hoursPerPerson}</span>
                            <button onClick={() => updatePersonal(item.id, item.numberOfPeople || 1, (item.hoursPerPerson || 1) + 0.5)} className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px]">+</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px]">-</button>
                            <span className="w-6 text-center font-bold">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 flex items-center justify-center bg-gray-200 rounded text-[10px]">+</button>
                          </div>
                          <span className="text-gray-400">× {item.pricePerDay.toFixed(2)}€</span>
                          <span className="ml-auto font-bold text-gray-900">{item.totalPrice.toFixed(2)}€</span>
                        </div>
                      )}
                      {item.isPersonal && (
                        <div className="mt-1 text-right">
                          <span className="text-xs font-bold text-gray-900">{item.totalPrice.toFixed(2)}€</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ========================================================
// STEP 3: SUMMARY & PDF
// ========================================================
const Step3Summary = ({
  pricing, setPricing, pdfData, setPdfData,
  newConceptName, setNewConceptName, newConceptPrice, setNewConceptPrice,
  profitAnalysis, effectiveTotal, calculatedTotal, itemsSubtotal, form, fmt,
}: any) => {
  const addConcept = () => {
    if (!newConceptName.trim()) return;
    setPdfData({
      ...pdfData,
      concepts: [...pdfData.concepts, { id: Date.now().toString(), name: newConceptName, price: newConceptPrice }],
    });
    setNewConceptName('');
    setNewConceptPrice(0);
  };

  const removeConcept = (id: string) => {
    setPdfData({ ...pdfData, concepts: pdfData.concepts.filter((c: any) => c.id !== id) });
  };

  const subtotalPdf = pdfData.concepts.reduce((s: number, c: any) => s + c.price, 0);

  return (
    <div className="space-y-6">
      {/* Pricing */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Calculator className="w-5 h-5 text-green-500" /> Precios y Costes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coste Transporte e Instalación (€)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={pricing.transportCost}
              onChange={e => setPricing({ ...pricing, transportCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Coste Alquiler Externo (€)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={pricing.rentalCost}
              onChange={e => setPricing({ ...pricing, rentalCost: parseFloat(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Precio Final Personalizado (€)</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={pricing.finalPrice}
              onChange={e => setPricing({ ...pricing, finalPrice: parseFloat(e.target.value) || 0 })}
              placeholder="Dejar en 0 para cálculo automático"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div className="flex items-end gap-4 pb-1">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={pricing.includeShipping}
                onChange={e => setPricing({ ...pricing, includeShipping: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Incluir transporte
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={pricing.includeInstallation}
                onChange={e => setPricing({ ...pricing, includeInstallation: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              Incluir montaje
            </label>
          </div>
        </div>

        {/* Profit analysis */}
        {profitAnalysis.totalCost > 0 && (
          <div className="mt-5 bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Análisis de Rentabilidad</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="text-center p-2 bg-white rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">Coste Total</p>
                <p className="text-sm font-bold text-gray-900">{fmt(profitAnalysis.totalCost)}€</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">Precio Venta</p>
                <p className="text-sm font-bold text-gray-900">{fmt(effectiveTotal)}€</p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">Beneficio</p>
                <p className={`text-sm font-bold ${profitAnalysis.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {fmt(profitAnalysis.profit)}€
                </p>
              </div>
              <div className="text-center p-2 bg-white rounded-lg border">
                <p className="text-xs text-gray-500 mb-1">Margen</p>
                <p className={`text-sm font-bold ${profitAnalysis.margin >= 30 ? 'text-green-600' : profitAnalysis.margin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                  {profitAnalysis.margin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* PDF Config */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-500" /> Configurar PDF para Cliente
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título del documento</label>
            <input
              type="text"
              value={pdfData.title}
              onChange={e => setPdfData({ ...pdfData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje de despedida</label>
            <input
              type="text"
              value={pdfData.footer}
              onChange={e => setPdfData({ ...pdfData, footer: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm cursor-pointer mb-5">
          <input
            type="checkbox"
            checked={pdfData.showItemDetails}
            onChange={e => setPdfData({ ...pdfData, showItemDetails: e.target.checked })}
            className="w-4 h-4 text-blue-600 rounded"
          />
          Mostrar detalles de productos individuales en el PDF
        </label>

        {/* Concepts */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Conceptos para el Cliente</h3>
          <p className="text-xs text-gray-500 mb-3">
            Estos conceptos aparecerán en el PDF. Agrupa productos bajo conceptos como "Sonorización", "Iluminación", etc.
          </p>

          {/* Add concept */}
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newConceptName}
              onChange={e => setNewConceptName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addConcept()}
              placeholder="Nombre del concepto"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
            />
            <input
              type="number"
              min={0}
              step={0.01}
              value={newConceptPrice}
              onChange={e => setNewConceptPrice(parseFloat(e.target.value) || 0)}
              onKeyDown={e => e.key === 'Enter' && addConcept()}
              placeholder="Precio"
              className="w-28 px-3 py-2 border border-gray-300 rounded-lg text-sm text-right focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={addConcept}
              disabled={!newConceptName.trim()}
              className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Concept list */}
          {pdfData.concepts.length > 0 ? (
            <div className="space-y-2">
              {pdfData.concepts.map((c: any) => (
                <div key={c.id} className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <input
                    type="text"
                    value={c.name}
                    onChange={e => setPdfData({
                      ...pdfData,
                      concepts: pdfData.concepts.map((x: any) => x.id === c.id ? { ...x, name: e.target.value } : x),
                    })}
                    className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    value={c.price}
                    onChange={e => setPdfData({
                      ...pdfData,
                      concepts: pdfData.concepts.map((x: any) => x.id === c.id ? { ...x, price: parseFloat(e.target.value) || 0 } : x),
                    })}
                    className="w-24 px-2 py-1 border border-gray-300 rounded text-sm text-right font-bold"
                  />
                  <button onClick={() => removeConcept(c.id)} className="p-1 text-red-400 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* PDF Totals */}
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{fmt(subtotalPdf)}€</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (21%):</span>
                  <span>{fmt(subtotalPdf * 0.21)}€</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-1 border-t">
                  <span>Total con IVA:</span>
                  <span className="text-green-600">{fmt(subtotalPdf * 1.21)}€</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-gray-400 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-xs">Sin conceptos. Añade conceptos para el PDF del cliente.</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Vista Previa del PDF</h2>
        <div className="bg-gray-50 rounded-lg p-6 border max-w-lg mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{pdfData.title}</h3>
          <p className="text-sm text-gray-500 mb-4">Cliente: {form.customerName || '—'} · {form.eventType || '—'}</p>
          <div className="border-t pt-3 mb-3">
            {pdfData.concepts.length > 0 ? (
              pdfData.concepts.map((c: any) => (
                <div key={c.id} className="flex justify-between py-1 text-sm border-b border-gray-100">
                  <span className="text-gray-700">{c.name}</span>
                  <span className="font-medium">{fmt(c.price)}€</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-gray-400 italic py-2">Sin conceptos</p>
            )}
          </div>
          {pdfData.concepts.length > 0 && (
            <div className="border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{fmt(subtotalPdf)}€</span></div>
              <div className="flex justify-between"><span>IVA (21%)</span><span>{fmt(subtotalPdf * 0.21)}€</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t">
                <span>Total</span><span className="text-green-600">{fmt(subtotalPdf * 1.21)}€</span>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-500 italic mt-4">{pdfData.footer}</p>
        </div>
      </div>
    </div>
  );
};

export default CreateQuotePage;

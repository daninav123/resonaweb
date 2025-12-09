import { useState, useEffect } from 'react';
import { Mail, Phone, Calendar, Users, MapPin, Package, CheckCircle, Clock, XCircle, Trash2, Eye, Plus, Calculator, X } from 'lucide-react';
import { api } from '../../services/api';
import { companyService } from '../../services/company.service';
import jsPDF from 'jspdf';

interface QuoteRequest {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  eventType: string;
  attendees: number;
  duration: number;
  durationType: string;
  eventDate: string | null;
  eventLocation: string | null;
  selectedPack: string | null;
  selectedExtras: any;
  estimatedTotal: number | null;
  status: string;
  notes: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface QuoteItem {
  id: string;
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
  sectionId?: string;
  description?: string;
  isInternal?: boolean;
}

interface QuoteSection {
  id: string;
  name: string;
  description?: string;
  items: QuoteItem[];
}

const QuoteRequestsManager = () => {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'presupuesto' | 'pdf'>('presupuesto');
  const [quoteItems, setQuoteItems] = useState<QuoteItem[]>([]);
  const [quoteSections, setQuoteSections] = useState<QuoteSection[]>([]);
  const [showCustomItemModal, setShowCustomItemModal] = useState(false);
  
  // Estado para edición del PDF
  const [pdfData, setPdfData] = useState({
    title: 'Presupuesto',
    showItemDetails: false,
    concepts: [] as Array<{id: string, name: string, price: number}>,
    footer: 'Gracias por confiar en nosotros',
  });
  const [newConceptName, setNewConceptName] = useState('');
  const [newConceptPrice, setNewConceptPrice] = useState(0);
  const [currentSectionId, setCurrentSectionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productFilter, setProductFilter] = useState({
    categoryId: '',
    search: '',
  });
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    eventType: '',
    attendees: 1,
    duration: 1,
    durationType: 'hours',
    eventDate: '',
    eventLocation: '',
    estimatedTotal: 0,
    notes: '',
    // Nuevos campos
    transportCost: 0,
    rentalCost: 0,
    finalPrice: 0,
    includeShipping: true,
    includeInstallation: true,
  });

  useEffect(() => {
    loadQuoteRequests();
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    try {
      const response: any = await api.get('/products/categories');
      let cats = [];
      if (Array.isArray(response)) {
        cats = response;
      } else if (response?.categories && Array.isArray(response.categories)) {
        cats = response.categories;
      } else if (response?.data && Array.isArray(response.data)) {
        cats = response.data;
      }
      setCategories(cats);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const loadProducts = async () => {
    try {
      // includeHidden=true para ver productos de categorías ocultas (Personal, etc.)
      const response: any = await api.get('/products?limit=1000&includeHidden=true');
      let prods = [];
      if (Array.isArray(response)) {
        prods = response;
      } else if (response?.products && Array.isArray(response.products)) {
        prods = response.products;
      } else if (response?.data && Array.isArray(response.data)) {
        prods = response.data;
      }
      setProducts(prods);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const getAvailableProducts = () => {
    const montajeCategory = categories.find((c: any) => c.name?.toLowerCase() === 'montaje');
    let filtered = products.filter(p =>
      !p.isPack &&
      p.categoryId !== montajeCategory?.id
    );

    if (productFilter.categoryId) {
      filtered = filtered.filter(p => p.categoryId === productFilter.categoryId);
    }

    if (productFilter.search) {
      const searchLower = productFilter.search.toLowerCase();
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.sku?.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  };

  const isPersonalProduct = (product: any) => {
    return product.category?.name?.toLowerCase() === 'personal';
  };

  const loadQuoteRequests = async () => {
    try {
      setLoading(true);
      const response = await api.get('/quote-requests');
      setQuoteRequests(response.data || []);
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
      alert('Error al cargar las solicitudes de presupuesto');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await api.put(`/quote-requests/${id}`, { status: newStatus });
      await loadQuoteRequests();
      alert('✅ Estado actualizado correctamente');
    } catch (error) {
      console.error('Error actualizando estado:', error);
      alert('❌ Error al actualizar el estado');
    }
  };

  const deleteRequest = async (id: string) => {
    if (!confirm('¿Seguro que quieres eliminar esta solicitud?')) return;
    
    try {
      await api.delete(`/quote-requests/${id}`);
      await loadQuoteRequests();
      alert('✅ Solicitud eliminada');
    } catch (error) {
      console.error('Error eliminando solicitud:', error);
      alert('❌ Error al eliminar la solicitud');
    }
  };

  const searchProducts = async (term: string) => {
    if (!term.trim()) {
      setSearchResults([]);
      return;
    }

    setLoadingSearch(true);
    try {
      const [productsRes, packsRes, montajesRes] = await Promise.all([
        api.get(`/products?search=${term}&limit=10`),
        api.get(`/packs?search=${term}&limit=10`),
        api.get(`/packs?search=${term}&limit=10&category=MONTAJE`),
      ]);

      const products = (productsRes?.products || []).map((p: any) => ({
        ...p,
        type: 'product',
        displayName: `📦 ${p.name}`,
      }));

      const packs = (packsRes?.packs || []).map((p: any) => ({
        ...p,
        type: 'pack',
        displayName: `📋 ${p.name}`,
      }));

      const montajes = (montajesRes?.packs || []).map((p: any) => ({
        ...p,
        type: 'montaje',
        displayName: `🚚 ${p.name}`,
      }));

      setSearchResults([...products, ...packs, ...montajes]);
    } catch (error) {
      console.error('Error buscando productos:', error);
    } finally {
      setLoadingSearch(false);
    }
  };

  const addItemToQuote = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const isPersonal = isPersonalProduct(product);
    const isConsumable = product.isConsumable;
    const price = isConsumable ? (product.pricePerUnit || 0) : (product.pricePerDay || 0);
    
    // Para personal: calcular total inicial (1 persona × 1 hora)
    const initialTotal = isPersonal ? price * 1 * 1 : price * 1;
    
    const newItem: QuoteItem = {
      id: `product-${product.id}`,
      type: 'product',
      name: product.name,
      quantity: isPersonal ? 1 : 1, // Para personal será numberOfPeople × hoursPerPerson
      numberOfPeople: isPersonal ? 1 : undefined,
      hoursPerPerson: isPersonal ? 1 : undefined,
      pricePerDay: price,
      purchasePrice: product.purchasePrice || 0,
      totalPrice: initialTotal,
      isPersonal,
      isConsumable,
      category: product.category?.name,
    };

    setQuoteItems([...quoteItems, newItem]);
  };

  const updateItemPersonal = (id: string, numberOfPeople: number, hoursPerPerson: number) => {
    setQuoteItems(quoteItems.map(item =>
      item.id === id
        ? {
            ...item,
            numberOfPeople,
            hoursPerPerson,
            quantity: numberOfPeople * hoursPerPerson,
            totalPrice: item.pricePerDay * numberOfPeople * hoursPerPerson
          }
        : item
    ));
  };

  const removeItemFromQuote = (id: string) => {
    setQuoteItems(quoteItems.filter(item => item.id !== id));
  };

  const updateItemQuantity = (id: string, quantity: number) => {
    setQuoteItems(quoteItems.map(item =>
      item.id === id
        ? { ...item, quantity, totalPrice: item.pricePerDay * quantity }
        : item
    ));
  };

  const calculateQuoteTotal = () => {
    return quoteItems.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
  };

  // Calcular análisis de rentabilidad (igual que en Montajes)
  const calculatePackTotals = () => {
    let totalPricePerDay = 0;
    let totalShipping = 0;
    let totalInstallation = 0;
    
    // Costes separados
    let costMaterial = 0;
    let costPersonal = 0;
    let costDepreciation = 0;
    let costShippingInstallation = 0;

    quoteItems.forEach((item) => {
      const product = products.find((p: any) => p.id === item.id.replace('product-', ''));
      if (product) {
        const isPersonal = item.isPersonal;
        const isConsumable = item.isConsumable;
        
        const effectiveQuantity = isPersonal
          ? (item.numberOfPeople || 1) * (item.hoursPerPerson || 1)
          : item.quantity;

        const unitPrice = isConsumable 
          ? Number((product as any).pricePerUnit || 0)
          : Number((product as any).pricePerDay || 0);
        const itemPrice = unitPrice * effectiveQuantity;
        
        if (isPersonal) {
          const personalCost = Number((product as any).purchasePrice || 0) * effectiveQuantity;
          costPersonal += personalCost;
        } else if (isConsumable) {
          const consumableCost = Number((product as any).purchasePrice || 0) * effectiveQuantity;
          costDepreciation += consumableCost;
        } else {
          const depreciationRate = 0.05;
          const depreciation = Number((product as any).purchasePrice || 0) * effectiveQuantity * depreciationRate;
          costDepreciation += depreciation;
        }

        totalPricePerDay += itemPrice;
        
        if (formData.includeShipping) {
          const shippingPrice = Number((product as any).shippingCost || 0) * effectiveQuantity;
          totalShipping += shippingPrice;
          costShippingInstallation += shippingPrice;
        }
        if (formData.includeInstallation) {
          const installationPrice = Number((product as any).installationCost || 0) * effectiveQuantity;
          totalInstallation += installationPrice;
          costShippingInstallation += installationPrice;
        }
      }
    });

    totalShipping = totalShipping / 2;
    totalInstallation = totalInstallation / 2;
    costShippingInstallation = costShippingInstallation / 2;

    const subtotal = totalPricePerDay + totalShipping + totalInstallation;
    const calculatedTotal = subtotal + (formData.transportCost || 0) + (formData.rentalCost || 0);
    const finalPrice = formData.finalPrice || calculatedTotal;

    const transportCostValue = formData.transportCost || 0;
    const rentalCostValue = formData.rentalCost || 0;
    
    const totalCost = costMaterial + costPersonal + costShippingInstallation + costDepreciation + transportCostValue + rentalCostValue;
    const profit = finalPrice - totalCost;
    const profitMargin = finalPrice > 0 ? (profit / finalPrice) * 100 : 0;

    return {
      totalPricePerDay,
      totalShipping,
      totalInstallation,
      subtotal,
      finalPrice,
      costMaterial,
      costPersonal,
      costShippingInstallation,
      costDepreciation,
      transportCost: transportCostValue,
      rentalCost: rentalCostValue,
      totalCost,
      profit,
      profitMargin
    };
  };

  const createQuoteRequest = async () => {
    if (!formData.customerName || !formData.customerEmail || !formData.eventType) {
      alert('Por favor completa los campos obligatorios: Nombre, Email y Tipo de Evento');
      return;
    }

    // Calcular total con IVA de los conceptos del PDF
    const subtotal = pdfData.concepts.reduce((sum, c) => sum + c.price, 0);
    const totalWithIVA = subtotal * 1.21;

    try {
      await api.post('/quote-requests', {
        ...formData,
        status: 'PENDING',
        estimatedTotal: totalWithIVA,
        selectedExtras: JSON.stringify({
          products: quoteItems,
          pdfConcepts: pdfData.concepts,
          pdfTitle: pdfData.title,
          pdfFooter: pdfData.footer,
        }),
      });
      alert('✅ Presupuesto creado correctamente');
      setShowCreateModal(false);
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        eventType: '',
        attendees: 1,
        duration: 1,
        durationType: 'hours',
        eventDate: '',
        eventLocation: '',
        estimatedTotal: 0,
        notes: '',
        transportCost: 0,
        rentalCost: 0,
        finalPrice: 0,
        includeShipping: true,
        includeInstallation: true,
      });
      setQuoteItems([]);
      setPdfData({
        title: 'Presupuesto',
        showItemDetails: false,
        concepts: [],
        footer: 'Gracias por confiar en nosotros',
      });
      setNewConceptName('');
      setNewConceptPrice(0);
      await loadQuoteRequests();
    } catch (error) {
      console.error('Error creando presupuesto:', error);
      alert('❌ Error al crear el presupuesto');
    } finally {
      setLoadingSearch(false);
    }
  };

  // Convertir presupuesto aceptado en pedido
  const convertToOrder = async (request: QuoteRequest) => {
    if (!confirm('¿Convertir este presupuesto en un pedido?')) return;
    
    try {
      // Aquí deberías llamar al endpoint para crear el pedido
      // await api.post('/orders', { ...datos del pedido });
      alert('✅ Pedido creado correctamente');
      await loadQuoteRequests();
    } catch (error) {
      console.error('Error creando pedido:', error);
      alert('❌ Error al crear el pedido');
    }
  };

  // Generar PDF del presupuesto
  const generatePDF = async (request: QuoteRequest) => {
    try {
      // Cargar datos de la empresa
      let companyData: any = {
        companyName: 'Resona Events',
        taxId: 'B-XXXXXXXX',
        address: 'C/ Ejemplo, 123',
        city: 'Madrid',
        postalCode: '28000',
        phone: '+34 XXX XXX XXX',
        email: 'info@resonaevents.com',
      };
      
      try {
        const settings = await companyService.getSettings();
        if (settings) {
          companyData = settings;
        }
      } catch (e) {
        console.warn('No se pudieron cargar los datos de la empresa, usando valores por defecto');
      }
      
      const doc = new jsPDF();
      
      // Parsear datos del presupuesto
      let pdfConcepts: Array<{name: string, price: number}> = [];
      let pdfTitle = 'Presupuesto';
      let pdfFooter = 'Gracias por confiar en nosotros';
      
      try {
        if (request.selectedExtras && request.selectedExtras !== '[]' && request.selectedExtras !== '{}') {
          let extras;
          
          // Intentar parsear el JSON
          try {
            extras = typeof request.selectedExtras === 'string' 
              ? JSON.parse(request.selectedExtras) 
              : request.selectedExtras;
          } catch (parseError) {
            console.warn('No se pudo parsear selectedExtras:', parseError);
            extras = null;
          }
          
          // Formato nuevo (con conceptos personalizados)
          if (extras && extras.pdfConcepts && Array.isArray(extras.pdfConcepts) && extras.pdfConcepts.length > 0) {
            pdfConcepts = extras.pdfConcepts;
            pdfTitle = extras.pdfTitle || 'Presupuesto';
            pdfFooter = extras.pdfFooter || 'Gracias por confiar en nosotros';
          } 
          // Formato viejo (solo productos) - array no vacío
          else if (extras && Array.isArray(extras) && extras.length > 0) {
            // Presupuesto viejo: usar productos directamente
            pdfConcepts = [{
              name: 'Servicios solicitados',
              price: Number(request.estimatedTotal) / 1.21 // Quitar IVA porque lo calculamos después
            }];
          }
          // Si no hay datos válidos, usar el total
          else {
            pdfConcepts = [{
              name: 'Servicios solicitados',
              price: Number(request.estimatedTotal || 0) / 1.21
            }];
          }
        } else {
          // Si selectedExtras está vacío o es null, usar solo el total
          pdfConcepts = [{
            name: 'Servicios solicitados',
            price: Number(request.estimatedTotal || 0) / 1.21
          }];
        }
      } catch (e) {
        console.error('Error parseando extras:', e);
        // Si falla, usar solo el total
        pdfConcepts = [{
          name: 'Servicios solicitados',
          price: Number(request.estimatedTotal || 0) / 1.21
        }];
      }

      // Header empresarial tipo factura con color corporativo #5ebbff
      doc.setFillColor(94, 187, 255); // Color Resona
      doc.rect(0, 0, 210, 50, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text(companyData.companyName || 'RESONA EVENTS', 20, 25);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Sonido | Iluminación | Eventos', 20, 32);
      doc.text(`CIF: ${companyData.taxId || 'B-XXXXXXXX'}`, 20, 38);
      doc.text(`Tel: ${companyData.phone || '+34 XXX XXX XXX'}`, 20, 44);
      
      // Tipo de documento en la esquina
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text(pdfTitle.toUpperCase(), 190, 30, { align: 'right' });
      
      // Número de presupuesto
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const presupuestoNum = `P-${request.id.substring(0, 8).toUpperCase()}`;
      doc.text(presupuestoNum, 190, 38, { align: 'right' });
      doc.text(new Date().toLocaleDateString('es-ES'), 190, 44, { align: 'right' });

      // Información del cliente (tipo factura)
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL CLIENTE:', 20, 65);
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`${request.customerName || 'Cliente'}`, 20, 72);
      if (request.customerEmail) doc.text(`Email: ${request.customerEmail}`, 20, 78);
      if (request.customerPhone) doc.text(`Tel: ${request.customerPhone}`, 20, 84);
      
      // Datos del evento
      doc.setFont('helvetica', 'bold');
      doc.text('DATOS DEL EVENTO:', 120, 65);
      doc.setFont('helvetica', 'normal');
      doc.text(`Tipo: ${request.eventType || 'No especificado'}`, 120, 72);
      if (request.eventDate) doc.text(`Fecha: ${new Date(request.eventDate).toLocaleDateString('es-ES')}`, 120, 78);
      if (request.eventLocation) doc.text(`Lugar: ${request.eventLocation}`, 120, 84);

      // Línea separadora más gruesa
      doc.setDrawColor(100, 100, 100);
      doc.setLineWidth(0.5);
      doc.line(20, 95, 190, 95);

      // Tabla de conceptos tipo factura
      let yPos = 105;
      
      // Cabecera de tabla
      doc.setFillColor(240, 240, 240);
      doc.rect(20, yPos, 170, 8, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0, 0, 0);
      doc.text('DESCRIPCIÓN', 25, yPos + 5);
      doc.text('IMPORTE', 180, yPos + 5, { align: 'right' });
      
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      if (pdfConcepts.length > 0) {
        pdfConcepts.forEach((concept, index) => {
          // Fondo alternado
          if (index % 2 === 0) {
            doc.setFillColor(250, 250, 250);
            doc.rect(20, yPos - 3, 170, 7, 'F');
          }
          
          doc.setTextColor(50, 50, 50);
          doc.text(concept.name, 25, yPos + 2);
          doc.setFont('helvetica', 'bold');
          doc.text(`${concept.price.toFixed(2)} €`, 185, yPos + 2, { align: 'right' });
          doc.setFont('helvetica', 'normal');
          yPos += 7;
        });
      } else {
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(150, 150, 150);
        doc.text('No hay conceptos definidos', 25, yPos + 2);
        yPos += 7;
      }

      // Línea separadora
      yPos += 3;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, yPos, 190, yPos);
      yPos += 10;

      // Cuadro de totales tipo factura
      const subtotal = pdfConcepts.reduce((sum, c) => sum + c.price, 0);
      const iva = subtotal * 0.21;
      const total = subtotal * 1.21;

      const boxTop = yPos;
      
      // Subtotal
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      doc.text('Base imponible:', 125, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`${subtotal.toFixed(2)} €`, 185, yPos, { align: 'right' });
      
      yPos += 7;
      doc.setFont('helvetica', 'normal');
      doc.text('IVA (21%):', 125, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`${iva.toFixed(2)} €`, 185, yPos, { align: 'right' });
      
      // Línea separadora antes del total
      yPos += 5;
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.5);
      doc.line(120, yPos, 190, yPos);
      
      // Total destacado con color corporativo
      yPos += 8;
      doc.setFillColor(94, 187, 255); // Color Resona
      doc.rect(120, yPos - 5, 70, 10, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255); // Texto blanco sobre fondo azul
      doc.text('TOTAL:', 125, yPos + 2);
      doc.text(`${total.toFixed(2)} €`, 185, yPos + 2, { align: 'right' });
      
      // Borde del cuadro de totales
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.rect(120, boxTop - 3, 70, yPos - boxTop + 8);

      // Condiciones y notas
      yPos += 15;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      doc.text('CONDICIONES:', 20, yPos);
      yPos += 5;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.setFontSize(8);
      const conditions = [
        '• Validez del presupuesto: 30 días',
        '• Forma de pago:',
        '  - 25% al reservar (señal)',
        '  - 50% un mes antes del evento',
        '  - 25% el día del evento',
        '• El precio no incluye permisos especiales si fueran necesarios'
      ];
      conditions.forEach(cond => {
        doc.text(cond, 20, yPos);
        yPos += 4;
      });
      
      // Mensaje personalizado
      if (pdfFooter && pdfFooter !== 'Gracias por confiar en nosotros') {
        yPos += 5;
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(9);
        doc.text(pdfFooter, 20, yPos, { maxWidth: 170 });
      }

      // Footer tipo factura con datos reales
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(20, 275, 190, 275);
      
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`${companyData.companyName || 'RESONA EVENTS'} | CIF: ${companyData.taxId || 'B-XXXXXXXX'}`, 105, 280, { align: 'center' });
      const address = `${companyData.address || 'C/ Ejemplo, 123'} - ${companyData.postalCode || '28000'} ${companyData.city || 'Madrid'}`;
      doc.text(`Dirección: ${address}`, 105, 285, { align: 'center' });
      doc.text(`Tel: ${companyData.phone || '+34 XXX XXX XXX'} | Email: ${companyData.email || 'info@resonaevents.com'}`, 105, 290, { align: 'center' });

      // Descargar PDF
      const fileName = `Presupuesto_${presupuestoNum}_${request.customerName?.replace(/[^a-z0-9]/gi, '_')}.pdf`;
      doc.save(fileName);
      alert('✅ PDF generado correctamente');
      
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('❌ Error al generar el PDF');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'CONTACTED': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'QUOTED': return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'CONVERTED': return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="w-4 h-4" />;
      case 'CONTACTED': return <Phone className="w-4 h-4" />;
      case 'QUOTED': return <Mail className="w-4 h-4" />;
      case 'CONVERTED': return <CheckCircle className="w-4 h-4" />;
      case 'REJECTED': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendiente';
      case 'CONTACTED': return 'Contactado';
      case 'QUOTED': return 'Presupuesto Enviado';
      case 'CONVERTED': return 'Aceptado';
      case 'REJECTED': return 'Rechazado';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Solicitudes de Presupuesto</h1>
          <p className="text-gray-600">
            Gestiona las solicitudes de contacto y presupuesto de los clientes
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-resona hover:bg-resona-dark text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Crear Presupuesto
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-yellow-600 font-medium">Pendientes</p>
              <p className="text-2xl font-bold text-yellow-900">
                {quoteRequests.filter(q => q.status === 'PENDING').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Contactados</p>
              <p className="text-2xl font-bold text-blue-900">
                {quoteRequests.filter(q => q.status === 'CONTACTED').length}
              </p>
            </div>
            <Phone className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Aceptados</p>
              <p className="text-2xl font-bold text-green-900">
                {quoteRequests.filter(q => q.status === 'CONVERTED').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {quoteRequests.length}
              </p>
            </div>
            <Package className="w-8 h-8 text-gray-600" />
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="bg-white rounded-lg shadow">
        {quoteRequests.length === 0 ? (
          <div className="p-12 text-center">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No hay solicitudes de presupuesto</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Evento</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Est.</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {quoteRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{request.customerName || 'Sin nombre'}</p>
                        {request.customerPhone && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {request.customerPhone}
                          </p>
                        )}
                        {request.customerEmail && (
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.customerEmail}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{request.eventType}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {request.attendees} personas
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{request.eventDate || 'Sin fecha'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('es-ES')}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-resona">
                        {request.estimatedTotal ? `€${Number(request.estimatedTotal).toFixed(2)}` : '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Ver detalles"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="text-red-600 hover:text-red-800"
                          title="Eliminar"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de detalle */}
      {showDetailModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-2xl font-bold">Detalle de Solicitud</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>

            {/* Información del cliente */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Información del Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Nombre</p>
                  <p className="font-medium">{selectedRequest.customerName || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Teléfono</p>
                  <p className="font-medium">{selectedRequest.customerPhone || '-'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{selectedRequest.customerEmail || '-'}</p>
                </div>
              </div>
            </div>

            {/* Información del evento */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Información del Evento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tipo de Evento</p>
                  <p className="font-medium">{selectedRequest.eventType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asistentes</p>
                  <p className="font-medium">{selectedRequest.attendees} personas</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="font-medium">{selectedRequest.duration} {selectedRequest.durationType === 'hours' ? 'horas' : 'días'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha del Evento</p>
                  <p className="font-medium">{selectedRequest.eventDate || 'No especificada'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Ubicación</p>
                  <p className="font-medium">{selectedRequest.eventLocation || 'No especificada'}</p>
                </div>
              </div>
            </div>

            {/* Total estimado */}
            {selectedRequest.estimatedTotal && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Total Estimado</p>
                <p className="text-3xl font-bold text-green-900">
                  €{Number(selectedRequest.estimatedTotal).toFixed(2)}
                </p>
              </div>
            )}

            {/* Notas */}
            {selectedRequest.notes && (
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Notas</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedRequest.notes}</p>
              </div>
            )}

            {/* Cambiar estado */}
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-3">Cambiar Estado</h3>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'PENDING')}
                  className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium"
                >
                  Pendiente
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'CONTACTED')}
                  className="px-4 py-2 bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                >
                  Contactado
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'QUOTED')}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 transition-colors text-sm font-medium"
                >
                  Presupuesto Enviado
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'CONVERTED')}
                  className="px-4 py-2 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  Aceptado
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'REJECTED')}
                  className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  Rechazado
                </button>
              </div>
            </div>

            {/* Enlace de Pago (si está aceptado) */}
            {selectedRequest?.status === 'CONVERTED' && (selectedRequest as any).paymentToken && (
              <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4 mb-4">
                <p className="text-sm font-bold text-green-900 mb-2">💳 Enlace de Pago para Cliente:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}/pagar/${(selectedRequest as any).paymentToken}`}
                    className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-sm"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/pagar/${(selectedRequest as any).paymentToken}`);
                      alert('✅ Enlace copiado al portapapeles');
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-colors"
                  >
                    Copiar
                  </button>
                </div>
                <p className="text-xs text-green-700 mt-2">
                  Envía este enlace al cliente para que pueda realizar los pagos fraccionados
                </p>
              </div>
            )}

            <div className="flex gap-3">
              {selectedRequest?.status === 'CONVERTED' && (
                <button
                  onClick={() => convertToOrder(selectedRequest)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Package className="w-5 h-5" />
                  Convertir en Pedido
                </button>
              )}
              <button
                onClick={async () => {
                  if (selectedRequest) {
                    await generatePDF(selectedRequest);
                  }
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors"
              >
                📄 Generar PDF
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear presupuesto - BASADO EN MONTAJES */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Crear Presupuesto</h2>
                <button onClick={() => {
                  setShowCreateModal(false);
                  setActiveTab('presupuesto');
                }} className="text-gray-500 hover:text-gray-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Pestañas */}
              <div className="flex border-b border-gray-200 mb-6">
                <button
                  onClick={() => setActiveTab('presupuesto')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'presupuesto'
                      ? 'border-resona text-resona'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📝 Crear Presupuesto
                </button>
                <button
                  onClick={() => setActiveTab('pdf')}
                  className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'pdf'
                      ? 'border-resona text-resona'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  📄 Editar PDF Cliente
                </button>
              </div>

              {/* Contenido de la pestaña Presupuesto */}
              {activeTab === 'presupuesto' && (
              <div className="space-y-6">
                {/* Información Básica */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Información del Cliente</h3>
                  <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                    placeholder="email@ejemplo.com"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                    placeholder="+34 123 456 789"
                  />
                </div>
              </div>
                </div>

                {/* Información del evento */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Información del Evento</h3>
                  <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Evento *</label>
                  <input
                    type="text"
                    value={formData.eventType}
                    onChange={(e) => setFormData({...formData, eventType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                    placeholder="Boda, Cumpleaños, Corporativo..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Asistentes</label>
                  <input
                    type="number"
                    value={formData.attendees}
                    onChange={(e) => setFormData({...formData, attendees: parseInt(e.target.value) || 1})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({...formData, duration: parseInt(e.target.value) || 1})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                      min="1"
                    />
                    <select
                      value={formData.durationType}
                      onChange={(e) => setFormData({...formData, durationType: e.target.value})}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                    >
                      <option value="hours">Horas</option>
                      <option value="days">Días</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del Evento</label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={formData.eventLocation}
                    onChange={(e) => setFormData({...formData, eventLocation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                    placeholder="Dirección del evento"
                  />
                </div>
              </div>
                </div>

                {/* Productos y Servicios - Layout 60/40 */}
                <div className="grid grid-cols-3 gap-3">
              {/* IZQUIERDA: Buscar y Agregar (60%) */}
              <div className="col-span-2 space-y-2">
                <h3 className="text-sm font-bold flex items-center gap-1 text-gray-900">
                  <Package className="w-4 h-4 text-blue-600" />
                  Buscar y Añadir Productos
                </h3>

                {/* Filtros */}
                <div className="flex gap-1">
                  <select
                    value={productFilter.categoryId}
                    onChange={(e) => setProductFilter({ ...productFilter, categoryId: e.target.value })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 bg-white"
                  >
                    <option value="">📁 Todas</option>
                    {categories.filter(c => !c.name?.toLowerCase().includes('pack')).map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={productFilter.search}
                    onChange={(e) => setProductFilter({ ...productFilter, search: e.target.value })}
                    className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                    placeholder="🔍 Buscar..."
                  />
                </div>

                {/* Lista de productos disponibles */}
                <div className="bg-white border border-gray-300 rounded max-h-[500px] overflow-y-auto">
                  {getAvailableProducts().length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      <Package className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                      <p className="text-xs">No hay productos</p>
                      <button
                        onClick={() => setProductFilter({ categoryId: '', search: '' })}
                        className="mt-1 text-xs text-blue-600 hover:underline"
                      >
                        Limpiar
                      </button>
                    </div>
                  ) : (
                    <div className="divide-y">
                      {getAvailableProducts().map((product) => {
                        const isAdded = quoteItems.some(item => item.id === `product-${product.id}`);
                        const isPerson = isPersonalProduct(product);
                        const isConsumable = product.isConsumable;
                        const price = isConsumable ? (product.pricePerUnit || 0) : (product.pricePerDay || 0);
                        const unit = isPerson ? 'hora' : isConsumable ? 'unidad' : 'día';
                        
                        return (
                          <div key={product.id} className="flex items-center justify-between px-2 py-1 hover:bg-gray-50">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex px-1 py-0.5 rounded text-xs font-bold ${
                                  isPerson ? 'bg-purple-600 text-white' : isConsumable ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'
                                }`}>
                                  {isPerson ? '👤' : isConsumable ? '🔥' : '📦'}
                                </span>
                                <span className="font-medium text-gray-900 text-xs truncate">{product.name}</span>
                                <span className={`text-xs font-semibold ml-auto ${
                                  isPerson ? 'text-purple-700' : isConsumable ? 'text-orange-700' : 'text-green-700'
                                }`}>
                                  €{price}/{unit}
                                </span>
                              </div>
                            </div>
                            <button
                              onClick={() => addItemToQuote(product.id)}
                              disabled={isAdded}
                              className={`px-2 py-0.5 rounded text-xs font-medium ml-2 ${
                                isAdded
                                  ? 'bg-gray-200 text-gray-500'
                                  : 'bg-blue-600 text-white hover:bg-blue-700'
                              }`}
                            >
                              {isAdded ? '✓' : '+'}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* DERECHA: Items en el Presupuesto (40%) */}
              <div className="col-span-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900">En el Presupuesto</h3>
                  <span className="bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    {quoteItems.length}
                  </span>
                </div>

                {quoteItems.length === 0 ? (
                  <div className="text-center py-6 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-300">
                    <Package className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                    <p className="text-xs">Sin productos</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-300 rounded max-h-[500px] overflow-y-auto divide-y divide-gray-200">
                    {quoteItems.map((item) => {
                      const isPersonal = item.isPersonal;
                      const isConsumable = item.isConsumable;
                      const effectiveQuantity = isPersonal ? (item.numberOfPeople || 1) * (item.hoursPerPerson || 1) : item.quantity;
                      return (
                        <div key={item.id} className="p-1.5">
                          {/* Header */}
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className={`inline-flex px-1 py-0.5 rounded text-xs font-bold ${
                                  isPersonal ? 'bg-purple-600 text-white' : isConsumable ? 'bg-orange-600 text-white' : 'bg-green-600 text-white'
                                }`}>
                                  {isPersonal ? '👤' : isConsumable ? '🔥' : '📦'}
                                </span>
                                <span className="font-medium text-xs text-gray-900 truncate">{item.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <div className={`font-bold text-sm ${
                                isPersonal ? 'text-purple-700' : isConsumable ? 'text-orange-700' : 'text-green-700'
                              }`}>
                                €{(item.totalPrice || 0).toFixed(2)}
                              </div>
                              <button onClick={() => removeItemFromQuote(item.id)} className="text-red-600 text-xs">🗑️</button>
                            </div>
                          </div>
                          
                          {/* Controles */}
                          {isPersonal ? (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-gray-600">P:</span>
                              <button onClick={() => updateItemPersonal(item.id, Math.max(1, (item.numberOfPeople || 1) - 1), item.hoursPerPerson || 1)} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">-</button>
                              <input
                                type="number"
                                min="1"
                                value={item.numberOfPeople || 1}
                                onChange={(e) => updateItemPersonal(item.id, parseInt(e.target.value) || 1, item.hoursPerPerson || 1)}
                                className="w-10 px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                              />
                              <button onClick={() => updateItemPersonal(item.id, (item.numberOfPeople || 1) + 1, item.hoursPerPerson || 1)} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">+</button>
                              <span className="text-gray-600 ml-1">H:</span>
                              <button onClick={() => updateItemPersonal(item.id, item.numberOfPeople || 1, Math.max(0.5, (item.hoursPerPerson || 1) - 0.5))} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">-</button>
                              <input
                                type="number"
                                min="0.5"
                                step="0.5"
                                value={item.hoursPerPerson || 1}
                                onChange={(e) => updateItemPersonal(item.id, item.numberOfPeople || 1, parseFloat(e.target.value) || 1)}
                                className="w-10 px-1 py-0.5 border border-gray-300 rounded text-xs text-center"
                              />
                              <button onClick={() => updateItemPersonal(item.id, item.numberOfPeople || 1, (item.hoursPerPerson || 1) + 0.5)} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">+</button>
                              <span className="text-purple-700 font-medium ml-auto text-xs">=&nbsp;{effectiveQuantity.toFixed(1)}h</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-xs">
                              <span className="text-gray-600">Cant:</span>
                              <button onClick={() => updateItemQuantity(item.id, Math.max(1, item.quantity - 1))} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">-</button>
                              <input type="number" min="1" value={item.quantity} onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)} className="w-10 px-1 py-0.5 border border-gray-300 rounded text-xs text-center" />
                              <button onClick={() => updateItemQuantity(item.id, item.quantity + 1)} className="px-1 py-0.5 bg-gray-200 hover:bg-gray-300 rounded">+</button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
                </div>

                {/* Paneles de Gestión del Presupuesto - Debajo de productos */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Precio Final Grande */}
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-500 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-green-700 mb-1">💰 Precio Final</p>
                        <p className="text-sm text-green-600">
                          {formData.finalPrice > 0 ? 'Personalizado' : 'Automático'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-green-600">
                          €{(formData.finalPrice || (calculateQuoteTotal() + (formData.transportCost || 0) + (formData.rentalCost || 0))).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Checkboxes de Inclusión */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.includeShipping}
                          onChange={(e) => setFormData({ ...formData, includeShipping: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">
                          ✅ <strong>Incluir transporte</strong> en el precio
                        </span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.includeInstallation}
                          onChange={(e) => setFormData({ ...formData, includeInstallation: e.target.checked })}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <span className="text-sm text-gray-700">
                          ✅ <strong>Incluir montaje/instalación</strong> en el precio
                        </span>
                      </label>
                    </div>
                    <p className="text-xs text-purple-700 mt-2">
                      Desmarca las opciones para packs sin transporte o montaje
                    </p>
                  </div>

                  {/* Desglose de Costes */}
                  <div className="bg-blue-50 border-2 border-blue-500 rounded-lg p-4">
                    <h4 className="text-sm font-bold text-blue-800 mb-3 flex items-center gap-2">
                      <Calculator className="w-4 h-4" />
                      Desglose de Costes
                    </h4>
                    <div className="space-y-2 text-sm">
                      {/* Productos */}
                      {calculateQuoteTotal() > 0 && (
                        <div className="flex justify-between">
                          <span className="text-blue-700">Productos/Servicios:</span>
                          <span className="font-medium text-blue-900">€{calculateQuoteTotal().toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Transporte */}
                      {(formData.transportCost || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-amber-700">🚚 Transporte:</span>
                          <span className="font-medium text-amber-900">€{(formData.transportCost || 0).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Alquiler */}
                      {(formData.rentalCost || 0) > 0 && (
                        <div className="flex justify-between">
                          <span className="text-purple-700">📦 Alquiler Externo:</span>
                          <span className="font-medium text-purple-900">€{(formData.rentalCost || 0).toFixed(2)}</span>
                        </div>
                      )}
                      
                      {/* Total Calculado */}
                      <div className="border-t-2 border-blue-300 pt-2 mt-2">
                        <div className="flex justify-between font-semibold">
                          <span className="text-blue-800">Total Calculado:</span>
                          <span className="text-blue-900">€{(calculateQuoteTotal() + (formData.transportCost || 0) + (formData.rentalCost || 0)).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between font-semibold mt-2">
                          <span className="text-blue-800">Precio Final:</span>
                          <span className="text-blue-900">
                            €{(formData.finalPrice || (calculateQuoteTotal() + (formData.transportCost || 0) + (formData.rentalCost || 0))).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Advertencia si el precio personalizado difiere */}
                    {formData.finalPrice > 0 && 
                     Math.abs(formData.finalPrice - (calculateQuoteTotal() + (formData.transportCost || 0) + (formData.rentalCost || 0))) > 0.01 && (
                      <div className="mt-3 bg-yellow-100 border border-yellow-300 rounded p-2">
                        <p className="text-xs text-yellow-700 font-medium">
                          💡 Has establecido un precio personalizado diferente al calculado
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Vacío para mantener grid */}
                  <div></div>

                  {/* Coste de Transporte */}
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-amber-900 mb-2">
                      🚚 Coste de Transporte e Instalación (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.transportCost}
                      onChange={(e) => setFormData({ ...formData, transportCost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                      placeholder="Ej: 50.00"
                    />
                    <p className="text-xs text-amber-700 mt-2">
                      Coste manual del transporte e instalación
                    </p>
                  </div>

                  {/* Coste de Alquiler Externo */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-purple-900 mb-2">
                      📦 Coste de Alquiler Externo (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.rentalCost}
                      onChange={(e) => setFormData({ ...formData, rentalCost: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="Ej: 100.00"
                    />
                    <p className="text-xs text-purple-700 mt-2">
                      Equipos o servicios alquilados externamente
                    </p>
                  </div>

                  {/* Precio Final Personalizado - Ocupa toda la fila */}
                  <div className="col-span-2">
                    <details className="bg-blue-50 border border-blue-200 rounded-lg">
                      <summary className="px-4 py-3 cursor-pointer text-sm font-medium text-blue-800 hover:bg-blue-100 rounded-lg">
                        ▼ Establecer Precio Final Personalizado (opcional)
                      </summary>
                      <div className="p-4 pt-2">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.finalPrice}
                          onChange={(e) => setFormData({ ...formData, finalPrice: parseFloat(e.target.value) || 0 })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Dejar vacío para usar cálculo automático"
                        />
                        <p className="text-xs text-gray-600 mt-2">
                          Si introduces un valor aquí, se ignorará el cálculo automático.
                        </p>
                      </div>
                    </details>
                  </div>
                </div>

                {/* Análisis de Rentabilidad - Debajo de selección de productos */}
                {quoteItems.length > 0 && (() => {
                  const totals = calculatePackTotals();
                  return (
                    <div className="bg-orange-50 border-2 border-orange-500 rounded-lg p-4">
                      <h4 className="text-sm font-bold text-orange-800 mb-3 flex items-center gap-2">
                        <Calculator className="w-4 h-4" />
                        Análisis de Rentabilidad
                      </h4>
                      <div className="space-y-2 text-sm">
                        {/* Costes Detallados */}
                        <div className="border-t border-orange-200 pt-3 mt-2">
                          <div className="text-xs font-bold text-orange-800 mb-2 uppercase">Costes:</div>
                          <div className="space-y-1.5 text-sm">
                            {totals.costMaterial > 0 && (
                              <div className="flex justify-between">
                                <span className="text-orange-700">Total costes material:</span>
                                <span className="font-medium text-orange-900">€{totals.costMaterial.toFixed(2)}</span>
                              </div>
                            )}
                            {totals.costPersonal > 0 && (
                              <div className="flex justify-between">
                                <span className="text-orange-700">Total costes personal:</span>
                                <span className="font-medium text-orange-900">€{totals.costPersonal.toFixed(2)}</span>
                              </div>
                            )}
                            {totals.costShippingInstallation > 0 && (
                              <div className="flex justify-between">
                                <span className="text-orange-700">Total coste envío+montaje:</span>
                                <span className="font-medium text-orange-900">€{totals.costShippingInstallation.toFixed(2)}</span>
                              </div>
                            )}
                            {totals.costDepreciation > 0 && (
                              <div className="flex justify-between">
                                <span className="text-orange-700">Total coste amortización:</span>
                                <span className="font-medium text-orange-900">€{totals.costDepreciation.toFixed(2)}</span>
                              </div>
                            )}
                            {totals.transportCost > 0 && (
                              <div className="flex justify-between">
                                <span className="text-amber-700">🚚 Coste transporte:</span>
                                <span className="font-medium text-amber-900">€{totals.transportCost.toFixed(2)}</span>
                              </div>
                            )}
                            {totals.rentalCost > 0 && (
                              <div className="flex justify-between">
                                <span className="text-purple-700">📦 Coste alquiler:</span>
                                <span className="font-medium text-purple-900">€{totals.rentalCost.toFixed(2)}</span>
                              </div>
                            )}
                            
                            <div className="border-t-2 border-orange-300 pt-2 mt-2">
                              <div className="flex justify-between font-semibold">
                                <span className="text-orange-800">Coste Total:</span>
                                <span className="text-orange-900">€{totals.totalCost.toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold mt-2">
                                <span className="text-orange-800">Precio Venta:</span>
                                <span className="text-orange-900">€{totals.finalPrice.toFixed(2)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-orange-600 mt-2 italic">
                            * Amortización: 5% del valor | Personal: coste/hora
                          </div>
                        </div>
                        <div className="border-t border-orange-200 pt-2 mt-2">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-orange-800">Beneficio:</span>
                            <span className={`text-lg font-bold ${totals.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              €{totals.profit.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <span className="font-semibold text-orange-800">Margen:</span>
                            <span className={`text-lg font-bold ${totals.profitMargin >= 30 ? 'text-green-600' : totals.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {totals.profitMargin.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      </div>
                      {totals.profit < 0 && (
                        <div className="mt-3 bg-red-100 border border-red-300 rounded p-2">
                          <p className="text-xs text-red-700 font-medium">
                            ⚠️ Beneficio negativo: El precio de venta (€{totals.finalPrice.toFixed(2)}) es menor que los costes totales (€{totals.totalCost.toFixed(2)}). 
                            Aumenta el precio final o reduce costes.
                          </p>
                        </div>
                      )}
                      {totals.profit >= 0 && totals.profitMargin < 15 && totals.totalCost > 0 && (
                        <div className="mt-3 bg-yellow-100 border border-yellow-300 rounded p-2">
                          <p className="text-xs text-yellow-700 font-medium">
                            ⚠️ Margen bajo: considera aumentar el precio o reducir costes
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Notas */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Notas</h3>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas adicionales</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-resona"
                rows={3}
                placeholder="Notas adicionales sobre el evento..."
              />
                </div>

              </div>
              )}

              {/* Contenido de la pestaña PDF */}
              {activeTab === 'pdf' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <span className="text-2xl">📄</span>
                      Personalizar PDF para Cliente
                    </h3>
                    <p className="text-sm text-blue-800 mb-6">
                      Configura cómo se verá el presupuesto en el PDF que recibirá el cliente
                    </p>

                    {/* Título del PDF */}
                    <div className="mb-6 bg-white p-4 rounded-lg">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        📌 Título del Documento
                      </label>
                      <input
                        type="text"
                        value={pdfData.title}
                        onChange={(e) => setPdfData({...pdfData, title: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: Presupuesto para tu Evento"
                      />
                      <p className="text-xs text-gray-500 mt-1">Este será el título principal del PDF</p>
                    </div>

                    {/* Mostrar detalles */}
                    <div className="mb-6 bg-white p-4 rounded-lg">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={pdfData.showItemDetails}
                          onChange={(e) => setPdfData({...pdfData, showItemDetails: e.target.checked})}
                          className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div>
                          <span className="text-sm font-bold text-gray-700">
                            📋 Mostrar detalles de productos individuales
                          </span>
                          <p className="text-xs text-gray-500">
                            Si está desmarcado, el cliente verá solo conceptos generales
                          </p>
                        </div>
                      </label>
                    </div>

                    {/* Pie del PDF */}
                    <div className="mb-6 bg-white p-4 rounded-lg">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        👋 Mensaje de Despedida
                      </label>
                      <textarea
                        value={pdfData.footer}
                        onChange={(e) => setPdfData({...pdfData, footer: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Mensaje que aparecerá al final del PDF"
                      />
                      <p className="text-xs text-gray-500 mt-1">Este mensaje aparecerá al final del documento</p>
                    </div>

                    {/* Crear Conceptos Manualmente */}
                    <div className="mb-6 bg-white p-4 rounded-lg border-2 border-purple-300">
                      <h4 className="text-sm font-bold text-purple-900 mb-3 flex items-center gap-2">
                        ✏️ Conceptos para el Cliente
                      </h4>
                      <p className="text-xs text-gray-600 mb-4">
                        Crea los conceptos que verá el cliente en el PDF. Ej: "Sonorización evento", "Iluminación", etc.
                      </p>
                      
                      {/* Formulario para agregar concepto */}
                      <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg mb-4">
                        <p className="text-xs font-bold text-purple-800 mb-3">➕ Agregar Nuevo Concepto</p>
                        <div className="flex gap-3">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-700 mb-1">Nombre del concepto</label>
                            <input
                              type="text"
                              value={newConceptName}
                              onChange={(e) => setNewConceptName(e.target.value)}
                              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                              placeholder="Ej: Sonorización evento"
                            />
                          </div>
                          <div className="w-32">
                            <label className="block text-xs text-gray-700 mb-1">Precio (€)</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={newConceptPrice}
                              onChange={(e) => setNewConceptPrice(parseFloat(e.target.value) || 0)}
                              className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                              placeholder="0.00"
                            />
                          </div>
                          <div className="flex items-end">
                            <button
                              onClick={() => {
                                if (newConceptName.trim()) {
                                  setPdfData({
                                    ...pdfData,
                                    concepts: [
                                      ...pdfData.concepts,
                                      {
                                        id: Date.now().toString(),
                                        name: newConceptName,
                                        price: newConceptPrice
                                      }
                                    ]
                                  });
                                  setNewConceptName('');
                                  setNewConceptPrice(0);
                                }
                              }}
                              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-colors"
                            >
                              ➕ Agregar
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Lista de conceptos creados */}
                      {pdfData.concepts.length > 0 ? (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-purple-800 mb-2">📋 Conceptos Creados:</p>
                          {pdfData.concepts.map((concept) => (
                            <div key={concept.id} className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex items-center gap-3">
                              <div className="flex-1">
                                <input
                                  type="text"
                                  value={concept.name}
                                  onChange={(e) => {
                                    setPdfData({
                                      ...pdfData,
                                      concepts: pdfData.concepts.map(c => 
                                        c.id === concept.id ? {...c, name: e.target.value} : c
                                      )
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm font-medium"
                                />
                              </div>
                              <div className="w-32">
                                <input
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={concept.price}
                                  onChange={(e) => {
                                    setPdfData({
                                      ...pdfData,
                                      concepts: pdfData.concepts.map(c => 
                                        c.id === concept.id ? {...c, price: parseFloat(e.target.value) || 0} : c
                                      )
                                    });
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm text-right font-bold text-green-600"
                                />
                              </div>
                              <button
                                onClick={() => {
                                  setPdfData({
                                    ...pdfData,
                                    concepts: pdfData.concepts.filter(c => c.id !== concept.id)
                                  });
                                }}
                                className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-colors"
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                          
                          <div className="mt-3 pt-3 border-t-2 border-purple-200">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-purple-900">Subtotal:</span>
                              <span className="text-lg font-bold text-purple-900">
                                €{pdfData.concepts.reduce((sum, c) => sum + c.price, 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-purple-700">IVA (21%):</span>
                              <span className="text-sm font-medium text-purple-700">
                                €{(pdfData.concepts.reduce((sum, c) => sum + c.price, 0) * 0.21).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between items-center pt-2 border-t border-purple-300">
                              <span className="text-sm font-bold text-purple-900">Total con IVA:</span>
                              <span className="text-xl font-bold text-green-600">
                                €{(pdfData.concepts.reduce((sum, c) => sum + c.price, 0) * 1.21).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-6 rounded-lg text-center border-2 border-dashed border-gray-300">
                          <p className="text-sm text-gray-500">
                            No hay conceptos creados. Agrega el primer concepto arriba 👆
                          </p>
                        </div>
                      )}
                      
                      <div className="mt-4 bg-purple-50 p-3 rounded-lg">
                        <p className="text-xs text-purple-800">
                          💡 <strong>Consejo:</strong> Agrupa productos similares bajo un mismo concepto. 
                          Por ejemplo, todos los equipos de audio bajo "Sonorización evento" con el precio total.
                        </p>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-lg border-2 border-gray-300">
                      <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                        👁️ Vista Previa del PDF
                      </h4>
                      <div className="bg-white p-6 rounded shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">{pdfData.title}</h2>
                        <div className="border-t-2 border-gray-300 pt-4 mb-4">
                          <p className="text-sm text-gray-600 mb-2">Cliente: {formData.customerName || 'Nombre del cliente'}</p>
                          <p className="text-sm text-gray-600 mb-2">Evento: {formData.eventType || 'Tipo de evento'}</p>
                        </div>
                        <div className="mb-4">
                          <p className="text-sm font-semibold text-gray-700 mb-2">Conceptos:</p>
                          {pdfData.concepts.length > 0 ? (
                            <div className="space-y-1">
                              {pdfData.concepts.map((concept) => (
                                <div key={concept.id} className="flex justify-between text-xs text-gray-600 py-1 border-b border-gray-100">
                                  <span>{concept.name}</span>
                                  <span className="font-semibold">€{concept.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-gray-500 italic mt-2">
                              → No hay conceptos creados. Agrégalos arriba ☝️
                            </p>
                          )}
                        </div>
                        <div className="border-t-2 border-gray-300 pt-4 mt-4">
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="font-semibold text-gray-700">Subtotal:</span>
                              <span className="font-semibold text-gray-900">
                                €{pdfData.concepts.reduce((sum, c) => sum + c.price, 0).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">IVA (21%):</span>
                              <span className="text-gray-700">
                                €{(pdfData.concepts.reduce((sum, c) => sum + c.price, 0) * 0.21).toFixed(2)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t-2 border-gray-400">
                              <span className="font-bold text-gray-900">Total:</span>
                              <span className="text-xl font-bold text-green-600">
                                €{(pdfData.concepts.reduce((sum, c) => sum + c.price, 0) * 1.21).toFixed(2)}
                              </span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600 italic">{pdfData.footer}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={() => {
                        setShowCreateModal(false);
                        setQuoteItems([]);
                        setSearchTerm('');
                        setActiveTab('presupuesto');
                        setPdfData({
                          title: 'Presupuesto',
                          showItemDetails: false,
                          concepts: [],
                          footer: 'Gracias por confiar en nosotros',
                        });
                      }}
                      className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={createQuoteRequest}
                      className="flex-1 bg-resona hover:bg-resona-dark text-white font-medium py-3 rounded-lg transition-colors"
                    >
                      Crear Presupuesto (€{(pdfData.concepts.reduce((sum, c) => sum + c.price, 0) * 1.21).toFixed(2)} IVA inc.)
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuoteRequestsManager;

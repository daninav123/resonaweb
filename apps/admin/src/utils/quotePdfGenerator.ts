import jsPDF from 'jspdf';
import { companyService } from '../services/company.service';

export interface QuoteRequestForPDF {
  id: string;
  customerName: string | null;
  customerEmail: string | null;
  customerPhone: string | null;
  eventType: string;
  eventDate: string | null;
  eventLocation: string | null;
  estimatedTotal: number | null;
  selectedExtras: any;
}

export async function generateQuotePDF(request: QuoteRequestForPDF): Promise<void> {
  try {
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

    let pdfConcepts: Array<{ name: string; price: number }> = [];
    let pdfTitle = 'Presupuesto';
    let pdfFooter = 'Gracias por confiar en nosotros';

    try {
      if (request.selectedExtras && request.selectedExtras !== '[]' && request.selectedExtras !== '{}') {
        let extras;
        try {
          extras = typeof request.selectedExtras === 'string'
            ? JSON.parse(request.selectedExtras)
            : request.selectedExtras;
        } catch (parseError) {
          console.warn('No se pudo parsear selectedExtras:', parseError);
          extras = null;
        }

        if (extras && extras.pdfConcepts && Array.isArray(extras.pdfConcepts) && extras.pdfConcepts.length > 0) {
          pdfConcepts = extras.pdfConcepts;
          pdfTitle = extras.pdfTitle || 'Presupuesto';
          pdfFooter = extras.pdfFooter || 'Gracias por confiar en nosotros';
        } else if (extras && Array.isArray(extras) && extras.length > 0) {
          pdfConcepts = [{
            name: 'Servicios solicitados',
            price: Number(request.estimatedTotal) / 1.21,
          }];
        } else {
          pdfConcepts = [{
            name: 'Servicios solicitados',
            price: Number(request.estimatedTotal || 0) / 1.21,
          }];
        }
      } else {
        pdfConcepts = [{
          name: 'Servicios solicitados',
          price: Number(request.estimatedTotal || 0) / 1.21,
        }];
      }
    } catch (e) {
      console.error('Error parseando extras:', e);
      pdfConcepts = [{
        name: 'Servicios solicitados',
        price: Number(request.estimatedTotal || 0) / 1.21,
      }];
    }

    // Header empresarial
    doc.setFillColor(94, 187, 255);
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

    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text(pdfTitle.toUpperCase(), 190, 30, { align: 'right' });

    const presupuestoNum = `P-${request.id.substring(0, 8).toUpperCase()}`;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(presupuestoNum, 190, 38, { align: 'right' });
    doc.text(new Date().toLocaleDateString('es-ES'), 190, 44, { align: 'right' });

    // Información del cliente
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

    // Línea separadora
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.5);
    doc.line(20, 95, 190, 95);

    // Tabla de conceptos
    let yPos = 105;

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

    yPos += 3;
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(20, yPos, 190, yPos);
    yPos += 10;

    // Cuadro de totales
    const subtotal = pdfConcepts.reduce((sum, c) => sum + c.price, 0);
    const iva = subtotal * 0.21;
    const total = subtotal * 1.21;

    const boxTop = yPos;

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

    yPos += 5;
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.line(120, yPos, 190, yPos);

    yPos += 8;
    doc.setFillColor(94, 187, 255);
    doc.rect(120, yPos - 5, 70, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL:', 125, yPos + 2);
    doc.text(`${total.toFixed(2)} €`, 185, yPos + 2, { align: 'right' });

    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.rect(120, boxTop - 3, 70, yPos - boxTop + 8);

    // Condiciones
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
      '• El precio no incluye permisos especiales si fueran necesarios',
    ];
    conditions.forEach((cond) => {
      doc.text(cond, 20, yPos);
      yPos += 4;
    });

    if (pdfFooter && pdfFooter !== 'Gracias por confiar en nosotros') {
      yPos += 5;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.text(pdfFooter, 20, yPos, { maxWidth: 170 });
    }

    // Footer
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

    const fileName = `Presupuesto_${presupuestoNum}_${request.customerName?.replace(/[^a-z0-9]/gi, '_')}.pdf`;
    doc.save(fileName);
    alert('✅ PDF generado correctamente');
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('❌ Error al generar el PDF');
  }
}

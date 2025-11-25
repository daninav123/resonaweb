import { create } from 'xmlbuilder2';
import { prisma } from '../index';
import { AppError } from '../middleware/error.middleware';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Servicio para generar facturas electrónicas Facturae (XML oficial español)
 * Implementa el estándar Facturae 3.2.2
 */
export class FacturaeService {
  
  /**
   * Generar XML Facturae para un pedido/factura
   */
  async generateFacturae(invoiceId: string): Promise<string> {
    // Obtener factura con relaciones
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        order: {
          include: {
            user: {
              include: {
                billingData: true
              }
            },
            orderItems: {
              include: {
                product: true
              }
            }
          }
        }
      }
    });

    if (!invoice) {
      throw new AppError(404, 'Factura no encontrada', 'INVOICE_NOT_FOUND');
    }

    if (!invoice.order.user.billingData) {
      throw new AppError(400, 'El cliente no tiene datos de facturación', 'NO_BILLING_DATA');
    }

    // Obtener datos de la empresa
    const companyData = await this.getCompanyData();

    // Generar XML
    const xml = this.buildFacturaeXML(invoice, companyData);

    // Guardar XML en BD
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        facturaeXml: xml,
        facturaeGenerated: true,
      }
    });

    logger.info(`Facturae XML generated for invoice ${invoice.invoiceNumber}`);

    return xml;
  }

  /**
   * Construir XML Facturae según estándar 3.2.2
   */
  private buildFacturaeXML(invoice: any, companyData: any): string {
    const billingData = invoice.order.user.billingData;
    const order = invoice.order;

    // Crear documento XML
    const root = create({ version: '1.0', encoding: 'UTF-8' })
      .ele('fe:Facturae', {
        'xmlns:fe': 'http://www.facturae.gob.es/formato/Versiones/Facturaev3_2_2.xml',
        'xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#'
      });

    // FileHeader
    const fileHeader = root.ele('FileHeader');
    fileHeader.ele('SchemaVersion').txt('3.2.2');
    fileHeader.ele('Modality').txt('I'); // I = Individual
    fileHeader.ele('InvoiceIssuerType').txt('EM'); // EM = Emisor
    
    const batch = fileHeader.ele('Batch');
    batch.ele('BatchIdentifier').txt(invoice.invoiceNumber);
    batch.ele('InvoicesCount').txt('1');
    batch.ele('TotalInvoicesAmount')
      .ele('TotalAmount').txt(invoice.total.toString());
    batch.up()
      .ele('TotalOutstandingAmount').txt(invoice.total.toString());
    batch.up()
      .ele('TotalExecutableAmount').txt(invoice.total.toString());
    batch.up().ele('InvoiceCurrencyCode').txt('EUR');

    // Parties (Emisor y Receptor)
    const parties = root.ele('Parties');

    // Seller Party (Nuestra empresa)
    const sellerParty = parties.ele('SellerParty');
    const sellerTax = sellerParty.ele('TaxIdentification');
    sellerTax.ele('PersonTypeCode').txt(this.getPersonTypeCode(companyData.taxIdType));
    sellerTax.ele('ResidenceTypeCode').txt('R'); // R = Residente
    sellerTax.ele('TaxIdentificationNumber').txt(companyData.taxId);

    const sellerAdmin = sellerParty.ele('AdministrativeCentres');
    const sellerCentre = sellerAdmin.ele('AdministrativeCentre');
    sellerCentre.ele('CentreCode').txt('0001');
    sellerCentre.ele('RoleTypeCode').txt('01'); // Oficina contable
    const sellerAddress = sellerCentre.ele('AddressInSpain');
    sellerAddress.ele('Address').txt(companyData.address);
    sellerAddress.ele('PostCode').txt(companyData.postalCode);
    sellerAddress.ele('Town').txt(companyData.city);
    sellerAddress.ele('Province').txt(companyData.state);
    sellerAddress.ele('CountryCode').txt('ESP');

    const sellerLegal = sellerParty.ele('LegalEntity');
    sellerLegal.ele('CorporateName').txt(companyData.companyName);
    sellerLegal.ele('TradeName').txt(companyData.tradeName || companyData.companyName);
    const sellerContactDetails = sellerLegal.ele('ContactDetails');
    sellerContactDetails.ele('Telephone').txt(companyData.phone);
    sellerContactDetails.ele('ElectronicMail').txt(companyData.email);

    // Buyer Party (Cliente)
    const buyerParty = parties.ele('BuyerParty');
    const buyerTax = buyerParty.ele('TaxIdentification');
    buyerTax.ele('PersonTypeCode').txt(this.getPersonTypeCode(billingData.taxIdType));
    buyerTax.ele('ResidenceTypeCode').txt('R');
    buyerTax.ele('TaxIdentificationNumber').txt(billingData.taxId);

    const buyerAdmin = buyerParty.ele('AdministrativeCentres');
    const buyerCentre = buyerAdmin.ele('AdministrativeCentre');
    buyerCentre.ele('CentreCode').txt('0001');
    buyerCentre.ele('RoleTypeCode').txt('02'); // Receptor
    const buyerAddress = buyerCentre.ele('AddressInSpain');
    buyerAddress.ele('Address').txt(billingData.address);
    if (billingData.addressLine2) {
      buyerAddress.ele('Address').txt(billingData.addressLine2);
    }
    buyerAddress.ele('PostCode').txt(billingData.postalCode);
    buyerAddress.ele('Town').txt(billingData.city);
    buyerAddress.ele('Province').txt(billingData.state);
    buyerAddress.ele('CountryCode').txt('ESP');

    if (billingData.companyName) {
      // Legal Entity (Empresa)
      const buyerLegal = buyerParty.ele('LegalEntity');
      buyerLegal.ele('CorporateName').txt(billingData.companyName);
    } else {
      // Individual (Particular)
      const buyerIndividual = buyerParty.ele('Individual');
      buyerIndividual.ele('Name').txt(order.user.firstName);
      buyerIndividual.ele('FirstSurname').txt(order.user.lastName);
    }

    // Invoices
    const invoices = root.ele('Invoices');
    const invoiceElement = invoices.ele('Invoice');

    // Invoice Header
    const invoiceHeader = invoiceElement.ele('InvoiceHeader');
    invoiceHeader.ele('InvoiceNumber').txt(invoice.invoiceNumber);
    invoiceHeader.ele('InvoiceSeriesCode').txt(invoice.facturaeSeries || 'A');
    invoiceHeader.ele('InvoiceDocumentType').txt('FC'); // FC = Factura Completa
    invoiceHeader.ele('InvoiceClass').txt('OO'); // OO = Original

    // Invoice Issue Data
    const issueData = invoiceElement.ele('InvoiceIssueData');
    issueData.ele('IssueDate').txt(this.formatDate(invoice.issueDate));
    issueData.ele('InvoiceCurrencyCode').txt('EUR');
    issueData.ele('TaxCurrencyCode').txt('EUR');
    issueData.ele('LanguageName').txt('es');

    // Tax Output (IVA)
    const taxesOutputs = issueData.ele('TaxesOutputs');
    const tax = taxesOutputs.ele('Tax');
    tax.ele('TaxTypeCode').txt('01'); // 01 = IVA
    const taxRate = tax.ele('TaxRate').txt('21.00'); // 21% IVA
    const taxableBase = tax.ele('TaxableBase');
    taxableBase.ele('TotalAmount').txt(invoice.subtotal.toString());
    const taxAmount = tax.ele('TaxAmount');
    taxAmount.ele('TotalAmount').txt(invoice.taxAmount.toString());

    // Invoice Totals
    const invoiceTotals = issueData.ele('InvoiceTotals');
    invoiceTotals.ele('TotalGrossAmount').txt(invoice.subtotal.toString());
    invoiceTotals.ele('TotalGeneralDiscounts').txt('0.00');
    invoiceTotals.ele('TotalGeneralSurcharges').txt('0.00');
    invoiceTotals.ele('TotalGrossAmountBeforeTaxes').txt(invoice.subtotal.toString());
    invoiceTotals.ele('TotalTaxOutputs').txt(invoice.taxAmount.toString());
    invoiceTotals.ele('TotalTaxesWithheld').txt('0.00');
    invoiceTotals.ele('InvoiceTotal').txt(invoice.total.toString());
    invoiceTotals.ele('TotalOutstandingAmount').txt(invoice.total.toString());
    invoiceTotals.ele('TotalExecutableAmount').txt(invoice.total.toString());

    // Items (Líneas de factura)
    const items = invoiceElement.ele('Items');
    order.orderItems.forEach((item: any, index: number) => {
      const invoiceLine = items.ele('InvoiceLine');
      invoiceLine.ele('ItemDescription').txt(item.product.name);
      invoiceLine.ele('Quantity').txt(item.quantity.toString());
      invoiceLine.ele('UnitOfMeasure').txt('01'); // 01 = Unidades
      invoiceLine.ele('UnitPriceWithoutTax').txt(item.pricePerDay.toString());
      invoiceLine.ele('TotalCost').txt((item.pricePerDay * item.quantity).toString());
      invoiceLine.ele('GrossAmount').txt((item.pricePerDay * item.quantity).toString());

      // Tax en línea
      const lineTaxes = invoiceLine.ele('TaxesOutputs');
      const lineTax = lineTaxes.ele('Tax');
      lineTax.ele('TaxTypeCode').txt('01');
      lineTax.ele('TaxRate').txt('21.00');
      const lineTaxableBase = lineTax.ele('TaxableBase');
      lineTaxableBase.ele('TotalAmount').txt((item.pricePerDay * item.quantity).toString());
    });

    // Payment Details
    const paymentDetails = invoiceElement.ele('PaymentDetails');
    const installment = paymentDetails.ele('Installment');
    installment.ele('InstallmentDueDate').txt(this.formatDate(invoice.dueDate));
    installment.ele('InstallmentAmount').txt(invoice.total.toString());
    installment.ele('PaymentMeans').txt('04'); // 04 = Transferencia

    // Convertir a string XML
    const xml = root.end({ prettyPrint: true });
    
    return xml;
  }

  /**
   * Obtener datos de la empresa desde settings
   */
  private async getCompanyData() {
    // En producción, esto vendría de la BD
    // Por ahora usamos datos hardcoded basados en company settings
    return {
      companyName: 'ReSona Events',
      tradeName: 'ReSona Events',
      taxId: 'B12345678', // CIF ejemplo
      taxIdType: 'CIF',
      address: 'Calle Industria 45',
      city: 'Valencia',
      state: 'Valencia',
      postalCode: '46015',
      country: 'España',
      phone: '+34 613 881 414',
      email: 'info@resonaevents.com'
    };
  }

  /**
   * Obtener código de tipo de persona según Facturae
   */
  private getPersonTypeCode(taxIdType: string): string {
    switch (taxIdType) {
      case 'CIF':
        return 'J'; // Persona jurídica (empresa)
      case 'NIF':
      case 'NIE':
      case 'PASSPORT':
      default:
        return 'F'; // Persona física
    }
  }

  /**
   * Formatear fecha para Facturae (YYYY-MM-DD)
   */
  private formatDate(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Guardar XML en archivo
   */
  async saveFacturaeToFile(invoiceId: string): Promise<string> {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId }
    });

    if (!invoice || !invoice.facturaeXml) {
      throw new AppError(404, 'Facturae XML no encontrado', 'XML_NOT_FOUND');
    }

    // Crear directorio si no existe
    const uploadDir = path.join(__dirname, '../../public/uploads/facturas');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Nombre archivo
    const filename = `factura_${invoice.invoiceNumber}.xml`;
    const filepath = path.join(uploadDir, filename);

    // Guardar archivo
    fs.writeFileSync(filepath, invoice.facturaeXml);

    // URL pública
    const publicUrl = `/uploads/facturas/${filename}`;

    // Actualizar URL en BD
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { facturaeUrl: publicUrl }
    });

    logger.info(`Facturae XML saved to file: ${filename}`);

    return publicUrl;
  }
}

export const facturaeService = new FacturaeService();

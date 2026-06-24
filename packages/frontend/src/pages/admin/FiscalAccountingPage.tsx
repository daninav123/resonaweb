import { useState, useEffect, useMemo } from 'react';
import { api } from '../../services/api';
import { Loader2, Download, Calculator, FileText, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import toast from 'react-hot-toast';

interface Invoice {
  id: string; invoiceNumber?: string; customerName?: string; total?: number;
  taxAmount?: number; subtotal?: number; status?: string; createdAt: string;
  customer?: { firstName?: string; lastName?: string; companyName?: string };
}

interface Expense {
  id: string; name: string; amount: number; category: string; nextPaymentDate?: string;
  lastPaymentDate?: string; frequency?: string;
}

const QUARTERS = [
  { label: '1T (Ene-Mar)', months: [0, 1, 2] },
  { label: '2T (Abr-Jun)', months: [3, 4, 5] },
  { label: '3T (Jul-Sep)', months: [6, 7, 8] },
  { label: '4T (Oct-Dic)', months: [9, 10, 11] },
];

const FiscalAccountingPage = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [tab, setTab] = useState<'libro' | 'modelo303'>('libro');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [inv, exp]: any[] = await Promise.all([
          api.get('/invoices?limit=500'),
          api.get('/recurring-expenses'),
        ]);
        setInvoices(Array.isArray(inv) ? inv : inv?.invoices || inv?.data || []);
        setExpenses(Array.isArray(exp) ? exp : exp?.data || []);
      } catch { toast.error('Error cargando datos fiscales'); } finally { setLoading(false); }
    };
    load();
  }, [year]);

  const yearInvoices = useMemo(() =>
    invoices.filter(i => new Date(i.createdAt).getFullYear() === year && i.status !== 'cancelled'),
    [invoices, year]
  );

  const quarterData = useMemo(() => {
    return QUARTERS.map(q => {
      const qInvoices = yearInvoices.filter(i => q.months.includes(new Date(i.createdAt).getMonth()));
      const baseImponible = qInvoices.reduce((s, i) => s + Number(i.subtotal || 0), 0);
      const ivaRepercutido = qInvoices.reduce((s, i) => s + Number(i.taxAmount || 0), 0);

      const monthlyExpenses = expenses.reduce((s, e) => {
        const monthlyAmount = e.frequency === 'yearly' ? Number(e.amount) / 12 :
          e.frequency === 'quarterly' ? Number(e.amount) / 3 : Number(e.amount);
        return s + monthlyAmount;
      }, 0);
      const quarterExpenses = monthlyExpenses * 3;
      const ivaSoportado = quarterExpenses * 0.21;

      return {
        label: q.label,
        invoiceCount: qInvoices.length,
        baseImponible,
        ivaRepercutido,
        expenseBase: quarterExpenses,
        ivaSoportado,
        resultado: ivaRepercutido - ivaSoportado,
      };
    });
  }, [yearInvoices, expenses]);

  const annualTotals = useMemo(() => ({
    totalFacturado: yearInvoices.reduce((s, i) => s + Number(i.total || 0), 0),
    baseImponible: quarterData.reduce((s, q) => s + q.baseImponible, 0),
    ivaRepercutido: quarterData.reduce((s, q) => s + q.ivaRepercutido, 0),
    ivaSoportado: quarterData.reduce((s, q) => s + q.ivaSoportado, 0),
    resultado: quarterData.reduce((s, q) => s + q.resultado, 0),
    invoiceCount: yearInvoices.length,
  }), [yearInvoices, quarterData]);

  const fmt = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const exportCSV = () => {
    const rows = [['Nº Factura', 'Cliente', 'Base Imponible', 'IVA', 'Total', 'Fecha']];
    yearInvoices.forEach(i => {
      const name = i.customer?.companyName || `${i.customer?.firstName || ''} ${i.customer?.lastName || ''}`.trim() || i.customerName || '-';
      rows.push([i.invoiceNumber || i.id.slice(0, 8), name, String(i.subtotal || 0), String(i.taxAmount || 0), String(i.total || 0), new Date(i.createdAt).toLocaleDateString('es-ES')]);
    });
    const csv = rows.map(r => r.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `libro-facturas-${year}.csv`; a.click();
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contabilidad Fiscal</h1>
          <p className="text-gray-600">Libro de facturas y modelo 303</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={year} onChange={e => setYear(Number(e.target.value))} className="px-3 py-2 border rounded-lg">
            {[2023, 2024, 2025, 2026].map(y => <option key={y}>{y}</option>)}
          </select>
          <button onClick={exportCSV} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2">
            <Download className="w-4 h-4" /> Exportar CSV
          </button>
        </div>
      </div>

      {/* KPIs anuales */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Facturas emitidas</p><p className="text-2xl font-bold">{annualTotals.invoiceCount}</p></div>
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Total facturado</p><p className="text-2xl font-bold text-blue-600">{fmt(annualTotals.totalFacturado)}€</p></div>
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">IVA repercutido</p><p className="text-lg font-bold text-orange-600">{fmt(annualTotals.ivaRepercutido)}€</p></div>
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">IVA soportado (est.)</p><p className="text-lg font-bold text-green-600">{fmt(annualTotals.ivaSoportado)}€</p></div>
        <div className="bg-white rounded-lg border p-4"><p className="text-xs text-gray-500">Resultado IVA</p><p className={`text-lg font-bold ${annualTotals.resultado >= 0 ? 'text-red-600' : 'text-green-600'}`}>{fmt(annualTotals.resultado)}€</p></div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        <button onClick={() => setTab('libro')} className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === 'libro' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <FileText className="w-4 h-4 inline mr-1" /> Libro de Facturas
        </button>
        <button onClick={() => setTab('modelo303')} className={`px-4 py-2 font-medium border-b-2 transition-colors ${tab === 'modelo303' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          <Calculator className="w-4 h-4 inline mr-1" /> Modelo 303
        </button>
      </div>

      {tab === 'libro' && (
        <div className="bg-white rounded-lg shadow border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b"><tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Nº</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Cliente</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Base</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">IVA</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Fecha</th>
            </tr></thead>
            <tbody className="divide-y">
              {yearInvoices.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-gray-400">Sin facturas en {year}</td></tr>
              ) : yearInvoices.map(i => (
                <tr key={i.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 font-mono text-xs">{i.invoiceNumber || i.id.slice(0, 8)}</td>
                  <td className="px-4 py-2">{i.customer?.companyName || `${i.customer?.firstName || ''} ${i.customer?.lastName || ''}`.trim() || i.customerName || '-'}</td>
                  <td className="px-4 py-2 text-right">{fmt(Number(i.subtotal || 0))}€</td>
                  <td className="px-4 py-2 text-right">{fmt(Number(i.taxAmount || 0))}€</td>
                  <td className="px-4 py-2 text-right font-medium">{fmt(Number(i.total || 0))}€</td>
                  <td className="px-4 py-2 text-xs text-gray-500">{new Date(i.createdAt).toLocaleDateString('es-ES')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'modelo303' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-700">
            Estimación orientativa del modelo 303. Los datos de IVA soportado son aproximados basados en gastos recurrentes. Consulte con su asesor fiscal.
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {quarterData.map((q, i) => (
              <div key={i} className="bg-white rounded-lg border p-5 space-y-3">
                <h3 className="font-bold text-gray-900">{q.label}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Facturas emitidas:</span><span className="font-medium">{q.invoiceCount}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Base imponible:</span><span>{fmt(q.baseImponible)}€</span></div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-orange-500" /> IVA repercutido:</span>
                    <span className="font-medium text-orange-600">{fmt(q.ivaRepercutido)}€</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 flex items-center gap-1"><ArrowDownRight className="w-3 h-3 text-green-500" /> IVA soportado (est.):</span>
                    <span className="font-medium text-green-600">{fmt(q.ivaSoportado)}€</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center text-base">
                    <span className="font-medium">Resultado:</span>
                    <span className={`font-bold ${q.resultado >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {q.resultado >= 0 ? 'A ingresar' : 'A compensar'}: {fmt(Math.abs(q.resultado))}€
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FiscalAccountingPage;

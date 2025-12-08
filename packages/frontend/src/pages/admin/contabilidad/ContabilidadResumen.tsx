import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Download,
  AlertCircle,
  BarChart3,
  Users,
  Package,
  ShoppingCart
} from 'lucide-react';
import { api } from '../../../services/api';
import toast from 'react-hot-toast';

interface FinancialSummary {
  currentMonth: {
    ingresos: number;
    gastos: number;
    beneficio: number;
  };
  previousMonth: {
    ingresos: number;
    gastos: number;
    beneficio: number;
  };
  changes: {
    ingresosChange: number;
    gastosChange: number;
    beneficioChange: number;
  };
}

interface RentabilidadItem {
  id: string;
  name: string;
  type: 'product' | 'pack' | 'montaje';
  vecesAlquilado: number;
  ingresosGenerados: number;
  costesAsociados: number;
  beneficio: number;
  margen: number;
  roi: number;
}

interface MonthlyEvolution {
  month: string;
  ingresos: number;
  gastos: number;
  beneficio: number;
}

interface CostBreakdown {
  costPersonal: number;
  costDepreciacion: number;
  costTransporte: number;
  costConsumibles: number;
  total: number;
}

const ContabilidadResumen = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [topRentables, setTopRentables] = useState<RentabilidadItem[]>([]);
  const [lessRentables, setLessRentables] = useState<RentabilidadItem[]>([]);
  const [monthlyEvolution, setMonthlyEvolution] = useState<MonthlyEvolution[]>([]);
  const [costBreakdown, setCostBreakdown] = useState<CostBreakdown | null>(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadFinancialData();
  }, [period]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      
      // Cargar resumen financiero
      const summaryResponse: any = await api.get(`/contabilidad/summary?period=${period}`);
      setFinancialSummary(summaryResponse as FinancialSummary);

      // Cargar análisis de rentabilidad
      const rentabilidadResponse: any = await api.get('/contabilidad/rentabilidad');
      const items = rentabilidadResponse as RentabilidadItem[];
      
      // Top 10 más rentables
      const sorted = [...items].sort((a, b) => b.margen - a.margen);
      setTopRentables(sorted.slice(0, 10));
      setLessRentables(sorted.slice(-5).reverse());

      // Cargar evolución mensual (últimos 12 meses)
      const evolutionResponse: any = await api.get('/contabilidad/evolution?months=12');
      setMonthlyEvolution(evolutionResponse as MonthlyEvolution[]);

      // Cargar desglose de costes del período actual
      const costResponse: any = await api.get(`/contabilidad/cost-breakdown?period=${period}`);
      setCostBreakdown(costResponse as CostBreakdown);

    } catch (error) {
      console.error('Error cargando datos contables:', error);
      toast.error('Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    const formatted = value.toFixed(1);
    return value >= 0 ? `+${formatted}%` : `${formatted}%`;
  };

  const exportToPDF = async () => {
    try {
      setExporting(true);
      toast.loading('Generando PDF...');
      
      const response = await api.get(`/contabilidad/export/pdf?period=${period}`, {
        responseType: 'blob'
      });
      
      const blob = response as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contabilidad_${period}_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('PDF descargado correctamente');
    } catch (error) {
      console.error('Error exportando PDF:', error);
      toast.dismiss();
      toast.error('Error al generar PDF');
    } finally {
      setExporting(false);
    }
  };

  const exportToExcel = async () => {
    try {
      setExporting(true);
      toast.loading('Generando Excel...');
      
      const response = await api.get(`/contabilidad/export/excel?period=${period}`, {
        responseType: 'blob'
      });
      
      const blob = response as Blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contabilidad_${period}_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.dismiss();
      toast.success('Excel descargado correctamente');
    } catch (error) {
      console.error('Error exportando Excel:', error);
      toast.dismiss();
      toast.error('Error al generar Excel');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('month')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'month'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Mes
          </button>
          <button
            onClick={() => setPeriod('quarter')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'quarter'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Trimestre
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              period === 'year'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Año
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportToPDF}
            disabled={exporting}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={exportToExcel}
            disabled={exporting}
            className="px-4 py-2 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors disabled:bg-gray-400 flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Excel
          </button>
        </div>
      </div>

      {/* Dashboard Financiero */}
      {financialSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Ingresos */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-lg">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-green-100 text-sm">Ingresos</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(financialSummary.currentMonth.ingresos)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {financialSummary.changes.ingresosChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {formatPercentage(financialSummary.changes.ingresosChange)} vs mes anterior
                </span>
              </div>
            </div>

            {/* Gastos */}
            <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-lg">
                  <TrendingDown className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-red-100 text-sm">Gastos</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(financialSummary.currentMonth.gastos)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {financialSummary.changes.gastosChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {formatPercentage(financialSummary.changes.gastosChange)} vs mes anterior
                </span>
              </div>
            </div>

            {/* Beneficio */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="bg-white/20 p-3 rounded-lg">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div className="text-right">
                  <p className="text-blue-100 text-sm">Beneficio Neto</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(financialSummary.currentMonth.beneficio)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4">
                {financialSummary.changes.beneficioChange >= 0 ? (
                  <TrendingUp className="w-4 h-4" />
                ) : (
                  <TrendingDown className="w-4 h-4" />
                )}
                <span className="text-sm">
                  {formatPercentage(financialSummary.changes.beneficioChange)} vs mes anterior
                </span>
              </div>
            </div>
          </div>

          {/* Margen de Beneficio */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Margen de Beneficio</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Margen actual:</span>
                <span className={`text-xl font-bold ${
                  financialSummary.currentMonth.beneficio >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {((financialSummary.currentMonth.beneficio / financialSummary.currentMonth.ingresos) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{
                    width: `${Math.min(
                      ((financialSummary.currentMonth.beneficio / financialSummary.currentMonth.ingresos) * 100),
                      100
                    )}%`
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Análisis de Rentabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 10 Más Rentables */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-green-50 px-6 py-4 border-b border-green-200">
            <h3 className="text-lg font-semibold text-green-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top 10 Más Rentables
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {topRentables.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-green-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.vecesAlquilado} alquileres • {formatCurrency(item.ingresosGenerados)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{item.margen.toFixed(1)}%</p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.beneficio)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Menos Rentables (Revisar) */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-orange-50 px-6 py-4 border-b border-orange-200">
            <h3 className="text-lg font-semibold text-orange-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Menos Rentables (Revisar Precios)
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {lessRentables.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">
                        {item.vecesAlquilado} alquileres • {formatCurrency(item.ingresosGenerados)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${
                      item.margen < 15 ? 'text-red-600' : 'text-orange-600'
                    }`}>
                      {item.margen.toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">{formatCurrency(item.beneficio)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evolución Mensual */}
      {monthlyEvolution.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Evolución de los Últimos 12 Meses
          </h3>
          <div className="space-y-2">
            {monthlyEvolution.map((month, index) => {
              const maxValue = Math.max(...monthlyEvolution.map(m => m.ingresos));
              const ingresosWidth = (month.ingresos / maxValue) * 100;
              const gastosWidth = (month.gastos / maxValue) * 100;
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-gray-700">{month.month}</span>
                    <div className="flex gap-4">
                      <span className="text-green-600">↑ {formatCurrency(month.ingresos)}</span>
                      <span className="text-red-600">↓ {formatCurrency(month.gastos)}</span>
                      <span className={`font-semibold ${month.beneficio >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        = {formatCurrency(month.beneficio)}
                      </span>
                    </div>
                  </div>
                  <div className="relative h-8 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="absolute top-0 left-0 h-full bg-green-500 opacity-70"
                      style={{ width: `${ingresosWidth}%` }}
                    />
                    <div
                      className="absolute top-0 left-0 h-full bg-red-500 opacity-70"
                      style={{ width: `${gastosWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-gray-600">Ingresos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-gray-600">Gastos</span>
            </div>
          </div>
        </div>
      )}

      {/* Desglose de Costes Operativos */}
      {costBreakdown && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Desglose de Costes Operativos
          </h3>
          <div className="space-y-4">
            {/* Coste Personal */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 flex items-center gap-2">
                  <Users className="w-4 h-4 text-purple-600" />
                  Personal (horas trabajadas)
                </span>
                <span className="font-semibold text-purple-600">
                  {formatCurrency(costBreakdown.costPersonal)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-600 h-2 rounded-full"
                  style={{
                    width: `${(costBreakdown.costPersonal / costBreakdown.total) * 100}%`
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {((costBreakdown.costPersonal / costBreakdown.total) * 100).toFixed(1)}% del total
              </span>
            </div>

            {/* Coste Depreciación */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  Depreciación equipos (5% por alquiler)
                </span>
                <span className="font-semibold text-blue-600">
                  {formatCurrency(costBreakdown.costDepreciacion)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${(costBreakdown.costDepreciacion / costBreakdown.total) * 100}%`
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {((costBreakdown.costDepreciacion / costBreakdown.total) * 100).toFixed(1)}% del total
              </span>
            </div>

            {/* Coste Transporte */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-700 flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4 text-orange-600" />
                  Transporte e instalación
                </span>
                <span className="font-semibold text-orange-600">
                  {formatCurrency(costBreakdown.costTransporte)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-600 h-2 rounded-full"
                  style={{
                    width: `${(costBreakdown.costTransporte / costBreakdown.total) * 100}%`
                  }}
                />
              </div>
              <span className="text-xs text-gray-500">
                {((costBreakdown.costTransporte / costBreakdown.total) * 100).toFixed(1)}% del total
              </span>
            </div>

            {/* Coste Consumibles */}
            {costBreakdown.costConsumibles > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 flex items-center gap-2">
                    <Package className="w-4 h-4 text-red-600" />
                    Consumibles vendidos
                  </span>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(costBreakdown.costConsumibles)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full"
                    style={{
                      width: `${(costBreakdown.costConsumibles / costBreakdown.total) * 100}%`
                    }}
                  />
                </div>
                <span className="text-xs text-gray-500">
                  {((costBreakdown.costConsumibles / costBreakdown.total) * 100).toFixed(1)}% del total
                </span>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total Costes Operativos:</span>
                <span className="font-bold text-xl text-gray-900">
                  {formatCurrency(costBreakdown.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContabilidadResumen;

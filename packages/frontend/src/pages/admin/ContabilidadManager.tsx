import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart,
  Users,
  Package,
  PieChart,
  BarChart3,
  Download,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { api } from '../../services/api';
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

const ContabilidadManager = () => {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'month' | 'quarter' | 'year'>('month');
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [topRentables, setTopRentables] = useState<RentabilidadItem[]>([]);
  const [lessRentables, setLessRentables] = useState<RentabilidadItem[]>([]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-resona"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-8 h-8 text-green-600" />
            Contabilidad
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis financiero y rentabilidad del negocio
          </p>
        </div>
        
        {/* Selector de período */}
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

      {/* Próximamente */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 text-white p-3 rounded-lg">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Próximas Funcionalidades
            </h3>
            <ul className="space-y-1 text-blue-800">
              <li>• Gráficos de evolución mensual</li>
              <li>• Desglose detallado de costes operativos</li>
              <li>• Facturación y estado de cobros</li>
              <li>• Exportación a PDF/Excel para el contable</li>
              <li>• Proyecciones de ingresos futuros</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContabilidadManager;

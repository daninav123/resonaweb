import { useState } from 'react';
import { Package, AlertTriangle, BarChart3 } from 'lucide-react';
import StockManager from './StockManager';
import StockAlerts from './StockAlerts';

type StockTab = 'gestion' | 'alertas';

const StockPage = () => {
  const [activeTab, setActiveTab] = useState<StockTab>('gestion');

  const tabs = [
    { id: 'gestion' as StockTab, label: 'Gestión de Stock', icon: Package },
    { id: 'alertas' as StockTab, label: 'Alertas', icon: AlertTriangle },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Stock
          </h1>
          <p className="text-gray-600 mt-1">Control de stock y alertas</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'bg-white text-blue-600 hover:bg-blue-50 shadow-sm'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="min-h-[400px]">
        {activeTab === 'gestion' && <StockManager />}
        {activeTab === 'alertas' && <StockAlerts />}
      </div>
    </div>
  );
};

export default StockPage;

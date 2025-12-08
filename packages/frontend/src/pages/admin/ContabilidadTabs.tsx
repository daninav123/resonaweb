import { useState } from 'react';
import { 
  PieChart, 
  ShoppingCart, 
  Wrench, 
  DollarSign,
  TrendingUp
} from 'lucide-react';
import ContabilidadResumen from './contabilidad/ContabilidadResumen';
import ContabilidadAlquileres from './contabilidad/ContabilidadAlquileres';
import ContabilidadMontajes from './contabilidad/ContabilidadMontajes';
import ContabilidadGastos from './contabilidad/ContabilidadGastos';

type Tab = 'resumen' | 'alquileres' | 'montajes' | 'gastos';

const ContabilidadTabs = () => {
  const [activeTab, setActiveTab] = useState<Tab>('resumen');

  const tabs = [
    {
      id: 'resumen' as Tab,
      label: 'Resumen',
      icon: TrendingUp,
      color: 'blue'
    },
    {
      id: 'alquileres' as Tab,
      label: 'Alquileres',
      icon: ShoppingCart,
      color: 'green'
    },
    {
      id: 'montajes' as Tab,
      label: 'Montajes',
      icon: Wrench,
      color: 'purple'
    },
    {
      id: 'gastos' as Tab,
      label: 'Gastos Reales',
      icon: DollarSign,
      color: 'orange'
    }
  ];

  const getTabColorClasses = (tabId: Tab, isActive: boolean) => {
    const colors = {
      blue: isActive 
        ? 'bg-blue-600 text-white' 
        : 'bg-white text-blue-600 hover:bg-blue-50',
      green: isActive 
        ? 'bg-green-600 text-white' 
        : 'bg-white text-green-600 hover:bg-green-50',
      purple: isActive 
        ? 'bg-purple-600 text-white' 
        : 'bg-white text-purple-600 hover:bg-purple-50',
      orange: isActive 
        ? 'bg-orange-600 text-white' 
        : 'bg-white text-orange-600 hover:bg-orange-50'
    };

    const tab = tabs.find(t => t.id === tabId);
    return colors[tab?.color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <PieChart className="w-8 h-8 text-green-600" />
            Contabilidad
          </h1>
          <p className="text-gray-600 mt-1">
            Análisis financiero completo del negocio
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white rounded-lg shadow-md p-2">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-6 py-3 rounded-lg font-medium
                  transition-all duration-200
                  ${getTabColorClasses(tab.id, isActive)}
                  ${isActive ? 'shadow-md scale-105' : 'shadow-sm'}
                `}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="min-h-[600px]">
        {activeTab === 'resumen' && <ContabilidadResumen />}
        {activeTab === 'alquileres' && <ContabilidadAlquileres />}
        {activeTab === 'montajes' && <ContabilidadMontajes />}
        {activeTab === 'gastos' && <ContabilidadGastos />}
      </div>
    </div>
  );
};

export default ContabilidadTabs;

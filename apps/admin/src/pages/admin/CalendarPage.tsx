import { useState } from 'react';
import { Calendar, Users, Package } from 'lucide-react';
import CalendarManager from './CalendarManager';
import ResourceCalendar from './ResourceCalendar';

type CalendarTab = 'pedidos' | 'recursos';

const CalendarPage = () => {
  const [activeTab, setActiveTab] = useState<CalendarTab>('pedidos');

  const tabs = [
    { id: 'pedidos' as CalendarTab, label: 'Calendario Pedidos', icon: Calendar, description: 'Vista mensual de todos los pedidos' },
    { id: 'recursos' as CalendarTab, label: 'Recursos y Personal', icon: Users, description: 'Vista de personal y equipamiento por evento' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600" />
            Calendario
          </h1>
          <p className="text-gray-600 mt-1">Gestión de calendario y recursos</p>
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

      <div className="min-h-[600px]">
        {activeTab === 'pedidos' && <CalendarManager />}
        {activeTab === 'recursos' && <ResourceCalendar />}
      </div>
    </div>
  );
};

export default CalendarPage;

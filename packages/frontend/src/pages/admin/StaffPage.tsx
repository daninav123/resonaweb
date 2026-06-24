import { useState, lazy, Suspense } from 'react';
import { Users, Calendar, Clock } from 'lucide-react';

const StaffManager = lazy(() => import('./StaffManager'));
const StaffAvailabilityCalendar = lazy(() => import('./StaffAvailabilityCalendar'));
const StaffWorkLogs = lazy(() => import('./StaffWorkLogs'));

const tabs = [
  { id: 'team', label: 'Equipo', icon: Users },
  { id: 'availability', label: 'Disponibilidad', icon: Calendar },
  { id: 'hours', label: 'Horas y Pagos', icon: Clock },
] as const;

type TabId = typeof tabs[number]['id'];

const StaffPage = () => {
  const [activeTab, setActiveTab] = useState<TabId>('team');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          </div>
        }
      >
        {activeTab === 'team' && <StaffManager />}
        {activeTab === 'availability' && <StaffAvailabilityCalendar />}
        {activeTab === 'hours' && <StaffWorkLogs />}
      </Suspense>
    </div>
  );
};

export default StaffPage;

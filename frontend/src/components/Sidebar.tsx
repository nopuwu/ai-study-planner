import {
  BookOpen,
  LayoutDashboard,
  Calendar,
  Clock,
  HelpCircle,
  BarChart2,
  LogOut,
  Zap,
} from 'lucide-react';
import type { User } from '../api/types';

export type ActiveTab = 'pulpit' | 'przedmioty' | 'egzaminy' | 'dostepnosc';

interface SidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  user: User | null;
  onLogout: () => void;
}

export function Sidebar({ activeTab, onSelectTab, user, onLogout }: SidebarProps) {
  const fullName = user?.full_name || user?.email || 'Student';
  const initials = user?.full_name
    ? user.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .substring(0, 2)
        .toUpperCase()
    : 'U';

  const navItems = [
    { id: 'pulpit' as ActiveTab, label: 'Pulpit', icon: LayoutDashboard },
    { id: 'przedmioty' as ActiveTab, label: 'Przedmioty i materiały', icon: BookOpen },
    { id: 'egzaminy' as ActiveTab, label: 'Egzaminy', icon: Calendar },
    { id: 'dostepnosc' as ActiveTab, label: 'Dostępność czasowa', icon: Clock },
  ];

  const comingSoonItems = [
    { label: 'Plan nauki', icon: Calendar },
    { label: 'Quizy', icon: HelpCircle },
    { label: 'Postępy', icon: BarChart2 },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col justify-between shrink-0 min-h-screen">
      <div>
        <div className="p-6 flex items-center gap-3 text-xl font-bold text-blue-600">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
            <BookOpen size={20} />
          </div>
          <span>Planer nauki</span>
        </div>

        <nav className="px-3 space-y-1">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Zarządzanie
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition text-left cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-2xs font-semibold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon size={19} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Wkrótce (kolejne etapy)
          </div>
          {comingSoonItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 rounded-xl text-gray-400 text-sm cursor-not-allowed select-none"
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-gray-300" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] uppercase font-semibold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded">
                  Wkrótce
                </span>
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-100 space-y-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 p-3.5 rounded-xl border border-blue-100/60">
          <div className="flex justify-between items-center text-xs font-semibold text-blue-900 mb-1">
            <span>Generowania AI</span>
            <Zap size={14} className="text-blue-600" />
          </div>
          <div className="text-xs text-blue-700 font-medium">Gotowe do ułożenia planu</div>
          <div className="h-1.5 w-full bg-blue-100 rounded-full mt-2 overflow-hidden">
            <div className="h-full bg-blue-600 w-full rounded-full"></div>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="flex w-full items-center justify-between p-2.5 hover:bg-gray-50 rounded-xl transition text-left group border border-transparent hover:border-gray-200"
          title="Wyloguj się"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="text-sm truncate">
              <div className="font-semibold text-gray-900 truncate leading-tight">{fullName}</div>
              <div className="text-gray-400 text-xs truncate">Wyloguj się</div>
            </div>
          </div>
          <LogOut size={16} className="text-gray-400 group-hover:text-red-500 transition shrink-0 ml-1" />
        </button>
      </div>
    </div>
  );
}

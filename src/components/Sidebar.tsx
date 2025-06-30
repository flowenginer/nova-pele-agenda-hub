
import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Calendar, 
  Users, 
  User, 
  Settings, 
  Kanban,
  Bell
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navigation = [
  { id: 'dashboard', name: 'Dashboard', icon: Kanban },
  { id: 'appointments', name: 'Agendamentos', icon: Calendar },
  { id: 'clients', name: 'Clientes', icon: Users },
  { id: 'professionals', name: 'Profissionais', icon: User },
  { id: 'communication', name: 'Comunicação', icon: Bell },
  { id: 'settings', name: 'Configurações', icon: Settings },
];

export const Sidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-lg">
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">N</span>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
              Nova Pele
            </h1>
            <p className="text-sm text-gray-600">CRM Estética</p>
          </div>
        </div>
      </div>
      
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                activeSection === item.id
                  ? "bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 text-white shadow-lg transform scale-105"
                  : "text-gray-700 hover:bg-white/50 hover:text-nova-pink-600"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.name}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

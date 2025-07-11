
import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Calendar, 
  Users, 
  UserCog, 
  MessageCircle, 
  Settings,
  TrendingUp,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  settings?: any;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'appointments', label: 'Agendamentos', icon: Calendar },
  { id: 'clients', label: 'Clientes', icon: Users },
  { id: 'professionals', label: 'Profissionais', icon: UserCog },
  { id: 'revenue', label: 'Receita', icon: TrendingUp },
  { id: 'communication', label: 'Comunicação', icon: MessageCircle },
  {
    id: 'public-links',
    label: 'Links Públicos',
    icon: ExternalLink,
    badge: null
  },
  { id: 'settings', label: 'Configurações', icon: Settings },
];

export const Sidebar = ({ activeSection, onSectionChange, settings }: SidebarProps) => {
  const clinicName = settings?.nome_clinica || 'Nova Pele';
  const logoUrl = settings?.logo_url;
  
  // Criar iniciais do nome da clínica
  const getInitials = (name: string) => {
    return name.split(' ').map(word => word.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="w-64 bg-white/80 backdrop-blur-sm border-r border-white/20 shadow-sm">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-nova-pink-500 to-nova-purple-500 rounded-lg flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={clinicName} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{getInitials(clinicName)}</span>
            )}
          </div>
          <div>
            <h1 className="font-bold text-gray-800">{clinicName}</h1>
            <p className="text-sm text-gray-600">Estética</p>
          </div>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Card
                key={item.id}
                className={cn(
                  "p-3 cursor-pointer transition-all duration-200 hover:shadow-md border-0",
                  activeSection === item.id
                    ? "bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 text-white shadow-lg"
                    : "bg-white/50 hover:bg-white/80 text-gray-700"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
              </Card>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

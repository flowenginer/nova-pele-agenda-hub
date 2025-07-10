
import React from 'react';
import { 
  Calendar, 
  Users, 
  Settings, 
  BarChart3, 
  UserPlus, 
  MessageSquare, 
  DollarSign,
  Briefcase,
  Link as LinkIcon,
  Home
} from 'lucide-react';
import { useLocation } from 'react-router-dom';
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar
} from '@/components/ui/sidebar';
import { useSupabaseCRM } from '@/hooks/useSupabaseCRM';

const menuItems = [
  { 
    name: 'Dashboard', 
    icon: Home, 
    section: 'dashboard',
    description: 'Visão geral'
  },
  { 
    name: 'Agendamentos', 
    icon: Calendar, 
    section: 'appointments',
    description: 'Kanban de agendamentos'
  },
  { 
    name: 'Clientes', 
    icon: Users, 
    section: 'clients',
    description: 'Gestão de clientes'
  },
  { 
    name: 'Profissionais', 
    icon: UserPlus, 
    section: 'professionals',
    description: 'Equipe de profissionais'
  },
  { 
    name: 'Comunicação', 
    icon: MessageSquare, 
    section: 'communication',
    description: 'Templates e mensagens'
  },
  { 
    name: 'Faturamento', 
    icon: DollarSign, 
    section: 'revenue',
    description: 'Relatórios financeiros'
  },
  { 
    name: 'Links Públicos', 
    icon: LinkIcon, 
    section: 'public-links',
    description: 'Links de agendamento'
  },
  { 
    name: 'Configurações', 
    icon: Settings, 
    section: 'settings',
    description: 'Configurações do sistema'
  }
];

export const Sidebar = () => {
  const location = useLocation();
  const { collapsed } = useSidebar();
  const { settings } = useSupabaseCRM();
  
  const activeSection = new URLSearchParams(location.search).get('section') || 'dashboard';
  
  const handleSectionChange = (section: string) => {
    window.history.pushState({}, '', `/?section=${section}`);
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <SidebarComponent className={`${collapsed ? 'w-12 sm:w-14' : 'w-48 sm:w-60'} transition-all duration-300`}>
      <div className="p-2 sm:p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {settings?.logo_url ? (
              <img src={settings.logo_url} alt="Logo" className="w-full h-full object-cover rounded-full" />
            ) : (
              <span className="text-white font-bold text-xs sm:text-sm">
                {(settings?.nome_clinica || 'N').charAt(0)}
              </span>
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <h2 className="font-bold text-xs sm:text-sm bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent truncate">
                {settings?.nome_clinica || 'Nova Pele Estética'}
              </h2>
              <p className="text-xs text-muted-foreground truncate">Sistema CRM</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent className="p-1 sm:p-2">
        <SidebarGroup>
          <SidebarGroupLabel className={`text-xs ${collapsed ? 'sr-only' : ''}`}>
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.section}>
                  <SidebarMenuButton
                    onClick={() => handleSectionChange(item.section)}
                    className={`
                      h-8 sm:h-10 text-xs sm:text-sm transition-colors cursor-pointer
                      ${activeSection === item.section 
                        ? 'bg-nova-pink-100 text-nova-pink-700 border-l-2 border-nova-pink-500' 
                        : 'hover:bg-sidebar-accent text-sidebar-foreground'
                      }
                    `}
                    tooltip={collapsed ? item.name : undefined}
                  >
                    <item.icon className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    {!collapsed && (
                      <div className="min-w-0 flex-1">
                        <span className="truncate">{item.name}</span>
                        <div className="text-xs text-muted-foreground truncate">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <div className="p-2 border-t border-sidebar-border">
        <SidebarTrigger className="w-full h-8 sm:h-10 text-xs sm:text-sm" />
      </div>
    </SidebarComponent>
  );
};

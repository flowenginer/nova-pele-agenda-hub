
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseCRM } from '@/hooks/useSupabaseCRM';
import { LoginForm } from '@/components/Auth/LoginForm';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AppointmentsKanban } from '@/components/AppointmentsKanban';
import { ClientsManagement } from '@/components/ClientsManagement';
import { ProfessionalsManagement } from '@/components/ProfessionalsManagement';
import { Communication } from '@/components/Communication';
import { Settings } from '@/components/Settings';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const crmData = useSupabaseCRM();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nova-pink-50 to-nova-purple-50">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-nova-pink-600" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  // Show login form if not authenticated
  if (!user) {
    return <LoginForm />;
  }

  const handleSignOut = async () => {
    await signOut();
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard {...crmData} />;
      case 'appointments':
        return <AppointmentsKanban {...crmData} />;
      case 'clients':
        return <ClientsManagement {...crmData} />;
      case 'professionals':
        return <ProfessionalsManagement {...crmData} />;
      case 'communication':
        return <Communication />;
      case 'settings':
        return <Settings settings={crmData.settings} updateSettings={crmData.updateSettings} />;
      default:
        return <Dashboard {...crmData} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nova-pink-50 to-nova-purple-50">
      <div className="flex">
        <Sidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Bem-vindo, {user.email}!
                </h1>
                <p className="text-gray-600">Sistema de Gestão Nova Pele Estética</p>
              </div>
              <Button
                variant="outline"
                onClick={handleSignOut}
                className="flex items-center space-x-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6">
            {crmData.loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-nova-pink-600" />
                  <p className="text-gray-600">Carregando dados...</p>
                </div>
              </div>
            ) : (
              renderActiveSection()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

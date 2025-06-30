
import React, { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Dashboard } from '../components/Dashboard';
import { AppointmentsKanban } from '../components/AppointmentsKanban';
import { ClientsManagement } from '../components/ClientsManagement';
import { ProfessionalsManagement } from '../components/ProfessionalsManagement';
import { Communication } from '../components/Communication';
import { Settings } from '../components/Settings';
import { useCRMData } from '../hooks/useCRMData';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const {
    clients,
    professionals,
    services,
    appointments,
    dashboardMetrics,
    loading,
    updateAppointmentStatus,
    addClient,
    addAppointment,
    setProfessionals
  } = useCRMData();

  const handleWhatsAppClick = (phone: string) => {
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const handleStatusChange = async (appointmentId: string, status: any) => {
    await updateAppointmentStatus(appointmentId, status);
    toast({
      title: "Status atualizado",
      description: "O status do agendamento foi atualizado com sucesso.",
    });
  };

  const handleAddClient = async (clientData: any) => {
    await addClient(clientData);
    toast({
      title: "Cliente adicionado",
      description: "O cliente foi cadastrado com sucesso.",
    });
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard metrics={dashboardMetrics} />;
      case 'appointments':
        return (
          <AppointmentsKanban
            appointments={appointments}
            onStatusChange={handleStatusChange}
            onWhatsAppClick={handleWhatsAppClick}
          />
        );
      case 'clients':
        return (
          <ClientsManagement
            clients={clients}
            onAddClient={handleAddClient}
          />
        );
      case 'professionals':
        return (
          <ProfessionalsManagement
            professionals={professionals}
            onUpdateProfessionals={setProfessionals}
          />
        );
      case 'communication':
        return <Communication clients={clients} />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard metrics={dashboardMetrics} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-nova">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
            <span className="text-white font-bold text-2xl">N</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-700">Carregando CRM...</h2>
          <p className="text-gray-500 mt-2">Aguarde um momento</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-nova">
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        <main className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Index;

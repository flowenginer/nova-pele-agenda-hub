
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

  const handleStatusChange = (appointmentId: string, status: any) => {
    const id = parseInt(appointmentId);
    crmData.updateAppointmentStatus(id, status);
  };

  const handleWhatsAppClick = (phone: string) => {
    window.open(`https://wa.me/${phone}`, '_blank');
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard metrics={crmData.dashboardMetrics} />;
      case 'appointments':
        return (
          <AppointmentsKanban
            appointments={crmData.appointments.map(apt => ({
              id: apt.id.toString(),
              clientId: apt.cliente_id || '',
              professionalId: apt.profissional_id.toString(),
              serviceId: apt.servico_id.toString(),
              client: {
                name: apt.cliente_nome,
                phone: apt.cliente_telefone,
                whatsapp: apt.cliente_telefone
              },
              professional: {
                name: crmData.professionals.find(p => p.id === apt.profissional_id)?.nome || 'N/A'
              },
              service: {
                name: crmData.services.find(s => s.id === apt.servico_id)?.nome || 'N/A'
              },
              date: apt.data_agendamento,
              time: apt.hora_agendamento,
              status: apt.status as any,
              value: apt.valor || 0,
              createdAt: apt.created_at,
              updatedAt: apt.updated_at || apt.created_at
            }))}
            onStatusChange={handleStatusChange}
            onWhatsAppClick={handleWhatsAppClick}
          />
        );
      case 'clients':
        return (
          <ClientsManagement
            clients={crmData.clients.map(client => ({
              id: client.id,
              name: client.nome,
              phone: client.telefone,
              whatsapp: client.whatsapp,
              email: client.email,
              birthDate: client.data_nascimento,
              address: client.endereco,
              status: client.status as any,
              notes: client.observacoes,
              createdAt: client.created_at,
              updatedAt: client.updated_at
            }))}
            onAddClient={(clientData) => {
              crmData.addClient({
                nome: clientData.name,
                telefone: clientData.phone,
                whatsapp: clientData.whatsapp,
                email: clientData.email,
                data_nascimento: clientData.birthDate,
                endereco: clientData.address,
                status: clientData.status,
                observacoes: clientData.notes
              });
            }}
          />
        );
      case 'professionals':
        return (
          <ProfessionalsManagement
            professionals={crmData.professionals.map(prof => ({
              id: prof.id.toString(),
              name: prof.nome,
              email: prof.email,
              phone: prof.telefone,
              specialties: prof.especialidades || [],
              workingHours: {
                start: prof.horario_inicio || '08:00',
                end: prof.horario_fim || '18:00'
              },
              workingDays: prof.dias_trabalho || [1, 2, 3, 4, 5],
              isActive: prof.ativo !== false,
              avatar: prof.photo_url
            }))}
            onUpdateProfessionals={() => crmData.refetch()}
          />
        );
      case 'communication':
        return <Communication clients={crmData.clients.map(client => ({
          id: client.id,
          name: client.nome,
          phone: client.telefone,
          whatsapp: client.whatsapp,
          email: client.email,
          birthDate: client.data_nascimento,
          address: client.endereco,
          status: client.status as any,
          notes: client.observacoes,
          createdAt: client.created_at,
          updatedAt: client.updated_at
        }))} />;
      case 'settings':
        return <Settings settings={crmData.settings} updateSettings={crmData.updateSettings} />;
      default:
        return <Dashboard metrics={crmData.dashboardMetrics} />;
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

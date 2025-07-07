import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSupabaseCRM } from '@/hooks/useSupabaseCRM';
import { LoginForm } from '@/components/Auth/LoginForm';
import { Sidebar } from '@/components/Sidebar';
import { Dashboard } from '@/components/Dashboard';
import { AppointmentsKanban } from '@/components/AppointmentsKanban';
import { ClientsManagement } from '@/components/ClientsManagement';
import { ProfessionalsManagement } from '@/components/ProfessionalsManagement';
import { Revenue } from '@/components/Revenue';
import { Communication } from '@/components/Communication';
import { Settings } from '@/components/Settings';
import { Button } from '@/components/ui/button';
import { LogOut, Loader2 } from 'lucide-react';
import { PublicLinks } from '@/components/PublicLinks';
import { AppointmentConsult } from '@/components/AppointmentConsult';

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const crmData = useSupabaseCRM();
  const [activeSection, setActiveSection] = useState('dashboard');

  // Verificar se há parâmetro de seção na URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const section = urlParams.get('section');
    if (section === 'appointment-consult') {
      setActiveSection('appointment-consult');
    }
  }, []);

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

  const handleUpdateProfessionals = (updatedProfessionals: any[]) => {
    // Esta função será chamada quando houver mudanças nos profissionais
    // mas como estamos usando o Supabase, vamos recarregar os dados
    crmData.refetch();
  };

  const handleAddProfessional = async (professionalData: any) => {
    try {
      await crmData.addProfessional({
        nome: professionalData.nome,
        email: professionalData.email,
        telefone: professionalData.telefone,
        especialidades: professionalData.especialidades,
        horario_inicio: professionalData.horario_inicio,
        horario_fim: professionalData.horario_fim,
        dias_trabalho: professionalData.dias_trabalho,
        ativo: professionalData.ativo,
        photo_url: professionalData.photo_url
      });
    } catch (error) {
      console.error('Erro ao adicionar profissional:', error);
    }
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <Dashboard metrics={crmData.dashboardMetrics} />;
      case 'appointment-consult':
        return <AppointmentConsult />;
      case 'appointments':
        // Combinando agendamentos normais com inicio_contato
        const allAppointments = [
          // Agendamentos normais
          ...crmData.appointments.map(apt => ({
            id: apt.id.toString(),
            clientId: apt.cliente_id || apt.id.toString(),
            professionalId: apt.profissional_id.toString(),
            serviceId: apt.servico_id.toString(),
            client: {
              id: apt.cliente_id || apt.id.toString(),
              name: apt.cliente_nome,
              phone: apt.cliente_telefone,
              whatsapp: apt.cliente_telefone,
              email: apt.email || '',
              status: 'cliente' as any,
              createdAt: apt.created_at,
              updatedAt: apt.updated_at || apt.created_at
            },
            professional: {
              id: apt.profissional_id.toString(),
              name: crmData.professionals.find(p => p.id === apt.profissional_id)?.nome || 'N/A',
              email: crmData.professionals.find(p => p.id === apt.profissional_id)?.email || '',
              phone: crmData.professionals.find(p => p.id === apt.profissional_id)?.telefone || '',
              specialties: crmData.professionals.find(p => p.id === apt.profissional_id)?.especialidades || [],
              workingHours: {
                start: crmData.professionals.find(p => p.id === apt.profissional_id)?.horario_inicio || '08:00',
                end: crmData.professionals.find(p => p.id === apt.profissional_id)?.horario_fim || '18:00'
              },
              workingDays: crmData.professionals.find(p => p.id === apt.profissional_id)?.dias_trabalho || [1, 2, 3, 4, 5],
              isActive: crmData.professionals.find(p => p.id === apt.profissional_id)?.ativo !== false,
              avatar: crmData.professionals.find(p => p.id === apt.profissional_id)?.photo_url
            },
            service: {
              id: apt.servico_id.toString(),
              name: crmData.services.find(s => s.id === apt.servico_id)?.nome || 'N/A',
              description: crmData.services.find(s => s.id === apt.servico_id)?.descricao || '',
              duration: crmData.services.find(s => s.id === apt.servico_id)?.duracao_minutos || 60,
              price: crmData.services.find(s => s.id === apt.servico_id)?.preco || 0,
              category: crmData.services.find(s => s.id === apt.servico_id)?.categoria || '',
              isActive: crmData.services.find(s => s.id === apt.servico_id)?.ativo !== false,
              professionals: []
            },
            date: apt.data_agendamento,
            time: apt.hora_agendamento,
            status: apt.status as any,
            value: apt.valor || 0,
            createdAt: apt.created_at,
            updatedAt: apt.updated_at || apt.created_at
          })),
          // Contatos de início que ainda não foram convertidos
          ...crmData.inicioContatos
            .filter(ic => ic.status === 'pendente')
            .map(ic => ({
              id: `inicio_${ic.id}`,
              clientId: ic.id,
              professionalId: '0',
              serviceId: '0',
              client: {
                id: ic.id,
                name: ic.nome,
                phone: ic.telefone,
                whatsapp: ic.whatsapp || ic.telefone,
                email: ic.email || '',
                status: 'lead' as any,
                createdAt: ic.created_at,
                updatedAt: ic.updated_at
              },
              professional: {
                id: '0',
                name: 'A definir',
                email: '',
                phone: '',
                specialties: [],
                workingHours: { start: '08:00', end: '18:00' },
                workingDays: [1, 2, 3, 4, 5],
                isActive: true
              },
              service: {
                id: '0',
                name: 'A definir',
                description: '',
                duration: 60,
                price: 0,
                category: '',
                isActive: true,
                professionals: []
              },
              date: ic.data_contato.split('T')[0],
              time: new Date(ic.data_contato).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
              status: 'inicio_contato' as any,
              value: 0,
              createdAt: ic.created_at,
              updatedAt: ic.updated_at
            }))
        ];

        return (
          <AppointmentsKanban
            appointments={allAppointments}
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
            professionals={crmData.professionals}
            addProfessional={handleAddProfessional}
            updateProfessional={crmData.updateProfessional}
          />
        );
      case 'revenue':
        return (
          <Revenue
            appointments={crmData.appointments}
            services={crmData.services}
            metrics={crmData.dashboardMetrics}
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
      case 'public-links':
        return <PublicLinks />;
      case 'settings':
        return <Settings settings={crmData.settings} updateSettings={crmData.updateSettings} />;
      default:
        return <Dashboard metrics={crmData.dashboardMetrics} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-nova-pink-50 to-nova-purple-50">
      <div className="flex">
        <Sidebar 
          activeSection={activeSection} 
          onSectionChange={setActiveSection}
          settings={crmData.settings}
        />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm p-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">
                  Bem-vindo, {crmData.settings?.nome_clinica || 'Nova Pele Estética'}!
                </h1>
                <p className="text-gray-600">Sistema de Gestão</p>
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

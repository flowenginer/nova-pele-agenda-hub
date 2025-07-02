import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { DatabaseClient, DatabaseProfessional, DatabaseService, DatabaseAppointment, SystemSettings } from '../types/supabase';

export const useSupabaseCRM = () => {
  const [clients, setClients] = useState<DatabaseClient[]>([]);
  const [professionals, setProfessionals] = useState<DatabaseProfessional[]>([]);
  const [services, setServices] = useState<DatabaseService[]>([]);
  const [appointments, setAppointments] = useState<DatabaseAppointment[]>([]);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasProcessedSync, setHasProcessedSync] = useState(false);
  const { toast } = useToast();

  // Função para sincronizar clientes dos agendamentos (apenas uma vez)
  const syncClientsFromAppointments = async (appointmentsData: DatabaseAppointment[]) => {
    if (hasProcessedSync) return;
    
    try {
      console.log('Iniciando sincronização de clientes...');
      const clientsToCreate = [];
      
      for (const appointment of appointmentsData) {
        if (appointment.cliente_nome && appointment.cliente_telefone) {
          // Verificar se cliente já existe
          const existingClient = await supabase
            .from('clientes')
            .select('id')
            .eq('telefone', appointment.cliente_telefone)
            .maybeSingle();

          if (!existingClient.data) {
            // Cliente não existe, adicionar à lista para criar
            clientsToCreate.push({
              nome: appointment.cliente_nome,
              telefone: appointment.cliente_telefone,
              whatsapp: appointment.cliente_telefone,
              email: appointment.email || null,
              status: 'cliente'
            });
          }
        }
      }

      // Criar clientes em lote se houver algum
      if (clientsToCreate.length > 0) {
        const { data: newClients, error } = await supabase
          .from('clientes')
          .insert(clientsToCreate)
          .select();

        if (error) {
          console.error('Erro ao sincronizar clientes:', error);
        } else {
          console.log(`${newClients?.length || 0} novos clientes sincronizados dos agendamentos`);
        }
      }
      
      setHasProcessedSync(true);
    } catch (error) {
      console.error('Erro na sincronização de clientes:', error);
    }
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);

      // Fetch clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;
      setClients((clientsData || []) as DatabaseClient[]);

      // Fetch professionals
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('profissionais')
        .select('*')
        .order('nome');

      if (professionalsError) throw professionalsError;
      setProfessionals((professionalsData || []) as DatabaseProfessional[]);

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('servicos')
        .select('*')
        .order('nome');

      if (servicesError) throw servicesError;
      setServices((servicesData || []) as DatabaseService[]);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('agendamentos')
        .select('*')
        .order('data_agendamento', { ascending: false });

      if (appointmentsError) throw appointmentsError;
      setAppointments((appointmentsData || []) as DatabaseAppointment[]);

      // Sincronizar clientes dos agendamentos (apenas uma vez)
      if (appointmentsData && appointmentsData.length > 0 && !hasProcessedSync) {
        await syncClientsFromAppointments(appointmentsData);
        
        // Recarregar clientes após sincronização
        const { data: updatedClientsData } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (updatedClientsData) {
          setClients(updatedClientsData as DatabaseClient[]);
        }
      }

      // Fetch system settings
      const { data: settingsData, error: settingsError } = await supabase
        .from('configuracoes_sistema')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') throw settingsError;
      setSettings(settingsData as SystemSettings || null);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do sistema.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Client operations
  const addClient = async (clientData: Omit<DatabaseClient, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert([clientData])
        .select()
        .single();

      if (error) throw error;

      setClients(prev => [data as DatabaseClient, ...prev]);
      toast({
        title: "Cliente adicionado",
        description: "Cliente foi adicionado com sucesso.",
      });
      return data;
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Não foi possível adicionar o cliente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateClient = async (id: string, updates: Partial<DatabaseClient>) => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setClients(prev => prev.map(c => c.id === id ? data as DatabaseClient : c));
      toast({
        title: "Cliente atualizado",
        description: "Dados do cliente foram atualizados.",
      });
      return data;
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Não foi possível atualizar o cliente.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Appointment operations
  const addAppointment = async (appointmentData: Omit<DatabaseAppointment, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .insert([appointmentData])
        .select()
        .single();

      if (error) throw error;

      setAppointments(prev => [data as DatabaseAppointment, ...prev]);
      
      // Sincronizar cliente automaticamente se não existir
      if (appointmentData.cliente_nome && appointmentData.cliente_telefone) {
        const existingClient = await supabase
          .from('clientes')
          .select('id')
          .eq('telefone', appointmentData.cliente_telefone)
          .maybeSingle();

        if (!existingClient.data) {
          await addClient({
            nome: appointmentData.cliente_nome,
            telefone: appointmentData.cliente_telefone,
            whatsapp: appointmentData.cliente_telefone,
            email: appointmentData.email || null,
            status: 'cliente'
          });
        }
      }

      toast({
        title: "Agendamento criado",
        description: "Agendamento foi criado com sucesso.",
      });
      return data;
    } catch (error) {
      console.error('Error adding appointment:', error);
      toast({
        title: "Erro ao criar agendamento",
        description: "Não foi possível criar o agendamento.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      const { data, error } = await supabase
        .from('agendamentos')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setAppointments(prev => prev.map(a => a.id === id ? data as DatabaseAppointment : a));
      toast({
        title: "Status atualizado",
        description: "Status do agendamento foi atualizado.",
      });
      return data;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Professional operations
  const addProfessional = async (professionalData: Omit<DatabaseProfessional, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .insert([professionalData])
        .select()
        .single();

      if (error) throw error;

      setProfessionals(prev => [...prev, data as DatabaseProfessional]);
      toast({
        title: "Profissional adicionado",
        description: "Profissional foi adicionado com sucesso.",
      });
      return data;
    } catch (error) {
      console.error('Error adding professional:', error);
      toast({
        title: "Erro ao adicionar profissional",
        description: "Não foi possível adicionar o profissional.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateProfessional = async (id: number, updates: Partial<DatabaseProfessional>) => {
    try {
      const { data, error } = await supabase
        .from('profissionais')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setProfessionals(prev => prev.map(p => p.id === id ? data as DatabaseProfessional : p));
      toast({
        title: "Profissional atualizado",
        description: "Dados do profissional foram atualizados.",
      });
      return data;
    } catch (error) {
      console.error('Error updating professional:', error);
      toast({
        title: "Erro ao atualizar profissional",
        description: "Não foi possível atualizar o profissional.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Service operations
  const addService = async (serviceData: Omit<DatabaseService, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('servicos')
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;

      setServices(prev => [...prev, data as DatabaseService]);
      toast({
        title: "Serviço adicionado",
        description: "Serviço foi adicionado com sucesso.",
      });
      return data;
    } catch (error) {
      console.error('Error adding service:', error);
      toast({
        title: "Erro ao adicionar serviço",
        description: "Não foi possível adicionar o serviço.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Settings operations
  const updateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      if (!settings?.id) return;

      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .update(updates)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;

      setSettings(data as SystemSettings);
      toast({
        title: "Configurações salvas",
        description: "Configurações foram atualizadas com sucesso.",
      });
      return data;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erro ao salvar configurações",
        description: "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
      throw error;
    }
  };

  // Dashboard metrics
  const dashboardMetrics = {
    totalAppointments: appointments.length,
    totalClients: clients.length,
    appointmentsToday: appointments.filter(a => a.data_agendamento === new Date().toISOString().split('T')[0]).length,
    revenue: appointments.reduce((sum, a) => sum + (a.valor || 0), 0),
    appointmentsByStatus: appointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    appointmentsByService: appointments.reduce((acc, a) => {
      const service = services.find(s => s.id === a.servico_id);
      if (service) {
        acc[service.nome] = (acc[service.nome] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    appointmentsByProfessional: appointments.reduce((acc, a) => {
      const professional = professionals.find(p => p.id === a.profissional_id);
      if (professional) {
        acc[professional.nome] = (acc[professional.nome] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    clients,
    professionals,
    services,
    appointments,
    settings,
    dashboardMetrics,
    loading,
    addClient,
    updateClient,
    addAppointment,
    updateAppointmentStatus,
    addProfessional,
    updateProfessional,
    addService,
    updateSettings,
    refetch: fetchAllData
  };
};

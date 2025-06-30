
import { useState, useEffect } from 'react';
import { Client, Professional, Service, Appointment, DashboardMetrics } from '../types/crm';

// Mock data - Em produção seria integrado com Supabase
const mockClients: Client[] = [
  {
    id: '1',
    name: 'Maria Silva',
    phone: '(11) 99999-9999',
    whatsapp: '5511999999999',
    email: 'maria@email.com',
    status: 'cliente',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'Ana Costa',
    phone: '(11) 88888-8888',
    whatsapp: '5511888888888',
    email: 'ana@email.com',
    status: 'lead',
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z'
  }
];

const mockProfessionals: Professional[] = [
  {
    id: '1',
    name: 'Dra. Carla Estética',
    email: 'carla@novapele.com',
    phone: '(11) 77777-7777',
    specialties: ['Facial', 'Limpeza de Pele', 'Peeling'],
    workingHours: { start: '08:00', end: '18:00' },
    workingDays: [1, 2, 3, 4, 5],
    isActive: true
  },
  {
    id: '2',
    name: 'Marcos Massoterapeuta',
    email: 'marcos@novapele.com',
    phone: '(11) 66666-6666',
    specialties: ['Massagem', 'Drenagem', 'Relaxante'],
    workingHours: { start: '09:00', end: '17:00' },
    workingDays: [1, 2, 3, 4, 5, 6],
    isActive: true
  }
];

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Limpeza de Pele',
    description: 'Limpeza profunda facial',
    duration: 60,
    price: 80,
    category: 'Facial',
    isActive: true,
    professionals: ['1']
  },
  {
    id: '2',
    name: 'Massagem Relaxante',
    description: 'Massagem corporal completa',
    duration: 90,
    price: 120,
    category: 'Corporal',
    isActive: true,
    professionals: ['2']
  }
];

const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientId: '1',
    professionalId: '1',
    serviceId: '1',
    date: '2024-06-30',
    time: '10:00',
    status: 'confirmado',
    value: 80,
    createdAt: '2024-06-25T10:00:00Z',
    updatedAt: '2024-06-25T10:00:00Z'
  },
  {
    id: '2',
    clientId: '2',
    professionalId: '2',
    serviceId: '2',
    date: '2024-06-30',
    time: '14:00',
    status: 'agendado',
    value: 120,
    createdAt: '2024-06-26T14:00:00Z',
    updatedAt: '2024-06-26T14:00:00Z'
  }
];

export const useCRMData = () => {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [professionals, setProfessionals] = useState<Professional[]>(mockProfessionals);
  const [services, setServices] = useState<Service[]>(mockServices);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [loading, setLoading] = useState(false);

  // Enriquecer appointments com dados relacionados
  const enrichedAppointments = appointments.map(appointment => ({
    ...appointment,
    client: clients.find(c => c.id === appointment.clientId),
    professional: professionals.find(p => p.id === appointment.professionalId),
    service: services.find(s => s.id === appointment.serviceId)
  }));

  const dashboardMetrics: DashboardMetrics = {
    totalAppointments: appointments.length,
    totalClients: clients.length,
    appointmentsToday: appointments.filter(a => a.date === '2024-06-30').length,
    revenue: appointments.reduce((sum, a) => sum + (a.value || 0), 0),
    appointmentsByStatus: appointments.reduce((acc, a) => {
      acc[a.status] = (acc[a.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
    appointmentsByService: appointments.reduce((acc, a) => {
      const service = services.find(s => s.id === a.serviceId);
      if (service) {
        acc[service.name] = (acc[service.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>),
    appointmentsByProfessional: appointments.reduce((acc, a) => {
      const professional = professionals.find(p => p.id === a.professionalId);
      if (professional) {
        acc[professional.name] = (acc[professional.name] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>)
  };

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    setAppointments(prev => 
      prev.map(a => 
        a.id === appointmentId 
          ? { ...a, status, updatedAt: new Date().toISOString() }
          : a
      )
    );
  };

  const addClient = async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newClient: Client = {
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setClients(prev => [...prev, newClient]);
    return newClient;
  };

  const addAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newAppointment: Appointment = {
      ...appointment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setAppointments(prev => [...prev, newAppointment]);
    return newAppointment;
  };

  return {
    clients,
    professionals,
    services,
    appointments: enrichedAppointments,
    dashboardMetrics,
    loading,
    updateAppointmentStatus,
    addClient,
    addAppointment,
    setClients,
    setProfessionals,
    setServices
  };
};

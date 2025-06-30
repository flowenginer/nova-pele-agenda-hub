
export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  birthDate?: string;
  address?: string;
  status: 'lead' | 'cliente' | 'inativo';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Professional {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  specialties: string[];
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[];
  isActive: boolean;
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  duration: number; // em minutos
  price: number;
  category: string;
  isActive: boolean;
  professionals: string[];
}

export interface Appointment {
  id: string;
  clientId: string;
  client?: Client;
  professionalId: string;
  professional?: Professional;
  serviceId: string;
  service?: Service;
  date: string;
  time: string;
  status: 'agendado' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado' | 'nao_compareceu';
  notes?: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardMetrics {
  totalAppointments: number;
  totalClients: number;
  appointmentsToday: number;
  revenue: number;
  appointmentsByStatus: Record<string, number>;
  appointmentsByService: Record<string, number>;
  appointmentsByProfessional: Record<string, number>;
}

export interface CommunicationTemplate {
  id: string;
  name: string;
  message: string;
  type: 'confirmation' | 'reminder' | 'birthday' | 'promotion' | 'custom';
}

export interface SystemSettings {
  clinicName: string;
  logo?: string;
  primaryColor: string;
  workingHours: {
    start: string;
    end: string;
  };
  workingDays: number[];
  appointmentDuration: number;
  notificationsEnabled: boolean;
  whatsappIntegration: boolean;
}

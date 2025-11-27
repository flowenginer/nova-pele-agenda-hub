
export interface DatabaseClient {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  cpf?: string;
  birth_date?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  notes?: string;
  tags?: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfessional {
  id: number;
  name: string;
  specialization?: string;
  email?: string;
  phone?: string;
  status: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseService {
  id: number;
  name: string;
  description?: string;
  duration?: number;
  price?: number;
  color?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseAppointment {
  id: number;
  client_id?: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  professional_id?: number;
  professional_name?: string;
  service_id?: number;
  service_name: string;
  date: string;
  time: string;
  duration: number;
  status: string;
  notes?: string;
  price?: number;
  payment_status?: string;
  payment_method?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSettings {
  id: number;
  key: string;
  value: any;
  created_at: string;
  updated_at: string;
}

export interface CommunicationTemplate {
  id: string;
  nome: string;
  mensagem: string;
  tipo: 'confirmacao' | 'lembrete' | 'aniversario' | 'promocao' | 'personalizada';
  created_at: string;
  updated_at: string;
}

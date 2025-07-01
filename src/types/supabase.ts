
export interface DatabaseClient {
  id: string;
  nome: string;
  telefone: string;
  whatsapp?: string;
  email?: string;
  data_nascimento?: string;
  endereco?: string;
  status: 'lead' | 'cliente' | 'inativo';
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface DatabaseProfessional {
  id: number;
  nome: string;
  especialidade?: string;
  photo_url?: string;
  email?: string;
  telefone?: string;
  especialidades?: string[];
  horario_inicio?: string;
  horario_fim?: string;
  dias_trabalho?: number[];
  ativo?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseService {
  id: number;
  nome: string;
  descricao?: string;
  duracao_minutos?: number;
  preco?: number;
  categoria?: string;
  ativo?: boolean;
  profissionais_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface DatabaseAppointment {
  id: number;
  id_uuid?: string;
  status: string;
  cliente_nome: string;
  cliente_telefone: string;
  email?: string;
  servico_id: number;
  profissional_id: number;
  data_agendamento: string;
  hora_agendamento: string;
  valor?: number;
  observacoes?: string;
  cliente_id?: string;
  created_at: string;
  updated_at?: string;
}

export interface SystemSettings {
  id: string;
  nome_clinica: string;
  logo_url?: string;
  cor_primaria: string;
  horario_inicio: string;
  horario_fim: string;
  dias_funcionamento: number[];
  duracao_padrao_agendamento: number;
  notificacoes_ativadas: boolean;
  integracao_whatsapp: boolean;
  titulo_pagina: string;
  subtitulo_pagina: string;
  mensagem_boas_vindas: string;
  mensagem_confirmacao: string;
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

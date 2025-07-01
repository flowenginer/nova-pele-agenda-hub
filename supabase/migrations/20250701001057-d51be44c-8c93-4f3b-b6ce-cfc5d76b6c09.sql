
-- Criar tabela de clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  data_nascimento DATE,
  endereco TEXT,
  status TEXT DEFAULT 'lead' CHECK (status IN ('lead', 'cliente', 'inativo')),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Atualizar tabela de agendamentos para usar UUID e melhorar estrutura
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS id_uuid UUID DEFAULT gen_random_uuid(),
ADD COLUMN IF NOT EXISTS cliente_id UUID,
ADD COLUMN IF NOT EXISTS valor DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS observacoes TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar foreign key para clientes
ALTER TABLE public.agendamentos 
ADD CONSTRAINT fk_agendamentos_cliente 
FOREIGN KEY (cliente_id) REFERENCES public.clientes(id) ON DELETE CASCADE;

-- Atualizar tabela de profissionais
ALTER TABLE public.profissionais 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS especialidades TEXT[],
ADD COLUMN IF NOT EXISTS horario_inicio TIME DEFAULT '08:00',
ADD COLUMN IF NOT EXISTS horario_fim TIME DEFAULT '18:00',
ADD COLUMN IF NOT EXISTS dias_trabalho INTEGER[] DEFAULT '{1,2,3,4,5}',
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Atualizar tabela de serviços
ALTER TABLE public.servicos 
ADD COLUMN IF NOT EXISTS descricao TEXT,
ADD COLUMN IF NOT EXISTS categoria TEXT,
ADD COLUMN IF NOT EXISTS ativo BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS profissionais_ids UUID[],
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Criar tabela de templates de comunicação
CREATE TABLE public.templates_comunicacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  tipo TEXT CHECK (tipo IN ('confirmacao', 'lembrete', 'aniversario', 'promocao', 'personalizada')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Criar tabela de configurações do sistema
CREATE TABLE public.configuracoes_sistema (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT DEFAULT 'Nova Pele Estética',
  logo_url TEXT,
  cor_primaria TEXT DEFAULT '#ec4899',
  horario_inicio TIME DEFAULT '08:00',
  horario_fim TIME DEFAULT '18:00',
  dias_funcionamento INTEGER[] DEFAULT '{1,2,3,4,5}',
  duracao_padrao_agendamento INTEGER DEFAULT 60,
  notificacoes_ativadas BOOLEAN DEFAULT true,
  integracao_whatsapp BOOLEAN DEFAULT true,
  titulo_pagina TEXT DEFAULT 'Nova Pele Estética',
  subtitulo_pagina TEXT DEFAULT 'Cuidando melhor de você',
  mensagem_boas_vindas TEXT DEFAULT 'Bem-vinda à Nova Pele Estética! Agende seu horário online e transforme sua beleza com nossos tratamentos especializados.',
  mensagem_confirmacao TEXT DEFAULT 'Agendamento realizado com sucesso! Entraremos em contato para confirmar.',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Inserir configuração padrão
INSERT INTO public.configuracoes_sistema (nome_clinica) VALUES ('Nova Pele Estética');

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.servicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_comunicacao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_sistema ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes (acesso total para usuários autenticados)
CREATE POLICY "Usuários autenticados podem ver clientes" 
ON public.clientes FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir clientes" 
ON public.clientes FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar clientes" 
ON public.clientes FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem deletar clientes" 
ON public.clientes FOR DELETE 
TO authenticated USING (true);

-- Políticas para agendamentos
CREATE POLICY "Usuários autenticados podem ver agendamentos" 
ON public.agendamentos FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir agendamentos" 
ON public.agendamentos FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar agendamentos" 
ON public.agendamentos FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem deletar agendamentos" 
ON public.agendamentos FOR DELETE 
TO authenticated USING (true);

-- Políticas para profissionais
CREATE POLICY "Usuários autenticados podem ver profissionais" 
ON public.profissionais FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir profissionais" 
ON public.profissionais FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar profissionais" 
ON public.profissionais FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem deletar profissionais" 
ON public.profissionais FOR DELETE 
TO authenticated USING (true);

-- Políticas para serviços
CREATE POLICY "Usuários autenticados podem ver serviços" 
ON public.servicos FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir serviços" 
ON public.servicos FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar serviços" 
ON public.servicos FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem deletar serviços" 
ON public.servicos FOR DELETE 
TO authenticated USING (true);

-- Políticas para templates de comunicação
CREATE POLICY "Usuários autenticados podem ver templates" 
ON public.templates_comunicacao FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir templates" 
ON public.templates_comunicacao FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar templates" 
ON public.templates_comunicacao FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem deletar templates" 
ON public.templates_comunicacao FOR DELETE 
TO authenticated USING (true);

-- Políticas para configurações do sistema
CREATE POLICY "Usuários autenticados podem ver configurações" 
ON public.configuracoes_sistema FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem atualizar configurações" 
ON public.configuracoes_sistema FOR UPDATE 
TO authenticated USING (true);

-- Políticas de acesso público para agendamentos (para a página externa)
CREATE POLICY "Acesso público para inserir agendamentos" 
ON public.agendamentos FOR INSERT 
TO anon WITH CHECK (true);

CREATE POLICY "Acesso público para ver serviços ativos" 
ON public.servicos FOR SELECT 
TO anon USING (ativo = true);

CREATE POLICY "Acesso público para ver profissionais ativos" 
ON public.profissionais FOR SELECT 
TO anon USING (ativo = true);

CREATE POLICY "Acesso público para ver configurações" 
ON public.configuracoes_sistema FOR SELECT 
TO anon USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar updated_at
CREATE TRIGGER trigger_clientes_updated_at
  BEFORE UPDATE ON public.clientes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_agendamentos_updated_at
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_profissionais_updated_at
  BEFORE UPDATE ON public.profissionais
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_servicos_updated_at
  BEFORE UPDATE ON public.servicos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_templates_updated_at
  BEFORE UPDATE ON public.templates_comunicacao
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trigger_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes_sistema
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Criar tabela para prontuários eletrônicos
CREATE TABLE public.prontuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id UUID NOT NULL,
  agendamento_id BIGINT,
  tipo VARCHAR(50) NOT NULL DEFAULT 'anamnese', -- 'anamnese', 'evolucao', 'procedimento'
  titulo VARCHAR(255) NOT NULL,
  dados_anamnese JSONB, -- Para formulários de anamnese personalizáveis
  observacoes TEXT,
  fotos_antes TEXT[], -- URLs das fotos "antes"
  fotos_depois TEXT[], -- URLs das fotos "depois"
  profissional_id BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para prontuários
CREATE POLICY "Usuários autenticados podem ver prontuários" 
ON public.prontuarios 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários autenticados podem inserir prontuários" 
ON public.prontuarios 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar prontuários" 
ON public.prontuarios 
FOR UPDATE 
USING (true);

CREATE POLICY "Usuários autenticados podem deletar prontuários" 
ON public.prontuarios 
FOR DELETE 
USING (true);

-- Criar tabela para despesas/contas a pagar
CREATE TABLE public.despesas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  descricao VARCHAR(255) NOT NULL,
  valor NUMERIC(10,2) NOT NULL,
  categoria VARCHAR(100), -- 'aluguel', 'produtos', 'equipamentos', 'salarios', etc.
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  status VARCHAR(20) NOT NULL DEFAULT 'pendente', -- 'pendente', 'pago', 'vencido'
  metodo_pagamento VARCHAR(50), -- 'dinheiro', 'cartao', 'pix', 'transferencia'
  observacoes TEXT,
  recorrente BOOLEAN DEFAULT false,
  frequencia_recorrencia VARCHAR(20), -- 'mensal', 'anual', etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.despesas ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para despesas
CREATE POLICY "Usuários autenticados podem ver despesas" 
ON public.despesas 
FOR SELECT 
USING (true);

CREATE POLICY "Usuários autenticados podem inserir despesas" 
ON public.despesas 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar despesas" 
ON public.despesas 
FOR UPDATE 
USING (true);

CREATE POLICY "Usuários autenticados podem deletar despesas" 
ON public.despesas 
FOR DELETE 
USING (true);

-- Adicionar campo de porcentagem de comissão na tabela profissionais
ALTER TABLE public.profissionais 
ADD COLUMN comissao_porcentagem NUMERIC(5,2) DEFAULT 0.00;

-- Criar função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_prontuarios()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_updated_at_despesas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar timestamps automaticamente
CREATE TRIGGER update_prontuarios_updated_at
  BEFORE UPDATE ON public.prontuarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_prontuarios();

CREATE TRIGGER update_despesas_updated_at
  BEFORE UPDATE ON public.despesas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_despesas();

-- Criar índices para melhor performance
CREATE INDEX idx_prontuarios_cliente_id ON public.prontuarios(cliente_id);
CREATE INDEX idx_prontuarios_agendamento_id ON public.prontuarios(agendamento_id);
CREATE INDEX idx_prontuarios_profissional_id ON public.prontuarios(profissional_id);
CREATE INDEX idx_despesas_data_vencimento ON public.despesas(data_vencimento);
CREATE INDEX idx_despesas_status ON public.despesas(status);
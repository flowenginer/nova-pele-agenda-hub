-- Criar tabela de prontuários
CREATE TABLE public.prontuarios (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id UUID NOT NULL,
    agendamento_id BIGINT,
    anotacoes TEXT,
    fotos TEXT[],
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de prontuários
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

-- Criar tabela de despesas
CREATE TABLE public.despesas (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    descricao VARCHAR NOT NULL,
    valor NUMERIC NOT NULL,
    data_vencimento DATE NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pendente',
    categoria VARCHAR,
    metodo_pagamento VARCHAR,
    observacoes TEXT,
    recorrente BOOLEAN DEFAULT false,
    frequencia_recorrencia VARCHAR,
    data_pagamento DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela de despesas
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

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_prontuarios()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_prontuarios_updated_at
    BEFORE UPDATE ON public.prontuarios
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_prontuarios();

CREATE OR REPLACE FUNCTION public.update_updated_at_despesas()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_despesas_updated_at
    BEFORE UPDATE ON public.despesas
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_despesas();
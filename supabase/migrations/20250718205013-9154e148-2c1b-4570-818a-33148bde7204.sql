-- Criar tabela de estoque
CREATE TABLE public.estoque (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_produto TEXT NOT NULL,
  categoria TEXT,
  quantidade_atual INTEGER NOT NULL DEFAULT 0,
  quantidade_minima INTEGER NOT NULL DEFAULT 0,
  valor_unitario NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  fornecedor TEXT,
  data_compra DATE,
  data_validade DATE,
  observacoes TEXT,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo', 'esgotado')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.estoque ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS para estoque
CREATE POLICY "Usuários autenticados podem ver estoque"
ON public.estoque
FOR SELECT
USING (true);

CREATE POLICY "Usuários autenticados podem inserir estoque"
ON public.estoque
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar estoque"
ON public.estoque
FOR UPDATE
USING (true);

CREATE POLICY "Usuários autenticados podem deletar estoque"
ON public.estoque
FOR DELETE
USING (true);

-- Criar trigger para atualizar updated_at
CREATE TRIGGER update_estoque_updated_at
  BEFORE UPDATE ON public.estoque
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Adicionar campos faltantes na tabela configuracoes_sistema
ALTER TABLE public.configuracoes_sistema 
ADD COLUMN IF NOT EXISTS telefone_contato text,
ADD COLUMN IF NOT EXISTS whatsapp_contato text,
ADD COLUMN IF NOT EXISTS endereco_contato text;

-- Permitir INSERT na tabela configuracoes_sistema para o caso de não existir configuração
CREATE POLICY "Usuários autenticados podem inserir configurações"
ON public.configuracoes_sistema
FOR INSERT
WITH CHECK (true);

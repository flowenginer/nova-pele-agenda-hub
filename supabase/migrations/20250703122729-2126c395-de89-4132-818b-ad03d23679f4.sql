
-- Criar tabela de iniciou contato
CREATE TABLE public.iniciou_contato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  telefone TEXT NOT NULL,
  whatsapp TEXT,
  email TEXT,
  mensagem TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'convertido')),
  data_contato TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS na nova tabela
ALTER TABLE public.iniciou_contato ENABLE ROW LEVEL SECURITY;

-- Políticas para iniciou_contato
CREATE POLICY "Usuários autenticados podem ver iniciou_contato" 
ON public.iniciou_contato FOR SELECT 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem inserir iniciou_contato" 
ON public.iniciou_contato FOR INSERT 
TO authenticated WITH CHECK (true);

CREATE POLICY "Usuários autenticados podem atualizar iniciou_contato" 
ON public.iniciou_contato FOR UPDATE 
TO authenticated USING (true);

CREATE POLICY "Usuários autenticados podem deletar iniciou_contato" 
ON public.iniciou_contato FOR DELETE 
TO authenticated USING (true);

-- Políticas para acesso via API externa (para WhatsApp)
CREATE POLICY "API pode inserir contatos" 
ON public.iniciou_contato FOR INSERT 
TO anon WITH CHECK (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_iniciou_contato_updated_at
  BEFORE UPDATE ON public.iniciou_contato
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Ajustar políticas do storage para profile-photos
CREATE POLICY "Usuários autenticados podem fazer upload de fotos" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'profile-photos');

CREATE POLICY "Usuários autenticados podem ver fotos" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Usuários autenticados podem atualizar fotos" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'profile-photos');

CREATE POLICY "Usuários autenticados podem deletar fotos" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'profile-photos');

-- Política para acesso público às fotos (para visualização)
CREATE POLICY "Acesso público para ver fotos" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'profile-photos');

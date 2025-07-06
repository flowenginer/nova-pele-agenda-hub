
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Copy, ExternalLink, Share2, QrCode } from 'lucide-react';

export const PublicLinks = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [copied, setCopied] = useState('');

  // Gerar URLs com o user ID - usando o domínio atual
  const baseUrl = window.location.origin;
  const agendamentoUrl = `${baseUrl}/agendamento.html?user=${user?.id}`;
  const consultarUrl = `${baseUrl}/consultar.html?user=${user?.id}`;
  const landingUrl = `${baseUrl}/index.html?user=${user?.id}`;

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para a área de transferência.",
      });
      setTimeout(() => setCopied(''), 2000);
    } catch (err) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const openInNewTab = (url: string) => {
    window.open(url, '_blank');
  };

  const shareLink = async (url: string, title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url,
        });
      } catch (err) {
        copyToClipboard(url, 'share');
      }
    } else {
      copyToClipboard(url, 'share');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
          Links Públicos de Agendamento
        </h2>
        <p className="text-gray-600 mt-1">
          Compartilhe estes links com seus clientes para que eles possam agendar online
        </p>
      </div>

      <div className="space-y-4">
        {/* Link da Página Principal */}
        <Card className="nova-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 rounded-lg flex items-center justify-center mr-3">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              Página Principal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Link principal com opções para agendar e consultar agendamentos
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={landingUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(landingUrl, 'landing')}
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied === 'landing' ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInNewTab(landingUrl)}
                className="flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareLink(landingUrl, 'Nova Pele Estética - Agendamento Online')}
                className="flex-shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link Direto para Agendamento */}
        <Card className="nova-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-3">
                <QrCode className="w-5 h-5 text-white" />
              </div>
              Link Direto - Agendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Link direto para o formulário de agendamento
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={agendamentoUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(agendamentoUrl, 'agendamento')}
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied === 'agendamento' ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInNewTab(agendamentoUrl)}
                className="flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareLink(agendamentoUrl, 'Agende seu horário - Nova Pele Estética')}
                className="flex-shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Link para Consultar */}
        <Card className="nova-card">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mr-3">
                <Share2 className="w-5 h-5 text-white" />
              </div>
              Link Direto - Consultar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Link direto para consultar agendamentos existentes
            </p>
            <div className="flex items-center space-x-2">
              <Input
                value={consultarUrl}
                readOnly
                className="flex-1 font-mono text-sm"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(consultarUrl, 'consultar')}
                className="flex-shrink-0"
              >
                <Copy className="w-4 h-4 mr-1" />
                {copied === 'consultar' ? 'Copiado!' : 'Copiar'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openInNewTab(consultarUrl)}
                className="flex-shrink-0"
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => shareLink(consultarUrl, 'Consulte seus agendamentos - Nova Pele Estética')}
                className="flex-shrink-0"
              >
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="nova-card bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <ExternalLink className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Como usar os links</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Compartilhe estes links com seus clientes via WhatsApp, email ou redes sociais</li>
                <li>• Todos os agendamentos feitos através destes links ficarão vinculados à sua conta</li>
                <li>• Os clientes poderão agendar e consultar seus agendamentos de forma independente</li>
                <li>• Você receberá notificações de novos agendamentos no seu painel</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

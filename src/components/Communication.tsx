
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Client, CommunicationTemplate } from '../types/crm';
import { Bell, Plus, Phone, Mail, Edit } from 'lucide-react';

interface CommunicationProps {
  clients: Client[];
}

const defaultTemplates: CommunicationTemplate[] = [
  {
    id: '1',
    name: 'Confirmação de Agendamento',
    message: 'Olá {nome}, tudo bem? Confirmamos seu agendamento para {servico} no dia {data} às {hora}. Aguardamos você na Nova Pele Estética! 💄✨',
    type: 'confirmation'
  },
  {
    id: '2',
    name: 'Lembrete de Agendamento',
    message: 'Oi {nome}! Lembrando que você tem um agendamento para {servico} amanhã às {hora}. Nos vemos lá! 😊',
    type: 'reminder'
  },
  {
    id: '3',
    name: 'Feliz Aniversário',
    message: 'Parabéns, {nome}! 🎉 Que seu novo ano seja repleto de beleza e autoestima! A Nova Pele Estética deseja muito sucesso e felicidade! 🎂✨',
    type: 'birthday'
  },
  {
    id: '4',
    name: 'Promoção Especial',
    message: 'Oi {nome}! Temos uma promoção especial só para você: 20% de desconto em tratamentos faciais! Válido até o final do mês. Agende já! 🌟',
    type: 'promotion'
  }
];

export const Communication = ({ clients }: CommunicationProps) => {
  const [templates, setTemplates] = useState<CommunicationTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<CommunicationTemplate | null>(null);
  const [customMessage, setCustomMessage] = useState('');
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    message: '',
    type: 'custom' as CommunicationTemplate['type']
  });

  const handleSendMessage = (client: Client, message: string) => {
    if (client.whatsapp) {
      const personalizedMessage = message
        .replace('{nome}', client.name)
        .replace('{servico}', 'seu serviço')
        .replace('{data}', new Date().toLocaleDateString('pt-BR'))
        .replace('{hora}', '14:00');
      
      const whatsappUrl = `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(personalizedMessage)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleBulkSend = () => {
    const message = selectedTemplate ? selectedTemplate.message : customMessage;
    selectedClients.forEach(clientId => {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        handleSendMessage(client, message);
      }
    });
    setSelectedClients([]);
    setCustomMessage('');
    setSelectedTemplate(null);
  };

  const handleAddTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    const template: CommunicationTemplate = {
      id: Date.now().toString(),
      ...newTemplate
    };
    setTemplates([...templates, template]);
    setNewTemplate({ name: '', message: '', type: 'custom' });
    setShowNewTemplate(false);
  };

  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev =>
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  const typeColors = {
    confirmation: 'bg-blue-100 text-blue-800',
    reminder: 'bg-yellow-100 text-yellow-800',
    birthday: 'bg-purple-100 text-purple-800',
    promotion: 'bg-green-100 text-green-800',
    custom: 'bg-gray-100 text-gray-800'
  };

  const typeLabels = {
    confirmation: 'Confirmação',
    reminder: 'Lembrete',
    birthday: 'Aniversário',
    promotion: 'Promoção',
    custom: 'Personalizado'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Comunicação
          </h2>
          <p className="text-gray-600 mt-1">WhatsApp e mensagens para clientes</p>
        </div>
        <Button 
          className="nova-button"
          onClick={() => setShowNewTemplate(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {/* Formulário de Novo Template */}
      {showNewTemplate && (
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Criar Novo Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddTemplate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Nome do Template *</label>
                <Input
                  required
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Promoção de Natal"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Mensagem *</label>
                <Textarea
                  required
                  value={newTemplate.message}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Use {nome}, {servico}, {data}, {hora} para personalizar"
                  rows={4}
                />
                <p className="text-xs text-gray-500">
                  Use {"{nome}"}, {"{servico}"}, {"{data}"}, {"{hora}"} para personalizar automaticamente
                </p>
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit" className="nova-button">
                  Salvar Template
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewTemplate(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Templates de Mensagem */}
        <Card className="nova-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Bell className="w-5 h-5 mr-2" />
              Templates de Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {templates.map(template => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedTemplate?.id === template.id ? 'border-nova-pink-300 bg-nova-pink-50' : 'border-gray-200'
                }`}
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-800">{template.name}</h4>
                  <Badge className={`${typeColors[template.type]} text-xs`}>
                    {typeLabels[template.type]}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{template.message}</p>
              </div>
            ))}
            
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Ou escreva uma mensagem personalizada:
              </label>
              <Textarea
                value={customMessage}
                onChange={(e) => {
                  setCustomMessage(e.target.value);
                  setSelectedTemplate(null);
                }}
                placeholder="Digite sua mensagem personalizada..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Lista de Clientes */}
        <Card className="nova-card">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center justify-between">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                Selecionar Clientes
              </div>
              {selectedClients.length > 0 && (
                <Badge variant="secondary">
                  {selectedClients.length} selecionado(s)
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="max-h-80 overflow-y-auto space-y-2">
              {clients.map(client => (
                <div
                  key={client.id}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                    selectedClients.includes(client.id) ? 'border-nova-pink-300 bg-nova-pink-50' : 'border-gray-200'
                  }`}
                  onClick={() => toggleClientSelection(client.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedClients.includes(client.id)}
                      onChange={() => toggleClientSelection(client.id)}
                      className="text-nova-pink-500"
                    />
                    <div>
                      <p className="font-medium text-gray-800">{client.name}</p>
                      <p className="text-sm text-gray-600">{client.phone}</p>
                    </div>
                  </div>
                  
                  {client.whatsapp && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-200 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        const message = selectedTemplate ? selectedTemplate.message : customMessage;
                        if (message) handleSendMessage(client, message);
                      }}
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            
            {(selectedTemplate || customMessage) && selectedClients.length > 0 && (
              <div className="border-t pt-4">
                <Button 
                  className="w-full nova-button"
                  onClick={handleBulkSend}
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Enviar para {selectedClients.length} cliente(s)
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

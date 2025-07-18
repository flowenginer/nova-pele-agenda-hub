
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Client } from '../types/crm';
import { MedicalRecords } from './MedicalRecords';
import { Users, Search, Phone, Mail, Plus, User, FileText } from 'lucide-react';

interface ClientsManagementProps {
  clients: Client[];
  onAddClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const ClientsManagement = ({ clients, onAddClient }: ClientsManagementProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedClientForRecords, setSelectedClientForRecords] = useState<Client | null>(null);
  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    status: 'lead' as Client['status'],
    notes: ''
  });

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.phone.includes(searchTerm) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWhatsAppClick = (whatsapp: string, name: string) => {
    const message = `Olá ${name}, tudo bem? Entro em contato da Nova Pele Estética!`;
    const whatsappUrl = `https://wa.me/${whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    onAddClient(newClient);
    setNewClient({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      status: 'lead',
      notes: ''
    });
    setShowAddForm(false);
  };

  const statusColors = {
    lead: 'bg-yellow-100 text-yellow-800',
    cliente: 'bg-green-100 text-green-800',
    inativo: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    lead: 'Lead',
    cliente: 'Cliente',
    inativo: 'Inativo'
  };

  // Se um cliente foi selecionado para prontuário, mostrar componente de prontuário
  if (selectedClientForRecords) {
    // Mapear campos do Client para o formato esperado pelo MedicalRecords
    const mappedClient = {
      id: selectedClientForRecords.id,
      nome: selectedClientForRecords.name,
      telefone: selectedClientForRecords.phone,
      email: selectedClientForRecords.email
    };
    
    return (
      <MedicalRecords 
        selectedClient={mappedClient}
        onClose={() => setSelectedClientForRecords(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Clientes
          </h2>
          <p className="text-gray-600 mt-1">Gestão completa de clientes e leads</p>
        </div>
        <Button 
          className="nova-button"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      {/* Formulário de Adição */}
      {showAddForm && (
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Adicionar Novo Cliente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddClient} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome *</label>
                  <Input
                    required
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome completo"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Telefone *</label>
                  <Input
                    required
                    value={newClient.phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">WhatsApp</label>
                  <Input
                    value={newClient.whatsapp}
                    onChange={(e) => setNewClient(prev => ({ ...prev, whatsapp: e.target.value }))}
                    placeholder="5511999999999"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">E-mail</label>
                  <Input
                    type="email"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="cliente@email.com"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Observações</label>
                <Input
                  value={newClient.notes}
                  onChange={(e) => setNewClient(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Observações sobre o cliente..."
                />
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit" className="nova-button">
                  Salvar Cliente
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Busca */}
      <Card className="nova-card">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar clientes por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map(client => (
          <Card key={client.id} className="nova-card hover:shadow-lg transition-shadow animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {client.name}
                    </CardTitle>
                  </div>
                </div>
                <Badge className={`${statusColors[client.status]} text-xs`}>
                  {statusLabels[client.status]}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{client.phone}</span>
                </div>
                
                {client.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
                
                {client.notes && (
                  <div className="text-gray-600 text-xs bg-gray-50 p-2 rounded">
                    {client.notes}
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                {client.whatsapp && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 text-green-600 border-green-200 hover:bg-green-50"
                    onClick={() => handleWhatsAppClick(client.whatsapp!, client.name)}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    WhatsApp
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 text-nova-pink-600 border-nova-pink-200 hover:bg-nova-pink-50"
                  onClick={() => setSelectedClientForRecords(client)}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Prontuário
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredClients.length === 0 && (
        <Card className="nova-card">
          <CardContent className="text-center py-12">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-gray-500">
              {searchTerm 
                ? 'Tente ajustar os termos de busca' 
                : 'Adicione seu primeiro cliente para começar'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

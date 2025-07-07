import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSupabaseCRM } from '@/hooks/useSupabaseCRM';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, Phone, Mail, Search, Loader2, RefreshCw, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export const AppointmentConsult = () => {
  const [searchPhone, setSearchPhone] = useState('');
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  
  const { appointments, services, professionals, updateAppointmentStatus } = useSupabaseCRM();
  const { toast } = useToast();

  // Formatação do telefone
  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      if (numbers.length > 2) {
        const formatted = `(${numbers.substring(0, 2)}) ${numbers.substring(2)}`;
        if (numbers.length > 7) {
          return `${formatted.substring(0, 10)}-${numbers.substring(7)}`;
        }
        return formatted;
      }
    }
    return numbers.substring(0, 11);
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setSearchPhone(formatted);
  };

  const handleSearch = () => {
    if (!searchPhone.replace(/\D/g, '') && !searchEmail.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, informe um telefone ou email para buscar.",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    setTimeout(() => {
      const phoneNumbers = searchPhone.replace(/\D/g, '');
      const emailQuery = searchEmail.trim().toLowerCase();
      
      let filteredAppointments = appointments.filter(appointment => {
        const phoneMatch = phoneNumbers && appointment.cliente_telefone.replace(/\D/g, '') === phoneNumbers;
        const emailMatch = emailQuery && appointment.email && appointment.email.toLowerCase().includes(emailQuery);
        return phoneMatch || emailMatch;
      });

      // Mapear os dados para incluir informações dos serviços e profissionais
      const enrichedResults = filteredAppointments.map(appointment => {
        const service = services.find(s => s.id === appointment.servico_id);
        const professional = professionals.find(p => p.id === appointment.profissional_id);
        
        return {
          ...appointment,
          service_name: service?.nome || 'Serviço não encontrado',
          service_price: service?.preco || 0,
          service_duration: service?.duracao_minutos || 60,
          professional_name: professional?.nome || 'Profissional não definido'
        };
      });

      setSearchResults(enrichedResults.sort((a, b) => 
        new Date(b.data_agendamento + 'T' + b.hora_agendamento).getTime() - 
        new Date(a.data_agendamento + 'T' + a.hora_agendamento).getTime()
      ));
      
      setIsSearching(false);
      setHasSearched(true);
    }, 1000);
  };

  const resetSearch = () => {
    setSearchPhone('');
    setSearchEmail('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'confirmado': { label: 'Confirmado', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      'agendado': { label: 'Agendado', variant: 'secondary' as const, className: 'bg-blue-100 text-blue-800' },
      'em_atendimento': { label: 'Em Atendimento', variant: 'default' as const, className: 'bg-yellow-100 text-yellow-800' },
      'concluido': { label: 'Concluído', variant: 'default' as const, className: 'bg-purple-100 text-purple-800' },
      'cancelado': { label: 'Cancelado', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      'nao_compareceu': { label: 'Não Compareceu', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['agendado'];
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'short', 
      day: '2-digit', 
      month: 'short',
      year: 'numeric'
    });
  };

  const handleCancel = async (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const confirmCancel = async () => {
    if (selectedAppointment) {
      try {
        await updateAppointmentStatus(selectedAppointment.id, 'cancelado');
        
        // Atualizar os resultados localmente
        setSearchResults(prev => 
          prev.map((apt: any) => 
            apt.id === selectedAppointment.id 
              ? { ...apt, status: 'cancelado' }
              : apt
          )
        );

        toast({
          title: "Agendamento cancelado",
          description: "O agendamento foi cancelado com sucesso.",
        });
        
        setShowCancelModal(false);
        setSelectedAppointment(null);
      } catch (error) {
        toast({
          title: "Erro ao cancelar",
          description: "Não foi possível cancelar o agendamento. Tente novamente.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
          Consultar Agendamentos
        </h2>
        <p className="text-gray-600 mt-1">Busque seus agendamentos por telefone ou email</p>
      </div>

      {/* Formulário de Busca */}
      <Card className="nova-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
            <Search className="w-5 h-5 mr-2 text-nova-pink-500" />
            Buscar Agendamentos
          </CardTitle>
          <p className="text-sm text-gray-600">
            Informe seu telefone (WhatsApp) ou email para encontrar seus agendamentos
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="search-phone" className="text-sm font-medium text-gray-700 flex items-center">
                <Phone className="w-4 h-4 mr-1" />
                Telefone (WhatsApp)
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search-phone"
                  type="tel"
                  placeholder="(99) 99999-9999"
                  value={searchPhone}
                  onChange={handlePhoneChange}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Digite o mesmo número usado no agendamento</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="search-email" className="text-sm font-medium text-gray-700 flex items-center">
                <Mail className="w-4 h-4 mr-1" />
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search-email"
                  type="email"
                  placeholder="seu@email.com"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
              <p className="text-xs text-gray-500">Digite o email usado no agendamento</p>
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800 flex items-start">
              <Search className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>
                <strong>Como buscar:</strong> Você pode usar apenas o telefone, apenas o email, ou ambos para encontrar seus agendamentos.
              </span>
            </p>
          </div>
          
          <div className="flex space-x-3">
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="flex-1 bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 hover:from-nova-pink-600 hover:to-nova-purple-600"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Buscar Agendamentos
                </>
              )}
            </Button>
            
            {hasSearched && (
              <Button 
                onClick={resetSearch}
                variant="outline"
                className="px-6"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Nova Busca
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultados da Busca */}
      {hasSearched && (
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Resultados da Busca
            </CardTitle>
            <p className="text-sm text-gray-600">
              {searchResults.length} agendamento(s) encontrado(s)
            </p>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Não encontramos agendamentos com as informações fornecidas. Verifique se:
                </p>
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p>• O telefone está correto (mesmo usado no agendamento)</p>
                  <p>• O email está correto (mesmo usado no agendamento)</p>
                  <p>• Você possui agendamentos cadastrados</p>
                </div>
                <Button 
                  onClick={resetSearch}
                  variant="outline"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {searchResults.map((appointment: any) => (
                  <div
                    key={appointment.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-nova-pink-300 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-lg text-gray-800">
                            {appointment.service_name}
                          </h4>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            <span>Profissional: {appointment.professional_name}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Data: {formatDate(appointment.data_agendamento)}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Horário: {appointment.hora_agendamento}</span>
                          </div>
                          {appointment.email && (
                            <div className="flex items-center">
                              <Mail className="w-4 h-4 mr-2" />
                              <span>E-mail: {appointment.email}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {appointment.status !== 'cancelado' && appointment.status !== 'concluido' && (
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleCancel(appointment)}
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Cancelar
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Modal de Confirmação de Cancelamento */}
      {showCancelModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Cancelar Agendamento
              </h3>
              <p className="text-gray-600">
                Você deseja realmente cancelar este agendamento?
              </p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Serviço:</span>
                <span className="font-medium">{selectedAppointment.service_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Data:</span>
                <span className="font-medium">{formatDate(selectedAppointment.data_agendamento)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Horário:</span>
                <span className="font-medium">{selectedAppointment.hora_agendamento}</span>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <Button
                onClick={() => setShowCancelModal(false)}
                variant="outline"
                className="flex-1"
              >
                Não
              </Button>
              <Button
                onClick={confirmCancel}
                variant="destructive"
                className="flex-1"
              >
                Sim, cancelar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

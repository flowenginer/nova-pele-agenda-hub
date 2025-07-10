
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';  
import { AddLeadDialog } from './AddLeadDialog';
import { Appointment } from '../types/crm';
import { Calendar, User, Clock, Phone, Mail, MapPin, Calendar as CalendarIcon } from 'lucide-react';

interface AppointmentsKanbanProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: string, status: Appointment['status']) => void;
  onWhatsAppClick: (phone: string) => void;
}

const statusColumns = [
  { id: 'inicio_contato', title: 'Início Contato', color: 'bg-orange-50 border-orange-200' },
  { id: 'agendado', title: 'Agendado', color: 'bg-blue-50 border-blue-200' },
  { id: 'confirmado', title: 'Confirmado', color: 'bg-green-50 border-green-200' },
  { id: 'concluido', title: 'Concluído', color: 'bg-purple-50 border-purple-200' }
];

const statusColors = {
  inicio_contato: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  agendado: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  confirmado: 'bg-green-100 text-green-800 hover:bg-green-200',
  em_atendimento: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  concluido: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  cancelado: 'bg-red-100 text-red-800 hover:bg-red-200',
  nao_compareceu: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

export const AppointmentsKanban = ({ appointments, onStatusChange, onWhatsAppClick }: AppointmentsKanbanProps) => {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const getAppointmentsByStatus = (status: string) => {
    return appointments.filter(appointment => appointment.status === status);
  };

  const handleWhatsAppClick = (appointment: Appointment) => {
    if (appointment.client?.whatsapp) {
      const message = `Olá ${appointment.client.name}, tudo bem? Entro em contato sobre seu agendamento para ${appointment.service?.name} no dia ${new Date(appointment.date).toLocaleDateString('pt-BR')} às ${appointment.time}.`;
      const whatsappUrl = `https://wa.me/${appointment.client.whatsapp}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleDragStart = (e: React.DragEvent, appointmentId: string) => {
    setDraggedItem(appointmentId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    if (draggedItem && draggedItem !== newStatus) {
      onStatusChange(draggedItem, newStatus as Appointment['status']);
    }
    setDraggedItem(null);
  };

  return (
    <div className="flex flex-col h-screen p-2 sm:p-4">
      <div className="flex items-center justify-between flex-shrink-0 mb-4 sm:mb-6">
        <div>
          <h2 className="text-xl sm:text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Agendamentos
          </h2>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Gestão visual dos agendamentos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 flex-1 overflow-hidden">
        {statusColumns.map(column => {
          const columnAppointments = getAppointmentsByStatus(column.id);
          return (
            <div 
              key={column.id} 
              className={`rounded-lg border-2 ${column.color} flex flex-col overflow-hidden min-h-0`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between p-2 sm:p-4 flex-shrink-0 border-b border-current border-opacity-20">
                <h3 className="font-semibold text-gray-800 text-sm sm:text-base">{column.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {columnAppointments.length}
                  </Badge>
                  <AddLeadDialog status={column.id} statusTitle={column.title} />
                </div>
              </div>
              
              <div className="flex-1 overflow-hidden min-h-0">
                <ScrollArea className="h-full">
                  <div className="p-2 sm:p-4 space-y-2 sm:space-y-3">
                    {columnAppointments.map(appointment => (
                      <Dialog key={appointment.id}>
                        <DialogTrigger asChild>
                          <Card 
                            className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                            draggable
                            onDragStart={(e) => handleDragStart(e, appointment.id)}
                            onDragEnd={handleDragEnd}
                          >
                            <CardContent className="p-3 sm:p-4">
                              <div className="space-y-2 sm:space-y-3">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-gray-800 truncate text-sm sm:text-lg">
                                      {appointment.client?.name || 'Cliente não identificado'}
                                    </h4>
                                    <Badge 
                                      className={`text-xs cursor-pointer transition-colors mt-1 ${statusColors[appointment.status]}`}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const nextStatus = getNextStatus(appointment.status);
                                        if (nextStatus) onStatusChange(appointment.id, nextStatus);
                                      }}
                                    >
                                      {column.title}
                                    </Badge>
                                  </div>
                                </div>
                                
                                <div className="space-y-1 sm:space-y-2 text-xs sm:text-sm text-gray-600">
                                  <div className="flex items-center space-x-2">
                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{new Date(appointment.date).toLocaleDateString('pt-BR')} - {appointment.time}</span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <Clock className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{appointment.service?.name}</span>
                                  </div>

                                  <div className="flex items-center space-x-2">
                                    <User className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                                    <span className="truncate">{appointment.professional?.name || 'Profissional não definido'}</span>
                                  </div>
                                </div>

                                {appointment.client?.whatsapp && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full text-green-600 border-green-200 hover:bg-green-50 text-xs sm:text-sm h-6 sm:h-8"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleWhatsAppClick(appointment);
                                    }}
                                  >
                                    <Phone className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                                    WhatsApp
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </DialogTrigger>
                        
                        <DialogContent className="max-w-md mx-2 sm:mx-auto">
                          <DialogHeader>
                            <DialogTitle className="text-sm sm:text-base">Informações do Cliente</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-3 sm:space-y-4">
                            <div className="flex items-center space-x-3">
                              <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">{appointment.client?.name}</p>
                                <p className="text-xs sm:text-sm text-gray-500">Cliente</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Phone className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                              <div className="min-w-0">
                                <p className="font-medium text-sm sm:text-base truncate">{appointment.client?.phone}</p>
                                <p className="text-xs sm:text-sm text-gray-500">Telefone</p>
                              </div>
                            </div>

                            {appointment.client?.email && (
                              <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{appointment.client.email}</p>
                                  <p className="text-xs sm:text-sm text-gray-500">E-mail</p>
                                </div>
                              </div>
                            )}

                            {appointment.client?.address && (
                              <div className="flex items-center space-x-3">
                                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{appointment.client.address}</p>
                                  <p className="text-xs sm:text-sm text-gray-500">Endereço</p>
                                </div>
                              </div>
                            )}

                            {appointment.client?.birthDate && (
                              <div className="flex items-center space-x-3">
                                <CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 flex-shrink-0" />
                                <div className="min-w-0">
                                  <p className="font-medium text-sm sm:text-base truncate">{new Date(appointment.client.birthDate).toLocaleDateString('pt-BR')}</p>
                                  <p className="text-xs sm:text-sm text-gray-500">Data de Nascimento</p>
                                </div>
                              </div>
                            )}

                            <div className="pt-2 border-t">
                              <h4 className="font-medium mb-2 text-sm sm:text-base">Agendamento</h4>
                              <div className="space-y-1">
                                <p className="text-xs sm:text-sm text-gray-600">
                                  <strong>Serviço:</strong> {appointment.service?.name}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  <strong>Profissional:</strong> {appointment.professional?.name}
                                </p>
                                <p className="text-xs sm:text-sm text-gray-600">
                                  <strong>Data:</strong> {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                                </p>
                                {appointment.value && (
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    <strong>Valor:</strong> R$ {appointment.value.toFixed(2)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ))}
                    
                    {columnAppointments.length === 0 && (
                      <div className="text-center py-4 sm:py-8 text-gray-400">
                        <Calendar className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs sm:text-sm">Nenhum agendamento</p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const getNextStatus = (currentStatus: Appointment['status']): Appointment['status'] | null => {
  const statusFlow = {
    inicio_contato: 'agendado',
    agendado: 'confirmado',
    confirmado: 'concluido',
    concluido: null,
    cancelado: null,
    nao_compareceu: null
  };
  
  return statusFlow[currentStatus] as Appointment['status'] | null;
};

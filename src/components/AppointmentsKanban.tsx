
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Appointment } from '../types/crm';
import { Calendar, User, Clock, Phone } from 'lucide-react';

interface AppointmentsKanbanProps {
  appointments: Appointment[];
  onStatusChange: (appointmentId: string, status: Appointment['status']) => void;
  onWhatsAppClick: (phone: string) => void;
}

const statusColumns = [
  { id: 'agendado', title: 'Agendado', color: 'bg-blue-50 border-blue-200' },
  { id: 'confirmado', title: 'Confirmado', color: 'bg-green-50 border-green-200' },
  { id: 'em_atendimento', title: 'Em Atendimento', color: 'bg-yellow-50 border-yellow-200' },
  { id: 'concluido', title: 'Concluído', color: 'bg-purple-50 border-purple-200' }
];

const statusColors = {
  agendado: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  confirmado: 'bg-green-100 text-green-800 hover:bg-green-200',
  em_atendimento: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
  concluido: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  cancelado: 'bg-red-100 text-red-800 hover:bg-red-200',
  nao_compareceu: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
};

export const AppointmentsKanban = ({ appointments, onStatusChange, onWhatsAppClick }: AppointmentsKanbanProps) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Agendamentos
          </h2>
          <p className="text-gray-600 mt-1">Gestão visual dos agendamentos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statusColumns.map(column => {
          const columnAppointments = getAppointmentsByStatus(column.id);
          return (
            <div key={column.id} className={`rounded-lg border-2 ${column.color} p-4`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
                <Badge variant="secondary" className="text-xs">
                  {columnAppointments.length}
                </Badge>
              </div>
              
              <div className="space-y-3">
                {columnAppointments.map(appointment => (
                  <Card key={appointment.id} className="bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-800 truncate">
                            {appointment.client?.name || 'Cliente não encontrado'}
                          </h4>
                          <Badge 
                            className={`text-xs cursor-pointer transition-colors ${statusColors[appointment.status]}`}
                            onClick={() => {
                              const nextStatus = getNextStatus(appointment.status);
                              if (nextStatus) onStatusChange(appointment.id, nextStatus);
                            }}
                          >
                            {column.title}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span className="truncate">{appointment.professional?.name}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(appointment.date).toLocaleDateString('pt-BR')}</span>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4" />
                            <span>{appointment.time} - {appointment.service?.name}</span>
                          </div>
                        </div>

                        {appointment.value && (
                          <div className="text-sm font-semibold text-nova-pink-600">
                            R$ {appointment.value.toLocaleString('pt-BR')}
                          </div>
                        )}

                        {appointment.client?.whatsapp && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleWhatsAppClick(appointment)}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            WhatsApp
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {columnAppointments.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum agendamento</p>
                  </div>
                )}
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
    agendado: 'confirmado',
    confirmado: 'em_atendimento',
    em_atendimento: 'concluido',
    concluido: null,
    cancelado: null,
    nao_compareceu: null
  };
  
  return statusFlow[currentStatus] as Appointment['status'] | null;
};

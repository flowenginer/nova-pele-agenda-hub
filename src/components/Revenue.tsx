
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DashboardMetrics } from '../types/crm';
import type { DatabaseAppointment, DatabaseService } from '../types/supabase';
import { TrendingUp, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';

interface RevenueProps {
  appointments: DatabaseAppointment[];
  services: DatabaseService[];
  metrics: DashboardMetrics;
}

export const Revenue = ({ appointments, services, metrics }: RevenueProps) => {
  // Calcular receita realizada (agendamentos concluídos)
  const completedAppointments = appointments.filter(apt => apt.status === 'concluido');
  const realizedRevenue = completedAppointments.reduce((sum, apt) => {
    const servicePrice = services.find(s => s.id === apt.servico_id)?.preco || apt.valor || 0;
    return sum + servicePrice;
  }, 0);

  // Calcular receita potencial (agendamentos agendados/confirmados)
  const scheduledAppointments = appointments.filter(apt => 
    apt.status === 'agendado' || apt.status === 'confirmado'
  );
  const potentialRevenue = scheduledAppointments.reduce((sum, apt) => {
    const servicePrice = services.find(s => s.id === apt.servico_id)?.preco || apt.valor || 0;
    return sum + servicePrice;
  }, 0);

  // Receita total
  const totalRevenue = realizedRevenue + potentialRevenue;

  // Receita por serviço (concluídos)
  const revenueByService = completedAppointments.reduce((acc, apt) => {
    const service = services.find(s => s.id === apt.servico_id);
    const serviceName = service?.nome || 'Serviço não encontrado';
    const servicePrice = service?.preco || apt.valor || 0;
    
    if (!acc[serviceName]) {
      acc[serviceName] = { count: 0, revenue: 0 };
    }
    acc[serviceName].count += 1;
    acc[serviceName].revenue += servicePrice;
    return acc;
  }, {} as Record<string, { count: number; revenue: number }>);

  // Receita por mês
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyRevenue = completedAppointments
    .filter(apt => {
      const aptDate = new Date(apt.data_agendamento);
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear;
    })
    .reduce((sum, apt) => {
      const servicePrice = services.find(s => s.id === apt.servico_id)?.preco || apt.valor || 0;
      return sum + servicePrice;
    }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Receita
          </h2>
          <p className="text-gray-600 mt-1">Balancete financeiro da clínica</p>
        </div>
      </div>

      {/* Cards de Receita */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="nova-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Realizada
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {realizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {completedAppointments.length} serviços concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="nova-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Potencial
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              R$ {potentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {scheduledAppointments.length} agendamentos ativos
            </p>
          </CardContent>
        </Card>

        <Card className="nova-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-nova-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nova-purple-600">
              R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Realizada + Potencial
            </p>
          </CardContent>
        </Card>

        <Card className="nova-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita do Mês
            </CardTitle>
            <Calendar className="h-4 w-4 text-nova-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nova-pink-600">
              R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamentos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Receita por Serviço
            </CardTitle>
            <CardDescription>
              Serviços concluídos e suas receitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(revenueByService)
                .sort(([,a], [,b]) => b.revenue - a.revenue)
                .map(([service, data]) => (
                <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{service}</p>
                    <p className="text-sm text-gray-500">{data.count} serviços</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      R$ {data.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                    <p className="text-xs text-gray-500">
                      R$ {(data.revenue / data.count).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} / serviço
                    </p>
                  </div>
                </div>
              ))}
              
              {Object.keys(revenueByService).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>Nenhum serviço concluído ainda</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Status dos Agendamentos
            </CardTitle>
            <CardDescription>
              Situação financeira dos agendamentos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-green-100 text-green-800">
                    Concluídos
                  </Badge>
                  <span className="text-sm text-gray-600">{completedAppointments.length}</span>
                </div>
                <span className="font-semibold text-green-600">
                  R$ {realizedRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    Agendados
                  </Badge>
                  <span className="text-sm text-gray-600">{scheduledAppointments.length}</span>
                </div>
                <span className="font-semibold text-blue-600">
                  R$ {potentialRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Badge className="bg-orange-100 text-orange-800">
                    Início Contato
                  </Badge>
                  <span className="text-sm text-gray-600">{metrics.inicioContatos || 0}</span>
                </div>
                <span className="font-semibold text-orange-600">
                  Potencial de conversão
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

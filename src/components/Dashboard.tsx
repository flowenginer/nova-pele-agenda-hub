
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DashboardMetrics } from '../types/crm';
import { Calendar, Users, User, TrendingUp } from 'lucide-react';

interface DashboardProps {
  metrics: DashboardMetrics;
}

export const Dashboard = ({ metrics }: DashboardProps) => {
  const statusColors = {
    agendado: 'bg-blue-100 text-blue-800',
    confirmado: 'bg-green-100 text-green-800',
    em_atendimento: 'bg-yellow-100 text-yellow-800',
    concluido: 'bg-purple-100 text-purple-800',
    cancelado: 'bg-red-100 text-red-800',
    nao_compareceu: 'bg-gray-100 text-gray-800'
  };

  const statusLabels = {
    agendado: 'Agendado',
    confirmado: 'Confirmado',
    em_atendimento: 'Em Atendimento',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
    nao_compareceu: 'Não Compareceu'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h2>
          <p className="text-gray-600 mt-1">Visão geral da Nova Pele Estética</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Hoje</p>
          <p className="text-lg font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="nova-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Agendamentos
            </CardTitle>
            <Calendar className="h-4 w-4 text-nova-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nova-pink-600">
              {metrics.totalAppointments}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +2 desde ontem
            </p>
          </CardContent>
        </Card>

        <Card className="nova-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total de Clientes
            </CardTitle>
            <Users className="h-4 w-4 text-nova-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nova-purple-600">
              {metrics.totalClients}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +1 novo hoje
            </p>
          </CardContent>
        </Card>

        <Card className="nova-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Agendamentos Hoje
            </CardTitle>
            <User className="h-4 w-4 text-nova-pink-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nova-pink-600">
              {metrics.appointmentsToday}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Próximo às 10h
            </p>
          </CardContent>
        </Card>

        <Card className="nova-card animate-fade-in">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Receita do Mês
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-nova-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-nova-purple-600">
              R$ {metrics.revenue.toLocaleString('pt-BR')}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              +12% vs mês anterior
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos e Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Status dos Agendamentos
            </CardTitle>
            <CardDescription>
              Distribuição por status atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.appointmentsByStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
                      {statusLabels[status as keyof typeof statusLabels]}
                    </span>
                  </div>
                  <span className="font-semibold text-gray-700">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Serviços Mais Procurados
            </CardTitle>
            <CardDescription>
              Agendamentos por tipo de serviço
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(metrics.appointmentsByService).map(([service, count]) => (
                <div key={service} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{service}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-nova-pink-500 to-nova-purple-500"
                        style={{ width: `${(count / Math.max(...Object.values(metrics.appointmentsByService))) * 100}%` }}
                      />
                    </div>
                    <span className="font-semibold text-gray-700 min-w-[20px]">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Próximos Agendamentos */}
      <Card className="nova-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Próximos Agendamentos
          </CardTitle>
          <CardDescription>
            Agendamentos para hoje e próximos dias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Carregando próximos agendamentos...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

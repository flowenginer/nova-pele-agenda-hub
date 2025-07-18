import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Calendar,
  CreditCard,
  Receipt,
  PieChart,
  BarChart3,
  Calculator,
  FileText
} from 'lucide-react';

interface Expense {
  id: string;
  descricao: string;
  valor: number;
  categoria?: string;
  data_vencimento: string;
  data_pagamento?: string;
  status: 'pendente' | 'pago' | 'vencido';
  metodo_pagamento?: string;
  observacoes?: string;
  recorrente: boolean;
  frequencia_recorrencia?: string;
  created_at: string;
  updated_at: string;
}

interface Appointment {
  id: number;
  valor?: number;
  status: string;
  data_agendamento: string;
  profissional_id: number;
  servicos?: { nome: string; preco?: number };
  profissionais?: { nome: string; comissao_porcentagem?: number };
}

interface Professional {
  id: number;
  nome: string;
  comissao_porcentagem?: number;
}

interface CommissionData {
  profissional_id: number;
  profissional_nome: string;
  total_vendas: number;
  comissao_porcentagem: number;
  valor_comissao: number;
  quantidade_atendimentos: number;
}

export const FinancialManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [commissions, setCommissions] = useState<CommissionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState('current_month');
  const [formData, setFormData] = useState({
    descricao: '',
    valor: '',
    categoria: '',
    data_vencimento: '',
    data_pagamento: '',
    status: 'pendente' as 'pendente' | 'pago' | 'vencido',
    metodo_pagamento: '',
    observacoes: '',
    recorrente: false,
    frequencia_recorrencia: ''
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, [selectedPeriod]);

  const fetchData = async () => {
    try {
      setIsLoading(true);

      // Buscar despesas
      const { data: expensesData, error: expensesError } = await supabase
        .from('despesas')
        .select('*')
        .order('data_vencimento', { ascending: false });

      if (expensesError) throw expensesError;

      // Buscar agendamentos para cálculo de receitas e comissões
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('agendamentos')
        .select(`
          id,
          valor,
          status,
          data_agendamento,
          profissional_id,
          servicos!inner(nome, preco),
          profissionais!inner(nome, comissao_porcentagem)
        `)
        .in('status', ['concluido', 'confirmado', 'agendado']);

      if (appointmentsError) throw appointmentsError;

      // Buscar profissionais
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('profissionais')
        .select('id, nome, comissao_porcentagem')
        .eq('ativo', true);

      if (professionalsError) throw professionalsError;

      setExpenses((expensesData || []) as Expense[]);
      setAppointments(appointmentsData || []);
      setProfessionals(professionalsData || []);

      // Calcular comissões
      calculateCommissions(appointmentsData || [], professionalsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateCommissions = (appointmentsData: Appointment[], professionalsData: Professional[]) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Filtrar por período selecionado
    let filteredAppointments = appointmentsData;
    if (selectedPeriod === 'current_month') {
      filteredAppointments = appointmentsData.filter(apt => {
        const aptDate = new Date(apt.data_agendamento);
        return aptDate >= startOfMonth && aptDate <= endOfMonth;
      });
    }

    // Agrupar por profissional
    const commissionsByProfessional = new Map<number, CommissionData>();

    filteredAppointments
      .filter(apt => apt.status === 'concluido')
      .forEach(apt => {
        const professional = professionalsData.find(p => p.id === apt.profissional_id);
        if (!professional) return;

        const valor = apt.valor || apt.servicos?.preco || 0;
        const comissaoPercent = professional.comissao_porcentagem || 0;
        const valorComissao = (valor * comissaoPercent) / 100;

        if (commissionsByProfessional.has(apt.profissional_id)) {
          const existing = commissionsByProfessional.get(apt.profissional_id)!;
          existing.total_vendas += valor;
          existing.valor_comissao += valorComissao;
          existing.quantidade_atendimentos += 1;
        } else {
          commissionsByProfessional.set(apt.profissional_id, {
            profissional_id: apt.profissional_id,
            profissional_nome: professional.nome,
            total_vendas: valor,
            comissao_porcentagem: comissaoPercent,
            valor_comissao: valorComissao,
            quantidade_atendimentos: 1
          });
        }
      });

    setCommissions(Array.from(commissionsByProfessional.values()));
  };

  const handleSaveExpense = async () => {
    if (!formData.descricao.trim() || !formData.valor || !formData.data_vencimento) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const expenseData = {
        descricao: formData.descricao.trim(),
        valor: parseFloat(formData.valor),
        categoria: formData.categoria.trim() || null,
        data_vencimento: formData.data_vencimento,
        data_pagamento: formData.data_pagamento || null,
        status: formData.status,
        metodo_pagamento: formData.metodo_pagamento.trim() || null,
        observacoes: formData.observacoes.trim() || null,
        recorrente: formData.recorrente,
        frequencia_recorrencia: formData.recorrente ? formData.frequencia_recorrencia : null,
      };

      if (editingExpense) {
        // Atualizar despesa existente
        const { error } = await supabase
          .from('despesas')
          .update(expenseData)
          .eq('id', editingExpense.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Despesa atualizada com sucesso.",
        });
      } else {
        // Criar nova despesa
        const { error } = await supabase
          .from('despesas')
          .insert([expenseData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Despesa criada com sucesso.",
        });
      }

      // Resetar formulário
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar despesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar despesa.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta despesa?')) return;

    try {
      const { error } = await supabase
        .from('despesas')
        .delete()
        .eq('id', expenseId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Despesa excluída com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao excluir despesa:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir despesa.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      descricao: expense.descricao,
      valor: expense.valor.toString(),
      categoria: expense.categoria || '',
      data_vencimento: expense.data_vencimento,
      data_pagamento: expense.data_pagamento || '',
      status: expense.status,
      metodo_pagamento: expense.metodo_pagamento || '',
      observacoes: expense.observacoes || '',
      recorrente: expense.recorrente,
      frequencia_recorrencia: expense.frequencia_recorrencia || ''
    });
    setShowExpenseDialog(true);
  };

  const resetForm = () => {
    setFormData({
      descricao: '',
      valor: '',
      categoria: '',
      data_vencimento: '',
      data_pagamento: '',
      status: 'pendente',
      metodo_pagamento: '',
      observacoes: '',
      recorrente: false,
      frequencia_recorrencia: ''
    });
    setShowExpenseDialog(false);
    setEditingExpense(null);
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pendente: { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
      pago: { label: 'Pago', className: 'bg-green-100 text-green-800' },
      vencido: { label: 'Vencido', className: 'bg-red-100 text-red-800' }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pendente;
    return <Badge className={statusConfig.className}>{statusConfig.label}</Badge>;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Cálculos financeiros
  const totalReceitas = appointments
    .filter(apt => apt.status === 'concluido')
    .reduce((sum, apt) => sum + (apt.valor || apt.servicos?.preco || 0), 0);

  const totalDespesas = expenses
    .filter(exp => exp.status === 'pago')
    .reduce((sum, exp) => sum + exp.valor, 0);

  const totalDespesasPendentes = expenses
    .filter(exp => exp.status === 'pendente')
    .reduce((sum, exp) => sum + exp.valor, 0);

  const lucroLiquido = totalReceitas - totalDespesas;
  const totalComissoes = commissions.reduce((sum, comm) => sum + comm.valor_comissao, 0);

  return (
    <div className="space-y-6">
      {/* Header com Cards de Resumo */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Gestão Financeira
          </h2>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current_month">Mês Atual</SelectItem>
              <SelectItem value="all_time">Todo o Período</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Receitas</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Despesas Pagas</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Lucro Líquido</p>
                  <p className={`text-2xl font-bold ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(lucroLiquido)}
                  </p>
                </div>
                <DollarSign className={`w-8 h-8 ${lucroLiquido >= 0 ? 'text-green-600' : 'text-red-600'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Comissões</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalComissoes)}</p>
                </div>
                <Receipt className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="expenses" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="expenses" className="flex items-center">
            <CreditCard className="w-4 h-4 mr-2" />
            Despesas
          </TabsTrigger>
          <TabsTrigger value="commissions" className="flex items-center">
            <PieChart className="w-4 h-4 mr-2" />
            Comissões
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Controle de Despesas</h3>
            <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-nova-pink-500 to-nova-purple-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Nova Despesa
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingExpense ? 'Editar Despesa' : 'Nova Despesa'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Descrição *</label>
                      <Input
                        value={formData.descricao}
                        onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                        placeholder="Ex: Aluguel, Material de limpeza..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Valor *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={formData.valor}
                        onChange={(e) => setFormData({...formData, valor: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Categoria</label>
                      <Select value={formData.categoria} onValueChange={(value) => setFormData({...formData, categoria: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="aluguel">Aluguel</SelectItem>
                          <SelectItem value="produtos">Produtos</SelectItem>
                          <SelectItem value="equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="salarios">Salários</SelectItem>
                          <SelectItem value="marketing">Marketing</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <Select value={formData.status} onValueChange={(value: any) => setFormData({...formData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pendente">Pendente</SelectItem>
                          <SelectItem value="pago">Pago</SelectItem>
                          <SelectItem value="vencido">Vencido</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Data de Vencimento *</label>
                      <Input
                        type="date"
                        value={formData.data_vencimento}
                        onChange={(e) => setFormData({...formData, data_vencimento: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Data de Pagamento</label>
                      <Input
                        type="date"
                        value={formData.data_pagamento}
                        onChange={(e) => setFormData({...formData, data_pagamento: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Observações</label>
                    <Textarea
                      value={formData.observacoes}
                      onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                      placeholder="Observações adicionais..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveExpense}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingExpense ? 'Atualizar' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Lista de Despesas */}
          <div className="space-y-3">
            {expenses.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <CreditCard className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Nenhuma despesa registrada
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comece adicionando suas primeiras despesas para controlar o fluxo de caixa.
                  </p>
                  <Button onClick={() => setShowExpenseDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Despesa
                  </Button>
                </CardContent>
              </Card>
            ) : (
              expenses.map((expense) => (
                <Card key={expense.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{expense.descricao}</h4>
                          {getStatusBadge(expense.status)}
                          {expense.categoria && (
                            <Badge variant="outline">{expense.categoria}</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="font-medium text-lg text-gray-800">
                            {formatCurrency(expense.valor)}
                          </span>
                          <span>Vencimento: {formatDate(expense.data_vencimento)}</span>
                          {expense.data_pagamento && (
                            <span>Pago em: {formatDate(expense.data_pagamento)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(expense)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteExpense(expense.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Relatório de Comissões</h3>
            <p className="text-sm text-gray-600">
              Período: {selectedPeriod === 'current_month' ? 'Mês Atual' : 'Todo o Período'}
            </p>
          </div>

          {commissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhuma comissão calculada
                </h3>
                <p className="text-gray-600">
                  As comissões serão exibidas quando houver agendamentos concluídos no período selecionado.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {commissions.map((commission) => (
                <Card key={commission.profissional_id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg mb-2">{commission.profissional_nome}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Total de Vendas</p>
                            <p className="font-semibold text-green-600">
                              {formatCurrency(commission.total_vendas)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Atendimentos</p>
                            <p className="font-semibold">{commission.quantidade_atendimentos}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">% Comissão</p>
                            <p className="font-semibold">{commission.comissao_porcentagem}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Valor da Comissão</p>
                            <p className="font-semibold text-purple-600">
                              {formatCurrency(commission.valor_comissao)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Total de Comissões */}
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-lg text-purple-800">
                      Total de Comissões a Pagar
                    </h4>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatCurrency(totalComissoes)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
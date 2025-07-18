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

interface Product {
  id: string;
  nome_produto: string;
  categoria?: string;
  quantidade_atual: number;
  quantidade_minima: number;
  valor_unitario: number;
  fornecedor?: string;
  data_compra?: string;
  data_validade?: string;
  observacoes?: string;
  status: 'ativo' | 'inativo' | 'esgotado';
  created_at: string;
  updated_at: string;
}

export const FinancialManagement: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
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

  const [productFormData, setProductFormData] = useState({
    nome_produto: '',
    categoria: '',
    quantidade_atual: '',
    quantidade_minima: '',
    valor_unitario: '',
    fornecedor: '',
    data_compra: '',
    data_validade: '',
    observacoes: '',
    status: 'ativo' as 'ativo' | 'inativo' | 'esgotado'
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

      // Buscar agendamentos para cálculo de receitas
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('agendamentos')
        .select(`
          id,
          valor,
          status,
          data_agendamento,
          profissional_id,
          servicos!inner(nome, preco),
          profissionais!inner(nome)
        `)
        .in('status', ['concluido', 'confirmado', 'agendado']);

      if (appointmentsError) throw appointmentsError;

      // Buscar produtos do estoque
      const { data: productsData, error: productsError } = await supabase
        .from('estoque')
        .select('*')
        .order('nome_produto', { ascending: true });

      if (productsError) throw productsError;

      setExpenses((expensesData || []) as Expense[]);
      setAppointments(appointmentsData || []);
      setProducts((productsData || []) as Product[]);
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

  const handleSaveProduct = async () => {
    if (!productFormData.nome_produto.trim() || !productFormData.quantidade_atual || !productFormData.valor_unitario) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      const productData = {
        nome_produto: productFormData.nome_produto.trim(),
        categoria: productFormData.categoria.trim() || null,
        quantidade_atual: parseInt(productFormData.quantidade_atual),
        quantidade_minima: parseInt(productFormData.quantidade_minima) || 0,
        valor_unitario: parseFloat(productFormData.valor_unitario),
        fornecedor: productFormData.fornecedor.trim() || null,
        data_compra: productFormData.data_compra || null,
        data_validade: productFormData.data_validade || null,
        observacoes: productFormData.observacoes.trim() || null,
        status: productFormData.status,
      };

      if (editingProduct) {
        // Atualizar produto existente
        const { error } = await supabase
          .from('estoque')
          .update(productData)
          .eq('id', editingProduct.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Produto atualizado com sucesso.",
        });
      } else {
        // Criar novo produto
        const { error } = await supabase
          .from('estoque')
          .insert([productData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Produto adicionado com sucesso.",
        });
      }

      // Resetar formulário
      resetProductForm();
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar produto.",
        variant: "destructive",
      });
    }
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

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Tem certeza que deseja excluir este produto do estoque?')) return;

    try {
      const { error } = await supabase
        .from('estoque')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Produto excluído do estoque com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir produto.",
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

  const openEditProductDialog = (product: Product) => {
    setEditingProduct(product);
    setProductFormData({
      nome_produto: product.nome_produto,
      categoria: product.categoria || '',
      quantidade_atual: product.quantidade_atual.toString(),
      quantidade_minima: product.quantidade_minima.toString(),
      valor_unitario: product.valor_unitario.toString(),
      fornecedor: product.fornecedor || '',
      data_compra: product.data_compra || '',
      data_validade: product.data_validade || '',
      observacoes: product.observacoes || '',
      status: product.status
    });
    setShowProductDialog(true);
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

  const resetProductForm = () => {
    setProductFormData({
      nome_produto: '',
      categoria: '',
      quantidade_atual: '',
      quantidade_minima: '',
      valor_unitario: '',
      fornecedor: '',
      data_compra: '',
      data_validade: '',
      observacoes: '',
      status: 'ativo'
    });
    setShowProductDialog(false);
    setEditingProduct(null);
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
  const totalEstoque = products.reduce((sum, prod) => sum + (prod.quantidade_atual * prod.valor_unitario), 0);
  const produtosBaixoEstoque = products.filter(prod => prod.quantidade_atual <= prod.quantidade_minima).length;

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
                  <p className="text-sm font-medium text-gray-600">Valor em Estoque</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(totalEstoque)}</p>
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
          <TabsTrigger value="inventory" className="flex items-center">
            <PieChart className="w-4 h-4 mr-2" />
            Controle de Estoque
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

        <TabsContent value="inventory" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold">Controle de Estoque</h3>
            <Dialog open={showProductDialog} onOpenChange={setShowProductDialog}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-nova-pink-500 to-nova-purple-500">
                  <Plus className="w-4 h-4 mr-2" />
                  Novo Produto
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 'Editar Produto' : 'Novo Produto'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Nome do Produto *</label>
                      <Input
                        value={productFormData.nome_produto}
                        onChange={(e) => setProductFormData({...productFormData, nome_produto: e.target.value})}
                        placeholder="Ex: Creme hidratante..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Categoria</label>
                      <Select value={productFormData.categoria} onValueChange={(value) => setProductFormData({...productFormData, categoria: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cosmeticos">Cosméticos</SelectItem>
                          <SelectItem value="equipamentos">Equipamentos</SelectItem>
                          <SelectItem value="medicamentos">Medicamentos</SelectItem>
                          <SelectItem value="materiais">Materiais</SelectItem>
                          <SelectItem value="outros">Outros</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Quantidade Atual *</label>
                      <Input
                        type="number"
                        value={productFormData.quantidade_atual}
                        onChange={(e) => setProductFormData({...productFormData, quantidade_atual: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Quantidade Mínima</label>
                      <Input
                        type="number"
                        value={productFormData.quantidade_minima}
                        onChange={(e) => setProductFormData({...productFormData, quantidade_minima: e.target.value})}
                        placeholder="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Valor Unitário *</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={productFormData.valor_unitario}
                        onChange={(e) => setProductFormData({...productFormData, valor_unitario: e.target.value})}
                        placeholder="0,00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Fornecedor</label>
                      <Input
                        value={productFormData.fornecedor}
                        onChange={(e) => setProductFormData({...productFormData, fornecedor: e.target.value})}
                        placeholder="Nome do fornecedor..."
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <Select value={productFormData.status} onValueChange={(value: any) => setProductFormData({...productFormData, status: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="esgotado">Esgotado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Data de Compra</label>
                      <Input
                        type="date"
                        value={productFormData.data_compra}
                        onChange={(e) => setProductFormData({...productFormData, data_compra: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Data de Validade</label>
                      <Input
                        type="date"
                        value={productFormData.data_validade}
                        onChange={(e) => setProductFormData({...productFormData, data_validade: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Observações</label>
                    <Textarea
                      value={productFormData.observacoes}
                      onChange={(e) => setProductFormData({...productFormData, observacoes: e.target.value})}
                      placeholder="Observações sobre o produto..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={resetProductForm}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSaveProduct}>
                    <Save className="w-4 h-4 mr-2" />
                    {editingProduct ? 'Atualizar' : 'Salvar'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Alerta de produtos com baixo estoque */}
          {produtosBaixoEstoque > 0 && (
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="text-yellow-600 mr-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800">Atenção: Produtos com baixo estoque</h4>
                    <p className="text-yellow-700">{produtosBaixoEstoque} produto(s) com quantidade igual ou menor que o mínimo estabelecido.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Produtos */}
          <div className="space-y-3">
            {products.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <PieChart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Nenhum produto no estoque
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comece adicionando os primeiros produtos para controlar o estoque.
                  </p>
                  <Button onClick={() => setShowProductDialog(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Produto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              products.map((product) => (
                <Card key={product.id} className={`hover:shadow-md transition-shadow ${product.quantidade_atual <= product.quantidade_minima ? 'border-yellow-300 bg-yellow-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{product.nome_produto}</h4>
                          <Badge className={
                            product.status === 'ativo' ? 'bg-green-100 text-green-800' :
                            product.status === 'esgotado' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }>
                            {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                          </Badge>
                          {product.categoria && (
                            <Badge variant="outline">{product.categoria}</Badge>
                          )}
                          {product.quantidade_atual <= product.quantidade_minima && (
                            <Badge className="bg-yellow-100 text-yellow-800">Baixo Estoque</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <p className="text-gray-600">Quantidade</p>
                            <p className="font-semibold text-lg">{product.quantidade_atual}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Mín. Estoque</p>
                            <p className="font-semibold">{product.quantidade_minima}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Valor Unit.</p>
                            <p className="font-semibold">{formatCurrency(product.valor_unitario)}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Valor Total</p>
                            <p className="font-semibold text-purple-600">
                              {formatCurrency(product.quantidade_atual * product.valor_unitario)}
                            </p>
                          </div>
                        </div>
                        {product.fornecedor && (
                          <p className="text-sm text-gray-600 mt-2">Fornecedor: {product.fornecedor}</p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditProductDialog(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
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
      </Tabs>
    </div>
  );
};
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
  FileText, 
  Camera, 
  Calendar, 
  User, 
  Upload, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Eye
} from 'lucide-react';

interface MedicalRecord {
  id: string;
  cliente_id: string;
  agendamento_id?: number;
  tipo: 'anamnese' | 'evolucao' | 'procedimento';
  titulo: string;
  dados_anamnese?: any;
  observacoes?: string;
  fotos_antes?: string[];
  fotos_depois?: string[];
  profissional_id?: number;
  created_at: string;
  updated_at: string;
}

interface Client {
  id: string;
  nome: string;
  telefone: string;
  email?: string;
}

interface Appointment {
  id: number;
  data_agendamento: string;
  hora_agendamento: string;
  servicos?: { nome: string };
  profissionais?: { nome: string };
}

interface Professional {
  id: number;
  nome: string;
}

interface MedicalRecordsProps {
  selectedClient: Client | null;
  onClose: () => void;
}

export const MedicalRecords: React.FC<MedicalRecordsProps> = ({ selectedClient, onClose }) => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewRecordDialog, setShowNewRecordDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MedicalRecord | null>(null);
  const [formData, setFormData] = useState({
    tipo: 'anamnese' as 'anamnese' | 'evolucao' | 'procedimento',
    titulo: '',
    observacoes: '',
    agendamento_id: '',
    profissional_id: '',
    dados_anamnese: {}
  });

  const { toast } = useToast();

  useEffect(() => {
    if (selectedClient) {
      fetchData();
    }
  }, [selectedClient]);

  const fetchData = async () => {
    if (!selectedClient) return;

    try {
      setIsLoading(true);

      // Buscar prontuários
      const { data: recordsData, error: recordsError } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('cliente_id', selectedClient.id)
        .order('created_at', { ascending: false });

      if (recordsError) throw recordsError;

      // Buscar agendamentos do cliente
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('agendamentos')
        .select(`
          id,
          data_agendamento,
          hora_agendamento,
          servicos!inner(nome),
          profissionais!inner(nome)
        `)
        .eq('cliente_id', selectedClient.id)
        .order('data_agendamento', { ascending: false });

      if (appointmentsError) throw appointmentsError;

      // Buscar profissionais
      const { data: professionalsData, error: professionalsError } = await supabase
        .from('profissionais')
        .select('id, nome')
        .eq('ativo', true);

      if (professionalsError) throw professionalsError;

      setRecords((recordsData || []) as MedicalRecord[]);
      setAppointments(appointmentsData || []);
      setProfessionals(professionalsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados do prontuário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveRecord = async () => {
    if (!selectedClient || !formData.titulo.trim()) {
      toast({
        title: "Erro",
        description: "Preencha pelo menos o título do prontuário.",
        variant: "destructive",
      });
      return;
    }

    try {
      const recordData = {
        cliente_id: selectedClient.id,
        tipo: formData.tipo,
        titulo: formData.titulo.trim(),
        observacoes: formData.observacoes.trim() || null,
        agendamento_id: formData.agendamento_id ? parseInt(formData.agendamento_id) : null,
        profissional_id: formData.profissional_id ? parseInt(formData.profissional_id) : null,
        dados_anamnese: formData.tipo === 'anamnese' ? formData.dados_anamnese : null,
      };

      if (editingRecord) {
        // Atualizar registro existente
        const { error } = await supabase
          .from('prontuarios')
          .update(recordData)
          .eq('id', editingRecord.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Prontuário atualizado com sucesso.",
        });
      } else {
        // Criar novo registro
        const { error } = await supabase
          .from('prontuarios')
          .insert([recordData]);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Prontuário criado com sucesso.",
        });
      }

      // Resetar formulário e fechar dialog
      setFormData({
        tipo: 'anamnese',
        titulo: '',
        observacoes: '',
        agendamento_id: '',
        profissional_id: '',
        dados_anamnese: {}
      });
      setShowNewRecordDialog(false);
      setEditingRecord(null);
      
      // Recarregar dados
      fetchData();
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar prontuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Tem certeza que deseja excluir este prontuário?')) return;

    try {
      const { error } = await supabase
        .from('prontuarios')
        .delete()
        .eq('id', recordId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Prontuário excluído com sucesso.",
      });

      fetchData();
    } catch (error) {
      console.error('Erro ao excluir prontuário:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir prontuário.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (record: MedicalRecord) => {
    setEditingRecord(record);
    setFormData({
      tipo: record.tipo,
      titulo: record.titulo,
      observacoes: record.observacoes || '',
      agendamento_id: record.agendamento_id?.toString() || '',
      profissional_id: record.profissional_id?.toString() || '',
      dados_anamnese: record.dados_anamnese || {}
    });
    setShowNewRecordDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRecordTypeBadge = (tipo: string) => {
    const config = {
      anamnese: { label: 'Anamnese', className: 'bg-blue-100 text-blue-800' },
      evolucao: { label: 'Evolução', className: 'bg-green-100 text-green-800' },
      procedimento: { label: 'Procedimento', className: 'bg-purple-100 text-purple-800' }
    };
    
    const typeConfig = config[tipo as keyof typeof config] || config.anamnese;
    return <Badge className={typeConfig.className}>{typeConfig.label}</Badge>;
  };

  if (!selectedClient) {
    return (
      <div className="text-center py-8">
        <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          Selecione um Cliente
        </h3>
        <p className="text-gray-600">
          Escolha um cliente na lista para visualizar o prontuário eletrônico.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 flex items-center">
            <FileText className="w-6 h-6 mr-2 text-nova-pink-500" />
            Prontuário Eletrônico
          </h2>
          <p className="text-gray-600 mt-1">
            Cliente: <span className="font-semibold">{selectedClient.nome}</span>
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showNewRecordDialog} onOpenChange={setShowNewRecordDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-nova-pink-500 to-nova-purple-500">
                <Plus className="w-4 h-4 mr-2" />
                Novo Registro
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? 'Editar Registro' : 'Novo Registro no Prontuário'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Tipo de Registro</label>
                    <Select value={formData.tipo} onValueChange={(value: any) => setFormData({...formData, tipo: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="anamnese">Anamnese</SelectItem>
                        <SelectItem value="evolucao">Evolução</SelectItem>
                        <SelectItem value="procedimento">Procedimento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Profissional</label>
                    <Select value={formData.profissional_id} onValueChange={(value) => setFormData({...formData, profissional_id: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o profissional" />
                      </SelectTrigger>
                      <SelectContent>
                        {professionals.map((prof) => (
                          <SelectItem key={prof.id} value={prof.id.toString()}>
                            {prof.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Título *</label>
                  <Input
                    value={formData.titulo}
                    onChange={(e) => setFormData({...formData, titulo: e.target.value})}
                    placeholder="Ex: Primeira consulta, Sessão de limpeza de pele..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Agendamento Relacionado</label>
                  <Select value={formData.agendamento_id} onValueChange={(value) => setFormData({...formData, agendamento_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o agendamento (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {appointments.map((appointment) => (
                        <SelectItem key={appointment.id} value={appointment.id.toString()}>
                          {new Date(appointment.data_agendamento).toLocaleDateString('pt-BR')} - {appointment.hora_agendamento} 
                          {appointment.servicos ? ` - ${appointment.servicos.nome}` : ''}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Observações</label>
                  <Textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                    placeholder="Descreva detalhes do atendimento, evolução do paciente, recomendações..."
                    rows={4}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => {
                  setShowNewRecordDialog(false);
                  setEditingRecord(null);
                  setFormData({
                    tipo: 'anamnese',
                    titulo: '',
                    observacoes: '',
                    agendamento_id: '',
                    profissional_id: '',
                    dados_anamnese: {}
                  });
                }}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveRecord}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingRecord ? 'Atualizar' : 'Salvar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4 mr-2" />
            Fechar
          </Button>
        </div>
      </div>

      <Tabs defaultValue="records" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="records" className="flex items-center">
            <FileText className="w-4 h-4 mr-2" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Histórico de Agendamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nova-pink-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando prontuários...</p>
            </div>
          ) : records.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhum registro encontrado
                </h3>
                <p className="text-gray-600 mb-4">
                  Este cliente ainda não possui registros no prontuário eletrônico.
                </p>
                <Button onClick={() => setShowNewRecordDialog(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Criar Primeiro Registro
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {records.map((record) => (
                <Card key={record.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getRecordTypeBadge(record.tipo)}
                        <h3 className="font-semibold text-lg">{record.titulo}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(record)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteRecord(record.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">
                      Criado em {formatDate(record.created_at)}
                      {record.profissional_id && (
                        <span className="ml-2">
                          • Profissional: {professionals.find(p => p.id === record.profissional_id)?.nome || 'N/A'}
                        </span>
                      )}
                    </p>
                  </CardHeader>
                  
                  {record.observacoes && (
                    <CardContent>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-2">Observações:</h4>
                        <p className="text-gray-700 whitespace-pre-wrap">{record.observacoes}</p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {appointments.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                  Nenhum agendamento encontrado
                </h3>
                <p className="text-gray-600">
                  Este cliente ainda não possui agendamentos registrados.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {appointments.map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">
                          {appointment.servicos?.nome || 'Serviço não especificado'}
                        </h4>
                        <p className="text-gray-600">
                          Data: {new Date(appointment.data_agendamento).toLocaleDateString('pt-BR')} às {appointment.hora_agendamento}
                        </p>
                        <p className="text-gray-600">
                          Profissional: {appointment.profissionais?.nome || 'Não especificado'}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              agendamento_id: appointment.id.toString(),
                              titulo: `Registro - ${appointment.servicos?.nome || 'Procedimento'}`,
                              tipo: 'procedimento'
                            });
                            setShowNewRecordDialog(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Criar Registro
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
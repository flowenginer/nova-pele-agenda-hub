
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useSupabaseCRM } from '@/hooks/useSupabaseCRM';
import { useToast } from '@/hooks/use-toast';

interface AddLeadDialogProps {
  status: string;
  statusTitle: string;
}

export const AddLeadDialog = ({ status, statusTitle }: AddLeadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    telefone: '',
    whatsapp: '',
    email: '',
    mensagem: '',
    servico_id: '',
    profissional_id: '',
    data_agendamento: '',
    hora_agendamento: '',
    observacoes: ''
  });

  const { addAppointment, services, professionals } = useSupabaseCRM();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const appointmentData = {
        cliente_nome: formData.nome,
        cliente_telefone: formData.telefone,
        email: formData.email || null,
        servico_id: parseInt(formData.servico_id),
        profissional_id: parseInt(formData.profissional_id),
        data_agendamento: formData.data_agendamento,
        hora_agendamento: formData.hora_agendamento,
        status: status,
        observacoes: formData.observacoes || null,
        valor: null,
        cliente_id: null,
        user_id: null
      };

      await addAppointment(appointmentData);
      
      toast({
        title: "Lead adicionado",
        description: `Lead foi adicionado na etapa "${statusTitle}" com sucesso.`,
      });
      
      setOpen(false);
      setFormData({
        nome: '',
        telefone: '',
        whatsapp: '',
        email: '',
        mensagem: '',
        servico_id: '',
        profissional_id: '',
        data_agendamento: '',
        hora_agendamento: '',
        observacoes: ''
      });
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o lead.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          size="sm" 
          className="h-6 w-6 p-0 bg-nova-pink-500 hover:bg-nova-pink-600"
        >
          <Plus className="h-3 w-3" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">Adicionar Lead - {statusTitle}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="nome" className="text-xs">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
              required
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="telefone" className="text-xs">Telefone *</Label>
            <Input
              id="telefone"
              value={formData.telefone}
              onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
              required
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="email" className="text-xs">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="h-8 text-sm"
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="servico" className="text-xs">Serviço *</Label>
            <Select value={formData.servico_id} onValueChange={(value) => setFormData(prev => ({ ...prev, servico_id: value }))}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecione o serviço" />
              </SelectTrigger>
              <SelectContent>
                {services.map(service => (
                  <SelectItem key={service.id} value={service.id.toString()}>
                    {service.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label htmlFor="profissional" className="text-xs">Profissional *</Label>
            <Select value={formData.profissional_id} onValueChange={(value) => setFormData(prev => ({ ...prev, profissional_id: value }))}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue placeholder="Selecione o profissional" />
              </SelectTrigger>
              <SelectContent>
                {professionals.map(professional => (
                  <SelectItem key={professional.id} value={professional.id.toString()}>
                    {professional.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {status !== 'inicio_contato' && (
            <>
              <div className="space-y-1">
                <Label htmlFor="data" className="text-xs">Data *</Label>
                <Input
                  id="data"
                  type="date"
                  value={formData.data_agendamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, data_agendamento: e.target.value }))}
                  required
                  className="h-8 text-sm"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="hora" className="text-xs">Hora *</Label>
                <Input
                  id="hora"
                  type="time"
                  value={formData.hora_agendamento}
                  onChange={(e) => setFormData(prev => ({ ...prev, hora_agendamento: e.target.value }))}
                  required
                  className="h-8 text-sm"
                />
              </div>
            </>
          )}

          <div className="space-y-1">
            <Label htmlFor="observacoes" className="text-xs">Observações</Label>
            <Textarea
              id="observacoes"
              value={formData.observacoes}
              onChange={(e) => setFormData(prev => ({ ...prev, observacoes: e.target.value }))}
              rows={2}
              className="text-sm resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              className="flex-1 h-8 text-xs"
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="flex-1 h-8 text-xs bg-nova-pink-500 hover:bg-nova-pink-600"
            >
              Adicionar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

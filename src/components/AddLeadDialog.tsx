import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AddLeadDialogProps {
  status: string;
  onLeadAdded: () => void;
}

export const AddLeadDialog = ({ status, onLeadAdded }: AddLeadDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    telefone: "",
    email: "",
    mensagem: ""
  });
  const [isLoading, setIsLoading] = useState(false);

  const statusLabels = {
    inicio_contato: "Início Contato",
    agendado: "Agendado",
    confirmado: "Confirmado",
    concluido: "Concluído"
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // First create the lead
      const { data: leadData, error: leadError } = await supabase
        .from('iniciou_contato')
        .insert({
          nome: formData.nome,
          telefone: formData.telefone,
          email: formData.email || null,
          mensagem: formData.mensagem || null,
          status: status
        })
        .select()
        .single();

      if (leadError) throw leadError;

      // If status is agendado, confirmado, or concluido, also create an appointment
      if (['agendado', 'confirmado', 'concluido'].includes(status)) {
        const { error: appointmentError } = await supabase
          .from('agendamentos')
          .insert({
            cliente_nome: formData.nome,
            cliente_telefone: formData.telefone,
            email: formData.email || null,
            status: status,
            observacoes: formData.mensagem || null,
            // Default values for required fields
            data_agendamento: new Date().toISOString().split('T')[0],
            hora_agendamento: '09:00:00',
            profissional_id: 1, // Default professional
            servico_id: 1, // Default service
          });

        if (appointmentError) {
          console.error('Erro ao criar agendamento:', appointmentError);
          // Don't throw here, the lead was still created successfully
        }
      }

      toast({
        title: "Lead adicionado com sucesso!",
        description: `Lead adicionado na etapa "${statusLabels[status as keyof typeof statusLabels]}"`
      });

      setFormData({ nome: "", telefone: "", email: "", mensagem: "" });
      setOpen(false);
      onLeadAdded();
    } catch (error) {
      console.error('Erro ao adicionar lead:', error);
      toast({
        title: "Erro ao adicionar lead",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Adicionar Lead - {statusLabels[status as keyof typeof statusLabels]}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome *</Label>
            <Input
              id="nome"
              value={formData.nome}
              onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
              required
              placeholder="Nome completo"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="telefone">Telefone *</Label>
            <Input
              id="telefone"
              type="tel"
              value={formData.telefone}
              onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
              required
              placeholder="(11) 99999-9999"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="email@exemplo.com"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="mensagem">Observações</Label>
            <Textarea
              id="mensagem"
              value={formData.mensagem}
              onChange={(e) => setFormData({ ...formData, mensagem: e.target.value })}
              placeholder="Observações sobre o lead..."
              rows={3}
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Adicionando..." : "Adicionar Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
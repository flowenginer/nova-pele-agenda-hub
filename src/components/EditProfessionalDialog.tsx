import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Edit, Upload, User } from 'lucide-react';
import { Professional } from '../types/crm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EditProfessionalDialogProps {
  professional: Professional;
  onUpdate: (id: string, updates: Partial<Professional>) => void;
}

export const EditProfessionalDialog = ({ professional, onUpdate }: EditProfessionalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: professional.name,
    email: professional.email || '',
    phone: professional.phone || '',
    specialties: professional.specialties.join(', '),
    workingHours: professional.workingHours,
    avatar: professional.avatar || ''
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }

      const file = event.target.files[0];
      
      // Validar tipo de arquivo
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
          variant: "destructive",
        });
        return;
      }

      // Validar tamanho do arquivo (5MB máximo)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB.",
          variant: "destructive",
        });
        return;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `professional-${professional.id}-${Date.now()}.${fileExt}`;

      console.log('Iniciando upload da foto...');

      const { error: uploadError, data } = await supabase.storage
        .from('profile-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw uploadError;
      }

      console.log('Upload realizado com sucesso:', data);

      const { data: publicUrlData } = supabase.storage
        .from('profile-photos')
        .getPublicUrl(fileName);

      console.log('URL pública gerada:', publicUrlData.publicUrl);

      setFormData(prev => ({ ...prev, avatar: publicUrlData.publicUrl }));
      
      toast({
        title: "Sucesso",
        description: "Foto enviada com sucesso!",
      });
    } catch (error: any) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro no upload",
        description: error.message || "Não foi possível enviar a foto.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      specialties: formData.specialties.split(',').map(s => s.trim()).filter(s => s),
      workingHours: formData.workingHours,
      avatar: formData.avatar
    };

    onUpdate(professional.id, updates);
    setOpen(false);
    
    toast({
      title: "Sucesso",
      description: "Profissional atualizado com sucesso!",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Profissional</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.avatar} alt={formData.name} />
              <AvatarFallback>
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            
            <div className="flex flex-col space-y-2">
              <Label htmlFor="photo-upload" className="cursor-pointer">
                <div className="flex items-center space-x-2 px-4 py-2 bg-primary/10 hover:bg-primary/20 rounded-md transition-colors">
                  <Upload className="w-4 h-4" />
                  <span>{uploading ? 'Enviando...' : 'Escolher Foto'}</span>
                </div>
              </Label>
              <Input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="hidden"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="specialties">Especialidades</Label>
            <Input
              id="specialties"
              value={formData.specialties}
              onChange={(e) => setFormData(prev => ({ ...prev, specialties: e.target.value }))}
              placeholder="Facial, Limpeza de Pele, Peeling"
            />
            <p className="text-xs text-gray-500">Separe as especialidades por vírgula</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start-time">Horário Início</Label>
              <Input
                id="start-time"
                type="time"
                value={formData.workingHours.start}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  workingHours: { ...prev.workingHours, start: e.target.value }
                }))}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="end-time">Horário Fim</Label>
              <Input
                id="end-time"
                type="time"
                value={formData.workingHours.end}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  workingHours: { ...prev.workingHours, end: e.target.value }
                }))}
              />
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

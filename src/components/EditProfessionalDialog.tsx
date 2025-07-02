
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit } from 'lucide-react';
import { Professional } from '../types/crm';

interface EditProfessionalDialogProps {
  professional: Professional;
  onUpdate: (id: string, updates: Partial<Professional>) => void;
}

export const EditProfessionalDialog = ({ professional, onUpdate }: EditProfessionalDialogProps) => {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: professional.name,
    email: professional.email || '',
    phone: professional.phone || '',
    specialties: professional.specialties.join(', '),
    workingHours: professional.workingHours,
    avatar: professional.avatar || ''
  });

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
            <Label htmlFor="avatar">URL da Foto</Label>
            <Input
              id="avatar"
              value={formData.avatar}
              onChange={(e) => setFormData(prev => ({ ...prev, avatar: e.target.value }))}
              placeholder="https://exemplo.com/foto.jpg"
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
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { X, Plus, Upload, User } from 'lucide-react';
import type { DatabaseProfessional } from '../types/supabase';

interface EditProfessionalDialogProps {
  professional: DatabaseProfessional | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: Partial<DatabaseProfessional>) => Promise<any> | 
          ((data: Omit<DatabaseProfessional, 'id' | 'created_at' | 'updated_at'>) => Promise<any>);
}

export const EditProfessionalDialog = ({ 
  professional, 
  isOpen, 
  onClose, 
  onSave 
}: EditProfessionalDialogProps) => {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    telefone: '',
    especialidade: '',
    especialidades: [] as string[],
    horario_inicio: '08:00',
    horario_fim: '18:00',
    dias_trabalho: [1, 2, 3, 4, 5] as number[],
    ativo: true,
    photo_url: ''
  });

  const [newEspecialidade, setNewEspecialidade] = useState('');
  const [loading, setLoading] = useState(false);

  const weekDays = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Segunda-feira' },
    { id: 2, name: 'Terça-feira' },
    { id: 3, name: 'Quarta-feira' },
    { id: 4, name: 'Quinta-feira' },
    { id: 5, name: 'Sexta-feira' },
    { id: 6, name: 'Sábado' }
  ];

  useEffect(() => {
    if (professional) {
      setFormData({
        nome: professional.nome || '',
        email: professional.email || '',
        telefone: professional.telefone || '',
        especialidade: professional.especialidade || '',
        especialidades: professional.especialidades || [],
        horario_inicio: professional.horario_inicio || '08:00',
        horario_fim: professional.horario_fim || '18:00',
        dias_trabalho: professional.dias_trabalho || [1, 2, 3, 4, 5],
        ativo: professional.ativo ?? true,
        photo_url: professional.photo_url || ''
      });
    } else {
      setFormData({
        nome: '',
        email: '',
        telefone: '',
        especialidade: '',
        especialidades: [],
        horario_inicio: '08:00',
        horario_fim: '18:00',
        dias_trabalho: [1, 2, 3, 4, 5],
        ativo: true,
        photo_url: ''
      });
    }
  }, [professional]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ 
          ...prev, 
          photo_url: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const addEspecialidade = () => {
    if (newEspecialidade.trim() && !formData.especialidades.includes(newEspecialidade.trim())) {
      setFormData(prev => ({
        ...prev,
        especialidades: [...prev.especialidades, newEspecialidade.trim()]
      }));
      setNewEspecialidade('');
    }
  };

  const removeEspecialidade = (especialidade: string) => {
    setFormData(prev => ({
      ...prev,
      especialidades: prev.especialidades.filter(e => e !== especialidade)
    }));
  };

  const toggleWorkingDay = (dayId: number) => {
    setFormData(prev => ({
      ...prev,
      dias_trabalho: prev.dias_trabalho.includes(dayId)
        ? prev.dias_trabalho.filter(d => d !== dayId)
        : [...prev.dias_trabalho, dayId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (professional) {
        await onSave(professional.id, formData);
      } else {
        await (onSave as any)(formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar profissional:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {professional ? 'Editar Profissional' : 'Novo Profissional'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Foto do Profissional */}
          <div className="flex items-center space-x-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={formData.photo_url} alt={formData.nome} />
              <AvatarFallback className="bg-nova-pink-100 text-nova-pink-600">
                <User className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
                id="photo-upload"
              />
              <Button 
                type="button"
                variant="outline" 
                asChild
                className="cursor-pointer"
              >
                <label htmlFor="photo-upload">
                  <Upload className="w-4 h-4 mr-2" />
                  {formData.photo_url ? 'Trocar Foto' : 'Adicionar Foto'}
                </label>
              </Button>
            </div>
          </div>

          {/* Informações Básicas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input
                id="nome"
                value={formData.nome}
                onChange={(e) => setFormData(prev => ({ ...prev, nome: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <Input
                id="telefone"
                value={formData.telefone}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone: e.target.value }))}
                placeholder="(11) 99999-9999"
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
              <Label htmlFor="especialidade">Especialidade Principal</Label>
              <Input
                id="especialidade"
                value={formData.especialidade}
                onChange={(e) => setFormData(prev => ({ ...prev, especialidade: e.target.value }))}
                placeholder="Ex: Estética Facial"
              />
            </div>
          </div>

          {/* Especialidades Adicionais */}
          <div className="space-y-2">
            <Label>Especialidades Adicionais</Label>
            <div className="flex space-x-2">
              <Input
                value={newEspecialidade}
                onChange={(e) => setNewEspecialidade(e.target.value)}
                placeholder="Digite uma especialidade"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addEspecialidade();
                  }
                }}
              />
              <Button type="button" onClick={addEspecialidade} variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.especialidades.map((esp, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{esp}</span>
                  <button
                    type="button"
                    onClick={() => removeEspecialidade(esp)}
                    className="ml-1 hover:bg-red-100 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Horários de Trabalho */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horario_inicio">Horário de Início</Label>
              <Input
                id="horario_inicio"
                type="time"
                value={formData.horario_inicio}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_inicio: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario_fim">Horário de Fim</Label>
              <Input
                id="horario_fim"
                type="time"
                value={formData.horario_fim}
                onChange={(e) => setFormData(prev => ({ ...prev, horario_fim: e.target.value }))}
              />
            </div>
          </div>

          {/* Dias de Trabalho */}
          <div className="space-y-2">
            <Label>Dias de Trabalho</Label>
            <div className="grid grid-cols-2 gap-2">
              {weekDays.map(day => (
                <div key={day.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-sm">{day.name}</span>
                  <Switch
                    checked={formData.dias_trabalho.includes(day.id)}
                    onCheckedChange={() => toggleWorkingDay(day.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Status Ativo */}
          <div className="flex items-center justify-between p-4 border rounded">
            <div>
              <Label className="text-base">Profissional Ativo</Label>
              <p className="text-sm text-gray-600">
                Quando ativo, o profissional aparece disponível para agendamentos
              </p>
            </div>
            <Switch
              checked={formData.ativo}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, ativo: checked }))}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="nova-button">
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

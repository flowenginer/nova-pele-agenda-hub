
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus, Edit2, Upload, User, Clock, Calendar, Phone, Mail, Palette } from 'lucide-react';
import { EditProfessionalDialog } from './EditProfessionalDialog';
import type { DatabaseProfessional } from '../types/supabase';

interface ProfessionalsManagementProps {
  professionals: DatabaseProfessional[];
  addProfessional: (data: Omit<DatabaseProfessional, 'id' | 'created_at' | 'updated_at'>) => Promise<any>;
  updateProfessional: (id: number, updates: Partial<DatabaseProfessional>) => Promise<any>;
}

export const ProfessionalsManagement = ({ 
  professionals, 
  addProfessional, 
  updateProfessional 
}: ProfessionalsManagementProps) => {
  const [editingProfessional, setEditingProfessional] = useState<DatabaseProfessional | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const weekDays = [
    'Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'
  ];

  const handleAddProfessional = () => {
    setEditingProfessional(null);
    setIsAddingNew(true);
  };

  const handleEditProfessional = (professional: DatabaseProfessional) => {
    setEditingProfessional(professional);
    setIsAddingNew(false);
  };

  const handleCloseDialog = () => {
    setEditingProfessional(null);
    setIsAddingNew(false);
  };

  const handleToggleActive = async (professional: DatabaseProfessional) => {
    try {
      await updateProfessional(professional.id, { 
        ativo: !professional.ativo 
      });
    } catch (error) {
      console.error('Erro ao atualizar status do profissional:', error);
    }
  };

  const handlePhotoUpload = async (professional: DatabaseProfessional, file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const photoUrl = e.target?.result as string;
        await updateProfessional(professional.id, { 
          photo_url: photoUrl 
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Erro ao fazer upload da foto:', error);
    }
  };

  const handleSaveProfessional = async (id: number | null, data: any) => {
    if (id) {
      return await updateProfessional(id, data);
    } else {
      return await addProfessional(data);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Profissionais
          </h2>
          <p className="text-gray-600 mt-1">Gerencie a equipe de profissionais da clínica</p>
        </div>
        <Button className="nova-button" onClick={handleAddProfessional}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map((professional) => (
          <Card key={professional.id} className={`nova-card animate-fade-in ${!professional.ativo ? 'opacity-60' : ''}`}>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage 
                        src={professional.photo_url || ''} 
                        alt={professional.nome}
                      />
                      <AvatarFallback className="bg-nova-pink-100 text-nova-pink-600">
                        <User className="w-6 h-6" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handlePhotoUpload(professional, file);
                          }
                        }}
                        className="hidden"
                        id={`photo-upload-${professional.id}`}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-6 h-6 p-0 rounded-full bg-white shadow-sm"
                        asChild
                      >
                        <label htmlFor={`photo-upload-${professional.id}`} className="cursor-pointer">
                          <Upload className="w-3 h-3" />
                        </label>
                      </Button>
                    </div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">{professional.nome}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Switch
                        checked={professional.ativo}
                        onCheckedChange={() => handleToggleActive(professional)}
                      />
                      <span className="text-sm text-gray-600">
                        {professional.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditProfessional(professional)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {professional.especialidade && (
                <div className="flex items-center space-x-2">
                  <Palette className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{professional.especialidade}</span>
                </div>
              )}

              {professional.especialidades && professional.especialidades.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {professional.especialidades.map((esp, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {esp}
                    </Badge>
                  ))}
                </div>
              )}

              {professional.telefone && (
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{professional.telefone}</span>
                </div>
              )}

              {professional.email && (
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{professional.email}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {professional.horario_inicio} - {professional.horario_fim}
                </span>
              </div>

              {professional.dias_trabalho && professional.dias_trabalho.length > 0 && (
                <div className="flex items-start space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div className="flex flex-wrap gap-1">
                    {professional.dias_trabalho.map((day) => (
                      <Badge key={day} variant="outline" className="text-xs">
                        {weekDays[day]?.substring(0, 3)}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {(isAddingNew || editingProfessional) && (
        <EditProfessionalDialog
          professional={editingProfessional}
          isOpen={true}
          onClose={handleCloseDialog}
          onSave={handleSaveProfessional}
        />
      )}
    </div>
  );
};

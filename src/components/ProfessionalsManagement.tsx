
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { EditProfessionalDialog } from './EditProfessionalDialog';
import { Professional } from '../types/crm';
import { User, Plus, Mail, Phone } from 'lucide-react';

interface ProfessionalsManagementProps {
  professionals: Professional[];
  onUpdateProfessionals: (professionals: Professional[]) => void;
}

export const ProfessionalsManagement = ({ professionals, onUpdateProfessionals }: ProfessionalsManagementProps) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProfessional, setNewProfessional] = useState({
    name: '',
    email: '',
    phone: '',
    specialties: '',
    workingHours: { start: '08:00', end: '18:00' },
    workingDays: [1, 2, 3, 4, 5],
    isActive: true
  });

  const handleAddProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    const professional: Professional = {
      id: Date.now().toString(),
      ...newProfessional,
      specialties: newProfessional.specialties.split(',').map(s => s.trim()).filter(s => s)
    };
    
    onUpdateProfessionals([...professionals, professional]);
    setNewProfessional({
      name: '',
      email: '',
      phone: '',
      specialties: '',
      workingHours: { start: '08:00', end: '18:00' },
      workingDays: [1, 2, 3, 4, 5],
      isActive: true
    });
    setShowAddForm(false);
  };

  const handleUpdateProfessional = (professionalId: string, updates: Partial<Professional>) => {
    const updatedProfessionals = professionals.map(p =>
      p.id === professionalId ? { ...p, ...updates } : p
    );
    onUpdateProfessionals(updatedProfessionals);
  };

  const toggleProfessionalStatus = (professionalId: string) => {
    const updatedProfessionals = professionals.map(p =>
      p.id === professionalId ? { ...p, isActive: !p.isActive } : p
    );
    onUpdateProfessionals(updatedProfessionals);
  };

  const getDayName = (dayNumber: number) => {
    const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return days[dayNumber];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Profissionais
          </h2>
          <p className="text-gray-600 mt-1">Gestão da equipe e especialidades</p>
        </div>
        <Button 
          className="nova-button"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Profissional
        </Button>
      </div>

      {/* Formulário de Adição */}
      {showAddForm && (
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Adicionar Novo Profissional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddProfessional} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Nome *</label>
                  <Input
                    required
                    value={newProfessional.name}
                    onChange={(e) => setNewProfessional(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nome do profissional"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">E-mail</label>
                  <Input
                    type="email"
                    value={newProfessional.email}
                    onChange={(e) => setNewProfessional(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@novapele.com"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Telefone</label>
                  <Input
                    value={newProfessional.phone}
                    onChange={(e) => setNewProfessional(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(11) 99999-9999"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Especialidades *</label>
                  <Input
                    required
                    value={newProfessional.specialties}
                    onChange={(e) => setNewProfessional(prev => ({ ...prev, specialties: e.target.value }))}
                    placeholder="Facial, Limpeza de Pele, Peeling"
                  />
                  <p className="text-xs text-gray-500">Separe as especialidades por vírgula</p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Horário de Início</label>
                  <Input
                    type="time"
                    value={newProfessional.workingHours.start}
                    onChange={(e) => setNewProfessional(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, start: e.target.value }
                    }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Horário de Fim</label>
                  <Input
                    type="time"
                    value={newProfessional.workingHours.end}
                    onChange={(e) => setNewProfessional(prev => ({ 
                      ...prev, 
                      workingHours: { ...prev.workingHours, end: e.target.value }
                    }))}
                  />
                </div>
              </div>
              
              <div className="flex space-x-3">
                <Button type="submit" className="nova-button">
                  Salvar Profissional
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Lista de Profissionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {professionals.map(professional => (
          <Card key={professional.id} className="nova-card hover:shadow-lg transition-shadow animate-fade-in">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 rounded-full flex items-center justify-center overflow-hidden">
                    {professional.avatar ? (
                      <img src={professional.avatar} alt={professional.name} className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-gray-800">
                      {professional.name}
                    </CardTitle>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={professional.isActive}
                    onCheckedChange={() => toggleProfessionalStatus(professional.id)}
                  />
                  <Badge variant={professional.isActive ? "default" : "secondary"}>
                    {professional.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                {professional.email && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{professional.email}</span>
                  </div>
                )}
                
                {professional.phone && (
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{professional.phone}</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Especialidades:</h4>
                <div className="flex flex-wrap gap-1">
                  {professional.specialties.map((specialty, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">Horário de Trabalho:</h4>
                <p className="text-sm text-gray-600">
                  {professional.workingHours.start} às {professional.workingHours.end}
                </p>
                <div className="flex flex-wrap gap-1">
                  {professional.workingDays.map(day => (
                    <Badge key={day} variant="outline" className="text-xs">
                      {getDayName(day)}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <EditProfessionalDialog
                  professional={professional}
                  onUpdate={handleUpdateProfessional}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {professionals.length === 0 && (
        <Card className="nova-card">
          <CardContent className="text-center py-12">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Nenhum profissional cadastrado
            </h3>
            <p className="text-gray-500">
              Adicione profissionais para começar a organizar a equipe
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

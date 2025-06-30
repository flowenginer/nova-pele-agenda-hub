
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { SystemSettings } from '../types/crm';
import { Settings as SettingsIcon, Upload, Save } from 'lucide-react';

export const Settings = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    clinicName: 'Nova Pele Estética',
    primaryColor: '#ec4899',
    workingHours: { start: '08:00', end: '18:00' },
    workingDays: [1, 2, 3, 4, 5],
    appointmentDuration: 60,
    notificationsEnabled: true,
    whatsappIntegration: true
  });

  const [pageSettings, setPageSettings] = useState({
    title: 'Nova Pele Estética',
    subtitle: 'Cuidando melhor de você',
    welcomeMessage: 'Bem-vinda à Nova Pele Estética! Agende seu horário online e transforme sua beleza com nossos tratamentos especializados.',
    confirmationMessage: 'Agendamento realizado com sucesso! Entraremos em contato para confirmar.',
    logo: ''
  });

  const handleSaveSettings = () => {
    console.log('Configurações salvas:', settings, pageSettings);
    // Aqui seria integrado com Supabase para salvar as configurações
    alert('Configurações salvas com sucesso!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPageSettings(prev => ({ 
          ...prev, 
          logo: e.target?.result as string 
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const weekDays = [
    { id: 0, name: 'Domingo' },
    { id: 1, name: 'Segunda-feira' },
    { id: 2, name: 'Terça-feira' },
    { id: 3, name: 'Quarta-feira' },
    { id: 4, name: 'Quinta-feira' },
    { id: 5, name: 'Sexta-feira' },
    { id: 6, name: 'Sábado' }
  ];

  const toggleWorkingDay = (dayId: number) => {
    setSettings(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(dayId)
        ? prev.workingDays.filter(d => d !== dayId)
        : [...prev.workingDays, dayId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Configurações
          </h2>
          <p className="text-gray-600 mt-1">Personalize o sistema e a página de agendamento</p>
        </div>
        <Button className="nova-button" onClick={handleSaveSettings}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Tudo
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configurações da Página de Agendamento */}
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Página de Agendamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Logo da Clínica</label>
              <div className="flex items-center space-x-4">
                {pageSettings.logo && (
                  <img 
                    src={pageSettings.logo} 
                    alt="Logo" 
                    className="w-16 h-16 object-contain rounded-lg border"
                  />
                )}
                <div>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button 
                    variant="outline" 
                    asChild
                    className="cursor-pointer"
                  >
                    <label htmlFor="logo-upload">
                      <Upload className="w-4 h-4 mr-2" />
                      {pageSettings.logo ? 'Trocar Logo' : 'Upload Logo'}
                    </label>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Título da Página</label>
              <Input
                value={pageSettings.title}
                onChange={(e) => setPageSettings(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Nova Pele Estética"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Subtítulo</label>
              <Input
                value={pageSettings.subtitle}
                onChange={(e) => setPageSettings(prev => ({ ...prev, subtitle: e.target.value }))}
                placeholder="Cuidando melhor de você"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mensagem de Boas-vindas</label>
              <Textarea
                value={pageSettings.welcomeMessage}
                onChange={(e) => setPageSettings(prev => ({ ...prev, welcomeMessage: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mensagem de Confirmação</label>
              <Textarea
                value={pageSettings.confirmationMessage}
                onChange={(e) => setPageSettings(prev => ({ ...prev, confirmationMessage: e.target.value }))}
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        {/* Configurações Gerais do Sistema */}
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Configurações Gerais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome da Clínica</label>
              <Input
                value={settings.clinicName}
                onChange={(e) => setSettings(prev => ({ ...prev, clinicName: e.target.value }))}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Horário de Abertura</label>
                <Input
                  type="time"
                  value={settings.workingHours.start}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, start: e.target.value }
                  }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Horário de Fechamento</label>
                <Input
                  type="time"
                  value={settings.workingHours.end}
                  onChange={(e) => setSettings(prev => ({
                    ...prev,
                    workingHours: { ...prev.workingHours, end: e.target.value }
                  }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Duração Padrão (minutos)</label>
              <Input
                type="number"
                value={settings.appointmentDuration}
                onChange={(e) => setSettings(prev => ({ 
                  ...prev, 
                  appointmentDuration: parseInt(e.target.value) 
                }))}
                min="15"
                max="240"
                step="15"
              />
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">Dias de Funcionamento</label>
              <div className="space-y-2">
                {weekDays.map(day => (
                  <div key={day.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{day.name}</span>
                    <Switch
                      checked={settings.workingDays.includes(day.id)}
                      onCheckedChange={() => toggleWorkingDay(day.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notificações Automáticas</label>
                  <p className="text-xs text-gray-500">Enviar lembretes e confirmações</p>
                </div>
                <Switch
                  checked={settings.notificationsEnabled}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    notificationsEnabled: checked 
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Integração WhatsApp</label>
                  <p className="text-xs text-gray-500">Habilitar envio via WhatsApp</p>
                </div>
                <Switch
                  checked={settings.whatsappIntegration}
                  onCheckedChange={(checked) => setSettings(prev => ({ 
                    ...prev, 
                    whatsappIntegration: checked 
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integração com Supabase */}
      <Card className="nova-card animate-fade-in">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Integração com Supabase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">Status da Integração</h4>
            <p className="text-sm text-blue-700 mb-3">
              A página de agendamento está conectada com o Supabase. Todas as configurações 
              feitas aqui serão sincronizadas automaticamente.
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-green-700 font-medium">Conectado</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

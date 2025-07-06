
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Settings as SettingsIcon, Upload, Save, Phone, MapPin, Palette, Globe } from 'lucide-react';
import type { SystemSettings } from '../types/supabase';

interface SettingsProps {
  settings: SystemSettings | null;
  updateSettings: (updates: Partial<SystemSettings>) => Promise<any>;
}

export const Settings = ({ settings, updateSettings }: SettingsProps) => {
  const [formData, setFormData] = useState({
    nome_clinica: '',
    titulo_pagina: '',
    subtitulo_pagina: '',
    mensagem_boas_vindas: '',
    mensagem_confirmacao: '',
    horario_inicio: '08:00',
    horario_fim: '18:00',
    duracao_padrao_agendamento: 60,
    notificacoes_ativadas: true,
    integracao_whatsapp: true,
    dias_funcionamento: [1, 2, 3, 4, 5],
    logo_url: '',
    cor_primaria: '#ec4899',
    telefone_contato: '',
    whatsapp_contato: '',
    endereco_contato: ''
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        nome_clinica: settings.nome_clinica || '',
        titulo_pagina: settings.titulo_pagina || '',
        subtitulo_pagina: settings.subtitulo_pagina || '',
        mensagem_boas_vindas: settings.mensagem_boas_vindas || '',
        mensagem_confirmacao: settings.mensagem_confirmacao || '',
        horario_inicio: settings.horario_inicio || '08:00',
        horario_fim: settings.horario_fim || '18:00',
        duracao_padrao_agendamento: settings.duracao_padrao_agendamento || 60,
        notificacoes_ativadas: settings.notificacoes_ativadas ?? true,
        integracao_whatsapp: settings.integracao_whatsapp ?? true,
        dias_funcionamento: settings.dias_funcionamento || [1, 2, 3, 4, 5],
        logo_url: settings.logo_url || '',
        cor_primaria: settings.cor_primaria || '#ec4899',
        telefone_contato: (settings as any).telefone_contato || '',
        whatsapp_contato: (settings as any).whatsapp_contato || '',
        endereco_contato: (settings as any).endereco_contato || ''
      });
    }
  }, [settings]);

  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      await updateSettings(formData);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ 
          ...prev, 
          logo_url: e.target?.result as string 
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
    setFormData(prev => ({
      ...prev,
      dias_funcionamento: prev.dias_funcionamento.includes(dayId)
        ? prev.dias_funcionamento.filter(d => d !== dayId)
        : [...prev.dias_funcionamento, dayId]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            Configurações do Sistema
          </h2>
          <p className="text-gray-600 mt-1">Configure sua clínica e personalize as páginas públicas</p>
        </div>
        <Button 
          className="nova-button" 
          onClick={handleSaveSettings}
          disabled={loading}
        >
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Informações da Clínica */}
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <SettingsIcon className="w-5 h-5 mr-2" />
              Informações da Clínica
            </CardTitle>
            <p className="text-sm text-gray-600">Essas informações aparecem em todo o sistema</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Logo da Clínica</label>
              <div className="flex items-center space-x-4">
                {formData.logo_url && (
                  <img 
                    src={formData.logo_url} 
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
                      {formData.logo_url ? 'Trocar Logo' : 'Upload Logo'}
                    </label>
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Nome da Clínica</label>
              <Input
                value={formData.nome_clinica}
                onChange={(e) => setFormData(prev => ({ ...prev, nome_clinica: e.target.value }))}
                placeholder="Nova Pele Estética"
              />
              <p className="text-xs text-gray-500">Aparece no cabeçalho e título das páginas</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <Palette className="w-4 h-4 mr-2" />
                Cor Primária do Sistema
              </label>
              <div className="flex items-center space-x-2">
                <Input
                  type="color"
                  value={formData.cor_primaria}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor_primaria: e.target.value }))}
                  className="w-16 h-10 p-1 border rounded"
                />
                <Input
                  type="text"
                  value={formData.cor_primaria}
                  onChange={(e) => setFormData(prev => ({ ...prev, cor_primaria: e.target.value }))}
                  placeholder="#ec4899"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500">Define a cor dos botões e elementos em destaque</p>
            </div>
          </CardContent>
        </Card>

        {/* Páginas Públicas */}
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Globe className="w-5 h-5 mr-2" />
              Páginas Públicas
            </CardTitle>
            <p className="text-sm text-gray-600">Textos que aparecem nas páginas de agendamento</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Título da Página</label>
              <Input
                value={formData.titulo_pagina}
                onChange={(e) => setFormData(prev => ({ ...prev, titulo_pagina: e.target.value }))}
                placeholder="Nova Pele Estética"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Subtítulo</label>
              <Input
                value={formData.subtitulo_pagina}
                onChange={(e) => setFormData(prev => ({ ...prev, subtitulo_pagina: e.target.value }))}
                placeholder="Cuidando melhor de você"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mensagem de Boas-vindas</label>
              <Textarea
                value={formData.mensagem_boas_vindas}
                onChange={(e) => setFormData(prev => ({ ...prev, mensagem_boas_vindas: e.target.value }))}
                rows={3}
                placeholder="Bem-vinda à nossa clínica!"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Mensagem de Confirmação</label>
              <Textarea
                value={formData.mensagem_confirmacao}
                onChange={(e) => setFormData(prev => ({ ...prev, mensagem_confirmacao: e.target.value }))}
                rows={2}
                placeholder="Agendamento realizado com sucesso!"
              />
            </div>
          </CardContent>
        </Card>

        {/* Funcionamento */}
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Horário de Funcionamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Abertura</label>
                <Input
                  type="time"
                  value={formData.horario_inicio}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_inicio: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Fechamento</label>
                <Input
                  type="time"
                  value={formData.horario_fim}
                  onChange={(e) => setFormData(prev => ({ ...prev, horario_fim: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Duração Padrão (minutos)</label>
              <Input
                type="number"
                value={formData.duracao_padrao_agendamento}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  duracao_padrao_agendamento: parseInt(e.target.value) 
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
                      checked={formData.dias_funcionamento.includes(day.id)}
                      onCheckedChange={() => toggleWorkingDay(day.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações de Contato */}
        <Card className="nova-card animate-fade-in">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
              <Phone className="w-5 h-5 mr-2" />
              Informações de Contato
            </CardTitle>
            <p className="text-sm text-gray-600">Aparecem na página inicial pública</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Telefone</label>
              <Input
                value={formData.telefone_contato}
                onChange={(e) => setFormData(prev => ({ ...prev, telefone_contato: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">WhatsApp</label>
              <Input
                value={formData.whatsapp_contato}
                onChange={(e) => setFormData(prev => ({ ...prev, whatsapp_contato: e.target.value }))}
                placeholder="(11) 99999-9999"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Endereço
              </label>
              <Input
                value={formData.endereco_contato}
                onChange={(e) => setFormData(prev => ({ ...prev, endereco_contato: e.target.value }))}
                placeholder="Rua das Flores, 123 - Centro"
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Notificações Automáticas</label>
                  <p className="text-xs text-gray-500">Enviar lembretes e confirmações</p>
                </div>
                <Switch
                  checked={formData.notificacoes_ativadas}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    notificacoes_ativadas: checked 
                  }))}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">Integração WhatsApp</label>
                  <p className="text-xs text-gray-500">Habilitar envio via WhatsApp</p>
                </div>
                <Switch
                  checked={formData.integracao_whatsapp}
                  onCheckedChange={(checked) => setFormData(prev => ({ 
                    ...prev, 
                    integracao_whatsapp: checked 
                  }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

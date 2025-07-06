
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { LogIn, Loader2, Mail } from 'lucide-react';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [settings, setSettings] = useState<any>(null);
  const { signIn } = useAuth();
  const { toast } = useToast();

  // Carregar configurações do sistema
  useEffect(() => {
    loadSystemSettings();
  }, []);

  const loadSystemSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes_sistema')
        .select('*')
        .limit(1)
        .single();

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.log('Erro ao carregar configurações:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        toast({
          title: "Erro ao fazer login",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Login realizado",
          description: `Bem-vindo ao CRM ${settings?.nome_clinica || 'Nova Pele'}!`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar fazer login.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, digite seu email para recuperar a senha.",
        variant: "destructive",
      });
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`,
      });

      if (error) {
        toast({
          title: "Erro ao enviar email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email enviado!",
          description: "Verifique seu email para instruções de recuperação de senha.",
        });
        setForgotPassword(false);
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar recuperar a senha.",
        variant: "destructive",
      });
    } finally {
      setResetLoading(false);
    }
  };

  if (forgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nova-pink-50 to-nova-purple-50 px-4">
        <Card className="w-full max-w-md nova-card">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              {settings?.logo_url ? (
                <img 
                  src={settings.logo_url} 
                  alt="Logo" 
                  className="w-12 h-12 object-contain rounded-full"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {settings?.nome_clinica?.charAt(0) || 'N'}
                </span>
              )}
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
              Recuperar Senha
            </CardTitle>
            <p className="text-gray-600">Digite seu email para receber as instruções</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                />
              </div>
              
              <Button
                type="submit"
                className="w-full nova-button"
                disabled={resetLoading}
              >
                {resetLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                {resetLoading ? 'Enviando...' : 'Enviar Email'}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => setForgotPassword(false)}
              >
                Voltar ao Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-nova-pink-50 to-nova-purple-50 px-4">
      <Card className="w-full max-w-md nova-card">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-nova-pink-500 to-nova-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt="Logo" 
                className="w-12 h-12 object-contain rounded-full"
              />
            ) : (
              <span className="text-white font-bold text-2xl">
                {settings?.nome_clinica?.charAt(0) || 'N'}
              </span>
            )}
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-nova-pink-600 to-nova-purple-600 bg-clip-text text-transparent">
            {settings?.nome_clinica || 'Nova Pele'} CRM
          </CardTitle>
          <p className="text-gray-600">Faça login para acessar o sistema</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full nova-button"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4 mr-2" />
              )}
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>

            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-nova-pink-600 hover:text-nova-pink-700"
                onClick={() => setForgotPassword(true)}
              >
                Esqueci minha senha
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

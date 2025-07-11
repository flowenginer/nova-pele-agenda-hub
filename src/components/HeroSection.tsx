import React from 'react';
import type { SystemSettings } from '../types/supabase';

interface HeroSectionProps {
  settings: SystemSettings | null;
}

export const HeroSection = ({ settings }: HeroSectionProps) => {
  const primaryColor = settings?.cor_primaria || '#ec4899';
  
  // Convert hex to HSL for gradient
  const hexToHsl = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }
    
    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
  };

  const hslColor = hexToHsl(primaryColor);
  const hslColorDark = hexToHsl(primaryColor).replace(/(\d+)%\)$/, (match, lightness) => 
    `${Math.max(0, parseInt(lightness) - 15)}%)`
  );

  return (
    <div 
      className="relative overflow-hidden text-white py-16 px-8"
      style={{
        background: `linear-gradient(135deg, hsl(${hslColor}) 0%, hsl(${hslColorDark}) 100%)`
      }}
    >
      <div className="max-w-6xl mx-auto text-center">
        <div className="flex items-center justify-center space-x-6 mb-8">
          {/* Logo */}
          <div className="w-24 h-24 rounded-full bg-white bg-opacity-20 flex items-center justify-center overflow-hidden flex-shrink-0">
            {settings?.logo_url ? (
              <img 
                src={settings.logo_url} 
                alt={settings.nome_clinica || 'Logo'} 
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <span className="text-white font-bold text-3xl">
                {(settings?.nome_clinica || 'N').charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Title and Subtitle */}
          <div className="text-left">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              {settings?.nome_clinica || 'Nova Pele Estética'}
            </h1>
            <p className="text-xl opacity-90">
              {settings?.subtitulo_pagina || 'Cuidando melhor de você'}
            </p>
          </div>
        </div>
        
        {/* Welcome Message */}
        <div className="max-w-4xl mx-auto">
          <p className="text-lg opacity-90 leading-relaxed">
            {settings?.mensagem_boas_vindas || 
             'Bem-vinda à Nova Pele Estética! Agende seu horário online e transforme sua beleza com nossos tratamentos especializados.'}
          </p>
        </div>
      </div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-12 -translate-x-12"></div>
    </div>
  );
};
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          cliente_id: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at: string
          data_agendamento: string
          email: string | null
          hora_agendamento: string
          id: number
          id_uuid: string | null
          observacoes: string | null
          profissional_id: number
          servico_id: number
          status: string
          updated_at: string | null
          user_id: number | null
          valor: number | null
        }
        Insert: {
          cliente_id?: string | null
          cliente_nome: string
          cliente_telefone: string
          created_at?: string
          data_agendamento: string
          email?: string | null
          hora_agendamento: string
          id?: number
          id_uuid?: string | null
          observacoes?: string | null
          profissional_id: number
          servico_id: number
          status?: string
          updated_at?: string | null
          user_id?: number | null
          valor?: number | null
        }
        Update: {
          cliente_id?: string | null
          cliente_nome?: string
          cliente_telefone?: string
          created_at?: string
          data_agendamento?: string
          email?: string | null
          hora_agendamento?: string
          id?: number
          id_uuid?: string | null
          observacoes?: string | null
          profissional_id?: number
          servico_id?: number
          status?: string
          updated_at?: string | null
          user_id?: number | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_profissional_id_fkey"
            columns: ["profissional_id"]
            isOneToOne: false
            referencedRelation: "profissionais"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_servico_id_fkey"
            columns: ["servico_id"]
            isOneToOne: false
            referencedRelation: "servicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_agendamentos_cliente"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          endereco: string | null
          id: string
          nome: string
          observacoes: string | null
          status: string | null
          telefone: string
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          observacoes?: string | null
          status?: string | null
          telefone: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          observacoes?: string | null
          status?: string | null
          telefone?: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      configuracoes_sistema: {
        Row: {
          cor_primaria: string | null
          created_at: string | null
          dias_funcionamento: number[] | null
          duracao_padrao_agendamento: number | null
          endereco_contato: string | null
          horario_fim: string | null
          horario_inicio: string | null
          id: string
          integracao_whatsapp: boolean | null
          logo_url: string | null
          mensagem_boas_vindas: string | null
          mensagem_confirmacao: string | null
          nome_clinica: string | null
          notificacoes_ativadas: boolean | null
          subtitulo_pagina: string | null
          telefone_contato: string | null
          titulo_pagina: string | null
          updated_at: string | null
          whatsapp_contato: string | null
        }
        Insert: {
          cor_primaria?: string | null
          created_at?: string | null
          dias_funcionamento?: number[] | null
          duracao_padrao_agendamento?: number | null
          endereco_contato?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          integracao_whatsapp?: boolean | null
          logo_url?: string | null
          mensagem_boas_vindas?: string | null
          mensagem_confirmacao?: string | null
          nome_clinica?: string | null
          notificacoes_ativadas?: boolean | null
          subtitulo_pagina?: string | null
          telefone_contato?: string | null
          titulo_pagina?: string | null
          updated_at?: string | null
          whatsapp_contato?: string | null
        }
        Update: {
          cor_primaria?: string | null
          created_at?: string | null
          dias_funcionamento?: number[] | null
          duracao_padrao_agendamento?: number | null
          endereco_contato?: string | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: string
          integracao_whatsapp?: boolean | null
          logo_url?: string | null
          mensagem_boas_vindas?: string | null
          mensagem_confirmacao?: string | null
          nome_clinica?: string | null
          notificacoes_ativadas?: boolean | null
          subtitulo_pagina?: string | null
          telefone_contato?: string | null
          titulo_pagina?: string | null
          updated_at?: string | null
          whatsapp_contato?: string | null
        }
        Relationships: []
      }
      iniciou_contato: {
        Row: {
          created_at: string | null
          data_contato: string | null
          email: string | null
          id: string
          mensagem: string | null
          nome: string
          status: string | null
          telefone: string
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          created_at?: string | null
          data_contato?: string | null
          email?: string | null
          id?: string
          mensagem?: string | null
          nome: string
          status?: string | null
          telefone: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          created_at?: string | null
          data_contato?: string | null
          email?: string | null
          id?: string
          mensagem?: string | null
          nome?: string
          status?: string | null
          telefone?: string
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      profissionais: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          dias_trabalho: number[] | null
          email: string | null
          especialidade: string | null
          especialidades: string[] | null
          horario_fim: string | null
          horario_inicio: string | null
          id: number
          nome: string
          photo_url: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          dias_trabalho?: number[] | null
          email?: string | null
          especialidade?: string | null
          especialidades?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: number
          nome: string
          photo_url?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          dias_trabalho?: number[] | null
          email?: string | null
          especialidade?: string | null
          especialidades?: string[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          id?: number
          nome?: string
          photo_url?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      servicos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          created_at: string | null
          descricao: string | null
          duracao_minutos: number | null
          id: number
          nome: string
          preco: number | null
          profissionais_ids: string[] | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          id?: number
          nome: string
          preco?: number | null
          profissionais_ids?: string[] | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          created_at?: string | null
          descricao?: string | null
          duracao_minutos?: number | null
          id?: number
          nome?: string
          preco?: number | null
          profissionais_ids?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      templates_comunicacao: {
        Row: {
          created_at: string | null
          id: string
          mensagem: string
          nome: string
          tipo: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          mensagem: string
          nome: string
          tipo?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          mensagem?: string
          nome?: string
          tipo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          criado_em: string | null
          email: string
          id: string
          nome: string
          senha_hash: string
        }
        Insert: {
          criado_em?: string | null
          email: string
          id?: string
          nome: string
          senha_hash: string
        }
        Update: {
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
          senha_hash?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bytea_to_text: {
        Args: { data: string }
        Returns: string
      }
      http: {
        Args: { request: Database["public"]["CompositeTypes"]["http_request"] }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_delete: {
        Args:
          | { uri: string }
          | { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_get: {
        Args: { uri: string } | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_head: {
        Args: { uri: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_header: {
        Args: { field: string; value: string }
        Returns: Database["public"]["CompositeTypes"]["http_header"]
      }
      http_list_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: {
          curlopt: string
          value: string
        }[]
      }
      http_patch: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_post: {
        Args:
          | { uri: string; content: string; content_type: string }
          | { uri: string; data: Json }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_put: {
        Args: { uri: string; content: string; content_type: string }
        Returns: Database["public"]["CompositeTypes"]["http_response"]
      }
      http_reset_curlopt: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      http_set_curlopt: {
        Args: { curlopt: string; value: string }
        Returns: boolean
      }
      text_to_bytea: {
        Args: { data: string }
        Returns: string
      }
      urlencode: {
        Args: { data: Json } | { string: string } | { string: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      http_header: {
        field: string | null
        value: string | null
      }
      http_request: {
        method: unknown | null
        uri: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content_type: string | null
        content: string | null
      }
      http_response: {
        status: number | null
        content_type: string | null
        headers: Database["public"]["CompositeTypes"]["http_header"][] | null
        content: string | null
      }
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

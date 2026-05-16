export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          business_id: string
          content: string
          context_data: Json | null
          expires_at: string
          generated_at: string
          id: string
          insight_type: string
        }
        Insert: {
          business_id: string
          content: string
          context_data?: Json | null
          expires_at: string
          generated_at?: string
          id?: string
          insight_type: string
        }
        Update: {
          business_id?: string
          content?: string
          context_data?: Json | null
          expires_at?: string
          generated_at?: string
          id?: string
          insight_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_integrations: {
        Row: {
          access_token: string | null
          business_id: string
          created_at: string
          id: string
          is_active: boolean
          last_synced_at: string | null
          provider: string
          refresh_token: string | null
          store_url: string
          sync_start_date: string | null
          token_expires_at: string | null
        }
        Insert: {
          access_token?: string | null
          business_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          store_url: string
          sync_start_date?: string | null
          token_expires_at?: string | null
        }
        Update: {
          access_token?: string | null
          business_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_synced_at?: string | null
          provider?: string
          refresh_token?: string | null
          store_url?: string
          sync_start_date?: string | null
          token_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_integrations_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          created_at: string | null
          custom_industry_name: string | null
          id: string
          industry: string
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          custom_industry_name?: string | null
          id?: string
          industry: string
          name: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          custom_industry_name?: string | null
          id?: string
          industry?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_rate_limits: {
        Row: {
          message_count: number | null
          reset_date: string | null
          user_id: string
        }
        Insert: {
          message_count?: number | null
          reset_date?: string | null
          user_id: string
        }
        Update: {
          message_count?: number | null
          reset_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
      expense_categories: {
        Row: {
          business_id: string | null
          icon: string | null
          id: string
          industry: string | null
          is_custom: boolean | null
          name: string
        }
        Insert: {
          business_id?: string | null
          icon?: string | null
          id?: string
          industry?: string | null
          is_custom?: boolean | null
          name: string
        }
        Update: {
          business_id?: string | null
          icon?: string | null
          id?: string
          industry?: string | null
          is_custom?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          business_id: string
          category_id: string | null
          created_at: string | null
          due_date: string | null
          id: string
          is_recurring: boolean | null
          name: string | null
          note: string | null
          paid_at: string | null
          payment_method: string | null
          recurrence: string | null
          reminder_notification_id: string | null
          reminder_offset_minutes: number | null
          vendor: string | null
        }
        Insert: {
          amount: number
          business_id: string
          category_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string | null
          note?: string | null
          paid_at?: string | null
          payment_method?: string | null
          recurrence?: string | null
          reminder_notification_id?: string | null
          reminder_offset_minutes?: number | null
          vendor?: string | null
        }
        Update: {
          amount?: number
          business_id?: string
          category_id?: string | null
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_recurring?: boolean | null
          name?: string | null
          note?: string | null
          paid_at?: string | null
          payment_method?: string | null
          recurrence?: string | null
          reminder_notification_id?: string | null
          reminder_offset_minutes?: number | null
          vendor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "expenses_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      invite_codes: {
        Row: {
          code: string
          created_at: string | null
          used: boolean | null
          used_at: string | null
          used_by: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          used?: boolean | null
          used_at?: string | null
          used_by?: string | null
        }
        Relationships: []
      }
      revenue_entries: {
        Row: {
          amount: number
          business_id: string
          channel_id: string | null
          collected_at: string | null
          created_at: string | null
          expected_payment_date: string | null
          id: string
          item_name: string | null
          note: string | null
          payment_method: string | null
          quantity: number | null
          reminder_notification_id: string | null
          reminder_offset_minutes: number | null
          shipping_provider: string | null
          status: string
        }
        Insert: {
          amount: number
          business_id: string
          channel_id?: string | null
          collected_at?: string | null
          created_at?: string | null
          expected_payment_date?: string | null
          id?: string
          item_name?: string | null
          note?: string | null
          payment_method?: string | null
          quantity?: number | null
          reminder_notification_id?: string | null
          reminder_offset_minutes?: number | null
          shipping_provider?: string | null
          status?: string
        }
        Update: {
          amount?: number
          business_id?: string
          channel_id?: string | null
          collected_at?: string | null
          created_at?: string | null
          expected_payment_date?: string | null
          id?: string
          item_name?: string | null
          note?: string | null
          payment_method?: string | null
          quantity?: number | null
          reminder_notification_id?: string | null
          reminder_offset_minutes?: number | null
          shipping_provider?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "revenue_entries_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "revenue_entries_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "sales_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_channels: {
        Row: {
          business_id: string | null
          icon: string | null
          id: string
          industry: string | null
          is_custom: boolean | null
          name: string
        }
        Insert: {
          business_id?: string | null
          icon?: string | null
          id?: string
          industry?: string | null
          is_custom?: boolean | null
          name: string
        }
        Update: {
          business_id?: string | null
          icon?: string | null
          id?: string
          industry?: string | null
          is_custom?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_channels_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_compliance_log: {
        Row: {
          id: string
          payload: Json | null
          received_at: string
          shop_domain: string
          topic: string
        }
        Insert: {
          id?: string
          payload?: Json | null
          received_at?: string
          shop_domain: string
          topic: string
        }
        Update: {
          id?: string
          payload?: Json | null
          received_at?: string
          shop_domain?: string
          topic?: string
        }
        Relationships: []
      }
      shopify_oauth_states: {
        Row: {
          created_at: string
          id: string
          return_to: string | null
          shop: string
          state: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          return_to?: string | null
          shop: string
          state: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          return_to?: string | null
          shop?: string
          state?: string
          user_id?: string | null
        }
        Relationships: []
      }
      shopify_orders: {
        Row: {
          business_id: string
          customer_name: string | null
          financial_status: string | null
          fulfillment_status: string | null
          id: string
          line_items_json: Json | null
          line_items_summary: string | null
          order_created_at: string
          order_number: string | null
          original_total_price: number | null
          shipping_provider: string | null
          shopify_customer_id: string | null
          shopify_order_id: string
          subtotal_price: number | null
          synced_at: string
          total_price: number
        }
        Insert: {
          business_id: string
          customer_name?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          line_items_json?: Json | null
          line_items_summary?: string | null
          order_created_at: string
          order_number?: string | null
          original_total_price?: number | null
          shipping_provider?: string | null
          shopify_customer_id?: string | null
          shopify_order_id: string
          subtotal_price?: number | null
          synced_at?: string
          total_price: number
        }
        Update: {
          business_id?: string
          customer_name?: string | null
          financial_status?: string | null
          fulfillment_status?: string | null
          id?: string
          line_items_json?: Json | null
          line_items_summary?: string | null
          order_created_at?: string
          order_number?: string | null
          original_total_price?: number | null
          shipping_provider?: string | null
          shopify_customer_id?: string | null
          shopify_order_id?: string
          subtotal_price?: number | null
          synced_at?: string
          total_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "shopify_orders_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      shopify_pending_installs: {
        Row: {
          access_token: string
          created_at: string
          refresh_token: string
          shop: string
          token_expires_at: string
          updated_at: string
        }
        Insert: {
          access_token: string
          created_at?: string
          refresh_token: string
          shop: string
          token_expires_at: string
          updated_at?: string
        }
        Update: {
          access_token?: string
          created_at?: string
          refresh_token?: string
          shop?: string
          token_expires_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_sms_quota: {
        Args: { p_month_limit: number; p_user_id: string }
        Returns: {
          allowed: boolean
          month_count: number
          reset_at: string
        }[]
      }
      get_sms_month_count: { Args: { p_user_id: string }; Returns: number }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

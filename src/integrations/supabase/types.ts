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
      attendance: {
        Row: {
          attended_classes: number | null
          created_at: string | null
          id: string
          month: string
          percentage: number | null
          student_id: string | null
          total_classes: number | null
          year: number
        }
        Insert: {
          attended_classes?: number | null
          created_at?: string | null
          id?: string
          month: string
          percentage?: number | null
          student_id?: string | null
          total_classes?: number | null
          year: number
        }
        Update: {
          attended_classes?: number | null
          created_at?: string | null
          id?: string
          month?: string
          percentage?: number | null
          student_id?: string | null
          total_classes?: number | null
          year?: number
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string | null
          date_issued: string
          file_url: string | null
          id: string
          issuer: string
          status: string | null
          student_id: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          date_issued: string
          file_url?: string | null
          id?: string
          issuer: string
          status?: string | null
          student_id?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          date_issued?: string
          file_url?: string | null
          id?: string
          issuer?: string
          status?: string | null
          student_id?: string | null
          title?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          created_at: string | null
          date: string
          description: string | null
          id: string
          image_url: string | null
          location: string | null
          time: string
          title: string
        }
        Insert: {
          created_at?: string | null
          date: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          time: string
          title: string
        }
        Update: {
          created_at?: string | null
          date?: string
          description?: string | null
          id?: string
          image_url?: string | null
          location?: string | null
          time?: string
          title?: string
        }
        Relationships: []
      }
      faculty: {
        Row: {
          created_at: string | null
          education: string | null
          email: string | null
          id: string
          image_url: string | null
          linkedin: string | null
          name: string
          phone: string | null
          position: string
          research: string | null
        }
        Insert: {
          created_at?: string | null
          education?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          linkedin?: string | null
          name: string
          phone?: string | null
          position: string
          research?: string | null
        }
        Update: {
          created_at?: string | null
          education?: string | null
          email?: string | null
          id?: string
          image_url?: string | null
          linkedin?: string | null
          name?: string
          phone?: string | null
          position?: string
          research?: string | null
        }
        Relationships: []
      }
      placements: {
        Row: {
          company: string
          created_at: string | null
          id: string
          package: string
          position: string
          students_placed: number | null
          year: string
        }
        Insert: {
          company: string
          created_at?: string | null
          id?: string
          package: string
          position: string
          students_placed?: number | null
          year: string
        }
        Update: {
          company?: string
          created_at?: string | null
          id?: string
          package?: string
          position?: string
          students_placed?: number | null
          year?: string
        }
        Relationships: []
      }
      results: {
        Row: {
          cgpa: number | null
          created_at: string | null
          file_url: string | null
          id: string
          semester: number
          sgpa: number | null
          student_id: string | null
          year: number
        }
        Insert: {
          cgpa?: number | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          semester: number
          sgpa?: number | null
          student_id?: string | null
          year: number
        }
        Update: {
          cgpa?: number | null
          created_at?: string | null
          file_url?: string | null
          id?: string
          semester?: number
          sgpa?: number | null
          student_id?: string | null
          year?: number
        }
        Relationships: []
      }
      timetable: {
        Row: {
          created_at: string | null
          day: string
          hour: string
          id: string
          subject_name: string
          year: number
        }
        Insert: {
          created_at?: string | null
          day: string
          hour: string
          id?: string
          subject_name: string
          year: number
        }
        Update: {
          created_at?: string | null
          day?: string
          hour?: string
          id?: string
          subject_name?: string
          year?: number
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          ht_no: string | null
          id: string
          role: string
          status: string | null
          student_name: string | null
          year: string | null
        }
        Insert: {
          ht_no?: string | null
          id?: string
          role: string
          status?: string | null
          student_name?: string | null
          year?: string | null
        }
        Update: {
          ht_no?: string | null
          id?: string
          role?: string
          status?: string | null
          student_name?: string | null
          year?: string | null
        }
        Relationships: []
      }
      verified_students: {
        Row: {
          ht_no: string
          student_name: string | null
          year: string | null
        }
        Insert: {
          ht_no: string
          student_name?: string | null
          year?: string | null
        }
        Update: {
          ht_no?: string
          student_name?: string | null
          year?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  public: {
    Enums: {},
  },
} as const
